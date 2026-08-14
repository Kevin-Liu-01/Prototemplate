/** The house 4×4 ordered-dither matrix (DitheredMark's BAYER4). */
const BAYER4: readonly (readonly number[])[] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/**
 * The compare board's corner motif: the currencies poured from the
 * house Bayer ramp in the accent blue — the blog feature covers'
 * construction (an SVG text mask over the tiered coverage ramp),
 * reseated in the pricing grammar over the table's empty head cell.
 * Pure server-rendered SVG; decoration only.
 */

/** Coverage tiers, solid-side first: ink decaying to sparse dots. */
const RAMP: readonly { cover: number; width: number }[] = [
  { cover: 16, width: 320 },
  { cover: 12, width: 64 },
  { cover: 8, width: 58 },
  { cover: 5, width: 54 },
  { cover: 3, width: 50 },
  { cover: 1, width: 44 },
];

const CELL = 3;
const TILE = CELL * 4;

function tilePath(cover: number): string {
  const cells: string[] = [];
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const bayerRow = BAYER4[row];
      if (bayerRow && (bayerRow[col] ?? 16) < cover) {
        cells.push(`M${col * CELL} ${row * CELL}h${CELL}v${CELL}h${-CELL}z`);
      }
    }
  }
  return cells.join('');
}

export default function CompareDitherMotif() {
  const idBase = 'pricing-cmp-dither';

  let edge = -200;
  const bands = RAMP.map((tier) => {
    const band = { cover: tier.cover, x: edge, width: tier.width };
    edge += tier.width;
    return band;
  });

  return (
    <span className='pricing-dither-type' aria-hidden='true'>
      <svg viewBox='0 0 400 150' preserveAspectRatio='xMidYMid meet'>
        <defs>
          {RAMP.map((tier) => (
            <pattern
              id={`${idBase}-${tier.cover}`}
              key={tier.cover}
              width={TILE}
              height={TILE}
              patternUnits='userSpaceOnUse'
            >
              <path d={tilePath(tier.cover)} />
            </pattern>
          ))}
          <mask id={`${idBase}-mask`}>
            <rect width='400' height='150' fill='black' />
            <text
              x='200'
              y='78'
              fill='white'
              textAnchor='middle'
              dominantBaseline='central'
              fontSize={104}
              letterSpacing='0.04em'
            >
              {'¥€$'}
            </text>
          </mask>
        </defs>
        <g mask={`url(#${idBase}-mask)`}>
          <g transform='rotate(18 200 75)'>
            {bands.map((band) => (
              <rect
                fill={`url(#${idBase}-${band.cover})`}
                height='700'
                key={band.cover}
                width={band.width}
                x={band.x}
                y='-240'
              />
            ))}
          </g>
        </g>
      </svg>
    </span>
  );
}
