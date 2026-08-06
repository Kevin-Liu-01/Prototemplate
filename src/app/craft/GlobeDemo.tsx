import EdgeGlobe from '@/app/d/toolchain/diagrams/EdgeGlobe';

/**
 * The edge-globe demo plate — the real drawing over its dithered atmosphere,
 * mounted the way the dossier home mounts it. The atmosphere is the house
 * 1-bit language, static by design: four NON-overlapping annuli, each filled
 * with one coverage tier of the 4×4 ordered Bayer matrix, all tiles on one
 * shared grid — crossing a ring boundary only ever turns dots off, and no
 * cell is painted twice. The overlay carries the globe's own viewBox so the
 * halo can never slide off the sphere.
 */
const BAYER4: readonly (readonly number[])[] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const CELL = 1.25;
const TILE = CELL * 4;
const CX = 179;
const CY = 126;

const RINGS: readonly { cover: number; rIn: number; rOut: number }[] = [
  { cover: 6, rIn: 94, rOut: 98.5 },
  { cover: 4, rIn: 98.5, rOut: 103 },
  { cover: 2, rIn: 103, rOut: 107.5 },
  { cover: 1, rIn: 107.5, rOut: 112 },
];

/** One pattern tile at coverage k/16 — every cell whose threshold sits
    under k, as one path of squares. */
function tile(cover: number): string {
  const cells: string[] = [];
  BAYER4.forEach((row, y) => {
    row.forEach((threshold, x) => {
      if (threshold < cover) {
        cells.push(`M${x * CELL} ${y * CELL}h${CELL}v${CELL}h${-CELL}Z`);
      }
    });
  });
  return cells.join('');
}

/** A full circle as two arcs; outer + inner subpaths under evenodd make
    each ring an annulus, so the tiers tile the halo without overlap. */
function ring(r: number): string {
  return `M${CX - r} ${CY}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0Z`;
}

export default function GlobeDemo() {
  return (
    <div className='ptc-globe-stage'>
      <svg aria-hidden='true' className='ptc-globe-atmo' focusable='false' viewBox='0 0 384 240'>
        <defs>
          {RINGS.map(({ cover }) => (
            <pattern
              height={TILE}
              id={`ptcga-${cover}`}
              key={cover}
              patternUnits='userSpaceOnUse'
              width={TILE}
            >
              <path className='ptc-globe-dots' d={tile(cover)} shapeRendering='crispEdges' />
            </pattern>
          ))}
        </defs>
        {RINGS.map(({ cover, rIn, rOut }) => (
          <path
            d={ring(rOut) + ring(rIn)}
            fill={`url(#ptcga-${cover})`}
            fillRule='evenodd'
            key={cover}
          />
        ))}
      </svg>
      <EdgeGlobe title='Five points of presence on a sparse graticule, one request served from the closest edge in 12 ms' />
    </div>
  );
}
