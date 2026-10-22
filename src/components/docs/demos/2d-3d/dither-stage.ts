import {
  Color,
  Mesh,
  NearestFilter,
  OrthographicCamera,
  PlaneGeometry,
  RGBAFormat,
  Scene,
  ShaderMaterial,
  UnsignedByteType,
  Vector2,
  Vector3,
  WebGLRenderTarget,
  WebGLRenderer,
} from 'three';
import type { Camera } from 'three';

import { bayerUniform, type MatrixSize } from './bayer';
import type { StageInks } from './ink';
import { costMeter, watchPresence } from './presence';

/**
 * A three.js scene printed through the house Bayer screen, with its WebGL
 * context held to the plate's time near the viewport.
 *
 * The scene renders into an offscreen target whose four channels are data,
 * never color: red is the light a surface receives (0 to 1), green marks
 * the one accent object, blue is a hairline's strength and alpha says a
 * surface was drawn. A fullscreen pass then reads the target once per
 * screen cell: it divides gl_FragCoord into square cells of a whole number
 * of device pixels, anchored at the canvas's top left, reads the light at
 * each cell's centre and lights the cell when the coverage is over the
 * matrix threshold. Hairlines are read per pixel, so they stay one device
 * pixel wide at any cell size, and each takes the ground where it crosses
 * dense cells and the ink elsewhere.
 *
 * On a dark ground the coverage is the light; on paper a solid prints its
 * shade, one minus the light, so a lit face reads as paper with sparse ink
 * and a face away from the light prints dense, the order of the isometric
 * family's faces in both themes. A scene can ask to print its light in
 * ink on both grounds instead (onPaper: 'light', the globe). A floor keeps
 * a few cells on the brightest face so a solid never dissolves into the
 * ground, and the accent object keeps at least 30 percent coverage.
 *
 * Lifecycle: the stage creates its renderer and a fresh canvas when the
 * host comes within 300px of the viewport, builds the scene in the next
 * task and compiles its shaders with compileAsync before the first frame,
 * so no single task holds the main thread for the whole creation. It
 * releases everything 1.5 s after the host leaves that margin, or on
 * destroy(): the scene's dispose(), the target, the pass,
 * renderer.dispose() and renderer.forceContextLoss(), then the canvas
 * leaves the DOM. A plate therefore holds one context at most, and only
 * near the viewport. The loop runs only while the host is on screen, the
 * tab is visible and the plate is playing; reduced motion draws one still
 * at stillTime and redraws it only when a control or a drag changes the
 * picture. The pixel ratio is capped at 2.
 */

export type PassMode = 'dither' | 'tone' | 'split';

export type PassSettings = {
  /** the Bayer matrix's side */
  matrix: MatrixSize;
  /** a cell's side in CSS pixels, rounded to whole device pixels */
  cell: number;
  /** the screen, the continuous light, or both either side of a seam */
  mode: PassMode;
  /** the seam's place across the canvas in split mode, 0 to 1 */
  split: number;
};

export type SceneEnv = { renderer: WebGLRenderer; width: number; height: number; dpr: number };

export type SceneInstance = {
  scene: Scene;
  camera: Camera;
  /** pose the scene at its own clock, in seconds */
  update: (time: number, delta: number) => void;
  resize: (width: number, height: number) => void;
  /** runs after each frame reaches the screen, for DOM labels that follow the scene */
  afterRender?: () => void;
  /** scales the coverage on each ground, for a quieter material; 1 on both by default */
  gain?: { dark: number; light: number };
  /**
   * What the ink means on a paper ground: 'shade' (the default) prints the
   * shadow, so a lit face reads as paper; 'light' prints the light in ink
   * on both grounds, as the CPU dither globe does.
   */
  onPaper?: 'shade' | 'light';
  dispose: () => void;
};

export type DitherStageOptions = {
  /** the element the canvas fills and whose presence gates the context */
  host: HTMLElement;
  build: (env: SceneEnv) => SceneInstance;
  pass: PassSettings;
  inks: StageInks;
  /** the still's instant on the scene clock */
  stillTime: number;
  /** the clock's rate; 1 by default */
  speed?: number;
  /** false shows the still */
  playing?: boolean;
  /** the main-thread cost of a frame, smoothed, at most twice a second */
  onCost?: (ms: number) => void;
  /** fires when WebGL is unavailable */
  onFail?: () => void;
};

