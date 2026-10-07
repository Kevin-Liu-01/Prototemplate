import { GT_MARK_VIEWBOX } from '@/components/viewer/GtMark';

import { GT_OUTLINE_BOX, GT_OUTLINE_PATHS } from './gt-outline';

/**
 * The mark section's specimen: the GT monogram's traced contours drawn
 * large in dotted outline and measured by its own layout guides. The
 * dashed guides sit on the mark's cap line, baseline and side bearings
 * and run to the figure's edges. The figure holds still.
 */
const VB = GT_MARK_VIEWBOX.split(' ').map(Number) as [number, number, number, number];

/** the guides' seats, from the traced bounding box, knowable at build */
const GUIDE = {
  top: ((GT_OUTLINE_BOX.y - VB[1]) / VB[3]) * 100,
  bottom: ((GT_OUTLINE_BOX.y + GT_OUTLINE_BOX.h - VB[1]) / VB[3]) * 100,
  left: ((GT_OUTLINE_BOX.x - VB[0]) / VB[2]) * 100,
  right: ((GT_OUTLINE_BOX.x + GT_OUTLINE_BOX.w - VB[0]) / VB[2]) * 100,
};

export default function BrandMarkFigure() {
  return (
    <figure className='ptb-mark-fig'>
      <div aria-labelledby='ptb-mark-fig-cap' className='ptb-mark-fig-art' role='img'>
        <i aria-hidden className='ptb-fig-line is-h' style={{ top: `${GUIDE.top}%` }} />
        <i aria-hidden className='ptb-fig-line is-h' style={{ top: `${GUIDE.bottom}%` }} />
        <i aria-hidden className='ptb-fig-line is-v' style={{ left: `${GUIDE.left}%` }} />
        <i aria-hidden className='ptb-fig-line is-v' style={{ left: `${GUIDE.right}%` }} />
        <svg aria-hidden viewBox={GT_MARK_VIEWBOX}>
          {GT_OUTLINE_PATHS.map((d) => (
            <path className='ptb-fig-gt' d={d} key={d.slice(0, 24)} />
          ))}
        </svg>
      </div>
      <figcaption id='ptb-mark-fig-cap'>The monogram&rsquo;s traced contours, with guides on its cap line, baseline and side bearings</figcaption>
    </figure>
  );
}
