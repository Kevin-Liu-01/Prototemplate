/** Ordered 4×4 Bayer matrix — the house matrix, verbatim. */
const BAYER4: readonly (readonly number[])[] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const CELL = 1.25;
const TILE = CELL * 4;
const VIEW_WIDTH = 384;
const VIEW_HEIGHT = 240;
const CENTER_X = 179;
const CENTER_Y = 126;

const RINGS = [
  { cover: 6, inner: 94, outer: 98.5 },
  { cover: 4, inner: 98.5, outer: 103 },
  { cover: 2, inner: 103, outer: 107.5 },
  { cover: 1, inner: 107.5, outer: 112 },
] as const;

/** One pattern tile at coverage k/16: every cell whose Bayer threshold sits
    under k, as one path of squares. bayerTile() in the shipped tree; this
    repo's copy of it is module-private, so the four lines live here. */
function bayerTile(k: number, cell: number): string {
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

function circlePath(radius: number): string {
  return `M${CENTER_X - radius} ${CENTER_Y}a${radius} ${radius} 0 1 0 ${
    radius * 2
  } 0a${radius} ${radius} 0 1 0 ${-radius * 2} 0Z`;
}

/**
 * GlobeAtmosphere, reproduced.
 *
 * 1-1 with apps/landing/src/components/landing/sections/global/
 * GlobeAtmosphere.tsx — four non-overlapping ordered-dither annuli aligned
 * to EdgeGlobe's 384×240 viewBox and 92-unit limb radius. Same constants,
 * same class names, same Tailwind box, so the yc close band's sheet finds
 * exactly what it expects to re-position.
 */
export default function YcGlobeAtmosphere() {
  return (
    <svg
      aria-hidden='true'
      className='v0-glob-atmo-field pointer-events-none absolute inset-0 z-[-1] block h-full w-full'
      focusable='false'
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
    >
      <defs>
        {RINGS.map(({ cover }) => (
          <pattern
            height={TILE}
            id={`v0ga-${cover}`}
            key={cover}
            patternUnits='userSpaceOnUse'
            width={TILE}
          >
            <path
              className='v0-glob-atmo-dots'
              d={bayerTile(cover, CELL)}
              shapeRendering='crispEdges'
            />
          </pattern>
        ))}
      </defs>
      {RINGS.map(({ cover, inner, outer }) => (
        <path
          d={circlePath(outer) + circlePath(inner)}
          fill={`url(#v0ga-${cover})`}
          fillRule='evenodd'
          key={cover}
        />
      ))}
    </svg>
  );
}
