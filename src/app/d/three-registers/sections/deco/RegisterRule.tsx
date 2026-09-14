import { useId } from 'react';

/**
 * Deco home: dividers (C1.2), the rule between two registers.
 *
 * Egyptian registers are separated by a band, not a line. Here the band is
 * a strip of chevrons, the water sign reduced to its zigzag, tiled at a
 * fixed pitch in one gold stroke. The strip owns both of its boundaries:
 * one hairline above, one below, so the register that ends and the
 * register that begins draw nothing at the junction.
 */
export function RegisterRule() {
  const id = useId();
  const pattern = `tr-chevron-${id.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <div className='tr-rule' aria-hidden='true'>
      <svg className='tr-rule-svg' width='100%' height='100%' aria-hidden='true' focusable='false'>
        <defs>
          <pattern id={pattern} width='18' height='20' patternUnits='userSpaceOnUse'>
            <path d='M0 15L9 5L18 15' fill='none' stroke='currentColor' strokeWidth='1' />
          </pattern>
        </defs>
        <rect width='100%' height='100%' fill={`url(#${pattern})`} />
      </svg>
    </div>
  );
}
