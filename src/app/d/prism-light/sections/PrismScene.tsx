'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * The optics, made real: a three.js layer over the shader fan.
 *
 * - The incident beam IS the source string: a stream of additive white
 *   "words of light" flying down the ray into the glass, converging as they
 *   approach the apex.
 * - The prism is a physical glass body (transmission + ior + clearcoat under
 *   a RoomEnvironment) with drawn facet edges, breathing a few degrees.
 * - The translations leave the far face along their dispersion angles and
 *   fly TOWARD the camera (z drift), so every ray reads with perspective:
 *   words grow as they pass, fade as they leave.
 *
 * The canvas is transparent and sits above the fan light; the rAF loop is
 * the browser's, so the app's freeze gate pauses the whole scene in
 * thumbnails. Reduced motion renders one still frame.
 */

export type PrismRay = {
  text: string;
  lang: string;
  /** dispersion angle in degrees, negative = upward */
  ang: number;
  /** relative flight speed, ~1 */
  speed?: number;
};

type Word = {
  mesh: THREE.Mesh;
  material: THREE.MeshBasicMaterial;
  aspect: number;
  phase: number;
  speed: number;
  angleRad: number;
};

/** Fractions of the plate where the optics anchor (matches the fan clip). */
const PRISM_X = 0.265;
const PRISM_Y = 0.49;
const BEAM_START_X = 0.045;
const BEAM_START_Y = 0.26;

function makeTextTexture(
  text: string,
  tag: string | null,
  fontPx: number
): { texture: THREE.CanvasTexture; aspect: number } {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const pad = fontPx * 0.5;
  const font = `500 ${fontPx}px InterVariable, Inter, system-ui, sans-serif`;
  const tagFont = `400 ${Math.round(fontPx * 0.42)}px ui-monospace, Menlo, monospace`;
  if (!ctx) {
    canvas.width = 4;
    canvas.height = 4;
    return { texture: new THREE.CanvasTexture(canvas), aspect: 1 };
  }
  ctx.font = font;
  const mainW = ctx.measureText(text).width;
  ctx.font = tagFont;
  const tagW = tag ? ctx.measureText(tag.toUpperCase()).width + fontPx * 0.35 : 0;
  canvas.width = Math.ceil(mainW + tagW + pad * 2);
  canvas.height = Math.ceil(fontPx * 1.6);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.textBaseline = 'middle';
  ctx.font = font;
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
  ctx.shadowBlur = fontPx * 0.16;
  ctx.fillText(text, pad, canvas.height / 2);
  if (tag) {
    ctx.shadowBlur = 0;
    ctx.font = tagFont;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.62)';
    ctx.fillText(tag.toUpperCase(), pad + mainW + fontPx * 0.35, canvas.height / 2 + fontPx * 0.08);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  texture.colorSpace = THREE.SRGBColorSpace;
  return { texture, aspect: canvas.width / canvas.height };
}

