import { GT_OUTLINE_BOX, GT_OUTLINE_PATHS, GT_OUTLINE_VIEWBOX } from './gt-outline';

/**
 * The brand opener's specimen: the actual GT monogram — its traced
 * contours, not a typeset stand-in — drawn giant in dotted outline and
 * measured by its own layout guides: dashed rules seated exactly on the
 * mark's cap, baseline, and side bearings, extending to the figure's
 * edges. The nameplate hero's crop-frame grammar, worn by the mark —
 * and entirely still: the sheet is the statement, no arrival, no march.
 */
const VB = GT_OUTLINE_VIEWBOX.split(' ').map(Number) as [number, number, number, number];

/** the guides' seats, from the traced bounding box — knowable at build */
const GUIDE = {
  top: ((GT_OUTLINE_BOX.y - VB[1]) / VB[3]) * 100,
  bottom: ((GT_OUTLINE_BOX.y + GT_OUTLINE_BOX.h - VB[1]) / VB[3]) * 100,
  left: ((GT_OUTLINE_BOX.x - VB[0]) / VB[2]) * 100,
  right: ((GT_OUTLINE_BOX.x + GT_OUTLINE_BOX.w - VB[0]) / VB[2]) * 100,
};

export default function BrandMarkFigure() {
  return (
    <figure
      aria-label='The GT monogram traced in dotted outline, measured by dashed layout guides seated on its own width and height.'
      className='ptb-hero-fig'
      role='img'
    >
      <i aria-hidden className='ptb-fig-line is-h' style={{ top: `${GUIDE.top}%` }} />
      <i aria-hidden className='ptb-fig-line is-h' style={{ top: `${GUIDE.bottom}%` }} />
      <i aria-hidden className='ptb-fig-line is-v' style={{ left: `${GUIDE.left}%` }} />
      <i aria-hidden className='ptb-fig-line is-v' style={{ left: `${GUIDE.right}%` }} />
      <svg aria-hidden viewBox={GT_OUTLINE_VIEWBOX}>
        {GT_OUTLINE_PATHS.map((d) => (
          <path className='ptb-fig-gt' d={d} key={d.slice(0, 24)} />
        ))}
      </svg>
    </figure>
  );
}
