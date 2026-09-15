/**
 * brick-lattice · the lattice engine and the pattern book.
 *
 * Home: the ground of every section. The page has no empty surface: each
 * section paints a running-bond brick grid behind its content, and each
 * brick is one ordered-dither cell. A scalar field gives every brick a
 * coverage value; the 8x8 Bayer matrix from src/lib/dither.ts decides
 * whether that brick stays fired clay, takes the lapis glaze, or (past 1.0)
 * the gold glaze. Density is the whole drawing language.
 *
 * The pattern book. Six fields, one per section, each a different bond
 * pattern from the Ishtar Gate's own repertoire, counted course by course:
 *
 *   rosette     the hero: one twelve-petal rosette on the claim panel with
 *               four eight-petal satellites at the corners, a rosette field
 *   chevron     the wall: zigzag courses, the gate's lower register; the
 *               source brick's firing wave lights it from the anchor out
 *   parapet     the kiln: the lattice inverted, a lapis body with obsidian
 *               holes, stepped ziggurat setbacks at both edges, crenellated
 *               merlons over a gold course, a gold foot
 *   fret        the languages band: a running meander in the top register
 *               and its mirror in the bottom one
 *   palmette    pricing: seven-lobed palmette fans rising from the bottom
 *               course, one behind each glazed panel
 *   foundation  the footer: density stepping up course by course to solid
 *               lapis and a gold plinth, the wall's footing
 *
 * The same functions draw the section-head swatches and the footer's
 * pattern book at tile scale (diagrams/PatternSwatch.tsx), so the system is
 * documented by the thing itself.
 *
 * Continuity across sections: courses are indexed from the top of the
 * document, not the section, so the bond and the dither tile run unbroken
 * through every seam. A canvas only knows its own box; the host passes the
 * section's document offset and the engine phases the first course from it.
 *
 * Drive: a section's timeline may write a 0..1 value onto the host
 * (data-bl-drive); the field reads it as `k`. The wall uses it to send one
 * ring of raised density out from the source brick as the DOM bricks fire,
 * so the lattice and the wall light together. At rest k is 0 and the field
 * is its still.
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
  /** an anchor element's box inside the section (the hero's claim panel, the wall's source brick); zeros when none */
  ax: number;
  ay: number;
  aw: number;
  ah: number;
  /** seconds since the loop started; 0 for a still */
  t: number;
  /** the host's drive, 0..1; 0 at rest */
  k: number;
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

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

/** The Bayer threshold for a brick address, 0..1, from the house 8x8 screen. */
export function brickThreshold(col: number, row: number): number {
  return (BAYER_8[row & 7]![col & 7]! + 0.5) / 64;
}

/* ------------------------------------------------------------------ */
/* rosette geometry, shared by the hero field, the medallions, the crown */

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

/** One rosette's coverage at a point, given its centre and radius in px. */
function rosetteAt(x: number, y: number, cx: number, cy: number, R: number, o: RosetteOptions): number {
  const dx = x - cx;
  const dy = y - cy;
  const r = Math.hypot(dx, dy) / R;
  if (r > o.outer + 0.1) return 0;
  return rosetteValue(r, Math.atan2(dy, dx), o);
}

/* ------------------------------------------------------------------ */
/* the pattern book                                                    */

const SCATTER = 0.04;

const CENTRE: RosetteOptions = { petals: 12, inner: 0.3, outer: 0.97, core: 0.22, ring: 0.27 };
const SATELLITE: RosetteOptions = { petals: 8, inner: 0.34, outer: 0.96, core: 0.3, ring: 0 };

/**
 * The hero: one twelve-petal rosette centred on the claim panel, four
 * eight-petal satellites with gold cores at the corners of the field, and
 * one ring of raised density breathing out from the centre.
 */
function rosetteField(c: LatticeCell): number {
  const hasAnchor = c.aw > 0 && c.ah > 0;
  const cx = hasAnchor ? c.ax + c.aw / 2 : c.w / 2;
  const cy = hasAnchor ? c.ay + c.ah / 2 : c.h * 0.44;
  const R = Math.max(c.aw * 0.78, c.ah * 0.78, c.w * 0.3);
  let v = rosetteAt(c.x, c.y, cx, cy, R, CENTRE);

  const R2 = R * 0.2;
  const ox = R * 0.86;
  const oy = R * 0.62;
  v = Math.max(v, rosetteAt(c.x, c.y, cx - ox, cy - oy, R2, SATELLITE));
  v = Math.max(v, rosetteAt(c.x, c.y, cx + ox, cy - oy, R2, SATELLITE));
  v = Math.max(v, rosetteAt(c.x, c.y, cx - ox, cy + oy, R2, SATELLITE));
  v = Math.max(v, rosetteAt(c.x, c.y, cx + ox, cy + oy, R2, SATELLITE));

  /* the pulse: one ring of raised density sweeps out every seven and a half seconds */
  const r = Math.hypot(c.x - cx, c.y - cy) / R;
  const pulse = (c.t * 0.16) % 1.2;
  const ring = 1 - smoothstep(0, 0.045, Math.abs(r - pulse));
  v += ring * 0.26 * (1 - smoothstep(1, 1.15, r));
  return Math.max(SCATTER, v);
}

