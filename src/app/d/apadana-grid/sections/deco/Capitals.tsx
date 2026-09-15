/**
 * apadana-grid: the portico's capitals.
 *
 * Ornament home: the hero crown. The Persepolis double-volute capital in
 * front elevation, reduced to pure arcs: a horizontal bar, a spiral of
 * three semicircles of decreasing radius curling down and outward at each
 * end, and the stem down to the base ring. One capital stands over every
 * base of the portico's front row and hangs, mirrored, under every base of
 * the back row, so the hero is symmetric on both axes. The layer is laid
 * over the plan and hidden below the desktop plan width, where the rows
 * wrap and the aisle no longer holds it.
 */
const LEFT = 'M18 20 A10 10 0 0 0 18 40 A6 6 0 0 0 18 28 A3 3 0 0 0 18 34';
const RIGHT = 'M82 20 A10 10 0 0 1 82 40 A6 6 0 0 1 82 28 A3 3 0 0 1 82 34';
const BAR = 'M18 20 H82';
const STEM = 'M50 20 V44';

export function Volute() {
  return (
    <svg className='apg-volute' viewBox='0 0 100 44' aria-hidden='true' focusable='false'>
      <path d={BAR} vectorEffect='non-scaling-stroke' />
      <path d={STEM} vectorEffect='non-scaling-stroke' />
      <path d={LEFT} vectorEffect='non-scaling-stroke' />
      <path d={RIGHT} vectorEffect='non-scaling-stroke' />
    </svg>
  );
}

export type CapitalsProps = { count: number };

/** `count` capitals over the front row and `count` under the back row. */
export function Capitals({ count }: CapitalsProps) {
  const slots = [...Array(count).keys()];
  return (
    <div className='apg-capitals' aria-hidden='true'>
      {slots.map((k) => (
        <span
          key={`t${k}`}
          className='apg-capital is-top'
          style={{ left: `${((k + 0.5) / count) * 100}%` }}
        >
          <Volute />
        </span>
      ))}
      {slots.map((k) => (
        <span
          key={`b${k}`}
          className='apg-capital is-bottom'
          style={{ left: `${((k + 0.5) / count) * 100}%` }}
        >
          <Volute />
        </span>
      ))}
    </div>
  );
}
