/**
 * The screens the dither lab compares. Each one turns a tone grid (0 to 1
 * per cell) into one bit per cell: a plain threshold, the 2 by 2, 4 by 4
 * and 8 by 8 Bayer matrices, a white-noise threshold, Floyd-Steinberg and
 * Atkinson error diffusion, and a 45 degree clustered-dot halftone. The
 * ordered screens compare each cell against a fixed map, so any cell can
 * be decided alone; the two diffusions walk the grid in order and carry
 * each cell's error to the cells after it.
 */

export type ScreenId = 'threshold' | 'bayer2' | 'bayer4' | 'bayer8' | 'random' | 'floyd' | 'atkinson' | 'halftone';

export const SCREEN_LABELS: Record<ScreenId, string> = {
  threshold: 'Threshold',
  bayer2: 'Bayer 2 by 2',
  bayer4: 'Bayer 4 by 4',
  bayer8: 'Bayer 8 by 8',
  random: 'White noise',
  floyd: 'Floyd-Steinberg',
  atkinson: 'Atkinson',
  halftone: 'Halftone',
};

/** The order the bench lays the screens out in. */
export const SCREEN_ORDER: readonly ScreenId[] = [
  'threshold',
  'bayer2',
  'bayer4',
  'bayer8',
  'random',
  'floyd',
  'atkinson',
  'halftone',
];

/**
 * The n by n Bayer index matrix, row major, built by
 * M(2n) = [[4M, 4M + 2], [4M + 3, 4M + 1]] from M(1) = [0]. At n = 8 it
 * equals BAYER_8 in src/lib/dither.ts, and at n = 4 the studio field's bayer4.
 */
export function bayerIndex(n: 2 | 4 | 8): Uint8Array {
  let m = new Uint8Array([0]);
  let size = 1;
  while (size < n) {
    const w = size * 2;
    const next = new Uint8Array(w * w);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const v = (m[y * size + x] ?? 0) * 4;
        next[y * w + x] = v;
        next[y * w + x + size] = v + 2;
        next[(y + size) * w + x] = v + 3;
        next[(y + size) * w + x + size] = v + 1;
      }
    }
    m = next;
    size = w;
  }
  return m;
}

/** The matrix as thresholds `(m + 0.5) / n²`: a cell prints ink when its tone is over its threshold. */
function bayerThresholds(n: 2 | 4 | 8): Float32Array {
  const index = bayerIndex(n);
  const out = new Float32Array(index.length);
  for (let i = 0; i < index.length; i++) out[i] = ((index[i] ?? 0) + 0.5) / index.length;
  return out;
}

export const BAYER: Record<2 | 4 | 8, Float32Array> = {
  2: bayerThresholds(2),
  4: bayerThresholds(4),
  8: bayerThresholds(8),
};

/**
 * The halftone dot's threshold map over one period, 32 by 32: the cosine
 * spot ranked so the dot grows from its centre and an even tone lights an
 * even share of the period.
 */
const SPOT = 32;
const SPOT_RANK: Float32Array = (() => {
  const n = SPOT * SPOT;
  const spot = new Float64Array(n);
  for (let y = 0; y < SPOT; y++) {
    for (let x = 0; x < SPOT; x++) {
      const fx = (x + 0.5) / SPOT - 0.5;
      const fy = (y + 0.5) / SPOT - 0.5;
      spot[y * SPOT + x] = Math.cos(2 * Math.PI * fx) + Math.cos(2 * Math.PI * fy);
    }
  }
  const order = Array.from({ length: n }, (_, i) => i).sort((a, b) => (spot[b] ?? 0) - (spot[a] ?? 0));
  const out = new Float32Array(n);
  order.forEach((cell, rank) => {
    out[cell] = (rank + 0.5) / n;
  });
  return out;
})();

/** The halftone threshold at cell x, y for dots `pitch` cells apart on a 45 degree grid. */
export function halftoneThreshold(x: number, y: number, pitch: number): number {
  const xr = ((x + y + 1) * Math.SQRT1_2) / pitch;
  const yr = ((y - x) * Math.SQRT1_2) / pitch;
  const fx = xr - Math.floor(xr);
  const fy = yr - Math.floor(yr);
  return SPOT_RANK[((fy * SPOT) | 0) * SPOT + ((fx * SPOT) | 0)] ?? 0.5;
}

