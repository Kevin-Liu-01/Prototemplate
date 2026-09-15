/**
 * clay-tablet fields: the wedge as a dither cell.
 *
 * Home (C1 as applied through G6): the hero frieze, the ramp band under the
 * language cells, and the stele's moving field.
 *
 * A cuneiform wedge is a triangular head with a tail, the print of a reed
 * stylus pressed into wet clay. This module treats that print as the cell of
 * an ordered dither. Every cell of a grid reads a scalar field at its centre,
 * compares the value against the 8x8 Bayer threshold from src/lib/dither.ts,
 * and takes one vertical wedge when it passes. Values above one half run a
 * second pass against the transposed matrix and lay a horizontal wedge across
 * the same cell, so dark tones thicken into crossed impressions. Tone is
 * impression density, never a gradient; the frieze, the ramp band, and the
 * stele's field are the same three lines of arithmetic.
 *
 * Two renderers share the geometry. `wedgeDither` returns SVG path data for a
 * still the server renders complete, so the page is whole before any script
 * runs. `createWedgeLoop` draws the same cells on a canvas over time under
 * the house engine's lifecycle contract: one still under reduced motion,
 * paused offscreen and on hidden tabs, released on destroy.
 */
import { BAYER_8, prefersReducedMotion } from '@/lib/dither';

export type WedgeField = (u: number, v: number, t: number) => number;
export type WedgeOrient = 'v' | 'h';

const round = (n: number) => Math.round(n * 10) / 10;
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);

/**
 * One wedge as an SVG subpath in a cell of size `c` whose top-left corner is
 * (x, y). Vertical: the head's base along the top of the cell, the tail to
 * the bottom. Horizontal: the head at the left, the tail to the right.
 */
export function wedgeSubpath(x: number, y: number, c: number, orient: WedgeOrient): string {
  if (orient === 'v') {
    return (
      `M${round(x + 0.16 * c)} ${round(y + 0.1 * c)}` +
      `L${round(x + 0.84 * c)} ${round(y + 0.1 * c)}` +
      `L${round(x + 0.58 * c)} ${round(y + 0.4 * c)}` +
      `L${round(x + 0.5 * c)} ${round(y + 0.92 * c)}` +
      `L${round(x + 0.42 * c)} ${round(y + 0.4 * c)}Z`
    );
  }
  return (
    `M${round(x + 0.1 * c)} ${round(y + 0.16 * c)}` +
    `L${round(x + 0.1 * c)} ${round(y + 0.84 * c)}` +
    `L${round(x + 0.4 * c)} ${round(y + 0.58 * c)}` +
    `L${round(x + 0.92 * c)} ${round(y + 0.5 * c)}` +
    `L${round(x + 0.4 * c)} ${round(y + 0.42 * c)}Z`
  );
}

export type WedgeGrid = { width: number; height: number; cell: number };

export type WedgePaths = {
  /** Every vertical wedge, one subpath per lit cell. */
  first: string;
  /** Every horizontal wedge of the second pass. */
  second: string;
  cols: number;
  rows: number;
};

/** The Bayer threshold for cell (i, j), 0..1. Swapping the arguments transposes the matrix. */
function threshold(i: number, j: number): number {
  return (BAYER_8[j & 7][i & 7] + 0.5) / 64;
}

/**
 * Ordered wedge dither over a grid, as two SVG path strings.
 *
 * The first pass compares the field value against the Bayer threshold and
 * lays a vertical wedge. The second pass compares twice the value minus one
 * against the transposed threshold and lays a horizontal wedge, so the
 * range one half to one fills in as crossed impressions.
 */
