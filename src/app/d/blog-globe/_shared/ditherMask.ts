/**
 * The 8 by 8 Bayer screen as a CSS mask, for the house dither step between
 * two pictures (DESIGN.md §7 and the craft article's transition rules): one
 * anchored tile, a fixed cell size, and a threshold that only rises, so the
 * outgoing picture gives way cell by cell to the one underneath. No alpha,
 * no wipe, nothing moves.
 */

/** The house 8 by 8 screen, an exact permutation of 0 to 63 (65 linear tone levels). */
export const BAYER8: readonly (readonly number[])[] = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

/** The steps of a transition: level 0 keeps every cell, level 64 keeps none. */
export const DITHER_LEVELS = 64;

/** Which picture a mask shows: the outgoing one, or the incoming one in the cells it has given up. */
export type DitherKeep = 'out' | 'in';

/** The cells a level keeps, as [x, y] tile coordinates: every cell whose threshold is at least the level ('out'), or the rest ('in'). */
export function keptCells(
  level: number,
  keep: DitherKeep = 'out'
): [number, number][] {
  const out: [number, number][] = [];
  BAYER8.forEach((row, y) => {
    row.forEach((threshold, x) => {
      if (threshold >= level === (keep === 'out')) out.push([x, y]);
    });
  });
  return out;
}

/**
 * A CSS `url()` for the mask of one level: an SVG tile of 8 by 8 cells,
 * `cell` CSS pixels each, opaque where the outgoing picture still shows
 * (or, with `keep` 'in', where the incoming one already does).
 * Tile it with `mask-size: 8 * cell` and `mask-position: 0 0` so every
 * level shares one grid.
 */
export function ditherMaskUrl(
  level: number,
  cell = 2,
  keep: DitherKeep = 'out'
): string {
  const size = cell * 8;
  const path = keptCells(level, keep)
    .map(([x, y]) => `M${x * cell} ${y * cell}h${cell}v${cell}h-${cell}z`)
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" shape-rendering="crispEdges"><path d="${path}" fill="#000"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** The house easing for a tone mix: zero slope at both ends. */
export function smoothstep(x: number): number {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
}
