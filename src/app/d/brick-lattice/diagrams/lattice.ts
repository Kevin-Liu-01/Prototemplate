/**
 * brick-lattice · the lattice engine.
 *
 * Home: the ground of every section. The page has no empty surface: each
 * section paints a running-bond brick grid behind its content, and each
 * brick is one ordered-dither cell. A scalar field gives every brick a
 * coverage value; the 8x8 Bayer matrix from src/lib/dither.ts decides
 * whether that brick stays fired clay, takes the lapis glaze, or (past 1.0)
 * the gold glaze. Density is the whole drawing language: rosettes,
 * chevrons, frets, palmettes, and stepped parapets are all density fields
 * quantised onto the bond, the way the Ishtar Gate's ornament is glazed
 * brick counted course by course.
 *
 * Continuity across sections: courses are indexed from the top of the
 * document, not the section, so the bond and the dither tile run unbroken
 * through every seam. A canvas only knows its own box; the host passes the
 * section's document offset and the engine phases the first course from it.
 *
 * Lifecycle (DESIGN.md section 11): one still under prefers-reduced-motion,
 * pause offscreen and on hidden tabs, redraw on resize and on theme flips,
 * destroy() releases everything. Colors arrive as resolved CSS token
 * strings; nothing here names a color.
 */

import { BAYER_8, prefersReducedMotion } from '@/lib/dither';

/** One brick, at evaluation time. Positions are CSS px from the section's top-left. */
export type LatticeCell = {
  x: number;
  y: number;
  /** the section box */
  w: number;
  h: number;
  /** the brick module: stretcher width and course height */
  bw: number;
  bh: number;
  /** column within the course, and the document-global course index */
  col: number;
  row: number;
  /** an anchor element's box inside the section (the hero's claim panel); zeros when none */
  ax: number;
  ay: number;
  aw: number;
  ah: number;
  /** seconds since the loop started; 0 for a still */
  t: number;
};

/** Coverage for one brick: 0 is fired clay, above the Bayer threshold lapis, above 1 + threshold gold. */
export type LatticeField = (cell: LatticeCell) => number;

export type LatticePalette = {
  mortar: string;
  brick: string;
  lapis: string;
  gold: string;
};

export type LatticeBox = { x: number; y: number; w: number; h: number };

