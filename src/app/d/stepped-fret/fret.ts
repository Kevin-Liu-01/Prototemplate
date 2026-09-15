import type { FieldFn } from '@/lib/dither';

/**
 * The greca system. Every fret on the page is one centerline polyline on an
 * integer cell grid, stroked one cell thick with butt caps and miter joins,
 * so a band reads as a mosaic of whole cells the way the cut-limestone frets
 * at Mitla do. Every fret keeps a one-cell gap between parallel coils, so
 * the ground between the stones is itself a stepped figure: figure and
 * ground trade places, and the ground is the seam.
 *
 * Five distinct frets, each drawn from a Mitla panel type, at three scales:
 *
 *   spiral   the stepped fret with a coil (xicalcoliuhqui), 13 by 8
 *   hook     the hooked step: base, riser, bar, return, inward hook, 12 by 8
 *   zigzag   the stepped chevron, treads and risers of two cells, 14 by 8
 *   lozenge  the stepped diamond, a closed staircase of one-cell steps, 9 by 8
 *   opposed  two spirals mirrored on one axis, coils facing, 27 by 8
 *
 *   fine     3 px per cell: cornices, pilasters, the footer's last band
 *   band     6 px per cell: every register boundary on the cream page
 *   field   12 px per cell: the first course of the dark band's facade
 *
 * The hero is the sixth drawing: the monumental spiral at the rail's own
 * module (one twenty-sixth of the rail), rendered in ordered dither.
 *
 * Assignment by register (page.tsx mounts these in this order):
 *   hero to trust          spiral, band, ink
 *   trust pilasters        hook, fine, ornament (vertical, between marks)
 *   trust to proof         zigzag, band, ornament
 *   proof terminal         the coil alone, as a hairline off the top tread
 *   proof to surfaces      hook, band, ink
 *   surfaces to material   lozenge, band, ornament
 *   material walls         the crenellated meander, one band-scale cell thick
 *   material to review     zigzag, band, ink
 *   dark facade            opposed at field, lozenge at band, zigzag at fine,
 *                          all cream on black, plain cream courses between
 *   dark to pricing        spiral, band, cream
 *   pricing caps           lozenge, fine, ornament, one course per setback
 *   pricing to footer      hook, fine, ink
 */

export type Pt = readonly [number, number];

export type FretId = 'spiral' | 'hook' | 'zigzag' | 'lozenge' | 'opposed';

export type Fret = {
  id: FretId;
  /** the Mitla panel type the drawing is taken from */
  name: string;
  /** tile size in cells, including the one-cell gap before the next tile */
  w: number;
  h: number;
  /** one or more centerline polylines */
  paths: readonly (readonly Pt[])[];
};

export const SCALES = { fine: 3, band: 6, field: 12 } as const;

export type Scale = keyof typeof SCALES;

export const FRET_UNIT_W = 13;
export const FRET_UNIT_H = 8;

/** Six steps rising right into a square spiral coiling inward. */
export const FRET_UNIT: readonly Pt[] = [
  [0.5, 8],
  [0.5, 6.5],
  [1.5, 6.5],
  [1.5, 5.5],
  [2.5, 5.5],
  [2.5, 4.5],
  [3.5, 4.5],
  [3.5, 3.5],
  [4.5, 3.5],
  [4.5, 2.5],
  [5.5, 2.5],
  [5.5, 1.5],
  [6.5, 1.5],
  [6.5, 0.5],
  [11.5, 0.5],
  [11.5, 5.5],
  [8.5, 5.5],
  [8.5, 2.5],
  [10, 2.5],
];

/** The hooked step: a base bar, a riser, the top bar, a return down, and a hook turned inward. */
const HOOK: readonly Pt[] = [
  [0, 7.5],
  [5.5, 7.5],
  [5.5, 0.5],
  [11.5, 0.5],
  [11.5, 5.5],
  [8.5, 5.5],
  [8.5, 2.5],
  [10, 2.5],
];

/** The stepped chevron: three treads up, a cap, three treads down. */
const ZIGZAG: readonly Pt[] = [
  [0.5, 8],
  [0.5, 6.5],
  [2.5, 6.5],
  [2.5, 4.5],
  [4.5, 4.5],
  [4.5, 2.5],
  [6.5, 2.5],
  [6.5, 0.5],
  [8.5, 0.5],
  [8.5, 2.5],
  [10.5, 2.5],
  [10.5, 4.5],
  [12.5, 4.5],
  [12.5, 6.5],
  [12.5, 8],
];

