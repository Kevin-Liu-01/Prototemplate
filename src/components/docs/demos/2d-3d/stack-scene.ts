import {
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  EdgesGeometry,
  Float32BufferAttribute,
  Group,
  LineSegments,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  Vector3,
} from 'three';
import type { Object3D, Texture } from 'three';

import type { SceneEnv, SceneInstance } from './dither-stage';
import type { Turn } from './drag';
import { glyphMaterial, inkMaterial, lightFrom, lightUniform, lineMaterial } from './materials';

/**
 * GT's pipeline as an isometric stack: content on top, translation in the
 * middle, the CDN at the bottom. The camera is orthographic and looks down
 * (1, 1, 1), the true isometric view, so its projection is the iso kit's
 * 30 degree map: +x runs down to the right, +z down to the left and +y up.
 * The plates keep the family's proportions: a 2 unit footprint, 4 percent
 * of it thick, and 40 percent of it as air when the stack stands open.
 *
 * Each face carries its artifact in its own plane: the `<T>` component on
 * content, three locale chips on translation (`ja` is the drawing's one
 * accent object) and a square marker for each point of presence on the
 * CDN. Leaders leave each plate's left vertex at mid-thickness and run to
 * the left, where the plate's HTML label sits.
 *
 * One clock drives the stack, 7.2 seconds a lap: closed for 1.6 s, open
 * over 1.2 s with the top plate leading by 90 ms a plate, open for 2.4 s,
 * closed again over 1.2 s with the bottom plate leading, so a plate never
 * passes through the one under it. The still is the open stack at 4 s.
 */

export const STACK_LAYERS = ['CDN', 'Translation', 'Content'] as const;

const FOOT = 2;
const THICK = 0.08;
const AIR_CLOSED = 0.24;
const AIR_OPEN = 0.8;
const LAP = 7.2;
const STAGGER = 0.09;
const LEADER = 0.62;
const CHIPS = [
  { code: 'en', x: -0.42 },
  { code: 'fr', x: 0.12 },
  { code: 'ja', x: 0.66 },
] as const;
const CHIP = 0.38;
const CHIP_H = 0.07;

export type StackState = {
  turn: Turn;
  /** the light's azimuth from the viewer's line, in degrees; negative is the left */
  light: number;
  labels: readonly (HTMLElement | null)[];
};

function ease(k: number): number {
  return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
}

/** How open plate i stands at time t, 0 closed to 1 open, on the shared lap. */
export function openness(t: number, i: number): number {
  const phase = ((t % LAP) + LAP) % LAP;
  const lead = (STACK_LAYERS.length - 1 - i) * STAGGER;
  const lag = i * STAGGER;
  if (phase < 1.6 + lead) return 0;
  if (phase < 2.8 + lead) return ease((phase - 1.6 - lead) / 1.2);
  if (phase < 5.2 + lag) return 1;
  if (phase < 6.4 + lag) return 1 - ease((phase - 5.2 - lag) / 1.2);
  return 0;
}

function faceTexture(draw: (ctx: CanvasRenderingContext2D, size: number) => void): CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'white';
    draw(ctx, size);
  }
  const texture = new CanvasTexture(canvas);
  texture.generateMipmaps = false;
  return texture;
}

/** A flat plane lying on a top face: canvas right is +x and canvas bottom is +z, toward the viewer. */
function facePlane(width: number, depth: number): PlaneGeometry {
  const plane = new PlaneGeometry(width, depth);
  plane.rotateX(-Math.PI / 2);
  return plane;
}

