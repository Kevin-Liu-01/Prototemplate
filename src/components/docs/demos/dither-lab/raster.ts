/**
 * Canvas helpers for the dither lab's plates. A grid's cell is a whole
 * number of device pixels, the canvas holds one buffer pixel per cell and
 * CSS scales it up with `image-rendering: pixelated`, and colors resolve
 * once into packed pixels that an index buffer is blitted through.
 */

/** The device pixel ratio the grids snap to, capped at 3. */
export function screenDpr(): number {
  if (typeof window === 'undefined') return 1;
  return Math.min(3, Math.max(1, window.devicePixelRatio || 1));
}

/** A cell of about `cssPx` CSS pixels, rounded to a whole number of device pixels (at least one). */
export function snapCell(cssPx: number): number {
  const dpr = screenDpr();
  return Math.max(1, Math.round(cssPx * dpr)) / dpr;
}

export type Surface = {
  ctx: CanvasRenderingContext2D;
  image: ImageData;
  /** a 32-bit view over the image's bytes, one packed pixel per cell */
  px: Uint32Array;
  width: number;
  height: number;
};

const surfaces = new WeakMap<HTMLCanvasElement, Surface>();

/**
 * The canvas's pixel buffer at `cols` by `rows`, with its CSS box set to
 * `cols * cell` by `rows * cell`. The buffer is reallocated only when the
 * grid changes size.
 */
export function surfaceFor(canvas: HTMLCanvasElement, cols: number, rows: number, cell: number): Surface | null {
  canvas.style.width = `${cols * cell}px`;
  canvas.style.height = `${rows * cell}px`;
  const hit = surfaces.get(canvas);
  if (hit && hit.width === cols && hit.height === rows) return hit;
  const ctx = hit?.ctx ?? canvas.getContext('2d');
  if (!ctx) return null;
  canvas.width = cols;
  canvas.height = rows;
  const image = ctx.createImageData(cols, rows);
  const surface: Surface = { ctx, image, px: new Uint32Array(image.data.buffer), width: cols, height: rows };
  surfaces.set(canvas, surface);
  return surface;
}

const word = new Uint32Array(1);
const bytes = new Uint8ClampedArray(word.buffer);

/** Four bytes as one pixel in the platform's byte order. */
export function packRgba(r: number, g: number, b: number, a: number): number {
  bytes[0] = r;
  bytes[1] = g;
  bytes[2] = b;
  bytes[3] = a;
  return word[0] ?? 0;
}

/** The four bytes of a packed pixel. */
export function unpack(pixel: number): [number, number, number, number] {
  word[0] = pixel;
  return [bytes[0] ?? 0, bytes[1] ?? 0, bytes[2] ?? 0, bytes[3] ?? 0];
}

const colorCache = new Map<string, number>();
let probe: CanvasRenderingContext2D | null = null;

/** Any CSS color as a packed pixel, read through a 1 by 1 canvas once per string. */
export function packColor(css: string): number {
  const hit = colorCache.get(css);
  if (hit !== undefined) return hit;
  if (!probe && typeof document !== 'undefined') {
    const el = document.createElement('canvas');
    el.width = 1;
    el.height = 1;
    probe = el.getContext('2d', { willReadFrequently: true });
  }
  if (!probe) return packRgba(0, 0, 0, 255);
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = 'transparent';
  probe.fillStyle = css;
  probe.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0, a = 255] = probe.getImageData(0, 0, 1, 1).data;
  const packed = packRgba(r, g, b, a);
  colorCache.set(css, packed);
  return packed;
}

/** `n` packed colors from `from` (index 0) to `to` (index n - 1), mixed per byte in sRGB. */
export function packedRamp(from: number, to: number, n: number): Uint32Array {
  const out = new Uint32Array(Math.max(2, n));
  const a = unpack(from);
  const b = unpack(to);
  for (let i = 0; i < out.length; i++) {
    const k = i / (out.length - 1);
    out[i] = packRgba(
      Math.round(a[0] + (b[0] - a[0]) * k),
      Math.round(a[1] + (b[1] - a[1]) * k),
      Math.round(a[2] + (b[2] - a[2]) * k),
      Math.round(a[3] + (b[3] - a[3]) * k)
    );
  }
  return out;
}

/** The ink and paper pairs a plate can print in; the tokens live in dither-lab.css. */
export type Palette = 'theme' | 'paper' | 'ink' | 'blue';

export const PALETTE_OPTIONS: readonly { value: Palette; label: string }[] = [
  { value: 'theme', label: 'Theme' },
  { value: 'paper', label: 'Paper' },
  { value: 'ink', label: 'Ink' },
  { value: 'blue', label: 'Blue' },
];

const PALETTE_TOKENS: Record<Palette, readonly [string, string]> = {
  theme: ['--pt-ink', '--pt-paper'],
  paper: ['--dl-print-ink', '--dl-print-paper'],
  ink: ['--dl-night-ink', '--dl-night-paper'],
  blue: ['--dl-blue', '--pt-paper'],
};

/** The palette's ink and paper as CSS colors, read off the element's computed tokens. */
export function readPalette(el: Element, palette: Palette = 'theme'): { ink: string; paper: string } {
  const style = getComputedStyle(el);
  const [inkName, paperName] = PALETTE_TOKENS[palette];
  return {
    ink: style.getPropertyValue(inkName).trim() || 'rgb(7, 7, 7)',
    paper: style.getPropertyValue(paperName).trim() || 'rgb(255, 255, 255)',
  };
}

/** One custom property off an element, trimmed, or the fallback. */
export function readVar(el: Element, name: string, fallback: string): string {
  return getComputedStyle(el).getPropertyValue(name).trim() || fallback;
}

/**
 * Writes `index` through `colors` into the surface and puts the rectangle
 * `x`, `y`, `w`, `h` (the whole buffer by default) on the canvas.
 */
export function blit(
  surface: Surface,
  index: Uint8Array,
  colors: Uint32Array,
  x = 0,
  y = 0,
  w = surface.width,
  h = surface.height
): void {
  const { px, width } = surface;
  for (let row = y; row < y + h; row++) {
    let i = row * width + x;
    const end = i + w;
    for (; i < end; i++) px[i] = colors[index[i] ?? 0] ?? 0;
  }
  surface.ctx.putImageData(surface.image, 0, 0, x, y, w, h);
}
