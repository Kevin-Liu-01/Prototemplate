/**
 * DITHERED-SUNRISE, the hero crown.
 *
 * Home: C1.4, the region above the h1 inside the hero copy card. A monogram
 * lockup: the drawn GT mark seated in a solid gold disc, with a fan of
 * fourteen rays rising from it in two Bayer bands (8/16 then 2/16). The disc
 * is the one solid gold surface on the page above the dark band, and it is
 * spent on the brand mark. The mark is the light-ground drawing (dark ink)
 * because it sits on gold, never on the page's ground. Decorative rays are
 * hidden from assistive tech; the mark carries the brand name as alt text.
 */

import Image from 'next/image';

import BayerTiers, { tierId } from './BayerTiers';
import { sectorPath } from './bayer-tiers';

const CX = 80;
const CY = 74;
const DISC = 24;
const GAP = 5;
const BANDS: readonly [number, number, number][] = [
  [DISC + GAP, 50, 8],
  [50, 70, 2],
];
const WEDGES = 14;

export default function SunCrown() {
  const wedge = Math.PI / WEDGES;
  const sectors: { d: string; tier: number }[] = [];
  for (let i = 0; i < WEDGES; i += 1) {
    if (i % 2 === 1) continue;
    const a0 = Math.PI + i * wedge;
    const a1 = a0 + wedge;
    for (const [r0, r1, tier] of BANDS) {
      sectors.push({ d: sectorPath(CX, CY, r0, r1, a0, a1), tier });
    }
  }

  return (
    <span className='ds-crown'>
      <svg aria-hidden='true' focusable='false' viewBox='0 0 160 100'>
        <BayerTiers cell={2} id='ds-crown' tiers={[8, 2]} />
        <circle cx={CX} cy={CY} fill='var(--deco-ornament)' r={DISC} />
        {sectors.map((s, i) => (
          <path d={s.d} fill={`url(#${tierId('ds-crown', s.tier)})`} key={i} />
        ))}
      </svg>
      <Image
        alt='General Translation'
        className='ds-crown-mark'
        height={22}
        src='/brand/no-bg-gt-logo-light.png'
        width={22}
      />
    </span>
  );
}