export type DitherStageHandle = {
  setPass: (patch: Partial<PassSettings>) => void;
  setInks: (inks: StageInks) => void;
  setSpeed: (speed: number) => void;
  setPlaying: (playing: boolean) => void;
  /** draw one frame soon, without moving the clock */
  invalidate: () => void;
  destroy: () => void;
};

const VERT = `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

/* Shader notes, kept out of the literal so they never ship:
   - top flips gl_FragCoord to a top-left origin so the screen's phase
     matches the CPU engines, whose row 0 is the canvas's top row.
   - mid is the cell's centre texel; s is the light there, p the light at
     this pixel. Dither mode lights the whole cell from s; tone mode and the
     left of the seam mix ground and ink by p's coverage.
   - a hairline (p.b) mixes toward the ground over dense cells and toward
     the ink over sparse ones, at the strength the line wrote.
   - the accent object keeps at least 0.3 coverage, so it reads on a lit
     face on paper. */
const FRAG = `
uniform sampler2D tScene;
uniform vec2 uRes;
uniform float uCell;
uniform int uN;
uniform float uM[64];
uniform vec3 uInk;
uniform vec3 uGround;
uniform vec3 uAccent;
uniform float uInvert;
uniform float uFloor;
uniform float uGain;
uniform int uMode;
uniform float uSplit;

float coverOf(vec4 s) {
  float t = clamp(s.r, 0.0, 1.0);
  float c = mix(t, 1.0 - t, uInvert) * uGain;
  return s.a > 0.5 ? uFloor + (1.0 - uFloor) * c : 0.0;
}

