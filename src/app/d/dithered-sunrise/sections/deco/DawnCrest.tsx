/**
 * DITHERED-SUNRISE, the section-head crest.
 *
 * Home: C1.1, the `tc-head-icon` slot inside `.tc-head`, seated on the
 * head's right edge with its baseline on the head's bottom rule. A half sun
 * rising: a hub at 12/16 coverage, the dark ring that separates disc from
 * fan, then eight lit wedges of a sixteen-wedge fan, each cut into three
 * radial bands at 8/16, 4/16 and 1/16, so the light thins by lattice and
 * never by alpha. Fill is the theme's ornament gold; the ornament is
 * decorative and hidden from assistive tech. `id` namespaces the pattern
 * defs so every section head can carry one.
 */

import BayerTiers, { tierId } from './BayerTiers';
import { sectorPath } from './bayer-tiers';

type Props = { id: string; className?: string };

const CX = 120;
const CY = 120;
const HUB = 24;
const GAP = 6;
/** Band radii, hub outward; the last is the crest's rim. */
const BANDS: readonly [number, number, number][] = [
  [HUB + GAP, 60, 8],
  [60, 90, 4],
  [90, 118, 1],
];
const WEDGES = 16;

export default function DawnCrest({ id, className }: Props) {
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
    <svg aria-hidden='true' className={className} focusable='false' viewBox='0 0 240 120'>
      <BayerTiers cell={3} id={id} tiers={[12, 8, 4, 1]} />
      <path d={`M${CX - HUB} ${CY}A${HUB} ${HUB} 0 0 1 ${CX + HUB} ${CY}Z`} fill={`url(#${tierId(id, 12)})`} />
      {sectors.map((s, i) => (
        <path d={s.d} fill={`url(#${tierId(id, s.tier)})`} key={i} />
      ))}
    </svg>
  );
}
