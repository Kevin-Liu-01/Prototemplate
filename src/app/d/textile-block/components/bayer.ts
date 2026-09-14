/**
 * textile-block: static Bayer tiers for the ziggurat faces.
 *
 * The house 4x4 screen. A tier at coverage k/16 lights every cell whose
 * threshold sits under k. The tile is emitted as an SVG mask so the CSS can
 * paint it in a token color; tiers nest by construction, so the five faces
 * of the stack read as one ramp of light falling from the platform down.
 */

const BAYER4: readonly (readonly number[])[] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/** One 4x4 tile at coverage k/16 as a `url("data:...")` value for mask-image. */
export function bayerTileUri(k: number): string {
  const cells: string[] = [];
  BAYER4.forEach((row, y) => {
    row.forEach((threshold, x) => {
      if (threshold < k) cells.push(`M${x} ${y}h1v1h-1z`);
    });
  });
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 4' shape-rendering='crispEdges'><path fill='white' d='${cells.join('')}'/></svg>`;
  return `url("data:image/svg+xml;utf8,${svg}")`;
}
