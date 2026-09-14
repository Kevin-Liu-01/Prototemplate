/**
 * BAYER FRIEZE — the ornament engine. Every deco figure on the page (the
 * meander, the zigzag, the corner fans, the stepped keys, the mark, the
 * stripe friezes) is generated from one Bayer 4x4 threshold matrix at four
 * stepped densities: 1/16, 4/16, 8/16, 12/16. The densities are defined
 * once as SVG patterns in <DitherDefs/> and referenced by id from every
 * ornament, so the whole grammar shares a single texture source. All
 * ornaments are aria-hidden server components; nothing here hydrates.
 */

const INK = '#1C1710';
const CREAM = '#F6EFDD';
const JADE = '#0E7A5F';

/**
 * The Bayer 4x4 threshold map. A density d/16 turns on every cell whose
 * threshold is below d, which is why the four steps read as one woven
 * family instead of four unrelated textures.
 */
const BAYER: number[][] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

function ditherPath(density: number): string {
  const cells: string[] = [];
  for (let y = 0; y < 4; y += 1) {
    for (let x = 0; x < 4; x += 1) {
      if (BAYER[y][x] < density) cells.push(`M${x} ${y}h1v1h-1z`);
    }
  }
  return cells.join('');
}

type PatternSpec = { id: string; density: number; color: string };

/** i = ink, c = cream, j = jade; the number is the density numerator. */
const PATTERNS: PatternSpec[] = [
  { id: 'bf-i1', density: 1, color: INK },
  { id: 'bf-i4', density: 4, color: INK },
  { id: 'bf-i8', density: 8, color: INK },
  { id: 'bf-i12', density: 12, color: INK },
  { id: 'bf-c4', density: 4, color: CREAM },
  { id: 'bf-c8', density: 8, color: CREAM },
  { id: 'bf-c12', density: 12, color: CREAM },
  { id: 'bf-j4', density: 4, color: JADE },
  { id: 'bf-j8', density: 8, color: JADE },
  { id: 'bf-j12', density: 12, color: JADE },
];

/**
 * The shared pattern sheet. Rendered once at the top of the root div as a
 * zero-size svg (not display:none, which breaks paint-server references in
 * some engines); every other ornament fills with url(#bf-*). 8px tiles at
 * userSpaceOnUse give 2px cells wherever ornaments render at natural size.
 */
export function DitherDefs() {
  return (
    <svg className='bf-defs' aria-hidden='true' focusable='false'>
      <defs>
        {PATTERNS.map((p) => (
          <pattern
            key={p.id}
            id={p.id}
            width='8'
            height='8'
            patternUnits='userSpaceOnUse'
          >
            <path
              d={ditherPath(p.density)}
              transform='scale(2)'
              fill={p.color}
              shapeRendering='crispEdges'
            />
          </pattern>
        ))}
      </defs>
    </svg>
  );
}

/**
 * The Greek-key meander: a filled hook (riser, top run, drop, inward run)
 * repeated on a 48px unit over a continuous 8px rail. The hooks carry the
 * 8/16 density, the rail 12/16, so the band steps the way the friezes do.
 * Rendered at fixed pixel width inside an overflow-hidden band; one extra
 * unit backs the 48px marquee loop.
 */
export function Meander({
  units = 110,
  tone = 'ink',
}: {
  units?: number;
  tone?: 'ink' | 'cream';
}) {
  const u = 48;
  const w = units * u;
  const hook = tone === 'ink' ? 'url(#bf-i8)' : 'url(#bf-c8)';
  const rail = tone === 'ink' ? 'url(#bf-i12)' : 'url(#bf-c12)';
  return (
    <svg
      className='bf-meander'
      width={w}
      height={40}
      viewBox={`0 0 ${w} 40`}
      aria-hidden='true'
      focusable='false'
    >
      <g className='bf-meander-track' shapeRendering='crispEdges'>
        {Array.from({ length: units + 1 }, (_, i) => (
          <path
            key={i}
            d='M0 32V0h40v24H16v-8h16V8H8v24z'
            transform={`translate(${i * u} 0)`}
            fill={hook}
          />
        ))}
        <rect x='0' y='32' width={w + u} height='8' fill={rail} />
      </g>
    </svg>
  );
}

/**
 * The chevron course: 8/16 triangles over a solid jade baseline. crispEdges
 * staircases the diagonals at device pixels, which keeps the 1-bit register.
 */
