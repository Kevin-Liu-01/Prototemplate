import { useId } from 'react';

import { BayerTierDefs, patternBase, tierFill } from './BayerTier';

/**
 * Deco layer. C1 home: dividers, the `.tc-hatch` spacer band (C1.2).
 *
 * The fork's 45-degree hatch becomes the temple's strata: three full-width
 * courses of 12px, filled bottom to top with the 12-, 6- and 2-cell Bayer
 * tiers, so the band prints dense where it meets the row below and dissolves
 * into dots toward the row above. The host `.tc-hatch` keeps its two hairlines
 * (top and bottom, owned once); this SVG paints only the interior, in the
 * ornament ink through `currentColor`.
 */
const CELL = 3;
const STRIP = 12;
/** Lit cells per 16, floor course first. */
const TIERS: readonly number[] = [12, 6, 2];

export default function TierHatch() {
  const base = patternBase('qth', useId());
  const height = STRIP * TIERS.length;

  return (
    <div className='tc-hatch' aria-hidden='true'>
      <svg
        className='qt-hatch-field'
        width='100%'
        height={height}
        aria-hidden='true'
        focusable='false'
        shapeRendering='crispEdges'
      >
        <BayerTierDefs base={base} tiers={TIERS} cell={CELL} />
        {TIERS.map((lit, k) => (
          <rect
            key={lit}
            x={0}
            y={height - STRIP * (k + 1)}
            width='100%'
            height={STRIP}
            fill={tierFill(base, lit)}
          />
        ))}
      </svg>
    </div>
  );
}
