/**
 * Static Bayer tiers for SVG pattern fills (the pylon masses). Home: frames,
 * the hero pylons. The house 4x4 ordered-dither screen from DESIGN.md
 * section 7; coverage tiers nest by construction, so two bands filled at
 * different tiers compose an exact step in tone.
 */
export const BAYER_4: readonly (readonly number[])[] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/** One pattern tile lit at coverage k/16: each cell whose threshold is under k, drawn as squares of `cell` px. */
export function bayerTilePath(k: number, cell: number): string {
  const squares: string[] = [];
  BAYER_4.forEach((row, y) => {
    row.forEach((threshold, x) => {
      if (threshold < k) {
        squares.push(`M${x * cell} ${y * cell}h${cell}v${cell}h${-cell}Z`);
      }
    });
  });
  return squares.join('');
}