export function wedgeDither(field: WedgeField, grid: WedgeGrid, time = 0): WedgePaths {
  const cols = Math.max(1, Math.ceil(grid.width / grid.cell));
  const rows = Math.max(1, Math.ceil(grid.height / grid.cell));
  const first: string[] = [];
  const second: string[] = [];
  for (let j = 0; j < rows; j++) {
    const v = (j + 0.5) / rows;
    for (let i = 0; i < cols; i++) {
      const u = (i + 0.5) / cols;
      const value = field(u, v, time);
      if (value > threshold(i, j)) {
        first.push(wedgeSubpath(i * grid.cell, j * grid.cell, grid.cell, 'v'));
      }
      if ((value - 0.5) * 2 > threshold(j, i)) {
        second.push(wedgeSubpath(i * grid.cell, j * grid.cell, grid.cell, 'h'));
      }
    }
  }
  return { first: first.join(''), second: second.join(''), cols, rows };
}

/* ------------------------------------------------------------------------ *
 * Fields
 * ------------------------------------------------------------------------ */

export type RosetteFriezeOptions = {
  /** Rosettes across the width. Default 5. */
  count?: number;
  /** Width over height of the box, so the rosettes stay round. Default 3.6. */
  aspect?: number;
  /** Lobes per rosette. Default 8. */
  petals?: number;
  /** Rosette radius as a fraction of one slot's width. Default 0.46. */
  radius?: number;
  /** Rest value between rosettes: a sparse scatter of impressions. Default 0.05. */
  floor?: number;
};

/**
 * A row of rosettes, the Assyrian border repeat, as a tone field. `count`
 * rosettes share the width and `aspect` keeps them round. Each rosette is a
 * lobed disk: its outline radius swells with cos(n theta), so the lobes are
 * the shape and not a shading; inside, tone falls from a solid core toward
 * the lobe edge with two thin concentric rings; a firm rim closes the disk.
 * Between rosettes the field rests at `floor`, a sparse regular scatter.
 */
export function rosetteFrieze(opts: RosetteFriezeOptions = {}): WedgeField {
  const { count = 5, aspect = 3.6, petals = 8, radius = 0.46, floor = 0.05 } = opts;
  const scaleY = count / aspect;
  return (u, v) => {
    const x = u * count;
    const lx = x - Math.floor(x) - 0.5;
    const ly = (v - 0.5) * scaleY;
    const r = Math.hypot(lx, ly) / radius;
    if (r >= 1) return floor;
    const theta = Math.atan2(ly, lx);
    const petal = 0.5 + 0.5 * Math.cos(theta * petals);
    const edge = 0.74 + 0.22 * petal;
    let value = floor;
    if (r < 0.2) {
      value = 1;
    } else if (r < edge) {
      const inward = r / edge;
      value = 0.94 - 0.5 * Math.pow(inward, 1.4);
      const ring = Math.pow(Math.max(0, Math.cos(r * Math.PI * 5.2)), 10);
      value += ring * 0.3;
    }
    const rim = 1 - Math.min(1, Math.abs(r - 0.94) / 0.06);
    value = Math.max(value, rim * 0.9);
    return clamp01(value);
  };
}

/** Dense at the left, bare clay at the right: the ramp band under the language cells. */
export function rampBand(): WedgeField {
  return (u) => clamp01(1.02 - u * 1.04);
}

/**
 * The stele's field: dense at the foot, rising in slow bands, thinning to
 * bare stone at the top. Time drifts the bands upward.
 */
export function steleField(): WedgeField {
  return (u, v, t) => {
    const lift = v; /* v runs top to bottom, so the foot of the stone is dense */
    const base = Math.pow(lift, 1.7) * 0.9;
    const bands =
      0.16 * Math.sin((v * 6 - t * 0.28) * Math.PI * 2 + Math.sin(u * Math.PI * 3 + t * 0.1) * 1.1);
    const warp = 0.08 * Math.sin(u * 11 + t * 0.4) * lift;
    return clamp01(base + bands * lift + warp);
  };
}

/* ------------------------------------------------------------------------ *
 * The canvas loop
 * ------------------------------------------------------------------------ */

export type WedgeLoopOptions = {
  /** Cell size in CSS pixels. Default 14. */
  cell?: number;
  /** Fill colour of a wedge. A resolved CSS colour, read from computed style by the caller. */
  ink: string;
  /** Frame budget. Default 24. */
  fps?: number;
  /** Multiplier on elapsed seconds. Default 1. */
  speed?: number;
  /** Time of the single still drawn under reduced motion. Default 0. */
  reducedMotionTime?: number;
};

