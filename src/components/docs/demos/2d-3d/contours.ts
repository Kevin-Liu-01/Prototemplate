import { bayerThresholds } from './bayer';
import type { CanvasEngine } from './canvas-loop';
import { cssRgb, type Rgb } from './ink';
import type { Presence } from './presence';

/**
 * Generative line work over one height field: contour lines, hachures, or
 * both, as an engraved map draws relief.
 *
 * The field is four Gaussian hills and basins that drift on slow Lissajous
 * paths, two long waves, and one more hill under the pointer. It is
 * sampled on a grid every 6 CSS pixels (5 under 520). Contours come from
 * marching squares over that grid, one segment per crossing, linearly
 * interpolated, with saddles split by the cell's mean; every fifth level
 * is an index contour, drawn heavier. Hachures are short strokes down the
 * slope on a jittered lattice, as long as the slope is steep, kept where
 * the slope faces away from a light at the upper left. Which strokes stay
 * is decided by an ordered 4 by 4 threshold per lattice point, so the
 * hachures thin out by the Bayer order instead of at random and the
 * pattern holds still while the field moves.
 */

export type ContourMode = 'contours' | 'hachures' | 'both';

export type ContourOptions = {
  canvas: HTMLCanvasElement;
  mode: ContourMode;
  /** the height between two contours; the field spans about 0 to 1.2 */
  interval: number;
  ink: Rgb;
};

export type ContourEngine = CanvasEngine & {
  /** the pointer in CSS pixels; the hill eases toward it, or jumps there with snap */
  point: (x: number, y: number, snap?: boolean) => void;
  set: (patch: Partial<Pick<ContourOptions, 'mode' | 'interval' | 'ink'>>) => void;
  /** segments drawn in the last paint, contours and hachures */
  counts: () => { contours: number; hachures: number };
};

const HILLS = [
  { a: 0.85, s: 0.34, cx: 0.55, cy: 0.42, ax: 0.32, ay: 0.12, w: 0.031, v: 0.043, p: 0.0 },
  { a: 0.6, s: 0.26, cx: 1.35, cy: 0.62, ax: 0.28, ay: 0.16, w: 0.024, v: 0.037, p: 1.7 },
  { a: -0.45, s: 0.3, cx: 0.95, cy: 0.2, ax: 0.22, ay: 0.1, w: 0.041, v: 0.029, p: 3.1 },
  { a: 0.5, s: 0.22, cx: 1.95, cy: 0.35, ax: 0.2, ay: 0.18, w: 0.035, v: 0.026, p: 4.4 },
] as const;
const POINTER_HILL = { a: 0.75, s: 0.13 };
const LIGHT = (() => {
  const x = -1;
  const y = -1;
  const z = 1.1;
  const n = Math.hypot(x, y, z);
  return { x: x / n, y: y / n, z: z / n };
})();
const BAYER4 = bayerThresholds(4);

