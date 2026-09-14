import { useId } from 'react';

import { BayerTierDefs, patternBase, tierFill } from './BayerTier';

/**
 * Deco layer. C1 home: section heads, the `tc-head-icon` slot (C1.1).
 *
 * The section's tier of the temple: a stepped ziggurat, `tiers` courses high,
 * each course narrower than the one below and filled with a sparser Bayer tier
 * than the one below, so the form prints solid at its base and dissolves into
 * dots at its crown. The count rises section by section down the page
 * (Frameworks 2, Bento 3, Locales 4, Story 5, Pricing 6), so the building
 * grows as the reader descends toward the dark band. It bleeds off the head's
 * right edge in the ornament ink at low opacity, exactly where the fork hung
 * its lucide watermark, and it is hidden under 900px with the rest of the
 * head devices.
 */
type TierCrestProps = { tiers: number; className?: string };

const W = 260;
const H = 200;

export default function TierCrest({ tiers, className }: TierCrestProps) {
  const base = patternBase('qtc', useId());
  const n = Math.max(2, Math.min(6, Math.round(tiers)));
  const tierHeight = H / n;
  /* lit cells per 16, base course 12 down to a 2-cell crown */
  const lits = Array.from({ length: n }, (_, k) => Math.round(12 - (10 * k) / (n - 1)));

  return (
    <svg
      className={className}
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      aria-hidden='true'
      focusable='false'
      shapeRendering='crispEdges'
    >
      <BayerTierDefs base={base} tiers={lits} cell={4} />
      {lits.map((lit, k) => {
        const width = W * (1 - k / (n + 0.6));
        return (
          <rect
            key={k}
            x={(W - width) / 2}
            y={H - tierHeight * (k + 1)}
            width={width}
            height={tierHeight}
            fill={tierFill(base, lit)}
          />
        );
      })}
    </svg>
  );
}
