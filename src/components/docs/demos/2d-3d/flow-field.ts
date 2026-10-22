import { bayerThresholds, type MatrixSize } from './bayer';
import type { CanvasEngine } from './canvas-loop';
import { packRgb, type Rgb } from './ink';
import type { Presence } from './presence';

/**
 * A smoke rake in a stream that parts around the pointer, printed as a
 * dithered density.
 *
 * Particles leave a rake of nozzles on the left edge, one every 24 CSS
 * pixels, and ride a uniform stream of U pixels a second to the right plus
 * three travelling cells of a stream function ψ = a·sin(kx·x + ωt)·sin(ky·y),
 * whose velocity (∂ψ/∂y, −∂ψ/∂x) is exact and has no divergence. Around the
 * obstacle the uniform stream becomes the potential flow past a cylinder
 * of radius R, u − iv = U(1 − R²/z²), and the cells fade out within 2.4 R,
 * so each filament splits ahead of the pointer and closes behind it. A
 * random walk of diffusivity D spreads each filament as it travels, so a
 * line that leaves its nozzle one cell wide arrives as a soft band.
 *
 * Each particle adds to a density grid at its cell, the grid decays by
 * e^(−3t), and the paint thresholds the grid through the Bayer matrix, one
 * buffer pixel per cell, upscaled by CSS with image-rendering: pixelated.
 * The filaments are whole cells of one ink: solid where particles crowd,
 * dithered where they spread.
 */

export type FlowOptions = {
  canvas: HTMLCanvasElement;
  /** CSS pixels per cell */
  cell: number;
  /** particles in the field */
  count: number;
  /** the random walk's diffusivity in px² per second; 0 keeps the filaments thin */
  spread: number;
  matrix: MatrixSize;
  ink: Rgb;
};

export type FlowEngine = CanvasEngine & {
  /**
   * The pointer in CSS pixels over the stage; the obstacle follows it and
   * stays where it last was. With settle, the obstacle moves there at once
   * and the field is simulated around it from empty, for a still.
   */
  point: (x: number, y: number, settle?: boolean) => void;
  set: (patch: Partial<Pick<FlowOptions, 'cell' | 'count' | 'spread' | 'matrix' | 'ink'>>) => void;
};

const MAX = 6000;
const U = 64;
const NOZZLE = 24;
const DECAY = 3;
const DEPOSIT = 0.22;
const SEED = 7;
/* the three cells of the stream function: amplitude as a share of U, wave numbers in rad/px, drift in rad/s */
const CELLS = [
  { a: 0.24, kx: 0.016, ky: 0.021, w: 0.4, p: 0.0, q: 1.3 },
  { a: 0.14, kx: 0.027, ky: 0.015, w: -0.5, p: 2.1, q: 0.4 },
  { a: 0.06, kx: 0.045, ky: 0.04, w: 0.8, p: 4.0, q: 2.6 },
] as const;

