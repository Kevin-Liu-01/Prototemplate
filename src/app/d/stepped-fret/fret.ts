import type { FieldFn } from '@/lib/dither';

/**
 * The stepped fret (greca, xicalcoliuhqui) as geometry. Every fret on the
 * page is one centerline polyline on an integer cell grid, stroked one cell
 * thick with butt caps and miter joins, so the band reads as a mosaic of
 * whole cells the way the cut-limestone frets at Mitla do. Two constructions
 * are used: the frieze unit (13 by 8 cells, repeated along a band) and the
 * hero's monumental unit (26 by 10 cells, drawn once). Both keep a one-cell
 * gap between every coil, so the ground between the stones is itself a
 * stepped fret: figure and ground trade places, and the ground is the seam.
 */

export type Pt = readonly [number, number];

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

/**
 * A bar-and-dot numeral: base twenty, a dot for one and a bar for five, the
 * highest place on top. 118 is one bar over three bars and three dots.
 */
export type BarDotPlace = { bars: number; dots: number };

export function barDotPlaces(n: number): BarDotPlace[] {
  const places: BarDotPlace[] = [];
  let rest = Math.max(0, Math.floor(n));
  do {
    const digit = rest % 20;
    places.unshift({ bars: Math.floor(digit / 5), dots: digit % 5 });
    rest = Math.floor(rest / 20);
  } while (rest > 0);
  return places;
}
