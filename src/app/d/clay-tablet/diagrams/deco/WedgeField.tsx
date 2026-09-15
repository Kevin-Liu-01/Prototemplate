import { wedgeDither } from '../../fields';
import type { WedgeField as Field } from '../../fields';

/**
 * Home: the hero frieze register and the ramp band under the language cells
 * (C1 dividers and the hero plate, as G6 lets the thesis place them).
 *
 * A still of the wedge dither, rendered on the server as two SVG paths so the
 * page carries its texture before any script runs. `slice` crops the drawing
 * to the box at the viewBox's scale instead of shrinking it, which keeps the
 * wedges at a readable size on narrow screens.
 */
export type WedgeFieldProps = {
  field: Field;
  width: number;
  height: number;
  cell?: number;
  className?: string;
  slice?: boolean;
};

export default function WedgeField({
  field,
  width,
  height,
  cell = 14,
  className,
  slice = false,
}: WedgeFieldProps) {
  const paths = wedgeDither(field, { width, height, cell });
  return (
    <svg
      className={className ? `ct-wedges ${className}` : 'ct-wedges'}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio={slice ? 'xMidYMid slice' : 'xMidYMid meet'}
      aria-hidden='true'
    >
      <path className='ct-wedge-a' d={paths.first} />
      <path className='ct-wedge-b' d={paths.second} />
    </svg>
  );
}
