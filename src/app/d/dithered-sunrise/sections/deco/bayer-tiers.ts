/**
 * DITHERED-SUNRISE, the static half of the dither engine.
 *
 * The house screen is the 4x4 ordered-dither matrix the shipped site cuts
 * its static SVG pattern tiers from (charter A2). A cell is lit at coverage
 * `k` of 16 when its matrix value is below `k`, so tiers nest by
 * construction: every cell lit at 4/16 is still lit at 8/16. That is what
 * lets adjacent bands filled with different tiers compose an exact ramp
 * without ever painting a translucent cell twice. The inline SVG ornaments
 * in this folder build their `<pattern>` tiles from these cells; the canvas
 * fields in `../../fields.ts` use the 8x8 matrix in `src/lib/dither.ts`.
 *
 * Home: a helper shared by the C1.1 crest, the C1.2 divider lattice and the
 * C1.4 hero crown in this folder; it renders nothing on its own.
 */

export const HOUSE_SCREEN: readonly (readonly number[])[] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/** One lit cell of a 4x4 tile, as (column, row). */
export type TileCell = readonly [number, number];

/** The lit cells of one 4x4 tile at coverage `k` of 16, in row order. */
export function tierCells(k: number): TileCell[] {
  const out: TileCell[] = [];
  for (let y = 0; y < 4; y += 1) {
    for (let x = 0; x < 4; x += 1) {
      if ((HOUSE_SCREEN[y]?.[x] ?? 16) < k) out.push([x, y]);
    }
  }
  return out;
}

/** An SVG path that fills one annular sector, centred on (cx, cy). */
export function sectorPath(
  cx: number,
  cy: number,
  r0: number,
  r1: number,
  a0: number,
  a1: number
): string {
  const f = (n: number) => n.toFixed(2);
  const x0 = cx + r0 * Math.cos(a0);
  const y0 = cy + r0 * Math.sin(a0);
  const x1 = cx + r1 * Math.cos(a0);
  const y1 = cy + r1 * Math.sin(a0);
  const x2 = cx + r1 * Math.cos(a1);
  const y2 = cy + r1 * Math.sin(a1);
  const x3 = cx + r0 * Math.cos(a1);
  const y3 = cy + r0 * Math.sin(a1);
  return [
    `M${f(x0)} ${f(y0)}`,
    `L${f(x1)} ${f(y1)}`,
    `A${f(r1)} ${f(r1)} 0 0 1 ${f(x2)} ${f(y2)}`,
    `L${f(x3)} ${f(y3)}`,
    `A${f(r0)} ${f(r0)} 0 0 0 ${f(x0)} ${f(y0)}`,
    'Z',
  ].join('');
}
