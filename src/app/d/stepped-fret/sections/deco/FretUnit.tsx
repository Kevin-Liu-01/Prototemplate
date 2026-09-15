import { FRET_UNIT, FRET_UNIT_H, polylinePath } from '../../fret';

/**
 * Ornament home: the hero crown. One tile of the stepped fret with its coil,
 * the page's own signature, drawn solid at a small scale in the crown's
 * `color` beside the locale count. The same figure the hero renders
 * monumentally in dither stands here at the size of a numeral.
 */
export type FretUnitProps = {
  /** pixels per grid unit; the tile is twelve units wide and eight tall */
  cell: number;
  className?: string;
};

/** The drawn width of the unit in cells (the tile's thirteenth cell is the gap to the next). */
const DRAWN_W = 12;

export default function FretUnit({ cell, className }: FretUnitProps) {
  const width = DRAWN_W * cell;
  const height = FRET_UNIT_H * cell;
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden='true'
      focusable='false'
    >
      <path
        d={polylinePath(FRET_UNIT, cell)}
        fill='none'
        stroke='currentColor'
        strokeWidth={cell}
        strokeLinecap='butt'
        strokeLinejoin='miter'
      />
    </svg>
  );
}