function mulberry(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createFlowField(options: FlowOptions): FlowEngine | null {
  const { canvas } = options;
  const context = canvas.getContext('2d');
  if (!context) return null;
  const ctx: CanvasRenderingContext2D = context;

  let cell = options.cell;
  let count = Math.min(MAX, options.count);
  let spread = options.spread;
  let matrix = options.matrix;
  let thresholds = bayerThresholds(matrix);
  let ink = packRgb(options.ink);

  let width = 1;
  let height = 1;
  let cols = 1;
  let rows = 1;
  let density = new Float32Array(1);
  let image = ctx.createImageData(1, 1);
  let pixels = new Uint32Array(image.data.buffer);

  const px = new Float32Array(MAX);
  const py = new Float32Array(MAX);
  let random = mulberry(SEED);
  let time = 0;

  /* the obstacle eases toward its target */
  let ox = 0;
  let oy = 0;
  let tx = 0;
  let ty = 0;
  let radius = 0;
  let moved = false;

  let vu = 0;
  let vv = 0;
  function velocity(x: number, y: number) {
    let nu = 0;
    let nv = 0;
    for (const c of CELLS) {
      const amp = (c.a * U) / Math.max(c.kx, c.ky);
      const sx = Math.sin(c.kx * x + c.w * time + c.p);
      const cx = Math.cos(c.kx * x + c.w * time + c.p);
      const sy = Math.sin(c.ky * y + c.q);
      const cy = Math.cos(c.ky * y + c.q);
      nu += amp * c.ky * sx * cy;
      nv -= amp * c.kx * cx * sy;
    }
    const dx = x - ox;
    const dy = y - oy;
    const r2 = dx * dx + dy * dy;
    const R2 = radius * radius;
    if (R2 < 1 || r2 < 1e-3) {
      vu = U + nu;
      vv = nv;
      return;
    }
    const r4 = r2 * r2;
    const k = Math.min(1, Math.max(0, (Math.sqrt(r2) - radius) / (1.4 * radius)));
    const fade = k * k * (3 - 2 * k);
    vu = U * (1 - (R2 * (dx * dx - dy * dy)) / r4) + fade * nu;
    vv = (-U * 2 * R2 * dx * dy) / r4 + fade * nv;
  }

  /* a particle leaves a nozzle a little left of the edge, staggered so the rake emits evenly */
  function emit(i: number) {
    const nozzles = Math.max(1, Math.floor(height / NOZZLE));
    const gap = (height - (nozzles - 1) * NOZZLE) / 2;
    px[i] = -random() * 12;
    py[i] = gap + Math.floor(random() * nozzles) * NOZZLE + (random() - 0.5);
  }

  function seed() {
    random = mulberry(SEED);
    for (let i = 0; i < MAX; i++) {
      emit(i);
      px[i] = -random() * (width + 24);
    }
    density.fill(0);
  }

  function rest() {
    tx = width * 0.3;
    ty = height * 0.5 + NOZZLE / 2;
    ox = tx;
    oy = ty;
  }

  /* gaussian steps for the random walk, from two uniforms */
  function gauss(): number {
    return Math.sqrt(-2 * Math.log(random() + 1e-9)) * Math.cos(2 * Math.PI * random());
  }

  function step(delta: number, deposit = true) {
    time += delta;
    const ease = 1 - Math.exp(-delta * 12);
    ox += (tx - ox) * ease;
    oy += (ty - oy) * ease;
    const target = Math.min(width, height) * 0.14;
    radius += (target - radius) * (1 - Math.exp(-delta * 6));
    const fade = Math.exp(-delta * DECAY);
    for (let i = 0; i < density.length; i++) density[i] = (density[i] ?? 0) * fade;
    const add = DEPOSIT * delta * 60;
    const walk = Math.sqrt(2 * spread * delta);
    for (let i = 0; i < count; i++) {
      let x = px[i] ?? 0;
      let y = py[i] ?? 0;
      velocity(x, y);
      x += vu * delta;
      y += vv * delta;
      if (walk > 0 && x > 0) {
        x += gauss() * walk * 0.5;
        y += gauss() * walk;
      }
      const dx = x - ox;
      const dy = y - oy;
      const r2 = dx * dx + dy * dy;
      if (r2 < radius * radius && r2 > 1e-6) {
        const s = (radius * 1.01) / Math.sqrt(r2);
        x = ox + dx * s;
        y = oy + dy * s;
      }
      px[i] = x;
      py[i] = y;
      if (x > width + 4 || y < -40 || y > height + 40) {
        emit(i);
        continue;
      }
      if (!deposit || x < 0 || y < 0) continue;
      const gx = (x / cell) | 0;
      const gy = (y / cell) | 0;
      if (gx < cols && gy < rows) {
        const at = gy * cols + gx;
        density[at] = (density[at] ?? 0) + add;
      }
    }
  }

  /* fills the field before the first paint: one crossing of the stage at 20 steps a second, depositing only in the last second */
  function prime() {
    const seconds = width / U + 1;
    const steps = Math.ceil(seconds * 20);
    for (let s = 0; s < steps; s++) step(1 / 20, s >= steps - 20);
  }

  function resize(state: Presence, fresh = false) {
    const prevW = width;
    const prevH = height;
    width = Math.max(1, state.width);
    height = Math.max(1, state.height);
    cols = Math.ceil(width / cell);
    rows = Math.ceil(height / cell);
    canvas.width = cols;
    canvas.height = rows;
    canvas.style.width = `${cols * cell}px`;
    canvas.style.height = `${rows * cell}px`;
    density = new Float32Array(cols * rows);
    image = ctx.createImageData(cols, rows);
    pixels = new Uint32Array(image.data.buffer);
    if (!moved || prevW <= 1) rest();
    else {
      tx *= width / prevW;
      ty *= height / prevH;
      ox = tx;
      oy = ty;
    }
    radius = Math.min(width, height) * 0.14;
    if (fresh || prevW <= 1) {
      seed();
      prime();
      return;
    }
    /* a resize keeps the particles in place, scaled to the new box; the density refills in a fraction of a second */
    for (let i = 0; i < MAX; i++) {
      px[i] = (px[i] ?? 0) * (width / prevW);
      py[i] = (py[i] ?? 0) * (height / prevH);
    }
  }

  function paint() {
    const n = matrix;
    for (let y = 0; y < rows; y++) {
      const row = y * cols;
      const band = (y % n) * n;
      for (let x = 0; x < cols; x++) pixels[row + x] = (density[row + x] ?? 0) > (thresholds[band + (x % n)] ?? 1) ? ink : 0;
    }
    ctx.putImageData(image, 0, 0);
  }

  return {
    resize,
    step: (delta) => {
      /* two substeps above 40 fps' delta keep fast particles on their streamlines */
      if (delta > 1 / 40) {
        step(delta / 2);
        step(delta / 2);
      } else step(delta);
    },
    paint,
    still() {
      time = 0;
      moved = false;
      rest();
      radius = Math.min(width, height) * 0.14;
      seed();
      prime();
    },
    point(x, y, settle = false) {
      moved = true;
      tx = Math.max(0, Math.min(width, x));
      ty = Math.max(0, Math.min(height, y));
      if (!settle) return;
      ox = tx;
      oy = ty;
      time = 0;
      seed();
      prime();
    },
    set(patch) {
      if (patch.ink) ink = packRgb(patch.ink);
      if (patch.matrix) {
        matrix = patch.matrix;
        thresholds = bayerThresholds(matrix);
      }
      if (patch.count) count = Math.min(MAX, patch.count);
      if (patch.spread !== undefined) spread = patch.spread;
      if (patch.cell && patch.cell !== cell) {
        cell = patch.cell;
        resize({ width, height, dpr: 1, near: true, visible: true, hidden: false, reduced: false }, true);
      }
    },
  };
}
