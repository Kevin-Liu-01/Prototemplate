import { useId } from 'react';

import { FRETS, SCALES, fretPath } from '../../fret';
import type { FretId, Scale } from '../../fret';

/**
 * Ornament home: the register boundaries, the dark band's facade courses,
 * and the pricing caps. A band is one fret from the greca system at one of
 * the three scales, tiled across its full width and standing eight cells
 * tall. The band owns both of its hairlines (top and bottom) unless a
 * neighbour already owns that seam; the registers it separates draw none.
 *
 * The frieze is one SVG pattern stroked in the band's `color`, so the tone
 * is a class on the band (ink, ornament, or the dark band's cream) and
 * never a literal here.
 */
export type FretBandProps = {
  fret: FretId;
  scale: Scale;
  tone?: 'ink' | 'ornament' | 'paper';
  /** drop the top or bottom rule where a neighbour already owns that seam */
  edges?: 'both' | 'bottom' | 'top' | 'none';
  className?: string;
};

export default function FretBand({ fret, scale, tone = 'ink', edges = 'both', className }: FretBandProps) {
  const id = `sf-fret-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const unit = FRETS[fret];
  const cell = SCALES[scale];
  const height = unit.h * cell;
  const width = unit.w * cell;
  return (
    <div
      className={['sf-band', `is-${tone}`, `is-edges-${edges}`, `is-${scale}`, className].filter(Boolean).join(' ')}
      style={{ height }}
      aria-hidden='true'
    >
      <svg className='sf-band-svg' width='100%' height={height} role='presentation' focusable='false'>
        <defs>
          <pattern id={id} patternUnits='userSpaceOnUse' width={width} height={height}>
            <path
              d={fretPath(unit, cell)}
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