/**
 * Behind the wall: zigzag courses, the register under the gate's rosettes.
 * When the wall fires, the host drives one ring of density out from the
 * source brick; where the ring crosses a chevron the bricks pass 1.0 and
 * take the gold glaze, so the wave reads as the wall lighting.
 */
function chevronField(c: LatticeCell): number {
  const period = c.bh * 10;
  const f = mod((c.y + Math.abs(c.x - c.w / 2)) / period, 1);
  const band = smoothstep(0, 0.22, f) * (1 - smoothstep(0.34, 0.56, f));
  let v = SCATTER + band * 0.5;

  if (c.k > 0 && c.aw > 0) {
    const cx = c.ax + c.aw / 2;
    const cy = c.ay + c.ah / 2;
    const reach = Math.hypot(c.w, c.h) * 0.55;
    const R = c.k * reach;
    const d = Math.hypot(c.x - cx, c.y - cy);
    const ring = 1 - smoothstep(0, c.bh * 3.5, Math.abs(d - R));
    const inside = d < R ? 0.12 * (1 - smoothstep(0, R, d)) : 0;
    v += ring * 0.62 + inside;
  }
  return v;
}

/**
 * The kiln: the lattice inverted. Elsewhere the ornament is lapis on clay;
 * here the body is lapis (the gate's true ground) with obsidian holes, and
 * the ornament is drawn by what is left unglazed. Ziggurat setbacks step
 * the body in three times at both edges, merlons stand over a gold course
 * along the top, and a gold foot closes the bottom.
 */
function parapetField(c: LatticeCell): number {
  const fromTop = Math.floor(c.y / c.bh);
  const fromBottom = Math.floor((c.h - c.y) / c.bh);
  const side = Math.min(c.x, c.w - c.x);

  /* three setbacks of one step each, receding upward; a step is three stretchers or 4% of the width */
  const step = Math.max(c.bw * 1.5, c.w * 0.04);
  const setback = Math.max(0, 3 - Math.floor(fromTop / 4)) * step;
  if (side < setback) return 0;

  const merlon = mod(c.col, 10) < 6;
  if (fromTop < 4) return merlon ? (fromTop === 0 ? 2 : 1.05) : 0;
  if (fromTop < 6) return 2;
  if (fromBottom < 2) return 2;
  if (fromBottom < 4) return 1.05;
  return 0.8;
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
  return row[mod(col, 8)] === '#';
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

/** Pricing: a row of seven-lobed palmette fans rising from the bottom register, one per third of the width. */
function palmetteField(c: LatticeCell): number {
  const spacing = Math.max(300, c.w / 3);
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

/** The footer: the wall's foundation, density stepping up course by course to solid lapis and a gold plinth. */
function foundationField(c: LatticeCell): number {
  const b = Math.floor((c.h - c.y) / c.bh);
  if (b < 2) return 2;
  if (b < 4) return 1;
  if (b < 6) return 0.7;
  if (b < 8) return 0.42;
  if (b < 10) return 0.2;
  if (b < 12) return 0.1;
  return SCATTER;
}

export const FIELDS = {
  rosette: rosetteField,
  chevron: chevronField,
  parapet: parapetField,
  fret: fretField,
  palmette: palmetteField,
  foundation: foundationField,
} as const;

export type FieldName = keyof typeof FIELDS;

/** The book as the footer prints it: each pattern, its name, and the section it grounds. */
export type PatternEntry = { field: FieldName; name: string; home: string; href: string };

export const PATTERN_BOOK: readonly PatternEntry[] = [
  { field: 'rosette', name: 'Rosette field', home: 'The claim', href: '#top' },
  { field: 'chevron', name: 'Chevron course', home: 'The T component', href: '#t' },
  { field: 'parapet', name: 'Stepped parapet', home: 'The platform', href: '#platform' },
  { field: 'fret', name: 'Meander register', home: 'Languages', href: '#languages' },
  { field: 'palmette', name: 'Palmette band', home: 'Pricing', href: '#pricing' },
  { field: 'foundation', name: 'Foundation', home: 'Footer', href: '#footer' },
];

/* ------------------------------------------------------------------ */
/* the renderer                                                        */

export type LatticeRenderOptions = {
  /** stretcher width in CSS px; rounded to an even integer so the half-brick offset is whole */
  brick: number;
  /** the section's offset from the document top in CSS px */
  docTop: number;
  palette: LatticePalette;
  time: number;
  drive: number;
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
    k: clamp01(o.drive),
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
  readDrive: () => number;
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
      drive: animate ? o.readDrive() : 0,
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
