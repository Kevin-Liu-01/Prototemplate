import { useId } from 'react';

import FanCapital from './FanCapital';
import { bayerTilePath } from './bayer';

/**
 * One battered pylon mass. Home: the hero (the two masses that frame the
 * passage). The mass is four horizontal bands of static Bayer tiers, light
 * at the top and dense at the base, so the wall reads as stone graded in
 * 1-bit tone; the batter comes from the wrapper's clip-path in the
 * stylesheet, and the papyrus fan sits on the pylon top as its capital.
 */
type PylonProps = { side: 'l' | 'r' };

const CELL = 3;
const TIERS: readonly number[] = [2, 3, 5, 8];

export default function Pylon({ side }: PylonProps) {
  const raw = useId();
  const id = `pg-${raw.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const bandHeight = 100 / TIERS.length;

  return (
    <div className={`pg-pylon is-${side}`} aria-hidden='true'>
      <svg className='pg-pylon-mass' width='100%' height='100%'>
        <defs>
          {TIERS.map((k) => (
            <pattern
              id={`${id}-t${k}`}
              key={k}
              patternUnits='userSpaceOnUse'
              width={CELL * 4}
              height={CELL * 4}
            >
              <path d={bayerTilePath(k, CELL)} fill='currentColor' shapeRendering='crispEdges' />
            </pattern>
          ))}
        </defs>
        {TIERS.map((k, i) => (
          <rect
            key={k}
            x='0'
            y={`${i * bandHeight}%`}
            width='100%'
            height={`${bandHeight}%`}
            fill={`url(#${id}-t${k})`}
          />
        ))}
      </svg>
      <FanCapital className='pg-cap' />
    </div>
  );
}
