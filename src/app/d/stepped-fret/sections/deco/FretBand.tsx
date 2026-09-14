import { useId } from 'react';

import { FRET_UNIT, FRET_UNIT_H, FRET_UNIT_W, polylinePath } from '../../fret';

/**
 * Ornament home: the register boundaries. Every register on the page is
 * bounded above and below by one of these bands, each at its own cell size,
 * so the same fret reads at five scales down the page. The band owns both
 * of its hairlines (top and bottom); the registers it separates draw none.
 *
 * The frieze is one SVG pattern of the 13 by 8 unit, stroked in the band's
 * `color`, so the tone is a class on the band (ink, ornament, or the dark
 * band's limestone) and never a literal here.
 */
export type FretBandProps = {
  /** pixels per grid cell; the band stands eight cells tall */
  cell: number;
  tone?: 'ink' | 'ornament' | 'paper';
  /** drop the top or bottom rule where a neighbour already owns that seam */
  edges?: 'both' | 'bottom' | 'top' | 'none';
  className?: string;
};

export default function FretBand({ cell, tone = 'ink', edges = 'both', className }: FretBandProps) {
  const id = `sf-fret-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const height = FRET_UNIT_H * cell;
  const width = FRET_UNIT_W * cell;
  return (
    <div
      className={['sf-band', `is-${tone}`, `is-edges-${edges}`, className].filter(Boolean).join(' ')}
      style={{ height }}
      aria-hidden='true'
    >
      <svg className='sf-band-svg' width='100%' height={height} role='presentation' focusable='false'>
        <defs>
          <pattern id={id} patternUnits='userSpaceOnUse' width={width} height={height}>
            <path
              d={polylinePath(FRET_UNIT, cell)}
              fill='none'
              stroke='currentColor'
              strokeWidth={cell}
              strokeLinecap='butt'
              strokeLinejoin='miter'
            />
          </pattern>
        </defs>
        <rect width='100%' height={height} fill={`url(#${id})`} />
      </svg>
    </div>
  );
}