export function buildStackScene(env: SceneEnv, read: () => StackState, fonts: { text: string; mono: string }): SceneInstance {
  const light = lightUniform();
  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(item: T): T => {
    disposables.push(item);
    return item;
  };

  const plateGeometry = keep(new BoxGeometry(FOOT, THICK, FOOT));
  const plateEdges = keep(new EdgesGeometry(plateGeometry));
  const chipGeometry = keep(new BoxGeometry(CHIP, CHIP_H, CHIP));
  const chipEdges = keep(new EdgesGeometry(chipGeometry));
  const plateMaterial = keep(inkMaterial({ light, ambient: 0.14, spec: 0.05, shine: 20 }));
  const chipMaterial = keep(inkMaterial({ light, ambient: 0.18, spec: 0.05, shine: 20 }));
  const accentMaterial = keep(inkMaterial({ light, ambient: 0.18, spec: 0.05, shine: 20, accent: true }));
  const accentLines = keep(lineMaterial(0.7, true));

  const scene = new Scene();
  const stack = new Group();
  scene.add(stack);

  const textures: Texture[] = [];
  const art = (draw: (ctx: CanvasRenderingContext2D, size: number) => void, width = FOOT, depth = FOOT): Mesh => {
    const texture = faceTexture(draw);
    textures.push(texture);
    const mesh = new Mesh(keep(facePlane(width, depth)), keep(glyphMaterial(texture)));
    return mesh;
  };

  const plates: { group: Group; anchor: Vector3 }[] = [];
  STACK_LAYERS.forEach((layer, i) => {
    const d = i / (STACK_LAYERS.length - 1);
    const group = new Group();
    group.add(new Mesh(plateGeometry, plateMaterial));
    group.add(new LineSegments(plateEdges, keep(lineMaterial(0.42 + 0.3 * d))));

    let face: Object3D;
    if (layer === 'Content') {
      face = art((ctx, size) => {
        ctx.font = `500 ${size * 0.22}px ${fonts.mono}`;
        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = 'right';
        ctx.fillText('<T>', size * 0.9, size * 0.88);
      });
    } else if (layer === 'CDN') {
      face = art((ctx, size) => {
        /* a square marker for each point of presence, on a 5 by 5 lattice */
        const pitch = size / 6;
        const mark = size * 0.03;
        for (let r = 1; r < 6; r++)
          for (let c = 1; c < 6; c++) ctx.fillRect(c * pitch - mark / 2, r * pitch - mark / 2, mark, mark);
      });
    } else {
      face = new Group();
      CHIPS.forEach((chip) => {
        const accent = chip.code === 'ja';
        const box = new Mesh(chipGeometry, accent ? accentMaterial : chipMaterial);
        box.position.set(chip.x, THICK / 2 + CHIP_H / 2, 0.52);
        group.add(box);
        const edges = new LineSegments(chipEdges, accent ? accentLines : keep(lineMaterial(0.5)));
        edges.position.copy(box.position);
        group.add(edges);
        const label = art(
          (ctx, size) => {
            ctx.font = `500 ${size * 0.46}px ${fonts.mono}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(chip.code, size / 2, size * 0.52);
          },
          CHIP,
          CHIP
        );
        label.position.set(chip.x, THICK / 2 + CHIP_H + 0.002, 0.52);
        group.add(label);
      });
    }
    face.position.y = THICK / 2 + 0.002;
    group.add(face);

    /* the leader: from the left vertex at mid-thickness, out along the screen's left */
    const start = new Vector3(-FOOT / 2, 0, FOOT / 2);
    const anchor = start.clone().add(new Vector3(-LEADER, 0, LEADER));
    const leader = keep(new BufferGeometry());
    leader.setAttribute('position', new Float32BufferAttribute([start.x, 0, start.z, anchor.x, 0, anchor.z], 3));
    group.add(new LineSegments(leader, keep(lineMaterial(0.5))));

    stack.add(group);
    plates.push({ group, anchor });
  });

  const camera = new OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  const middle = (STACK_LAYERS.length - 1) * (THICK + AIR_OPEN) * 0.5;
  camera.position.set(10, 10 + middle, 10);
  camera.lookAt(0, middle, 0);
  camera.updateMatrixWorld();

  let width = env.width;
  let height = env.height;

  /* fit the open stack and its leaders into the stage, with room on the left for the labels */
  const fit = (w: number, h: number) => {
    width = w;
    height = h;
    const view = camera.matrixWorldInverse;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    const p = new Vector3();
    for (let i = 0; i < STACK_LAYERS.length; i++) {
      const y = i * (THICK + AIR_OPEN);
      for (const [x, z] of [
        [-FOOT / 2, -FOOT / 2],
        [FOOT / 2, -FOOT / 2],
        [FOOT / 2, FOOT / 2],
        [-FOOT / 2, FOOT / 2],
        [-FOOT / 2 - LEADER, FOOT / 2 + LEADER],
      ] as const) {
        for (const dy of [-THICK / 2, THICK / 2 + CHIP_H]) {
          p.set(x, y + dy, z).applyMatrix4(view);
          minX = Math.min(minX, p.x);
          maxX = Math.max(maxX, p.x);
          minY = Math.min(minY, p.y);
          maxY = Math.max(maxY, p.y);
        }
      }
    }
    const labelRoom = w < 520 ? 78 : 96;
    const pad = w < 520 ? 14 : 24;
    const top = 40;
    const availW = Math.max(40, w - labelRoom - pad * 2);
    const availH = Math.max(40, h - top - pad);
    const scale = Math.min(availW / (maxX - minX), availH / (maxY - minY));
    const left = minX - (labelRoom + pad + (availW - (maxX - minX) * scale) / 2) / scale;
    const upper = maxY + (top + (availH - (maxY - minY) * scale) / 2) / scale;
    camera.left = left;
    camera.right = left + w / scale;
    camera.top = upper;
    camera.bottom = upper - h / scale;
    camera.updateProjectionMatrix();
  };
  fit(env.width, env.height);

  const projected = new Vector3();

  return {
    scene,
    camera,
    gain: { dark: 0.62, light: 0.36 },
    update(time) {
      const state = read();
      stack.rotation.y = state.turn.yaw;
      lightFrom(45 + state.light, 58, light.value);
      plates.forEach((plate, i) => {
        plate.group.position.y = i * (THICK + AIR_CLOSED + (AIR_OPEN - AIR_CLOSED) * openness(time, i));
      });
    },
    resize: fit,
    afterRender() {
      const { labels } = read();
      stack.updateMatrixWorld();
      plates.forEach((plate, i) => {
        const el = labels[i];
        if (!el) return;
        projected.copy(plate.anchor).applyMatrix4(plate.group.matrixWorld).project(camera);
        const x = Math.round(((projected.x + 1) / 2) * width);
        const y = Math.round(((1 - projected.y) / 2) * height);
        el.style.transform = `translate(${x}px, ${y}px)`;
        el.dataset.ready = 'true';
      });
    },
    dispose() {
      for (const item of disposables) item.dispose();
      for (const texture of textures) texture.dispose();
    },
  };
}
