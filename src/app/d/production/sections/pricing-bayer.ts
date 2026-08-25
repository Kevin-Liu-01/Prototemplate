/**
 * The house Bayer ramp, vendored from the shipped site's dithered-mark
 * kit (apps/landing/src/components/landing/shared/DitheredMark.tsx — the
 * BAYER4 matrix, the ShineTier record and bayerTile). Only the two pieces
 * the pricing page's marks actually use are carried over: the shipped
 * module also drives the sweeping "shine" pass, which /pricing never
 * mounts.
 */

export const BAYER4: readonly (readonly number[])[] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

export type ShineTier = { cover: number; width: number };

/** One pattern tile at coverage k/16: every cell whose Bayer threshold
    sits under k, as one path of squares. */
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
