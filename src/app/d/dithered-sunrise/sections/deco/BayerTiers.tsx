/**
 * DITHERED-SUNRISE, the shared `<pattern>` defs every inline ornament fills
 * with. One tile per coverage tier, cut from the house screen; the fill is
 * `var(--deco-ornament)` so the tiles follow the theme's gold. Ids are
 * namespaced by the host's `id` so several ornaments can share a document.
 *
 * Home: a helper for the C1 ornaments in this folder, never mounted alone.
 */

import { tierCells } from './bayer-tiers';

type Props = {
  /** The host ornament's id; each tier's pattern is `${id}-t${k}`. */
  id: string;
  /** The coverage tiers (of 16) the host needs. */
  tiers: readonly number[];
  /** CSS pixels per screen cell; the tile is four cells square. */
  cell: number;
};

export function tierId(id: string, k: number): string {
  return `${id}-t${k}`;
}

export default function BayerTiers({ id, tiers, cell }: Props) {
  const tile = cell * 4;
  return (
    <defs>
      {tiers.map((k) => (
        <pattern
          height={tile}
          id={tierId(id, k)}
          key={k}
          patternUnits='userSpaceOnUse'
          width={tile}
        >
          {tierCells(k).map(([x, y]) => (
            <rect
              fill='var(--deco-ornament)'
              height={cell}
              key={`${x}-${y}`}
              width={cell}
              x={x * cell}
              y={y * cell}
            />
          ))}
        </pattern>
      ))}
    </defs>
  );
}