export type WedgeLoopHandle = {
  render: (time?: number) => void;
  start: () => void;
  stop: () => void;
  readonly running: boolean;
  setInk: (ink: string) => void;
  destroy: () => void;
};

/**
 * Animate a wedge field on a canvas. The canvas is sized to its layout box at
 * the device pixel ratio because the wedges are vector paths; unlike the 1-bit
 * engine there is no cell-per-pixel buffer to protect.
 */
export function createWedgeLoop(
  canvas: HTMLCanvasElement,
  field: WedgeField,
  opts: WedgeLoopOptions
): WedgeLoopHandle {
  const cell = Math.max(4, opts.cell ?? 14);
  const fps = opts.fps ?? 24;
  const speed = opts.speed ?? 1;
  const restTime = opts.reducedMotionTime ?? 0;
  let ink = opts.ink;

  const reduced = prefersReducedMotion();
  const ctx = canvas.getContext('2d');
  const vertical = new Path2D(wedgeSubpath(0, 0, cell, 'v'));
  const horizontal = new Path2D(wedgeSubpath(0, 0, cell, 'h'));

  let width = 1;
  let height = 1;
  let dpr = 1;
  let frame = 0;
  let startedAt = 0;
  let lastDrawn = -Infinity;
  let running = false;
  let visible = true;
  let destroyed = false;

  const measure = () => {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width || canvas.clientWidth || 1));
    height = Math.max(1, Math.round(rect.height || canvas.clientHeight || 1));
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  };

  const draw = (time: number) => {
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = ink;
    const cols = Math.ceil(width / cell);
    const rows = Math.ceil(height / cell);
    for (let j = 0; j < rows; j++) {
      const v = (j + 0.5) / rows;
      const y = j * cell * dpr;
      for (let i = 0; i < cols; i++) {
        const u = (i + 0.5) / cols;
        const value = field(u, v, time);
        const x = i * cell * dpr;
        if (value > threshold(i, j)) {
          ctx.setTransform(dpr, 0, 0, dpr, x, y);
          ctx.fill(vertical);
        }
        if ((value - 0.5) * 2 > threshold(j, i)) {
          ctx.setTransform(dpr, 0, 0, dpr, x, y);
          ctx.fill(horizontal);
        }
      }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  };

  const tick = (now: number) => {
    if (destroyed) return;
    frame = requestAnimationFrame(tick);
    const minDelta = fps > 0 ? 1000 / fps : 0;
    if (now - lastDrawn < minDelta) return;
    lastDrawn = now;
    if (!startedAt) startedAt = now;
    draw(((now - startedAt) / 1000) * speed);
  };

  const start = () => {
    if (destroyed || running || reduced) return;
    running = true;
    startedAt = 0;
    lastDrawn = -Infinity;
    frame = requestAnimationFrame(tick);
  };

  const stop = () => {
    running = false;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };

  measure();
  draw(reduced ? restTime : 0);

  let resizeObserver: ResizeObserver | undefined;
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      if (destroyed) return;
      measure();
      if (!running) draw(reduced ? restTime : 0);
    });
    resizeObserver.observe(canvas);
  }

  let intersectionObserver: IntersectionObserver | undefined;
  if (!reduced && typeof IntersectionObserver !== 'undefined') {
    intersectionObserver = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (visible && !document.hidden) start();
      else stop();
    });
    intersectionObserver.observe(canvas);
  }

  const onVisibility = () => {
    if (reduced) return;
    if (document.hidden) stop();
    else if (visible) start();
  };
  document.addEventListener('visibilitychange', onVisibility);

  if (!reduced) start();

  return {
    render: (time) => draw(time ?? 0),
    start,
    stop,
    get running() {
      return running;
    },
    setInk: (next) => {
      ink = next;
      if (!running) draw(reduced ? restTime : 0);
    },
    destroy: () => {
      destroyed = true;
      stop();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    },
  };
}