export function Zigzag({ units = 160 }: { units?: number }) {
  const w = units * 32;
  return (
    <svg
      className='bf-zigzag'
      width={w}
      height={24}
      viewBox={`0 0 ${w} 24`}
      aria-hidden='true'
      focusable='false'
    >
      <g shapeRendering='crispEdges'>
        {Array.from({ length: units }, (_, i) => (
          <path
            key={i}
            d='M0 18L16 2l16 16z'
            transform={`translate(${i * 32} 0)`}
            fill='url(#bf-i8)'
          />
        ))}
        <rect x='0' y='20' width={w} height='3' fill={JADE} />
      </g>
    </svg>
  );
}

/**
 * A quarter-circle sunrise fan: six wedges alternating 12/16 and 4/16, rimmed
 * with a jade arc. Drawn from the top-left corner; CSS flips it into the
 * other corners.
 */
export function FanCorner({ size = 160 }: { size?: number }) {
  const n = 6;
  const r = 180;
  const wedges = Array.from({ length: n }, (_, i) => {
    const a0 = (i * Math.PI) / (2 * n);
    const a1 = ((i + 1) * Math.PI) / (2 * n);
    const x0 = (Math.cos(a0) * r).toFixed(1);
    const y0 = (Math.sin(a0) * r).toFixed(1);
    const x1 = (Math.cos(a1) * r).toFixed(1);
    const y1 = (Math.sin(a1) * r).toFixed(1);
    return {
      d: `M0 0L${x0} ${y0}A${r} ${r} 0 0 1 ${x1} ${y1}Z`,
      fill: i % 2 === 0 ? 'url(#bf-i12)' : 'url(#bf-i4)',
    };
  });
  return (
    <svg
      className='bf-fan'
      width={size}
      height={size}
      viewBox='0 0 180 180'
      aria-hidden='true'
      focusable='false'
    >
      {wedges.map((w, i) => (
        <path key={i} d={w.d} fill={w.fill} />
      ))}
      <path
        d='M168 0A168 168 0 0 1 0 168'
        fill='none'
        stroke={JADE}
        strokeWidth='4'
      />
    </svg>
  );
}

/**
 * The stepped key: three nested corner brackets falling from 12/16 to 4/16.
 * Marks the head of each section.
 */
export function StepCorner({ size = 56 }: { size?: number }) {
  return (
    <svg
      className='bf-step'
      width={size}
      height={size}
      viewBox='0 0 64 64'
      aria-hidden='true'
      focusable='false'
    >
      <g shapeRendering='crispEdges'>
        <path d='M0 0h64v10H10v54H0z' fill='url(#bf-i12)' />
        <path d='M20 20h44v8H28v36h-8z' fill='url(#bf-i8)' />
        <path d='M38 38h26v6H44v20h-6z' fill='url(#bf-i4)' />
      </g>
    </svg>
  );
}

/**
 * The mark: a 12/16 dither field around a solid jade core. It is the one
 * place the accent sits inside the texture instead of beside it.
 */
export function Mark({
  size = 30,
  tone = 'ink',
}: {
  size?: number;
  tone?: 'ink' | 'cream';
}) {
  const field = tone === 'ink' ? 'url(#bf-i12)' : 'url(#bf-c12)';
  return (
    <svg
      className='bf-mark'
      width={size}
      height={size}
      viewBox='0 0 32 32'
      aria-hidden='true'
      focusable='false'
    >
      <g shapeRendering='crispEdges'>
        <rect width='32' height='32' fill={field} />
        <rect x='9' y='9' width='14' height='14' fill={JADE} />
      </g>
    </svg>
  );
}

/** A small dither swatch used as a density chip beside labels. */
export function Tile({
  density,
  size = 20,
  jade = false,
}: {
  density: 1 | 4 | 8 | 12;
  size?: number;
  jade?: boolean;
}) {
  const id = jade ? `bf-j${density}` : `bf-i${density}`;
  return (
    <svg
      className='bf-tile'
      width={size}
      height={size}
      viewBox='0 0 24 24'
      aria-hidden='true'
      focusable='false'
    >
      <rect width='24' height='24' fill={`url(#${id})`} shapeRendering='crispEdges' />
    </svg>
  );
}

const DEFAULT_STEPS = [1, 4, 8, 12, 16, 12, 8, 4, 1];

/**
 * The stripe frieze: stacked rows of CSS dither tiles whose densities step
 * like a woven border. 16 renders solid. Color variants come from the
 * bf-frieze-cream and bf-frieze-jade classes in styles.css.
 */
export function Frieze({
  steps = DEFAULT_STEPS,
  className = '',
}: {
  steps?: number[];
  className?: string;
}) {
  return (
    <div
      className={className ? `bf-frieze ${className}` : 'bf-frieze'}
      aria-hidden='true'
    >
      {steps.map((d, i) => (
        <i key={i} className={`bf-f bf-f-${d}`} />
      ))}
    </div>
  );
}