function hash(x: number, y: number): number {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function createContours(options: ContourOptions): ContourEngine | null {
  const { canvas } = options;
  const context = canvas.getContext('2d');
  if (!context) return null;
  const ctx: CanvasRenderingContext2D = context;

  let mode = options.mode;
  let interval = options.interval;
  let ink = options.ink;

  let width = 1;
  let height = 1;
  let dpr = 1;
  let pitch = 6;
  let nx = 2;
  let ny = 2;
  let field = new Float32Array(4);
  let time = 0;

  let hx = 0;
  let hy = 0;
  let tx = 0;
  let ty = 0;
  let moved = false;

  let normal = new Float32Array(4096);
  let index = new Float32Array(1024);
  let hatch = new Float32Array(4096);
  let nCount = 0;
  let iCount = 0;
  let hCount = 0;

  const grow = (buf: Float32Array<ArrayBuffer>, need: number): Float32Array<ArrayBuffer> => {
    if (need <= buf.length) return buf;
    const next = new Float32Array(Math.max(need, buf.length * 2));
    next.set(buf);
    return next;
  };

  /* Every term of the field separates into a column factor times a row
     factor, so a frame computes each factor once per column and once per
     row and the grid costs a few multiplies a node: a Gaussian is
     exp(-dx²/2s²)·exp(-dy²/2s²), and sin(A - B) = sin A·cos B - cos A·sin B. */
  const TERMS = HILLS.length + 1;
  let colF = new Float32Array(0);
  let rowF = new Float32Array(0);
  let waveCol = new Float32Array(0);
  let waveRow = new Float32Array(0);

  function sample() {
    if (colF.length !== TERMS * nx) {
      colF = new Float32Array(TERMS * nx);
      waveCol = new Float32Array(3 * nx);
    }
    if (rowF.length !== TERMS * ny) {
      rowF = new Float32Array(TERMS * ny);
      waveRow = new Float32Array(3 * ny);
    }
    const centres: { x: number; y: number; a: number; k: number }[] = HILLS.map((hill) => ({
      x: hill.cx + hill.ax * Math.sin(hill.w * time * 6 + hill.p),
      y: hill.cy + hill.ay * Math.cos(hill.v * time * 6 + hill.p * 0.7),
      a: hill.a,
      k: 1 / (2 * hill.s * hill.s),
    }));
    centres.push({ x: hx / height, y: hy / height, a: POINTER_HILL.a, k: 1 / (2 * POINTER_HILL.s * POINTER_HILL.s) });
    for (let i = 0; i < nx; i++) {
      const u = (i * pitch) / height;
      for (let t = 0; t < TERMS; t++) {
        const c = centres[t];
        if (!c) continue;
        const d = u - c.x;
        colF[t * nx + i] = c.a * Math.exp(-d * d * c.k);
      }
      waveCol[i] = Math.sin(1.3 * u + 0.11 * time);
      waveCol[nx + i] = Math.sin(2.7 * u + 0.05 * time);
      waveCol[2 * nx + i] = Math.cos(2.7 * u + 0.05 * time);
    }
    for (let j = 0; j < ny; j++) {
      const v = (j * pitch) / height;
      for (let t = 0; t < TERMS; t++) {
        const c = centres[t];
        if (!c) continue;
        const d = v - c.y;
        rowF[t * ny + j] = Math.exp(-d * d * c.k);
      }
      waveRow[j] = Math.sin(1.9 * v - 0.07 * time);
      waveRow[ny + j] = Math.cos(1.4 * v);
      waveRow[2 * ny + j] = Math.sin(1.4 * v);
    }
    for (let j = 0; j < ny; j++) {
      const w0 = 0.18 * (waveRow[j] ?? 0);
      const wc = 0.1 * (waveRow[ny + j] ?? 0);
      const ws = 0.1 * (waveRow[2 * ny + j] ?? 0);
      for (let i = 0; i < nx; i++) {
        let h = 0.2 + w0 * (waveCol[i] ?? 0) + wc * (waveCol[nx + i] ?? 0) - ws * (waveCol[2 * nx + i] ?? 0);
        for (let t = 0; t < TERMS; t++) h += (colF[t * nx + i] ?? 0) * (rowF[t * ny + j] ?? 0);
        field[j * nx + i] = h;
      }
    }
  }

  let ex = 0;
  let ey = 0;
  /* writes the crossing of `level` on edge e of the cell at (x, y) into ex, ey */
  function edge(e: number, level: number, x: number, y: number, a: number, b: number, c: number, d: number) {
    if (e === 0) {
      ex = x + ((level - a) / (b - a)) * pitch;
      ey = y;
    } else if (e === 1) {
      ex = x + pitch;
      ey = y + ((level - b) / (c - b)) * pitch;
    } else if (e === 2) {
      ex = x + ((level - d) / (c - d)) * pitch;
      ey = y + pitch;
    } else {
      ex = x;
      ey = y + ((level - a) / (d - a)) * pitch;
    }
  }

  function contours() {
    nCount = 0;
    iCount = 0;
    const push = (heavy: boolean, x0: number, y0: number, x1: number, y1: number) => {
      if (heavy) {
        index = grow(index, iCount + 4);
        index[iCount++] = x0;
        index[iCount++] = y0;
        index[iCount++] = x1;
        index[iCount++] = y1;
      } else {
        normal = grow(normal, nCount + 4);
        normal[nCount++] = x0;
        normal[nCount++] = y0;
        normal[nCount++] = x1;
        normal[nCount++] = y1;
      }
    };
    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        const a = field[j * nx + i] ?? 0;
        const b = field[j * nx + i + 1] ?? 0;
        const c = field[(j + 1) * nx + i + 1] ?? 0;
        const d = field[(j + 1) * nx + i] ?? 0;
        const min = Math.min(a, b, c, d);
        const max = Math.max(a, b, c, d);
        const first = Math.ceil(min / interval);
        const last = Math.floor(max / interval);
        if (first > last) continue;
        const x = i * pitch;
        const y = j * pitch;
        for (let k = first; k <= last; k++) {
          const level = k * interval;
          const heavy = k % 5 === 0;
          const code = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
          if (code === 0 || code === 15) continue;
          /* the crossings on the four edges, by number: 0 top a-b, 1 right b-c, 2 bottom d-c, 3 left a-d */
          const seg = (e: number, f: number) => {
            edge(e, level, x, y, a, b, c, d);
            const x0 = ex;
            const y0 = ey;
            edge(f, level, x, y, a, b, c, d);
            push(heavy, x0, y0, ex, ey);
          };
          switch (code) {
            case 1:
            case 14:
              seg(3, 2);
              break;
            case 2:
            case 13:
              seg(2, 1);
              break;
            case 3:
            case 12:
              seg(3, 1);
              break;
            case 4:
            case 11:
              seg(0, 1);
              break;
            case 6:
            case 9:
              seg(0, 2);
              break;
            case 7:
            case 8:
              seg(3, 0);
              break;
            case 5:
            case 10: {
              const centre = (a + b + c + d) / 4 > level;
              if ((code === 5) === centre) {
                seg(3, 0);
                seg(2, 1);
              } else {
                seg(3, 2);
                seg(0, 1);
              }
              break;
            }
          }
        }
      }
    }
  }

  /* the lattice's jitter, fixed per lattice point and kept between frames */
  let jitter = new Float32Array(0);
  let jitterCols = 0;

  function hachures() {
    hCount = 0;
    const lattice = pitch + 1;
    const cols = Math.ceil(width / lattice);
    const rows = Math.ceil(height / lattice);
    if (jitter.length !== cols * rows * 2 || jitterCols !== cols) {
      jitter = new Float32Array(cols * rows * 2);
      jitterCols = cols;
      for (let r = 0; r < rows; r++)
        for (let q = 0; q < cols; q++) {
          jitter[(r * cols + q) * 2] = (q + 0.2 + 0.6 * hash(q, r)) * lattice;
          jitter[(r * cols + q) * 2 + 1] = (r + 0.2 + 0.6 * hash(r + 911, q)) * lattice;
        }
    }
    for (let r = 0; r < rows; r++) {
      for (let q = 0; q < cols; q++) {
        const sx = jitter[(r * cols + q) * 2] ?? 0;
        const sy = jitter[(r * cols + q) * 2 + 1] ?? 0;
        const gi = Math.min(nx - 2, Math.max(0, Math.floor(sx / pitch)));
        const gj = Math.min(ny - 2, Math.max(0, Math.floor(sy / pitch)));
        const a = field[gj * nx + gi] ?? 0;
        const b = field[gj * nx + gi + 1] ?? 0;
        const d = field[(gj + 1) * nx + gi] ?? 0;
        const c = field[(gj + 1) * nx + gi + 1] ?? 0;
        /* the slope in height per stage height, from the cell's corners */
        const gx = ((b - a + (c - d)) / 2 / pitch) * height;
        const gy = ((d - a + (c - b)) / 2 / pitch) * height;
        const slope = Math.hypot(gx, gy);
        if (slope < 0.4) continue;
        const nz = 1 / Math.hypot(gx, gy, 1);
        const lit = -gx * nz * LIGHT.x - gy * nz * LIGHT.y + nz * LIGHT.z;
        const shade = Math.min(1, (1 - lit) * 1.15) * Math.min(1, slope / 3.2);
        if (shade <= (BAYER4[(r % 4) * 4 + (q % 4)] ?? 1)) continue;
        const len = Math.min(lattice * 1.5, lattice * (0.45 + slope * 0.22)) / 2;
        const ux = -gx / slope;
        const uy = -gy / slope;
        hatch = grow(hatch, hCount + 4);
        hatch[hCount++] = sx - ux * len;
        hatch[hCount++] = sy - uy * len;
        hatch[hCount++] = sx + ux * len;
        hatch[hCount++] = sy + uy * len;
      }
    }
  }

  const stroke = (buf: Float32Array, n: number, lineWidth: number, alpha: number) => {
    if (!n) return;
    ctx.beginPath();
    for (let k = 0; k < n; k += 4) {
      ctx.moveTo(buf[k] ?? 0, buf[k + 1] ?? 0);
      ctx.lineTo(buf[k + 2] ?? 0, buf[k + 3] ?? 0);
    }
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = cssRgb(ink, alpha);
    ctx.stroke();
  };

  function paint() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'butt';
    sample();
    if (mode !== 'hachures') contours();
    else {
      nCount = 0;
      iCount = 0;
    }
    if (mode !== 'contours') hachures();
    else hCount = 0;
    stroke(hatch, hCount, 1, mode === 'both' ? 0.5 : 0.85);
    stroke(normal, nCount, 1, 0.5);
    stroke(index, iCount, 1.5, 1);
  }

  function rest() {
    tx = width * 0.68;
    ty = height * 0.46;
    hx = tx;
    hy = ty;
  }

  return {
    resize(state: Presence) {
      const prevW = width;
      const prevH = height;
      width = Math.max(1, state.width);
      height = Math.max(1, state.height);
      dpr = state.dpr;
      pitch = width < 520 ? 5 : 6;
      nx = Math.ceil(width / pitch) + 2;
      ny = Math.ceil(height / pitch) + 2;
      field = new Float32Array(nx * ny);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      if (!moved || prevW <= 1) rest();
      else {
        tx *= width / prevW;
        ty *= height / prevH;
        hx = tx;
        hy = ty;
      }
    },
    step(delta) {
      time += delta;
      const ease = 1 - Math.exp(-delta * 8);
      hx += (tx - hx) * ease;
      hy += (ty - hy) * ease;
    },
    paint,
    still() {
      time = 18;
      moved = false;
      rest();
    },
    point(x, y, snap = false) {
      moved = true;
      tx = x;
      ty = y;
      if (snap) {
        hx = x;
        hy = y;
      }
    },
    set(patch) {
      if (patch.mode) mode = patch.mode;
      if (patch.interval) interval = patch.interval;
      if (patch.ink) ink = patch.ink;
    },
    counts: () => ({ contours: (nCount + iCount) / 4, hachures: hCount / 4 }),
  };
}
