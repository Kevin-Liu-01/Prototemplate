import { LOGO } from '@/lib/logo';

/**
 * The mark section's specimen: the logo's outline (LOGO in
 * src/lib/logo.ts) drawn large in dotted outline on its 256 unit square
 * and measured by its own drawn box. The dashed guides sit on the globe's
 * top, bottom and sides and run to the figure's edges. The figure holds
 * still.
 */
const SQUARE = LOGO.square.split(' ').map(Number) as [number, number, number, number];
const BOX = LOGO.viewBox.split(' ').map(Number) as [number, number, number, number];

/** the guides' seats, from the drawn box, knowable at build */
const GUIDE = {
  top: ((BOX[1] - SQUARE[1]) / SQUARE[3]) * 100,
  bottom: ((BOX[1] + BOX[3] - SQUARE[1]) / SQUARE[3]) * 100,
  left: ((BOX[0] - SQUARE[0]) / SQUARE[2]) * 100,
  right: ((BOX[0] + BOX[2] - SQUARE[0]) / SQUARE[2]) * 100,
};

export default function BrandMarkFigure() {
  return (
    <figure className='ptb-mark-fig'>
      <div aria-labelledby='ptb-mark-fig-cap' className='ptb-mark-fig-art' role='img'>
        <i aria-hidden className='ptb-fig-line is-h' style={{ top: `${GUIDE.top}%` }} />
        <i aria-hidden className='ptb-fig-line is-h' style={{ top: `${GUIDE.bottom}%` }} />
        <i aria-hidden className='ptb-fig-line is-v' style={{ left: `${GUIDE.left}%` }} />
        <i aria-hidden className='ptb-fig-line is-v' style={{ left: `${GUIDE.right}%` }} />
        <svg aria-hidden viewBox={LOGO.square}>
          <path className='ptb-fig-gt' d={LOGO.d} />
        </svg>
      </div>
      <figcaption id='ptb-mark-fig-cap'>The logo&rsquo;s outline, with guides on the globe&rsquo;s top, bottom and sides</figcaption>
    </figure>
  );
}
