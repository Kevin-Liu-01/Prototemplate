/**
 * talud-tablero deco: the house 4x4 Bayer screen as an SVG pattern tile.
 * Home: the talud surfaces (every sloped band is volcanic stone drawn as a
 * dither tier) and the plaza's paving. The matrix is the one the shipped
 * pricing marks use; a tile at coverage k/16 lights every cell whose
 * threshold sits under k, so tiers nest by construction.
 */

export const BAYER4: readonly (readonly number[])[] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/** One pattern tile at coverage k/16, as a single path of squares. */
export function bayerTile(k: number, cell: number): string {
  const cells: string[] = [];
  BAYER4.forEach((row, y) => {
    row.forEach((threshold, x) => {
      if (threshold < k) {
        cells.push(`M${x * cell} ${y * cell}h${cell}v${cell}h${-cell}Z`);
      }
    });
  });
  return cells.join('');
}
