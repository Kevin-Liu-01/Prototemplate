import './globe-atmosphere.css';

/** The house 4×4 ordered-dither matrix (DitheredMark's BAYER4). */
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

function tilePath(cover: number): string {
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

function circlePath(radius: number): string {
  return `M${CENTER_X - radius} ${CENTER_Y}a${radius} ${radius} 0 1 0 ${radius * 2} 0a${radius} ${radius} 0 1 0 ${-radius * 2} 0Z`;
}

/**
 * Renders four non-overlapping ordered-dither annuli aligned to EdgeGlobe's
 * 384×240 viewBox and 92-unit limb radius.
 */
export default function GlobeAtmosphere() {
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
              d={tilePath(cover)}
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