/* ------------------------------------------------------------------ */
/* helpers                                                             */

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function smoothstep(a: number, b: number, x: number): number {
  if (a === b) return x < a ? 0 : 1;
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

/** The Bayer threshold for a brick address, 0..1, from the house 8x8 screen. */
export function brickThreshold(col: number, row: number): number {
  return (BAYER_8[row & 7]![col & 7]! + 0.5) / 64;
}

/* ------------------------------------------------------------------ */
/* rosette geometry, shared by the hero field and the band medallions  */

export type RosetteOptions = {
  /** radial repeats; the gate's rosettes carry eight or twelve */
  petals: number;
  /** where the petal band starts and ends, as fractions of the radius */
  inner: number;
  outer: number;
  /** the core disc's radius as a fraction; 0 leaves the core to the host */
  core: number;
  /** a one-course lapis ring at this radius, 0 for none */
  ring: number;
};

/**
 * A rosette as a coverage value at polar (r, theta), r in radii. Petals
 * are a cosine lobe raised to a power so the dither renders each petal as
 * a dense core thinning to its edge; the band profile fades the petals in
 * from the core and out to the rim, which is what makes the rosette read
 * as glazed dots rather than a stencil.
 */
export function rosetteValue(r: number, theta: number, o: RosetteOptions): number {
  let v = 0;
  if (o.core > 0 && r < o.core) v = 1.35;
  if (o.ring > 0 && r >= o.ring && r < o.ring + 0.05) v = Math.max(v, 1);
  const lobe = Math.pow(0.5 + 0.5 * Math.cos(o.petals * theta), 2.4);
  const band = smoothstep(o.inner, o.inner + 0.2, r) * (1 - smoothstep(o.outer - 0.18, o.outer, r));
  v = Math.max(v, lobe * band * 1.18 + band * 0.08);
  if (r > o.outer + 0.03 && r < o.outer + 0.07) v = Math.max(v, 0.9);
  return v;
}

/* ------------------------------------------------------------------ */
/* the fields, one per section, referenced by name from the markup     */

const SCATTER = 0.04;

/** The hero: one enormous twelve-petal rosette centred on the claim panel, breathing one ring outward. */
function heroField(c: LatticeCell): number {
  const hasAnchor = c.aw > 0 && c.ah > 0;
  const cx = hasAnchor ? c.ax + c.aw / 2 : c.w / 2;
  const cy = hasAnchor ? c.ay + c.ah / 2 : c.h * 0.44;
  const R = Math.max(c.aw * 0.78, c.ah * 0.78, c.w * 0.3);
  const dx = c.x - cx;
  const dy = c.y - cy;
  const r = Math.hypot(dx, dy) / R;
  const theta = Math.atan2(dy, dx);
  let v = rosetteValue(r, theta, { petals: 12, inner: 0.3, outer: 0.97, core: 0.22, ring: 0.27 });
  /* the pulse: one ring of raised density sweeps out every seven and a half seconds */
  const pulse = (c.t * 0.16) % 1.2;
  const ring = 1 - smoothstep(0, 0.045, Math.abs(r - pulse));
  v += ring * 0.26 * (1 - smoothstep(1, 1.15, r));
  return Math.max(SCATTER, v);
}

/** Behind the wall: soft chevron courses, the zigzag register of the gate's lower walls. */
function chevronField(c: LatticeCell): number {
  const period = c.bh * 10;
  const f = ((c.y + Math.abs(c.x - c.w / 2)) / period) % 1;
  const band = smoothstep(0, 0.22, f) * (1 - smoothstep(0.34, 0.56, f));
  return SCATTER + band * 0.5;
}

/** The kiln: a crenellated parapet along the top edge and a stepped foot along the bottom. */
function parapetField(c: LatticeCell): number {
  const fromTop = Math.floor(c.y / c.bh);
  const fromBottom = Math.floor((c.h - c.y) / c.bh);
  const merlon = ((c.col % 10) + 10) % 10 < 6;
  let v = SCATTER;
  if (fromTop < 2) v = 1;
  else if (fromTop < 6 && merlon) v = 1;
  if (fromTop === 0) v = 2;
  if (fromBottom < 2) v = Math.max(v, 1);
  else if (fromBottom < 4) v = Math.max(v, 0.55);
  else if (fromBottom < 6) v = Math.max(v, 0.25);
  return v;
}

/**
 * A running meander (the Greek key of the lineage's Persian and Greek
 * simplifications) as an 8x8 bitmap. Read row by row from the section's
 * top register, and mirrored into the bottom register.
 */
const FRET: readonly string[] = [
  '########',
  '.......#',
  '######.#',
  '#....#.#',
  '#.##.#.#',
  '#.#..#.#',
  '#.####.#',
  '#......#',
];

function fretAt(col: number, line: number): boolean {
  const row = FRET[line];
  if (!row) return false;
  return row[((col % 8) + 8) % 8] === '#';
}

/** The languages band: a fret in the top register and its mirror in the bottom one. */
function fretField(c: LatticeCell): number {
  const fromTop = Math.floor(c.y / c.bh);
  const fromBottom = Math.floor((c.h - c.y) / c.bh);
  if (fromTop >= 1 && fromTop <= 8) {
    if (fretAt(c.col, fromTop - 1)) return fromTop === 1 ? 2 : 1;
    return 0.02;
  }
  if (fromBottom >= 1 && fromBottom <= 8) {
    if (fretAt(c.col, fromBottom - 1)) return fromBottom === 1 ? 2 : 1;
    return 0.02;
  }
  return SCATTER;
}

/** Pricing: a row of seven-lobed palmette fans rising from the bottom register. */
function palmetteField(c: LatticeCell): number {
  const spacing = Math.max(320, c.w / 4);
  const R = spacing * 0.5;
  const baseY = c.h - c.bh * 2;
  const k = Math.round((c.x - c.w / 2) / spacing);
  const cx = c.w / 2 + k * spacing;
  /* a fan taller than it is wide, the way the palmette's fronds rise */
  const dx = (c.x - cx) * 1.25;
  const dy = baseY - c.y;
  if (dy < -c.bh) return SCATTER;
  const r = Math.hypot(dx, dy) / R;
  const theta = Math.atan2(dx, Math.max(dy, 0.0001));
  const lobe = Math.pow(Math.max(0, Math.cos(14 * theta)), 1.3);
  const band = smoothstep(0.24, 0.42, r) * (1 - smoothstep(0.82, 0.99, r));
  let v = Math.max(SCATTER, lobe * band * 1.15 + band * 0.06);
  if (r < 0.18) v = 1.3;
  else if (r >= 0.2 && r < 0.26) v = 1;
  return v;
}

/** The footer: the wall's foundation, density stepping up course by course to a solid base. */
function foundationField(c: LatticeCell): number {
  const b = Math.floor((c.h - c.y) / c.bh);
  if (b < 3) return 1;
  if (b < 5) return 0.7;
  if (b < 7) return 0.42;
  if (b < 9) return 0.2;
  if (b < 11) return 0.1;
  return SCATTER;
}

/** Plain bond with the page's scatter; sections that carry their own objects. */
function plainField(): number {
  return SCATTER;
}

export const FIELDS = {
  hero: heroField,
  chevron: chevronField,
  parapet: parapetField,
  fret: fretField,
  palmette: palmetteField,
  foundation: foundationField,
  plain: plainField,
} as const;

export type FieldName = keyof typeof FIELDS;

/* ------------------------------------------------------------------ */
/* the renderer                                                        */

export type LatticeRenderOptions = {
  /** stretcher width in CSS px; rounded to an even integer so the half-brick offset is whole */
  brick: number;
  /** the section's offset from the document top in CSS px */
  docTop: number;
  palette: LatticePalette;
  time: number;
  anchor: LatticeBox | null;
};

/**
 * Paint one frame. The canvas backing store is one canvas pixel per CSS
 * pixel (never device pixels: the mortar is a one-pixel line and the
 * upscale keeps it crisp through image-rendering: pixelated). Each course
 * alternates a half-brick shift, the running bond; the fill style changes
 * only when the glaze changes, which on a dithered field is rare.
 */
export function renderLattice(canvas: HTMLCanvasElement, field: LatticeField, o: LatticeRenderOptions): void {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (w < 2 || h < 2) return;
  const bw = Math.max(8, Math.round(o.brick / 2) * 2);
  const bh = bw / 2;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const { mortar, brick, lapis, gold } = o.palette;
  ctx.fillStyle = mortar;
  ctx.fillRect(0, 0, w, h);

  const docTop = Math.max(0, Math.round(o.docTop));
  const phase = Math.floor(docTop / bh);
  const yOff = phase * bh - docTop;
  const courses = Math.ceil((h - yOff) / bh);
  const cols = Math.ceil(w / bw) + 1;

  const cell: LatticeCell = {
    x: 0,
    y: 0,
    w,
    h,
    bw,
    bh,
    col: 0,
    row: 0,
    ax: o.anchor?.x ?? 0,
    ay: o.anchor?.y ?? 0,
    aw: o.anchor?.w ?? 0,
    ah: o.anchor?.h ?? 0,
    t: o.time,
  };

  let current = '';
  for (let r = 0; r < courses; r++) {
    const row = phase + r;
    const y = yOff + r * bh;
    const xOff = row & 1 ? -bh : 0;
    cell.row = row;
    cell.y = y + bh / 2;
    for (let c = 0; c <= cols; c++) {
      const x = xOff + c * bw;
      cell.col = c;
      cell.x = x + bw / 2;
      const v = field(cell);
      const th = brickThreshold(c, row);
      const glaze = v - 1 > th ? gold : v > th ? lapis : brick;
      if (glaze !== current) {
        ctx.fillStyle = glaze;
        current = glaze;
      }
      ctx.fillRect(x + 1, y + 1, bw - 1, bh - 1);
    }
  }
}

/* ------------------------------------------------------------------ */
/* the loop                                                            */

export type LatticeLoopOptions = {
  field: LatticeField;
  /** false renders a still and only redraws on resize and theme flips */
  animate: boolean;
  fps?: number;
  readPalette: () => LatticePalette;
  readBrick: () => number;
  readDocTop: () => number;
  readAnchor: () => LatticeBox | null;
};

export type LatticeLoopHandle = {
  render: (time?: number) => void;
  destroy: () => void;
};

export function createLatticeLoop(canvas: HTMLCanvasElement, o: LatticeLoopOptions): LatticeLoopHandle {
  const reduced = prefersReducedMotion();
  const animate = o.animate && !reduced;
  let palette = o.readPalette();
  let frame = 0;
  let startedAt = 0;
  let lastDrawn = -Infinity;
  let running = false;
  let visible = true;
  let destroyed = false;
  let elapsed = 0;

  const draw = (time: number) => {
    elapsed = time;
    renderLattice(canvas, o.field, {
      brick: o.readBrick(),
      docTop: o.readDocTop(),
      palette,
      time,
      anchor: o.readAnchor(),
    });
  };

  const tick = (now: number) => {
    if (destroyed) return;
    frame = requestAnimationFrame(tick);
    const minDelta = 1000 / (o.fps ?? 12);
    if (now - lastDrawn < minDelta) return;
    lastDrawn = now;
    if (!startedAt) startedAt = now - elapsed * 1000;
    draw((now - startedAt) / 1000);
  };

  const start = () => {
    if (destroyed || running || !animate) return;
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

  /* the first frame paints synchronously so the canvas is never the default 300x150 */
  draw(0);

  const redraw = () => {
    if (destroyed) return;
    palette = o.readPalette();
    draw(running ? elapsed : 0);
  };

  let resize: ResizeObserver | undefined;
  if (typeof ResizeObserver !== 'undefined') {
    resize = new ResizeObserver(redraw);
    if (canvas.parentElement) resize.observe(canvas.parentElement);
    /* a taller section above shifts this one: the document body's height is the tell */
    resize.observe(document.body);
  }

  const theme = new MutationObserver(redraw);
  theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  let intersection: IntersectionObserver | undefined;
  if (animate && typeof IntersectionObserver !== 'undefined') {
    intersection = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting);
      if (visible && !document.hidden) start();
      else stop();
    });
    intersection.observe(canvas);
  }

  const onVisibility = () => {
    if (!animate) return;
    if (document.hidden) stop();
    else if (visible) start();
  };
  document.addEventListener('visibilitychange', onVisibility);

  if (animate) start();

  return {
    render: (time) => draw(time ?? 0),
    destroy: () => {
      destroyed = true;
      stop();
      resize?.disconnect();
      theme.disconnect();
      intersection?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    },
  };
}
