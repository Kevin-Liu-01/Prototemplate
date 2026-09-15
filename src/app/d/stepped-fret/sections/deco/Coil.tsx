import { COIL, COIL_H, COIL_W, polylinePath } from '../../fret';

/**
 * Ornament home: the terminal of a stair drawn in hairlines (the T proof).
 * The coil of the stepped fret alone, hanging from the rule above it: a
 * drop, the return, and two turns inward, stroked at one device hairline in
 * the host's `color`, so the stair's hairline path and its coil are one
 * line at one weight. It starts on the rule and never redraws it.
 */
export type CoilProps = {
  /** pixels per grid unit; the coil is six units square */
  cell: number;
  className?: string;
};

export default function Coil({ cell, className }: CoilProps) {
  return (
    <svg
      className={className}
      width={COIL_W * cell}
      height={COIL_H * cell}
      viewBox={`0 0 ${COIL_W * cell} ${COIL_H * cell}`}
      aria-hidden='true'
      focusable='false'
    >
      <path
        d={polylinePath(COIL, cell)}
        fill='none'
        stroke='currentColor'
        strokeWidth={1}
        strokeLinecap='butt'
        strokeLinejoin='miter'
        vectorEffect='non-scaling-stroke'
        shapeRendering='crispEdges'
      />
    </svg>
  );
}
