/**
 * DITHERED-SUNRISE, the divider lattice.
 *
 * Home: C1.2, the `.tc-hatch` spacer band between bento rows. The 45 degree
 * hatch becomes one flat Bayer tier: the house screen at 4/16 coverage in
 * the theme's ornament gold, three CSS pixels per cell, tiled edge to edge
 * inside the spacer's own hairlines. The spacer keeps its two rules; this
 * fills the strip between them. Decorative, hidden from assistive tech;
 * `id` namespaces the pattern so the three spacers share a document.
 */

import BayerTiers, { tierId } from './BayerTiers';

type Props = { id: string };

export default function BayerBand({ id }: Props) {
  return (
    <svg aria-hidden='true' className='ds-band' focusable='false'>
      <BayerTiers cell={3} id={id} tiers={[4]} />
      <rect fill={`url(#${tierId(id, 4)})`} height='100%' width='100%' />
    </svg>
  );
}
