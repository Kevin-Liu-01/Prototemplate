import { bayerThresholds, type MatrixSize } from './bayer';
import { packRgb, type Rgb } from './ink';

/**
 * A pad to paint tone into and watch the screen print it. The tone lives in
 * a float grid at one value per cell; a stroke adds a soft round brush
 * (a raised cosine 28 CSS pixels across) along the pointer's path, or
 * takes it away, and the paint thresholds the grid through the Bayer
 * matrix into a canvas of one pixel per cell, which CSS scales with
 * image-rendering: pixelated. Because the tiers nest, adding tone only
 * ever turns cells on: a cell that is lit stays lit as the tone under it
 * rises. Nothing runs between strokes, so the pad costs nothing at rest.
 */

export type PadOptions = {
  canvas: HTMLCanvasElement;
  cell: number;
  matrix: MatrixSize;
  ink: Rgb;
};

export type PadEngine = {
  resize: (width: number, height: number) => void;
  /** paints one dab; erase takes tone away */
  dab: (x: number, y: number, erase: boolean) => void;
  /** dabs along a segment, one every quarter brush */
  stroke: (x0: number, y0: number, x1: number, y1: number, erase: boolean) => void;
  /** the starting picture: a left-to-right ramp over the lower half and a soft disc above it */
  reset: () => void;
  clear: () => void;
  paint: () => void;
  set: (patch: Partial<Pick<PadOptions, 'cell' | 'matrix' | 'ink'>>) => void;
  /** the share of lit cells in the last paint, 0 to 1 */
  coverage: () => number;
};

const BRUSH = 28;
const FLOW = 0.22;

export function createDitherPad(options: PadOptions): PadEngine | null {
  const { canvas } = options;
  const context = canvas.getContext('2d');
  if (!context) return null;
  const ctx: CanvasRenderingContext2D = context;

  let cell = options.cell;
  let matrix = options.matrix;
  let thresholds = bayerThresholds(matrix);
  let ink = packRgb(options.ink);
  let width = 1;
  let height = 1;
  let cols = 1;
  let rows = 1;
  let tone = new Float32Array(1);
  let image = ctx.createImageData(1, 1);
  let pixels = new Uint32Array(image.data.buffer);
  let lit = 0;

  function layout() {
    cols = Math.max(1, Math.ceil(width / cell));
    rows = Math.max(1, Math.ceil(height / cell));
    canvas.width = cols;
    canvas.height = rows;
    canvas.style.width = `${cols * cell}px`;
    canvas.style.height = `${rows * cell}px`;
    image = ctx.createImageData(cols, rows);
    pixels = new Uint32Array(image.data.buffer);
  }

  /* resamples the tone grid to the new cells, so a resize or a new cell size keeps the picture */
  function regrid(prevCols: number, prevRows: number, prev: Float32Array) {
    tone = new Float32Array(cols * rows);
    for (let y = 0; y < rows; y++) {
      const sy = Math.min(prevRows - 1, Math.floor((y / rows) * prevRows));
      for (let x = 0; x < cols; x++) {
        const sx = Math.min(prevCols - 1, Math.floor((x / cols) * prevCols));
        tone[y * cols + x] = prev[sy * prevCols + sx] ?? 0;
      }
    }
  }

  function dab(x: number, y: number, erase: boolean) {
    const r = BRUSH / 2 / cell;
    const cx = x / cell;
    const cy = y / cell;
    const x0 = Math.max(0, Math.floor(cx - r));
    const x1 = Math.min(cols - 1, Math.ceil(cx + r));
    const y0 = Math.max(0, Math.floor(cy - r));
    const y1 = Math.min(rows - 1, Math.ceil(cy + r));
    for (let j = y0; j <= y1; j++) {
      for (let i = x0; i <= x1; i++) {
        const d = Math.hypot(i + 0.5 - cx, j + 0.5 - cy) / r;
        if (d >= 1) continue;
        const w = FLOW * 0.5 * (1 + Math.cos(Math.PI * d));
        const at = j * cols + i;
        const v = (tone[at] ?? 0) + (erase ? -w : w);
        tone[at] = v < 0 ? 0 : v > 1 ? 1 : v;
      }
    }
  }

  function reset() {
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const u = (x + 0.5) / cols;
        const v = (y + 0.5) / rows;
        const ramp = v > 0.62 ? u : 0;
        const dx = (u - 0.72) * (width / height);
        const dy = v - 0.3;
        const disc = Math.max(0, 1 - Math.hypot(dx, dy) / 0.22);
        tone[y * cols + x] = Math.min(1, ramp + disc * disc * (3 - 2 * disc));
      }
    }
  }

  function paint() {
    const n = matrix;
    lit = 0;
    for (let y = 0; y < rows; y++) {
      const row = y * cols;
      const band = (y % n) * n;
      for (let x = 0; x < cols; x++) {
        const on = (tone[row + x] ?? 0) > (thresholds[band + (x % n)] ?? 1);
        pixels[row + x] = on ? ink : 0;
        if (on) lit++;
      }
    }
    ctx.putImageData(image, 0, 0);
  }

  return {
    resize(w, h) {
      const first = width <= 1;
      const prev = { cols, rows, tone };
      width = Math.max(1, w);
      height = Math.max(1, h);
      layout();
      if (first) {
        tone = new Float32Array(cols * rows);
        reset();
      } else regrid(prev.cols, prev.rows, prev.tone);
    },
    dab,
    stroke(x0, y0, x1, y1, erase) {
      const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / (BRUSH / 4)));
      for (let s = 1; s <= steps; s++) dab(x0 + ((x1 - x0) * s) / steps, y0 + ((y1 - y0) * s) / steps, erase);
    },
    reset,
    clear: () => tone.fill(0),
    paint,
    set(patch) {
      if (patch.ink) ink = packRgb(patch.ink);
      if (patch.matrix) {
        matrix = patch.matrix;
        thresholds = bayerThresholds(matrix);
      }
      if (patch.cell && patch.cell !== cell) {
        const prev = { cols, rows, tone };
        cell = patch.cell;
        layout();
        regrid(prev.cols, prev.rows, prev.tone);
      }
    },
    coverage: () => lit / Math.max(1, cols * rows),
  };
}
