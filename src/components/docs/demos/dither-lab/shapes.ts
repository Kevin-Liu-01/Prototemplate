import { REFERENCE_MARK } from '@/lib/marks';

/**
 * Shapes for the type plates: a word or a mark rasterized into a binary
 * mask at a few pixels per cell, and the mask's exact signed distance
 * field, read back at each cell's centre in cells.
 */

const INF = 1e20;

/** Felzenszwalb and Huttenlocher's 1D squared distance transform: the lower envelope of parabolas. */
function edt1d(f: Float64Array, n: number, d: Float64Array, v: Int32Array, z: Float64Array): void {
  const meet = (q: number, p: number) => ((f[q] ?? INF) + q * q - ((f[p] ?? INF) + p * p)) / (2 * q - 2 * p);
  let k = 0;
  v[0] = 0;
  z[0] = -INF;
  z[1] = INF;
  for (let q = 1; q < n; q++) {
    let s = meet(q, v[k] ?? 0);
    while (s <= (z[k] ?? -INF)) {
      k--;
      s = meet(q, v[k] ?? 0);
    }
    k++;
    v[k] = q;
    z[k] = s;
    z[k + 1] = INF;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while ((z[k + 1] ?? INF) < q) k++;
    const p = v[k] ?? 0;
    d[q] = (q - p) * (q - p) + (f[p] ?? INF);
  }
}

/** The squared Euclidean distance from every pixel to the nearest pixel where `seed(i)` holds. */
function edt2d(w: number, h: number, seed: (i: number) => boolean): Float64Array {
  const grid = new Float64Array(w * h);
  for (let i = 0; i < grid.length; i++) grid[i] = seed(i) ? 0 : INF;
  const n = Math.max(w, h);
  const f = new Float64Array(n);
  const d = new Float64Array(n);
  const v = new Int32Array(n);
  const z = new Float64Array(n + 1);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) f[y] = grid[y * w + x] ?? INF;
    edt1d(f, h, d, v, z);
    for (let y = 0; y < h; y++) grid[y * w + x] = d[y] ?? INF;
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) f[x] = grid[y * w + x] ?? INF;
    edt1d(f, w, d, v, z);
    for (let x = 0; x < w; x++) grid[y * w + x] = d[x] ?? INF;
  }
  return grid;
}

/** A shape at cell resolution: signed distance in cells (negative inside) and the ink box in cells. */
export type CellShape = {
  cols: number;
  rows: number;
  sd: Float32Array;
  box: { x0: number; x1: number; y0: number; y1: number };
  /** the deepest inside distance, in cells */
  depth: number;
};

/**
 * Reads a mask drawn at `ss` pixels per cell back to the cell grid: the
 * signed distance at each cell's centre, in cells.
 */
function toCells(mask: Uint8Array, cols: number, rows: number, ss: number): CellShape {
  const w = cols * ss;
  const h = rows * ss;
  const outside = edt2d(w, h, (i) => mask[i] === 1);
  const inside = edt2d(w, h, (i) => mask[i] === 0);
  const sd = new Float32Array(cols * rows);
  let x0 = cols;
  let x1 = -1;
  let y0 = rows;
  let y1 = -1;
  let depth = 0;
  const half = Math.floor(ss / 2);
  for (let y = 0, i = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++, i++) {
      const p = (y * ss + half) * w + x * ss + half;
      const value = mask[p] === 1 ? -Math.sqrt(inside[p] ?? 0) / ss : Math.sqrt(outside[p] ?? 0) / ss;
      sd[i] = value;
      if (value < 0) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
        if (-value > depth) depth = -value;
      }
    }
  }
  if (x1 < 0) {
    x0 = 0;
    x1 = cols - 1;
    y0 = 0;
    y1 = rows - 1;
  }
  return { cols, rows, sd, box: { x0, x1, y0, y1 }, depth };
}

function maskCanvas(w: number, h: number): CanvasRenderingContext2D | null {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return canvas.getContext('2d', { willReadFrequently: true });
}

/** Ink where a pixel is mostly opaque and dark, so a mark's white knockout shapes stay paper. */
function readMask(ctx: CanvasRenderingContext2D, w: number, h: number): Uint8Array {
  const { data } = ctx.getImageData(0, 0, w, h);
  const mask = new Uint8Array(w * h);
  for (let i = 0, j = 0; i < mask.length; i++, j += 4) {
    const a = data[j + 3] ?? 0;
    const lum = (data[j] ?? 0) + (data[j + 1] ?? 0) + (data[j + 2] ?? 0);
    mask[i] = a >= 128 && lum < 384 ? 1 : 0;
  }
  return mask;
}

/**
 * A line of type rasterized in `family` at weight 500, fit to `fill` of
 * the grid's width and at most 64 percent of its height.
 */
export function textShape(text: string, family: string, cols: number, rows: number, ss = 3, fill = 0.88): CellShape {
  const w = cols * ss;
  const h = rows * ss;
  const ctx = maskCanvas(w, h);
  if (!ctx) return toCells(new Uint8Array(w * h), cols, rows, ss);
  ctx.fillStyle = 'rgb(0, 0, 0)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const probe = 100;
  ctx.font = `500 ${probe}px ${family}`;
  const m = ctx.measureText(text || ' ');
  const inkW = (m.actualBoundingBoxLeft ?? 0) + (m.actualBoundingBoxRight ?? m.width) || m.width || 1;
  const inkH = (m.actualBoundingBoxAscent ?? probe * 0.72) + (m.actualBoundingBoxDescent ?? 0) || probe;
  const px = probe * Math.min((w * fill) / inkW, (h * 0.64) / inkH);
  ctx.font = `500 ${px}px ${family}`;
  const fit = ctx.measureText(text || ' ');
  const left = fit.actualBoundingBoxLeft ?? 0;
  const right = fit.actualBoundingBoxRight ?? fit.width;
  const ascent = fit.actualBoundingBoxAscent ?? px * 0.72;
  const descent = fit.actualBoundingBoxDescent ?? 0;
  ctx.fillText(text, w / 2 - (right - left) / 2, h / 2 + (ascent - descent) / 2);
  return toCells(readMask(ctx, w, h), cols, rows, ss);
}