/** The stepped diamond: a closed staircase of one-cell steps around an open center. */
const LOZENGE: readonly Pt[] = [
  [0.5, 4.5],
  [0.5, 3.5],
  [1.5, 3.5],
  [1.5, 2.5],
  [2.5, 2.5],
  [2.5, 1.5],
  [3.5, 1.5],
  [3.5, 0.5],
  [4.5, 0.5],
  [4.5, 1.5],
  [5.5, 1.5],
  [5.5, 2.5],
  [6.5, 2.5],
  [6.5, 3.5],
  [7.5, 3.5],
  [7.5, 4.5],
  [6.5, 4.5],
  [6.5, 5.5],
  [5.5, 5.5],
  [5.5, 6.5],
  [4.5, 6.5],
  [4.5, 7.5],
  [3.5, 7.5],
  [3.5, 6.5],
  [2.5, 6.5],
  [2.5, 5.5],
  [1.5, 5.5],
  [1.5, 4.5],
  [0.5, 4.5],
];

/** The polyline mirrored across a vertical axis at x = w / 2. */
function mirrorX(points: readonly Pt[], w: number): Pt[] {
  return points.map(([x, y]) => [w - x, y] as const);
}

export const FRETS: Record<FretId, Fret> = {
  spiral: {
    id: 'spiral',
    name: 'stepped fret with coil',
    w: FRET_UNIT_W,
    h: FRET_UNIT_H,
    paths: [FRET_UNIT],
  },
  hook: { id: 'hook', name: 'hooked step', w: 12, h: 8, paths: [HOOK] },
  zigzag: { id: 'zigzag', name: 'stepped chevron', w: 14, h: 8, paths: [ZIGZAG] },
  lozenge: { id: 'lozenge', name: 'stepped diamond', w: 9, h: 8, paths: [LOZENGE] },
  opposed: {
    id: 'opposed',
    name: 'opposed frets, coils facing',
    w: 27,
    h: 8,
    paths: [FRET_UNIT, mirrorX(FRET_UNIT, 26)],
  },
};

/**
 * The coil alone, hanging from a rule above it: a drop, the return, and two
 * turns inward. Used as the terminal of a stair drawn in hairlines, so it
 * starts on the rule (y = 0) and never redraws it.
 */
export const COIL: readonly Pt[] = [
  [5.5, 0],
  [5.5, 5.5],
  [2.5, 5.5],
  [2.5, 2.5],
  [4, 2.5],
];

export const COIL_W = 6;
export const COIL_H = 6;

export const HERO_W = 26;
export const HERO_H = 10;

/**
 * The monumental fret: five steps, a tall final riser, the bar across the
 * top, and a three-coil spiral at the right. The open step it leaves, cells
 * 6 to 19 across and 1 to 10 down, holds the claim.
 */
export const HERO_FRET: readonly Pt[] = [
  [0.5, 10],
  [0.5, 8.5],
  [1.5, 8.5],
  [1.5, 7.5],
  [2.5, 7.5],
  [2.5, 6.5],
  [3.5, 6.5],
  [3.5, 5.5],
  [4.5, 5.5],
  [4.5, 4.5],
  [5.5, 4.5],
  [5.5, 0.5],
  [25.5, 0.5],
  [25.5, 7.5],
  [19.5, 7.5],
  [19.5, 2.5],
  [23.5, 2.5],
  [23.5, 5.5],
  [21.5, 5.5],
  [21.5, 4],
];

