import { bayerTile } from '@/app/d/production/sections/pricing-bayer';

/**
 * The page's dither screen as SVG pattern tiers: the house 4x4 Bayer matrix
 * at a 3px cell (a 12px tile), one pattern per coverage tier and per tone.
 * Every dithered square, hinge ramp, and plate on the codex fills from
 * these ids, so the whole page shares one screen and the tiers compose
 * exact ramps wherever two regions meet. The svg is zero-sized but
 * rendered, which is what pattern references need.
 *
 * Tones: `ink` follows the theme's ink, `orn` is the red oxide, `night` is
 * the permanently dark panel's cream. The colors come from the classes in
 * styles.css, never from here.
 *
 * Ornament home: the screen behind every ornament on the page.
 */
export const TIERS: readonly number[] = [1, 2, 3, 4, 5, 6, 8, 10, 12];

export const TONES = ['ink', 'orn', 'night'] as const;

export type Tone = (typeof TONES)[number];

const CELL = 3;
const TILE = CELL * 4;

export function patternId(tone: Tone, tier: number): string {
  return `sfc-bayer-${tone}-${tier}`;
}

export default function BayerDefs() {
  return (
    <svg className='sfc-defs' aria-hidden='true' focusable='false' width='0' height='0'>
      <defs>
        {TONES.map((tone) =>
          TIERS.map((k) => (
            <pattern
              className={`sfc-pat is-${tone}`}
              id={patternId(tone, k)}
              key={patternId(tone, k)}
              width={TILE}
              height={TILE}
              patternUnits='userSpaceOnUse'
            >
              <path d={bayerTile(k, CELL)} fill='currentColor' />
            </pattern>
          ))
        )}
      </defs>
    </svg>
  );
}