void main() {
  vec2 px = gl_FragCoord.xy;
  vec2 top = vec2(px.x, uRes.y - px.y);
  vec2 cell = floor(top / uCell);
  vec2 mid = floor((cell + 0.5) * uCell) + 0.5;
  vec4 s = texture2D(tScene, vec2(mid.x, uRes.y - mid.y) / uRes);
  vec4 p = texture2D(tScene, px / uRes);
  float cover = coverOf(s);
  if (s.g > 0.5) cover = max(cover, 0.3);
  int ix = int(mod(cell.x, float(uN)));
  int iy = int(mod(cell.y, float(uN)));
  vec3 ink = s.g > 0.5 ? uAccent : uInk;
  vec3 col = cover > uM[iy * uN + ix] ? ink : uGround;
  if (uMode == 1 || (uMode == 2 && px.x < uSplit)) {
    cover = coverOf(p);
    col = mix(uGround, p.g > 0.5 ? uAccent : uInk, cover);
  }
  if (p.b > 0.003) {
    vec3 line = cover > 0.5 ? uGround : (p.g > 0.5 ? uAccent : uInk);
    col = mix(col, line, clamp(p.b, 0.0, 1.0));
  }
  if (uMode == 2 && floor(px.x) == floor(uSplit)) col = uInk;
  gl_FragColor = vec4(col, 1.0);
}
`;

const MODE_INDEX: Record<PassMode, number> = { dither: 0, tone: 1, split: 2 };
const RELEASE_MS = 1500;
const CLEAR = new Color(0, 0, 0);

export function createDitherStage(options: DitherStageOptions): DitherStageHandle {
  const { host, build, stillTime, onFail } = options;
  let pass = { ...options.pass };
  let inks = options.inks;
  let speed = options.speed ?? 1;
  let playing = options.playing ?? true;
  let clock = playing ? 0 : stillTime;
  let destroyed = false;
  let failed = false;

  let canvas: HTMLCanvasElement | null = null;
  let renderer: WebGLRenderer | null = null;
  let target: WebGLRenderTarget | null = null;
  let post: { scene: Scene; camera: OrthographicCamera; material: ShaderMaterial; geometry: PlaneGeometry } | null = null;
  let inst: SceneInstance | null = null;

  let loop = 0;
  let once = 0;
  let building = 0;
  let ready = false;
  let last = 0;
  let release = 0;
  let restore = 0;
  const meter = costMeter(options.onCost);

  const uniforms = {
    tScene: { value: null as WebGLRenderTarget['texture'] | null },
    uRes: { value: new Vector2(1, 1) },
    uCell: { value: 2 },
    uN: { value: pass.matrix },
    uM: { value: bayerUniform(pass.matrix) },
    uInk: { value: new Vector3() },
    uGround: { value: new Vector3() },
    uAccent: { value: new Vector3() },
    uInvert: { value: 0 },
    uFloor: { value: 0 },
    uGain: { value: 1 },
    uMode: { value: MODE_INDEX[pass.mode] },
    uSplit: { value: 0 },
  };

  const presence = watchPresence({
    el: host,
    onChange: () => {
      if (presence.state.near) {
        if (release) {
          window.clearTimeout(release);
          release = 0;
        }
        mount();
      } else if (canvas && !release) {
        release = window.setTimeout(() => {
          release = 0;
          if (!presence.state.near) unmount();
        }, RELEASE_MS);
      }
      sync();
    },
    onResize: () => {
      size();
      invalidate();
    },
  });

  function applyInks() {
    uniforms.uInk.value.set(...inks.ink);
    uniforms.uGround.value.set(...inks.ground);
    uniforms.uAccent.value.set(...inks.accent);
    uniforms.uInvert.value = inks.dark || inst?.onPaper === 'light' ? 0 : 1;
    uniforms.uFloor.value = inks.dark ? 0.015 : 0.05;
    const gain = inst?.gain;
    uniforms.uGain.value = gain ? (inks.dark ? gain.dark : gain.light) : 1;
  }

  function applyPass() {
    uniforms.uN.value = pass.matrix;
    uniforms.uM.value = bayerUniform(pass.matrix);
    uniforms.uMode.value = MODE_INDEX[pass.mode];
    const dpr = presence.state.dpr;
    uniforms.uCell.value = Math.max(1, Math.round(pass.cell * dpr));
    uniforms.uSplit.value = Math.round(uniforms.uRes.value.x * pass.split);
  }

  function size() {
    if (!renderer || !target) return;
    const { width, height, dpr } = presence.state;
    const w = Math.max(1, width);
    const h = Math.max(1, height);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    const buffer = renderer.getDrawingBufferSize(new Vector2());
    target.setSize(buffer.x, buffer.y);
    uniforms.uRes.value.copy(buffer);
    applyPass();
    inst?.resize(w, h);
  }

  function mount() {
    if (canvas || destroyed || failed) return;
    const begin = performance.now();
    const el = document.createElement('canvas');
    el.className = 'd23-canvas';
    el.setAttribute('aria-hidden', 'true');
    let next: WebGLRenderer;
    try {
      next = new WebGLRenderer({ canvas: el, antialias: false, alpha: false, depth: true, stencil: false, preserveDrawingBuffer: false });
    } catch {
      failed = true;
      host.dataset.d23Gl = 'none';
      onFail?.();
      return;
    }
    canvas = el;
    renderer = next;
    host.prepend(el);
    el.addEventListener('webglcontextlost', onLost);
    renderer.autoClear = false;
    target = new WebGLRenderTarget(1, 1, {
      format: RGBAFormat,
      type: UnsignedByteType,
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      generateMipmaps: false,
      depthBuffer: true,
      stencilBuffer: false,
    });
    uniforms.tScene.value = target.texture;
    const geometry = new PlaneGeometry(2, 2);
    const material = new ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG, depthTest: false, depthWrite: false });
    const scene = new Scene();
    scene.add(new Mesh(geometry, material));
    post = { scene, camera: new OrthographicCamera(-1, 1, 1, -1, 0, 1), material, geometry };
    applyInks();
    const made = renderer;
    const tasks = [performance.now() - begin];
    /* the scene builds in the next task, and its shaders compile through
       compileAsync (KHR_parallel_shader_compile where the browser has it),
       so creating a context never holds the main thread for one long task */
    building = window.setTimeout(() => {
      building = 0;
      if (renderer !== made || !target || !post) return;
      const start = performance.now();
      const { width, height, dpr } = presence.state;
      inst = build({ renderer: made, width: Math.max(1, width), height: Math.max(1, height), dpr });
      applyInks();
      size();
      made.setRenderTarget(target);
      const scenePrograms = made.compileAsync(inst.scene, inst.camera);
      made.setRenderTarget(null);
      const passPrograms = made.compileAsync(post.scene, post.camera);
      tasks.push(performance.now() - start);
      Promise.all([scenePrograms, passPrograms]).then(
        () => {
          if (renderer !== made) return;
          const first = performance.now();
          ready = true;
          host.dataset.d23Gl = 'live';
          draw(0);
          tasks.push(performance.now() - first);
          /* the main-thread time of each of the three tasks that create a context */
          host.dataset.d23Mount = tasks.map((ms) => ms.toFixed(1)).join(' ');
          sync();
        },
        () => undefined
      );
    }, 0);
  }

  function unmount() {
    stopLoop();
    ready = false;
    if (building) {
      window.clearTimeout(building);
      building = 0;
    }
    if (once) {
      cancelAnimationFrame(once);
      once = 0;
    }
    inst?.dispose();
    inst = null;
    target?.dispose();
    target = null;
    post?.geometry.dispose();
    post?.material.dispose();
    post = null;
    if (renderer) {
      renderer.dispose();
      renderer.forceContextLoss();
      renderer = null;
    }
    canvas?.removeEventListener('webglcontextlost', onLost);
    canvas?.remove();
    canvas = null;
    if (!destroyed) host.dataset.d23Gl = 'released';
  }

  /* The browser took the context (its budget is about 16 live contexts).
     Drop everything, and build again on a new canvas while the plate is
     still near. */
  function onLost(event: Event) {
    event.preventDefault();
    unmount();
    if (!restore)
      restore = window.setTimeout(() => {
        restore = 0;
        if (presence.state.near) mount();
        sync();
      }, 600);
  }

  function draw(delta: number) {
    if (!renderer || !target || !post || !inst || !ready) return;
    const start = performance.now();
    inst.update(clock, delta);
    renderer.setRenderTarget(target);
    renderer.setClearColor(CLEAR, 0);
    renderer.clear(true, true, false);
    renderer.render(inst.scene, inst.camera);
    renderer.setRenderTarget(null);
    renderer.render(post.scene, post.camera);
    inst.afterRender?.();
    meter(performance.now() - start);
  }

  const running = () => ready && presence.state.visible && !presence.state.hidden && playing && !presence.state.reduced;

  function tick(now: number) {
    loop = 0;
    if (!running()) return;
    const delta = last ? Math.min(0.1, (now - last) / 1000) * speed : 0;
    last = now;
    clock += delta;
    draw(delta);
    loop = requestAnimationFrame(tick);
  }

  function stopLoop() {
    if (loop) cancelAnimationFrame(loop);
    loop = 0;
    last = 0;
  }

  function sync() {
    if (!playing || presence.state.reduced) clock = stillTime;
    if (running()) {
      if (!loop) loop = requestAnimationFrame(tick);
    } else {
      stopLoop();
      invalidate();
    }
  }

  function invalidate() {
    if (!ready || loop || once) return;
    once = requestAnimationFrame(() => {
      once = 0;
      draw(0);
    });
  }

  return {
    setPass(patch) {
      pass = { ...pass, ...patch };
      applyPass();
      invalidate();
    },
    setInks(next) {
      inks = next;
      applyInks();
      invalidate();
    },
    setSpeed(next) {
      speed = next;
    },
    setPlaying(next) {
      playing = next;
      sync();
    },
    invalidate,
    destroy() {
      destroyed = true;
      if (release) window.clearTimeout(release);
      if (restore) window.clearTimeout(restore);
      presence.dispose();
      unmount();
      delete host.dataset.d23Gl;
      delete host.dataset.d23Mount;
    },
  };
}
