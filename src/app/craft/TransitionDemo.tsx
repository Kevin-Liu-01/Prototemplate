'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import {
  createDitherLoop,
  globe,
  mixFields,
  prefersReducedMotion,
  type DitherLoopHandle,
  type DitherLoopOptions,
  type FieldFn,
} from '@/lib/dither';

// the plate sheet travels with the demo, so any host outside CraftArticle has the plate rules
import './craft.css';

gsap.registerPlugin(useGSAP);

/** CSS px per loop cell: the deck's cell. */
const CELL = 2;
/** The sheet the tone grids stand for, in px. */
const FILE_WIDTH = 1600;
const FILE_HEIGHT = 900;
/**
 * The Blue Marble's disc on the sheet in file px, measured from the cut:
 * 820 px across, centred at 420, 450 (deck/shots/OPENERS.md, mood-earth).
 */
const DISC = { cx: 420, cy: 450, r: 410 };
/** The loop's beats. */
const TURN_MS = 2000;
const RESOLVE_MS = 350;
const HOLD_MS = 1500;
const STEP_MS = 150;
const CYCLE_MS = TURN_MS + RESOLVE_MS + HOLD_MS + STEP_MS + HOLD_MS + RESOLVE_MS;
/** The sign-in globe's look and curve, so the plate turns the same globe. */
const GLOBE_LOOK = { ambient: 0.14, rim: 0.16, graticule: 0, landmass: 0.42, spin: 0.14 };
const GLOBE_GAMMA = 1.15;
const EARTH_SRC = '/craft/mood-earth-cells.png';
const ROSETTA_SRC = '/craft/mood-rosetta-cells.png';
/** Ink fallbacks for a plate whose tokens are unresolved: GT blue and paper white. */
const GLOBE_INK = 'rgb(47, 92, 224)';
const PICTURE_INK = 'rgb(255, 255, 255)';
const LOOP_OPTIONS: DitherLoopOptions = { scale: CELL, paper: 'transparent', fps: 30 };
/** Paper only, for a plate with nothing to show yet. */
const BLANK: FieldFn = () => 0;

type ToneGrid = { width: number; height: number; tone: Float32Array };
type Frame = { width: number; height: number };
type Inks = { globe: string; picture: string };
type Fields = { turning: FieldFn; earth: FieldFn | null; rosetta: FieldFn | null };
/** The globe's tone gain, and the loop time the globe was last read at (written on every cell). */
type GlobeTone = { gain: number; t: number };
type Rgb = readonly [number, number, number];

function smoothstep(x: number): number {
  const k = x <= 0 ? 0 : x >= 1 ? 1 : x;
  return k * k * (3 - 2 * k);
}

/** `#rgb`, `#rrggbb`, `rgb()` or `rgba()` to its channels; null for any other form. */
function parseRgb(color: string): Rgb | null {
  const key = color.trim().toLowerCase();
  if (key.startsWith('#')) {
    const hex = key.slice(1);
    if (hex.length === 3) {
      return [
        parseInt(hex[0] + hex[0], 16),
        parseInt(hex[1] + hex[1], 16),
        parseInt(hex[2] + hex[2], 16),
      ];
    }
    if (hex.length === 6) {
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
      ];
    }
    return null;
  }
  if (key.startsWith('rgb')) {
    const nums = key
      .slice(key.indexOf('(') + 1, key.lastIndexOf(')'))
      .split(/[,\s/]+/)
      .filter(Boolean)
      .map(Number);
    if (nums.length >= 3 && nums.every((n) => !Number.isNaN(n))) {
      return [nums[0] ?? 0, nums[1] ?? 0, nums[2] ?? 0];
    }
  }
  return null;
}

/**
 * The colour `k` of the way from `from` to `to`, per channel in sRGB.
 * Either end in a form parseRgb does not read switches at k 0.5.
 */