export default function PrismScene({
  className,
  source,
  rays,
}: {
  className?: string;
  source: string;
  rays: readonly PrismRay[];
}) {
  const holder = useRef<HTMLDivElement>(null);
  const sourceRef = useRef(source);
  const raysRef = useRef(rays);

  useEffect(() => {
    const el = holder.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 2.6, 0.1, 60);
    camera.position.set(0, 0, 10);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.05).texture;

    /* World extents at z=0, recomputed on resize. */
    let halfH = 1;
    let halfW = 1;
    const fracX = (fx: number) => (fx - 0.5) * 2 * halfW;
    const fracY = (fy: number) => (0.5 - fy) * 2 * halfH;

    /* ---- the glass ----
       True `transmission` would refract the 3D scene, not the DOM light
       living behind this transparent canvas — it renders as a gray slab.
       The glass is therefore a thin veil: low uniform opacity so the fan
       shines through, environment-lit clearcoat for moving highlights, and
       drawn facet edges. The extrusion axis points at the camera, so the
       silhouette is the classic triangle, gaining depth as it breathes. */
    const prismGroup = new THREE.Group();
    const prismGeo = new THREE.CylinderGeometry(1, 1, 1.1, 3, 1);
    /* bake the pose: extrusion axis toward the camera, then spin the
       cross-section so the triangle reads /_\ — apex up, base flat */
    prismGeo.rotateX(Math.PI / 2);
    prismGeo.rotateZ(Math.PI);
    const prismMat = new THREE.MeshPhysicalMaterial({
      roughness: 0.06,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.18,
      envMapIntensity: 2.2,
      color: 0xffffff,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const prism = new THREE.Mesh(prismGeo, prismMat);
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(prismGeo, 8),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 })
    );
    prismGroup.add(prism, edges);
    scene.add(prismGroup);

    /* a faint core where the light gathers inside the glass */
    const coreTex = makeTextTexture('·', null, 64).texture;
    const core = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: coreTex,
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    core.scale.set(1.6, 1.6, 1);
    scene.add(core);

    /* ---- the incident beam, made of words: a dense, fast stream ---- */
    const inWords: Word[] = [];
    const inTexture = makeTextTexture(sourceRef.current, null, 84);
    const IN_COUNT = 18;
    for (let i = 0; i < IN_COUNT; i++) {
      const material = new THREE.MeshBasicMaterial({
        map: inTexture.texture,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
      scene.add(mesh);
      inWords.push({
        mesh,
        material,
        aspect: inTexture.aspect,
        /* tight, even packing with a whisper of jitter — a stream, not a
           procession */
        phase: (i + (i % 3) * 0.13) / IN_COUNT,
        speed: 0.16,
        /* hair-thin lateral spread: the words overdraw additively into one
           bright filament */
        angleRad: (i % 2 === 0 ? 1 : -1) * (0.004 + 0.004 * (i % 3)),
      });
    }

    /* ---- the dispersal, words with perspective ---- */
    const outWords: Word[] = [];
    const outTextures: { texture: THREE.CanvasTexture; aspect: number }[] = [];
    raysRef.current.forEach((ray, i) => {
      const tex = makeTextTexture(ray.text, ray.lang, 96);
      outTextures.push(tex);
      const material = new THREE.MeshBasicMaterial({
        map: tex.texture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      /* a whisper of spectrum per lane, warm above, cool below */
      const hueT = i / Math.max(raysRef.current.length - 1, 1);
      material.color = new THREE.Color().lerpColors(
        new THREE.Color(1.0, 0.93, 0.88),
        new THREE.Color(0.86, 0.92, 1.0),
        hueT
      );
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
      scene.add(mesh);
      outWords.push({
        mesh,
        material,
        aspect: tex.aspect,
        phase: (i * 0.618034) % 1,
        speed: (ray.speed ?? 1) * 0.062,
        angleRad: (ray.ang * Math.PI) / 180,
      });
    });

    const layout = () => {
      const width = Math.max(el.clientWidth, 2);
      const height = Math.max(el.clientHeight, 2);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      halfW = halfH * camera.aspect;
      const px = fracX(PRISM_X);
      const py = fracY(PRISM_Y);
      /* apex-up triangle: place the centroid so the midpoint of the RIGHT
         face sits on the fan's origin — beam in the left face, fan out the
         right, base level with the ground */
      const prismR = halfH * 0.58;
      prismGroup.position.set(px - prismR * 0.433, py - prismR * 0.25, 0);
      prismGroup.scale.set(prismR, prismR, prismR);
      /* the gather point sits INSIDE the glass; the stream strikes it */
      core.position.set(px - prismR * 0.5, py - prismR * 0.18, 0.2);
    };
    layout();
    const sizer = new ResizeObserver(layout);
    sizer.observe(el);

    /* ---- flight ---- */
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 2);
    const clock = new THREE.Clock();
    let elapsed = 0;

    const render = (dt: number) => {
      elapsed += dt;
      const px = fracX(PRISM_X);
      const py = fracY(PRISM_Y);
      const bx = fracX(BEAM_START_X);
      const by = fracY(BEAM_START_Y);
      /* the stream's target is the gather point inside the glass */
      const prismR = halfH * 0.58;
      const tx = px - prismR * 0.5;
      const ty = py - prismR * 0.18;
      const beamAngle = Math.atan2(ty - by, tx - bx);

      /* the glass breathes: a slow lean in depth, never leaving its post */
      prismGroup.rotation.y = Math.sin(elapsed * 0.3) * 0.16;
      prismGroup.rotation.x = Math.sin(elapsed * 0.19) * 0.04;

      for (const word of inWords) {
        word.phase = (word.phase + dt * word.speed) % 1;
        const t = word.phase;
        const x = THREE.MathUtils.lerp(bx, tx, t);
        const y = THREE.MathUtils.lerp(by, ty, t) + word.angleRad * halfH * 6 * (1 - t);
        word.mesh.position.set(x, y, 0.3);
        word.mesh.rotation.z = beamAngle;
        /* converge hard: the words pack down into the gather point */
        const scaleH = halfH * (0.085 - t * 0.052);
        word.mesh.scale.set(scaleH * word.aspect, scaleH, 1);
        /* stay lit all the way in — the stream visibly STRIKES the core */
        word.material.opacity = Math.min(easeOut(t / 0.14), 1 - easeOut(Math.max(0, (t - 0.93) / 0.07))) * 0.95;
      }

      for (const word of outWords) {
        word.phase = (word.phase + dt * word.speed) % 1;
        const t = word.phase;
        /* fly the plate's width; the vertical component is damped so every
           ray stays on the plate for its whole flight */
        const flightX = halfW - px + halfW * 0.18;
        const x = px + t * flightX;
        const y = py - Math.tan(word.angleRad) * t * flightX * 0.52;
        const z = -1.0 + t * 3.4;
        word.mesh.position.set(x, y, z);
        word.mesh.rotation.z = Math.atan2(-Math.tan(word.angleRad) * 0.52, 1);
        const scaleH = halfH * 0.115;
        word.mesh.scale.set(scaleH * word.aspect, scaleH, 1);
        /* hold back until clear of the glass, then bloom */
        word.material.opacity =
          Math.min(easeOut(Math.max(0, (t - 0.07) / 0.15)), 1 - easeOut(Math.max(0, (t - 0.8) / 0.2))) * 0.96;
      }

      renderer.render(scene, camera);
    };

    let visible = true;
    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[entries.length - 1]?.isIntersecting ?? true;
      },
      { rootMargin: '80px' }
    );
    io.observe(el);

    if (reduced) {
      render(4.2);
    } else {
      renderer.setAnimationLoop(() => {
        const dt = Math.min(clock.getDelta(), 0.1);
        if (visible) render(dt);
      });
    }

    return () => {
      renderer.setAnimationLoop(null);
      io.disconnect();
      sizer.disconnect();
      pmrem.dispose();
      inTexture.texture.dispose();
      coreTex.dispose();
      outTextures.forEach((t) => t.texture.dispose());
      [...inWords, ...outWords].forEach((w) => {
        w.mesh.geometry.dispose();
        w.material.dispose();
      });
      prismGeo.dispose();
      prismMat.dispose();
      edges.geometry.dispose();
      (edges.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={holder} className={className} aria-hidden />;
}
