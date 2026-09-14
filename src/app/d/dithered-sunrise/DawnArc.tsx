/**
 * DITHERED-SUNRISE — the dawn arc, the page's recurring ornament.
 *
 * A half-disc of concentric bands rendered as true ordered dither in inline
 * SVG: four <pattern> lattices carry 1, 2, 3 and 4 gold squares per 8px cell,
 * placed in 2x2 Bayer order, so the arc steps from sparse dots at the rim to
 * a solid gold core. Every band is a hard edge; light is quantized, never
 * blended. Sections open with this arc, and the footer hangs it upside down
 * as the sunset.
 *
 * Pattern ids are namespaced by the required `id` prop so several arcs can
 * live on one page without colliding.
 */

type DawnArcProps = {
  /** Unique per instance; namespaces the SVG pattern ids. */
  id: string;
  className?: string;
};

/** Cumulative dot positions per density level, in 2x2 Bayer order. */
const LEVELS: ReadonlyArray<ReadonlyArray<readonly [number, number]>> = [
  [[1, 1]],
  [
    [1, 1],
    [5, 5],
  ],
  [
    [1, 1],
    [5, 5],
    [5, 1],
  ],
  [
    [1, 1],
    [5, 5],
    [5, 1],
    [1, 5],
  ],
];

/** Outer to inner: radius and which density level fills the band. */
const RINGS: ReadonlyArray<{ r: number; level: number }> = [
  { r: 118, level: 1 },
  { r: 94, level: 2 },
  { r: 72, level: 3 },
  { r: 52, level: 4 },
];

export default function DawnArc({ id, className }: DawnArcProps) {
  return (
    <svg
      aria-hidden='true'
      className={className}
      focusable='false'
      viewBox='0 0 240 120'
    >
      <defs>
        {LEVELS.map((cells, i) => (
          <pattern
            height='8'
            id={`${id}-b${i + 1}`}
            key={`${id}-b${i + 1}`}
            patternUnits='userSpaceOnUse'
            width='8'
          >
            {cells.map(([x, y]) => (
              <rect
                fill='var(--ds-gold)'
                height='3'
                key={`${x}-${y}`}
                width='3'
                x={x}
                y={y}
              />
            ))}
          </pattern>
        ))}
      </defs>
      {RINGS.map(({ r, level }, i) => (
        <g key={r}>
          {/* Inner bands get an opaque ground backing so the sparser lattice
              beneath them does not show through the pattern's gaps. */}
          {i > 0 ? <circle cx='120' cy='120' fill='var(--ds-ground)' r={r} /> : null}
          <circle cx='120' cy='120' fill={`url(#${id}-b${level})`} r={r} />
        </g>
      ))}
      <circle cx='120' cy='120' fill='var(--ds-gold)' r='34' />
      <circle cx='120' cy='120' fill='var(--ds-gold-bright)' r='19' />
    </svg>
  );
}