function lerpInk(from: string, to: string, k: number): string {
  if (k <= 0) return from;
  if (k >= 1) return to;
  const a = parseRgb(from);
  const b = parseRgb(to);
  if (!a || !b) return k < 0.5 ? from : to;
  const channel = (i: 0 | 1 | 2) => Math.round(a[i] + (b[i] - a[i]) * k);
  return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`;
}

/** Decodes an 8-bit grid through a canvas; tone is the red channel over 255. */
function loadToneGrid(src: string): Promise<ToneGrid> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const width = image.naturalWidth;
      const height = image.naturalHeight;
      const probe = document.createElement('canvas');
      probe.width = width;
      probe.height = height;
      const ctx = probe.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        reject(new Error(`no 2d context to decode ${src}`));
        return;
      }
      ctx.drawImage(image, 0, 0);
      const { data } = ctx.getImageData(0, 0, width, height);
      const tone = new Float32Array(width * height);
      for (let i = 0; i < tone.length; i++) tone[i] = (data[i * 4] ?? 0) / 255;
      resolve({ width, height, tone });
    };
    image.onerror = () => reject(new Error(`could not load ${src}`));
    image.src = src;
  });
}

/** The sheet covering the frame, centred: CSS px per file px and the sheet's top left. */
function coverSheet(frame: Frame): { scale: number; left: number; top: number } {
  const scale = Math.max(frame.width / FILE_WIDTH, frame.height / FILE_HEIGHT);
  return {
    scale,
    left: (frame.width - FILE_WIDTH * scale) / 2,
    top: (frame.height - FILE_HEIGHT * scale) / 2,
  };
}

/**
 * The loop's u, v run over its cells' left edges, 0 at the first and 1 at
 * the last, so a cell's centre in CSS px is `u * sx + CELL / 2`.
 */
function cellSpans(frame: Frame): { sx: number; sy: number } {
  const cellsX = Math.max(1, Math.ceil(frame.width / CELL));
  const cellsY = Math.max(1, Math.ceil(frame.height / CELL));
  return { sx: Math.max(1, (cellsX - 1) * CELL), sy: Math.max(1, (cellsY - 1) * CELL) };
}

/**
 * `grid` covering `frame`, read at the loop's cells. A loop cell over at
 * most one grid cell reads the cell under its centre; a wider one reads
 * the area average of the grid cells under it, so the screen re-dithers
 * the grid's density where the picture is drawn smaller than the grid.
 * Tone is 0 off the sheet; time is ignored.
 */
function pictureField(grid: ToneGrid, frame: Frame): FieldFn {
  const { width, height, tone } = grid;
  const sheet = coverSheet(frame);
  const { sx, sy } = cellSpans(frame);
  // CSS px to grid cells: cell k spans [k, k + 1) in this space.
  const gridX = width / (FILE_WIDTH * sheet.scale);
  const gridY = height / (FILE_HEIGHT * sheet.scale);
  const spanX = CELL * gridX;
  const spanY = CELL * gridY;
  const half = CELL / 2;

  if (spanX <= 1 && spanY <= 1) {
    return (u, v) => {
      const gx = (u * sx + half - sheet.left) * gridX;
      if (gx < 0 || gx >= width) return 0;
      const gy = (v * sy + half - sheet.top) * gridY;
      if (gy < 0 || gy >= height) return 0;
      return tone[(gy | 0) * width + (gx | 0)] ?? 0;
    };
  }

  const halfX = spanX / 2;
  const halfY = spanY / 2;
  const area = spanX * spanY;
  return (u, v) => {
    const gx = (u * sx + half - sheet.left) * gridX;
    const x0 = gx - halfX;
    const x1 = gx + halfX;
    if (x1 <= 0 || x0 >= width) return 0;
    const gy = (v * sy + half - sheet.top) * gridY;
    const y0 = gy - halfY;
    const y1 = gy + halfY;
    if (y1 <= 0 || y0 >= height) return 0;
    const cx0 = Math.max(0, Math.floor(x0));
    const cx1 = Math.min(width, Math.ceil(x1));
    const cy0 = Math.max(0, Math.floor(y0));
    const cy1 = Math.min(height, Math.ceil(y1));
    let sum = 0;
    for (let cy = cy0; cy < cy1; cy++) {
      const wy = Math.min(y1, cy + 1) - Math.max(y0, cy);
      const row = cy * width;
      for (let cx = cx0; cx < cx1; cx++) {
        const wx = Math.min(x1, cx + 1) - Math.max(x0, cx);
        sum += (tone[row + cx] ?? 0) * wx * wy;
      }
    }
    return sum / area;
  };
}

/**
 * The mean of `field` at loop time `t` over the loop cells inside the Blue
 * Marble's disc as `frame` shows it. The plate is shorter than the disc, so
 * the disc is read where it is drawn and not over its whole area. Every
 * other cell on each axis is enough.
 */
function discMean(field: FieldFn, frame: Frame, t: number): number {
  const sheet = coverSheet(frame);
  const { sx, sy } = cellSpans(frame);
  const cx = sheet.left + DISC.cx * sheet.scale;
  const cy = sheet.top + DISC.cy * sheet.scale;
  const r2 = (DISC.r * sheet.scale) ** 2;
  const cellsX = Math.ceil(frame.width / CELL);
  const cellsY = Math.ceil(frame.height / CELL);
  let sum = 0;
  let count = 0;
  for (let y = 0; y < cellsY; y += 2) {
    const dy = y * CELL + CELL / 2 - cy;
    for (let x = 0; x < cellsX; x += 2) {
      const dx = x * CELL + CELL / 2 - cx;
      if (dx * dx + dy * dy >= r2) continue;
      sum += field((x * CELL) / sx, (y * CELL) / sy, t);
      count++;
    }
  }
  return count === 0 ? 0 : sum / count;
}

/**
 * The globe on the disc the Blue Marble covers in `frame`, at the sign-in
 * curve, its tone scaled by `tone.gain` so the resolve holds brightness.
 * Every read writes its loop time to `tone.t`, so the gain can be solved
 * against the disc on screen when the resolve begins.
 */
function turningField(frame: Frame, tone: GlobeTone): FieldFn {
  const sheet = coverSheet(frame);
  const { sx, sy } = cellSpans(frame);
  const cx = sheet.left + DISC.cx * sheet.scale;
  const cy = sheet.top + DISC.cy * sheet.scale;
  const r = DISC.r * sheet.scale;
  const shaded = globe({
    ...GLOBE_LOOK,
    cx: (cx - CELL / 2) / sx,
    cy: (cy - CELL / 2) / sy,
    radius: r / sy,
    aspect: sx / sy,
  });
  return (u, v, t) => {
    tone.t = t;
    const value = shaded(u, v, t);
    return value <= 0 ? 0 : Math.pow(value, GLOBE_GAMMA) * tone.gain;
  };
}

function readFrame(canvas: HTMLCanvasElement): Frame {
  const rect = canvas.getBoundingClientRect();
  return { width: rect.width || canvas.clientWidth || 1, height: rect.height || canvas.clientHeight || 1 };
}

function readInks(plate: Element): Inks {
  const style = getComputedStyle(plate);
  return {
    globe: style.getPropertyValue('--ptc-globe-ink').trim() || GLOBE_INK,
    picture: style.getPropertyValue('--tc-ink').trim() || PICTURE_INK,
  };
}

/**
 * The transition plate: one dither loop at the deck's cell, its field and
 * ink set together by one clock. The globe turns, resolves into the Blue
 * Marble over 350 ms on the disc it occupies, holds, steps into the Rosetta
 * Stone over 150 ms, holds, and mixes back over 350 ms. Every mix is
 * mixFields on one smoothstep with the ink interpolated on the same curve;
 * nothing fades in alpha and the cell never changes. As each resolve begins
 * the globe's gain is solved against its disc on screen, so the mix starts
 * at the picture's mean tone and brightness holds. The tone grids decode in
 * the browser; until they arrive the globe turns alone. Under reduced motion
 * the plate draws nothing until they arrive, then draws the Blue Marble
 * still once.
 */
export default function TransitionDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const canvas = canvasRef.current;
    const plate = canvas?.parentElement;
    if (!canvas || !plate) return;

    const reduced = prefersReducedMotion();
    let inks = readInks(plate);
    let frame = readFrame(canvas);
    const globeTone: GlobeTone = { gain: 1, t: 0 };
    let earthMean = 0;
    let solvedCycle = -1;
    let grids: { earth: ToneGrid; rosetta: ToneGrid } | null = null;
    let fields: Fields = { turning: turningField(frame, globeTone), earth: null, rosetta: null };
    let clock: number | null = null;
    let dead = false;

    // under reduced motion the plate draws nothing until the grids arrive, so the
    // first frame the viewer sees is the Blue Marble still
    const loop: DitherLoopHandle = createDitherLoop(canvas, reduced ? BLANK : fields.turning, {
      ...LOOP_OPTIONS,
      ink: reduced ? inks.picture : inks.globe,
    });

    /** Puts the globe's disc, as it stands on screen, at the Blue Marble's mean tone. */
    const solveGain = () => {
      const mean = discMean(fields.turning, frame, globeTone.t) / globeTone.gain;
      if (mean > 0) globeTone.gain = earthMean / mean;
    };

    const rebuild = () => {
      fields = {
        turning: turningField(frame, globeTone),
        earth: grids ? pictureField(grids.earth, frame) : null,
        rosetta: grids ? pictureField(grids.rosetta, frame) : null,
      };
      // both means follow the frame, since a resize moves the band of the disc the plate shows
      if (fields.earth) {
        earthMean = discMean(fields.earth, frame, 0);
        solveGain();
      }
      // a still, or a paused loop, redraws through setField; a running loop draws on its next tick
      if (!loop.running) loop.setField(fields.earth ?? (reduced ? BLANK : fields.turning));
    };

    const apply = (field: FieldFn, ink: string) => {
      loop.setField(field);
      loop.setOptions({ ink });
    };

    /* the clock: the cycle position picks the segment; a mix sets the
       field and the ink from one smoothstep of its own elapsed time, and
       the resolve solves the globe's gain on its first tick */
    const tick = () => {
      if (!loop.running) return;
      const { earth, rosetta } = fields;
      if (!earth || !rosetta || clock === null) {
        apply(fields.turning, inks.globe);
        return;
      }
      const now = performance.now();
      const cycle = Math.floor((now - clock) / CYCLE_MS);
      const cycleStart = clock + cycle * CYCLE_MS;
      const ms = now - cycleStart;
      const resolveAt = cycleStart + TURN_MS;
      const stepAt = resolveAt + RESOLVE_MS + HOLD_MS;
      const returnAt = stepAt + STEP_MS + HOLD_MS;
      if (ms < TURN_MS) {
        apply(fields.turning, inks.globe);
      } else if (now < resolveAt + RESOLVE_MS) {
        if (solvedCycle !== cycle) {
          // the disc as it stands on screen, so the mix begins at the picture's brightness
          solvedCycle = cycle;
          solveGain();
        }
        const k = smoothstep((now - resolveAt) / RESOLVE_MS);
        loop.setField(mixFields(fields.turning, earth, k));
        loop.setOptions({ ink: lerpInk(inks.globe, inks.picture, k) });
      } else if (now < stepAt) {
        apply(earth, inks.picture);
      } else if (now < stepAt + STEP_MS) {
        const k = smoothstep((now - stepAt) / STEP_MS);
        apply(mixFields(earth, rosetta, k), inks.picture);
      } else if (now < returnAt) {
        apply(rosetta, inks.picture);
      } else {
        const k = smoothstep((now - returnAt) / RESOLVE_MS);
        loop.setField(mixFields(rosetta, fields.turning, k));
        loop.setOptions({ ink: lerpInk(inks.picture, inks.globe, k) });
      }
    };

    if (!reduced) gsap.ticker.add(tick);

    Promise.all([loadToneGrid(EARTH_SRC), loadToneGrid(ROSETTA_SRC)])
      .then(([earth, rosetta]) => {
        if (dead) return;
        grids = { earth, rosetta };
        clock = performance.now();
        rebuild();
      })
      .catch(() => {
        // a grid that never arrives leaves the globe turning
      });

    const resize =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            if (dead) return;
            frame = readFrame(canvas);
            rebuild();
          });
    resize?.observe(canvas);

    // the plate is dark in both themes; the redraw follows the family's rule and re-reads the tokens
    const theme = new MutationObserver(() => {
      if (dead) return;
      inks = readInks(plate);
      if (!loop.running) loop.setOptions({ ink: fields.earth ? inks.picture : inks.globe });
    });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      dead = true;
      gsap.ticker.remove(tick);
      resize?.disconnect();
      theme.disconnect();
      loop.destroy();
    };
  }, []);

  return <canvas className='ptc-plate-field' ref={canvasRef} aria-hidden='true' />;
}