/** An SVG path for a polyline at `cell` pixels per grid unit. */
export function polylinePath(points: readonly Pt[], cell: number): string {
  return points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${(x * cell).toFixed(2)} ${(y * cell).toFixed(2)}`)
    .join('');
}

/** Every polyline of a fret as one SVG path at `cell` pixels per unit. */
export function fretPath(fret: Fret, cell: number): string {
  return fret.paths.map((points) => polylinePath(points, cell)).join('');
}

/**
 * A fret turned to run vertically: the tile of w by h cells becomes h by w,
 * with the fret's base on the left. Used for the pilasters between the
 * customer marks.
 */
export function rotatePaths(fret: Fret): readonly (readonly Pt[])[] {
  return fret.paths.map((points) => points.map(([x, y]) => [fret.h - y, x] as const));
}

/**
 * The vertical fret as a data URI mask: no color in the image, since a mask
 * reads alpha and the host paints the tone with its own background.
 */
export function verticalFretMask(fret: Fret): string {
  const d = rotatePaths(fret)
    .map((points) => polylinePath(points, 1))
    .join('');
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${fret.h} ${fret.w}' width='${fret.h}' height='${fret.w}'>` +
    `<path d='${d}' fill='none' stroke='black' stroke-width='1' stroke-linecap='butt' stroke-linejoin='miter'/>` +
    `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

type Segment = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** cumulative centerline length at the segment's start and end */
  s0: number;
  s1: number;
  horizontal: boolean;
};

/**
 * The stroked polyline as axis-aligned rectangles, one per segment, each
 * widened by half a cell on every side except the path's two open ends. The
 * half-cell overlap at every joint is the miter square, so the union equals
 * the SVG stroke cell for cell.
 */
function toSegments(points: readonly Pt[]): Segment[] {
  const out: Segment[] = [];
  let s = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, ay] = points[i]!;
    const [bx, by] = points[i + 1]!;
    const horizontal = ay === by;
    const len = Math.abs(horizontal ? bx - ax : by - ay);
    const first = i === 0;
    const last = i === points.length - 2;
    let x0 = Math.min(ax, bx) - 0.5;
    let x1 = Math.max(ax, bx) + 0.5;
    let y0 = Math.min(ay, by) - 0.5;
    let y1 = Math.max(ay, by) + 0.5;
    // the open ends stop at their centerline point (a butt cap)
    if (first) {
      if (horizontal) {
        if (ax < bx) x0 = ax;
        else x1 = ax;
      } else if (ay < by) y0 = ay;
      else y1 = ay;
    }
    if (last) {
      if (horizontal) {
        if (bx > ax) x1 = bx;
        else x0 = bx;
      } else if (by > ay) y1 = by;
      else y0 = by;
    }
    out.push({ x0, y0, x1, y1, s0: s, s1: s + len, horizontal });
    s += len;
  }
  return out;
}

function smoothstep(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/**
 * The hero fret as a dither field. Coverage is solid at the base of the
 * stair and thins along the centerline to a fine ordered grain by the end
 * of the coil: one string at the base, many small units by the time it has
 * climbed and turned. A single knot of higher coverage travels the path
 * once every twenty seconds; under reduced motion the knot rests a third of
 * the way up the stair (time 7).
 *
 * `aspect` is the canvas box's width over height; the grid is 26 cells wide
 * and anchored to the top, so any height beyond ten cells stays ground.
 */
export function heroFretField(aspect: number): FieldFn {
  const segments = toSegments(HERO_FRET);
  const total = segments[segments.length - 1]?.s1 ?? 1;
  const rows = HERO_W / aspect;
  return (u, v, t) => {
    const x = u * HERO_W;
    const y = v * rows;
    if (y > HERO_H) return 0;
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i]!;
      if (x < seg.x0 || x >= seg.x1 || y < seg.y0 || y >= seg.y1) continue;
      const along = seg.horizontal
        ? HERO_FRET[i]![0] < HERO_FRET[i + 1]![0]
          ? x - HERO_FRET[i]![0]
          : HERO_FRET[i]![0] - x
        : HERO_FRET[i]![1] < HERO_FRET[i + 1]![1]
          ? y - HERO_FRET[i]![1]
          : HERO_FRET[i]![1] - y;
      const s = Math.min(seg.s1, Math.max(seg.s0, seg.s0 + along)) / total;
      const base = 1 - 0.66 * smoothstep(0.06, 1, s);
      const knot = ((t * 0.05) % 1.3) - 0.15;
      const d = s - knot;
      const pulse = Math.exp(-(d * d) / 0.0024) * (1 - base) * 0.9;
      return base + pulse;
    }
    return 0;
  };
}

/** The house 4 by 4 Bayer screen, values 0..15. */
export const BAYER4: readonly (readonly number[])[] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/** One static pattern tile at coverage k/16: every cell whose threshold sits under k, as one path. */
export function bayerTile(k: number, cell: number): string {
  const cells: string[] = [];
  BAYER4.forEach((row, y) => {
    row.forEach((threshold, x) => {
      if (threshold < k) cells.push(`M${x * cell} ${y * cell}h${cell}v${cell}h${-cell}Z`);
    });
  });
  return cells.join('');
}
