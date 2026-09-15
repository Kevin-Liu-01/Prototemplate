import { bayerTile } from '@/app/d/production/sections/pricing-bayer';

/**
 * Deco home: the glaze. The shared dither tiles for every sheen on the
 * page, declared once so each glazed surface references a pattern by id
 * instead of carrying its own defs. Three coverage tiers of the house 4x4
 * screen at two-pixel cells (6, 3 and 1 of 16) in three inks: lapis for
 * the cream bricks, cream for the gold plaques and the glazed headers,
 * turquoise for the lapis tiles and the court's tablets. Stacked in
 * non-overlapping bands the tiers compose an exact ramp, the catch-light
 * of fired glaze at a brick's upper arris, without a gradient. Fill
 * colors come from the sheet through class names, so the tiles remap with
 * the theme where the surface does and stay glazed where it does not.
 */
export const SHEEN_INKS = ['lapis', 'cream', 'turq'] as const;
export type SheenInk = (typeof SHEEN_INKS)[number];

export type SheenTierKey = 'a' | 'b' | 'c';

export const SHEEN_TIERS: readonly { key: SheenTierKey; cover: number }[] = [
  { key: 'a', cover: 6 },
  { key: 'b', cover: 3 },
  { key: 'c', cover: 1 },
];

/** The document-global id of one tile: `gb-sheen-<ink>-<tier>`. */
export function sheenId(ink: SheenInk, key: SheenTierKey): string {
  return `gb-sheen-${ink}-${key}`;
}

export default function GlazeDefs() {
  return (
    <svg className='gb-defs' width={0} height={0} aria-hidden='true' focusable='false'>
      <defs>
        {SHEEN_INKS.map((ink) =>
          SHEEN_TIERS.map((tier) => (
            <pattern
              id={sheenId(ink, tier.key)}
              width={8}
              height={8}
              patternUnits='userSpaceOnUse'
              key={sheenId(ink, tier.key)}
            >
              <path className={`gb-sheen-${ink}`} d={bayerTile(tier.cover, 2)} />
            </pattern>
          ))
        )}
      </defs>
    </svg>
  );
}
