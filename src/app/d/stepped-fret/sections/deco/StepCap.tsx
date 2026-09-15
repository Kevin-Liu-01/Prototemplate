import type { CSSProperties } from 'react';

import FretBand from './FretBand';

/**
 * Ornament home: the pricing plinths' frames. A stepped cap of one, two or
 * three setbacks over a plinth, each setback one course of fine stepped
 * diamonds in the ornament color and narrower than the one below it by one
 * step on each side, so the three plinths read as three ziggurats of
 * increasing height. Each setback owns its top and side hairlines; the
 * plinth body's top rule closes the lowest setback, so no seam is drawn
 * twice.
 */
export type StepCapProps = {
  tiers: 1 | 2 | 3;
};

export default function StepCap({ tiers }: StepCapProps) {
  // top to bottom: the deepest setback first, so the narrowest course sits on top
  const setbacks = [3, 2, 1].slice(3 - tiers);
  return (
    <div className='sf-cap' aria-hidden='true'>
      {setbacks.map((depth) => (
        <div className='sf-cap-tier' key={depth} style={{ '--depth': depth } as CSSProperties}>
          <FretBand fret='lozenge' scale='fine' tone='ornament' edges='none' />
        </div>
      ))}
    </div>
  );
}
