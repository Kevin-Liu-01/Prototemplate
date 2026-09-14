import { useId } from 'react';

import { GtMark } from '@/components/viewer/GtMark';

import { BayerTierDefs, patternBase, tierFill } from './BayerTier';

/**
 * Deco layer. C1 home: the hero crown, the region above the h1 inside the
 * hero copy card (C1.4).
 *
 * The GT monogram seated on a three-course plinth: the summit shrine of the
 * ziggurat the plate beside it renders. The plinth is the crown's only
 * ornament and it is built from the same Bayer tiers as the plate, dense at
 * the foot (14 of 16) and loose under the mark (3 of 16). The monogram is one
 * ink (`currentColor`, the page ink) and the plinth is the ornament ink, set
 * by CSS on `.qt-crown-plinth`. Decorative: the wordmark in the sub carries
 * the company name for assistive tech.
 */
const W = 120;
const COURSE = 8;
const WIDTHS: readonly number[] = [120, 80, 40];
/** Lit cells per 16, foot course first. */
const TIERS: readonly number[] = [14, 8, 3];

export default function HeroCrown() {
  const base = patternBase('qtk', useId());
  const height = COURSE * TIERS.length;

  return (
    <div className='qt-crown' data-hero-in aria-hidden='true'>
      <span className='qt-crown-mark'>
        <GtMark width={30} height={19} />
      </span>
      <svg
        className='qt-crown-plinth'
        viewBox={`0 0 ${W} ${height}`}
        width={W}
        height={height}
        aria-hidden='true'
        focusable='false'
        shapeRendering='crispEdges'
      >
        <BayerTierDefs base={base} tiers={TIERS} cell={2} />
        {TIERS.map((lit, k) => {
          const width = WIDTHS[k] ?? W;
          return (
            <rect
              key={lit}
              x={(W - width) / 2}
              y={height - COURSE * (k + 1)}
              width={width}
              height={COURSE}
              fill={tierFill(base, lit)}
            />
          );
        })}
      </svg>
    </div>
  );
}