/** A mark's artwork, drawable into any box at its own aspect. */
export type MarkArt = { aspect: number; draw: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => void };

export type MarkId = 'gt' | 'bar-monogram' | 'globe-g' | 'two-way' | 'plate-inverted';

export const MARK_LABELS: Record<MarkId, string> = {
  gt: 'GT mark',
  'bar-monogram': 'Bar monogram',
  'globe-g': 'Globe G',
  'two-way': 'Two-way',
  'plate-inverted': 'Plate',
};

const artCache = new Map<MarkId, Promise<MarkArt>>();

function viewBoxOf(text: string): [number, number, number, number] {
  const [x = 0, y = 0, w = 1, h = 1] = text.trim().split(/[\s,]+/).map(Number);
  return [x, y, w || 1, h || 1];
}

/** The reference GT mark as a Path2D, or a speed mark's SVG from public/marks drawn as an image at the box's size. */
export function loadMark(id: MarkId): Promise<MarkArt> {
  const hit = artCache.get(id);
  if (hit) return hit;
  const loading =
    id === 'gt'
      ? Promise.resolve<MarkArt>(gtArt())
      : fetch(`/marks/${id}.svg`)
          .then((response) => {
            if (!response.ok) throw new Error(`no mark at /marks/${id}.svg`);
            return response.text();
          })
          .then(svgArt);
  const guarded = loading.catch((error: unknown) => {
    artCache.delete(id);
    throw error;
  });
  artCache.set(id, guarded);
  return guarded;
}

function gtArt(): MarkArt {
  const [vx, vy, vw, vh] = viewBoxOf(REFERENCE_MARK.viewBox);
  const path = new Path2D(REFERENCE_MARK.d);
  return {
    aspect: vw / vh,
    draw: (ctx, x, y, w, h) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(w / vw, h / vh);
      ctx.translate(-vx, -vy);
      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fill(path, 'evenodd');
      ctx.restore();
    },
  };
}

/** Decodes the SVG at 2048 pixels wide, so the mark is rasterized once at a size above any mask it is drawn into. */
function svgArt(text: string): Promise<MarkArt> {
  const match = /viewBox="([^"]+)"/.exec(text);
  const [, , vw, vh] = viewBoxOf(match?.[1] ?? '0 0 1 1');
  const aspect = vw / vh;
  const width = 2048;
  const sized = text.replace(/<svg\b/, `<svg width="${width}" height="${Math.round(width / aspect)}"`);
  return new Promise<MarkArt>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ aspect, draw: (ctx, x, y, w, h) => ctx.drawImage(image, x, y, w, h) });
    image.onerror = () => reject(new Error('the mark did not decode'));
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(sized)}`;
  });
}

/**
 * A mark fit to `fill` of the grid's width and 76 percent of its height,
 * centred, rasterized at `ss` pixels per cell.
 */
export function markShape(art: MarkArt, cols: number, rows: number, ss = 3, fill = 0.8): CellShape {
  const w = cols * ss;
  const h = rows * ss;
  const ctx = maskCanvas(w, h);
  if (!ctx) return toCells(new Uint8Array(w * h), cols, rows, ss);
  const bw = Math.min(w * fill, h * 0.76 * art.aspect);
  const bh = bw / art.aspect;
  art.draw(ctx, (w - bw) / 2, (h - bh) / 2, bw, bh);
  return toCells(readMask(ctx, w, h), cols, rows, ss);
}

export type WordStyle = 'fringe' | 'ramp' | 'shade' | 'glow' | 'shadow';

function smoothstep(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/**
 * The tone of every cell for one style, from the word's signed distance in
 * cells: a dithered fringe on the outline, a ramp across the word, a shade
 * that rises from the outline to the stroke's spine, a glow that thins
 * away from the letters past a paper ring, or solid letters over a
 * dithered shadow.
 */
export function wordTone(shape: CellShape, style: WordStyle, out: Float32Array): Float32Array {
  const { cols, rows, sd, box, depth } = shape;
  const capH = Math.max(4, box.y1 - box.y0 + 1);
  const span = Math.max(1, box.x1 - box.x0);
  const glow = capH * 0.45;
  const off = Math.max(2, Math.round(capH * 0.09));
  for (let y = 0, i = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++, i++) {
      const d = sd[i] ?? 9;
      let t = 0;
      if (style === 'fringe') t = 1 - smoothstep(-1.4, 1.4, d);
      else if (style === 'ramp') t = d < 0 ? 1.04 - 0.96 * Math.min(1, Math.max(0, (x - box.x0) / span)) : 0;
      else if (style === 'shade') t = d < 0 ? 0.14 + 0.86 * smoothstep(0, depth * 0.9, -d) : 0;
      else if (style === 'glow') t = d < 0 ? 1 : d < 1.2 ? 0 : 0.55 * (1 - smoothstep(1.2, glow, d));
      else if (d < 0) t = 1;
      else if (d > 1.5) {
        const sx = x - off;
        const sy = y - off;
        const shifted = sx >= 0 && sy >= 0 ? (sd[sy * cols + sx] ?? 9) : 9;
        t = shifted < 0 ? 0.42 : 0;
      }
      out[i] = t;
    }
  }
  return out;
}
