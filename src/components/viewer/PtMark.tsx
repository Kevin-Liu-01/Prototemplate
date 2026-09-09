import { useId } from 'react';

/**
 * The Prototemplate mark: the sheet's extending rules crossing into a
 * square, the square they make filled with the diagonal hatch. Extracted
 * from the .pt-mark rules in src/app/prototemplate.css (four 1px lines at
 * 5px and 16px, a 10px hatched plate at 6px, hatch period 3px at -45deg)
 * and drawn as one SVG so it needs no stylesheet. 22x22 by default. The
 * lines fill currentColor, so the parent sets the ink; the hatch is
 * --pt-ink-2 as in the source.
 */
export type PtMarkProps = { size?: number };

export function PtMark({ size = 22 }: PtMarkProps) {
  const hatchId = `pt-mark-hatch-${useId()}`;
  return (
    <svg
      viewBox='0 0 22 22'
      width={size}
      height={size}
      aria-hidden='true'
      style={{ display: 'block', flex: 'none' }}
    >
      <defs>
        <pattern
          id={hatchId}
          width='3'
          height='3'
          patternUnits='userSpaceOnUse'
          patternTransform='rotate(-45)'
        >
          <rect x='2' y='0' width='1' height='3' style={{ fill: 'var(--pt-ink-2)' }} />
        </pattern>
      </defs>
      <rect x='6' y='6' width='10' height='10' fill={`url('#${hatchId}')`} />
      <rect x='0' y='5' width='22' height='1' fill='currentColor' />
      <rect x='0' y='16' width='22' height='1' fill='currentColor' />
      <rect x='5' y='0' width='1' height='22' fill='currentColor' />
      <rect x='16' y='0' width='1' height='22' fill='currentColor' />
    </svg>
  );
}
