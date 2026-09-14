import { bayerTile } from '@/app/d/production/sections/pricing-bayer';

/**
 * brick-lattice · the static dither screens, defined once per page.
 *
 * Home: mounted once at the top of the root, invisible. Two kinds of
 * pattern live here. `bl-bond` is the plain running bond (mortar under
 * fired-clay stretchers, two courses per tile) that every medallion's SVG
 * fills its ground with. `bl-t1` to `bl-t4` are the house 4x4 Bayer screen
 * at coverages 3, 6, 10 and 13 of 16, in lapis: the wall's bricks step
 * through them as they fire, so density rises in exact nested tiers
 * (DESIGN.md section 7) and never as an opacity fade. Colors are CSS
 * tokens on the paths, so the patterns follow the theme remap.
 */
const TIERS: readonly { id: string; k: number }[] = [
  { id: 'bl-t1', k: 3 },
  { id: 'bl-t2', k: 6 },
  { id: 'bl-t3', k: 10 },
  { id: 'bl-t4', k: 13 },
];

const CELL = 5;
const BW = 16;
const BH = 8;

export default function BayerTiers() {
  return (
    <svg className='bl-defs' width='0' height='0' aria-hidden='true' focusable='false'>
      <defs>
        <pattern id='bl-bond' width={BW} height={BH * 2} patternUnits='userSpaceOnUse'>
          <rect className='bl-def-mortar' width={BW} height={BH * 2} />
          <path
            className='bl-def-brick'
            d={`M1 1h${BW - 1}v${BH - 1}h${-(BW - 1)}Z M1 ${BH + 1}h${BW / 2 - 1}v${BH - 1}h${-(BW / 2 - 1)}Z M${BW / 2 + 1} ${BH + 1}h${BW / 2 - 1}v${BH - 1}h${-(BW / 2 - 1)}Z`}
          />
        </pattern>
        {TIERS.map((tier) => (
          <pattern key={tier.id} id={tier.id} width={CELL * 4} height={CELL * 4} patternUnits='userSpaceOnUse'>
            <path className='bl-def-lapis' d={bayerTile(tier.k, CELL)} />
          </pattern>
        ))}
      </defs>
    </svg>
  );
}
