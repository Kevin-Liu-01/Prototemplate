import { SHEEN_TIERS, sheenId } from './GlazeDefs';
import type { SheenInk } from './GlazeDefs';

/**
 * Deco home: the glaze. One sheen: three bands of four pixels along the
 * top edge of a glazed surface, densest at the arris and thinning below,
 * filled from the shared tiles in GlazeDefs. The host is positioned and
 * clips its overflow; the sheen sits at its top edge under the content.
 * Decorative, hidden from the tree, and nothing in it ever moves.
 */
export const SHEEN_H = 12;
const BAND = SHEEN_H / SHEEN_TIERS.length;

export type SheenProps = { ink: SheenInk; className?: string };

export default function Sheen({ ink, className }: SheenProps) {
  return (
    <svg
      className={className ? `gb-sheen ${className}` : 'gb-sheen'}
      height={SHEEN_H}
      aria-hidden='true'
      focusable='false'
      shapeRendering='crispEdges'
    >
      {SHEEN_TIERS.map((tier, i) => (
        <rect
          x={0}
          y={i * BAND}
          width='100%'
          height={BAND}
          fill={`url(#${sheenId(ink, tier.key)})`}
          key={tier.key}
        />
      ))}
    </svg>
  );
}