/** A stable hash of a cell, 0 to 1: the white-noise screen's threshold. */
export function cellHash(x: number, y: number): number {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** The tone curve every screen applies first: `tone ** gamma + bias`. */
export function curve(tone: number, gamma: number, bias: number): number {
  const v = gamma === 1 ? tone : tone <= 0 ? 0 : Math.pow(tone, gamma);
  return v + bias;
}

export type Kernel = readonly (readonly [dx: number, dy: number, weight: number])[];

/** Floyd and Steinberg (1976): all of the error, in sixteenths, to four neighbours. */
export const FLOYD: Kernel = [
  [1, 0, 7 / 16],
  [-1, 1, 3 / 16],
  [0, 1, 5 / 16],
  [1, 1, 1 / 16],
];

/** Bill Atkinson's kernel for the Macintosh: an eighth to each of six neighbours, so a quarter of the error is dropped. */
export const ATKINSON: Kernel = [
  [1, 0, 1 / 8],
  [2, 0, 1 / 8],
  [-1, 1, 1 / 8],
  [0, 1, 1 / 8],
  [1, 1, 1 / 8],
  [0, 2, 1 / 8],
];

export type ScreenOptions = {
  gamma?: number;
  bias?: number;
  /** the ordered tile's offset in cells */
  phaseX?: number;
  phaseY?: number;
  /** halftone dot spacing in cells */
  pitch?: number;
  /** diffusion walks odd rows right to left */
  serpentine?: boolean;
};

let scratch = new Float32Array(0);

/** The threshold of cell x, y for the stateless screens. */
function thresholdAt(id: ScreenId, x: number, y: number, phaseX: number, phaseY: number, pitch: number): number {
  if (id === 'threshold') return 0.5;
  if (id === 'random') return cellHash(x, y);
  if (id === 'halftone') return halftoneThreshold(x + phaseX, y + phaseY, pitch);
  const n = id === 'bayer2' ? 2 : id === 'bayer4' ? 4 : 8;
  return BAYER[n][((y + phaseY) & (n - 1)) * n + ((x + phaseX) & (n - 1))] ?? 0.5;
}

/**
 * Screens `tone` (`w` by `h`, row major) into `out`, a buffer `stride`
 * cells wide, with its top left cell at `ox`, `oy`: 1 for ink, 0 for
 * paper. Returns how many cells print ink.
 */
export function screenTone(
  id: ScreenId,
  tone: Float32Array,
  w: number,
  h: number,
  out: Uint8Array,
  stride: number,
  ox = 0,
  oy = 0,
  opts: ScreenOptions = {}
): number {
  const { gamma = 1, bias = 0, phaseX = 0, phaseY = 0, pitch = 6, serpentine = true } = opts;
  if (scratch.length < w * h) scratch = new Float32Array(w * h);
  const work = scratch;
  const plain = gamma === 1 && bias === 0;
  for (let i = 0; i < w * h; i++) work[i] = plain ? (tone[i] ?? 0) : curve(tone[i] ?? 0, gamma, bias);
  if (id === 'floyd' || id === 'atkinson') {
    return diffuse(id === 'floyd' ? FLOYD : ATKINSON, work, w, h, out, stride, ox, oy, serpentine);
  }
  let lit = 0;
  if (id === 'bayer2' || id === 'bayer4' || id === 'bayer8') {
    const n = id === 'bayer2' ? 2 : id === 'bayer4' ? 4 : 8;
    const map = BAYER[n];
    const mask = n - 1;
    for (let y = 0; y < h; y++) {
      const row = ((y + phaseY) & mask) * n;
      let o = (oy + y) * stride + ox;
      let i = y * w;
      for (let x = 0; x < w; x++, i++, o++) {
        const on = (work[i] ?? 0) > (map[row + ((x + phaseX) & mask)] ?? 0.5) ? 1 : 0;
        out[o] = on;
        lit += on;
      }
    }
    return lit;
  }
  for (let y = 0; y < h; y++) {
    let o = (oy + y) * stride + ox;
    let i = y * w;
    for (let x = 0; x < w; x++, i++, o++) {
      const on = (work[i] ?? 0) > thresholdAt(id, x, y, phaseX, phaseY, pitch) ? 1 : 0;
      out[o] = on;
      lit += on;
    }
  }
  return lit;
}

/** Walks `work` in rows (odd rows backward when serpentine), printing each cell and passing its error on. */
function diffuse(
  kernel: Kernel,
  work: Float32Array,
  w: number,
  h: number,
  out: Uint8Array,
  stride: number,
  ox: number,
  oy: number,
  serpentine: boolean
): number {
  const taps = kernel.length;
  const kx = new Int32Array(taps);
  const ky = new Int32Array(taps);
  const kw = new Float32Array(taps);
  kernel.forEach(([dx, dy, weight], k) => {
    kx[k] = dx;
    ky[k] = dy;
    kw[k] = weight;
  });
  let lit = 0;
  for (let y = 0; y < h; y++) {
    const back = serpentine && (y & 1) === 1;
    const dir = back ? -1 : 1;
    let x = back ? w - 1 : 0;
    for (let k = 0; k < w; k++, x += dir) {
      const i = y * w + x;
      const v = work[i] ?? 0;
      const on = v > 0.5 ? 1 : 0;
      out[(oy + y) * stride + ox + x] = on;
      lit += on;
      const err = v - on;
      for (let t = 0; t < taps; t++) {
        const nx = x + (kx[t] ?? 0) * dir;
        const ny = y + (ky[t] ?? 0);
        if (nx < 0 || nx >= w || ny >= h) continue;
        const j = ny * w + nx;
        work[j] = (work[j] ?? 0) + err * (kw[t] ?? 0);
      }
    }
  }
  return lit;
}
