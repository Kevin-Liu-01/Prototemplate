import { useId } from 'react';

import { bayerTile } from '@/app/d/production/sections/pricing-bayer';

/**
 * papyrus-registers · deco · the fan cell.
 * Ornament home: the scripts register. One lotus bell per locale, reduced
 * to geometry: a static half disc of five concentric arcs, each band filled
 * with the next Bayer coverage tier (3, 6, 9, 12, 15 of 16), so the bell
 * reads as a gold ramp brightening to its rim. Tiers nest by construction
 * and the bands do not overlap, so the ramp is exact. Cells stay square
 * screen pixels: the SVG renders at its own size, never scaled.
 */
const W = 132;
const H = 66;
const CX = W / 2;
const CY = H - 2;
const CELL = 2;
const TIERS: readonly number[] = [3, 6, 9, 12, 15];
const RADII: readonly number[] = [12, 22, 32, 42, 52, 62];

function halfAnnulus(r0: number, r1: number): string {
  return `M${CX - r1} ${CY}A${r1} ${r1} 0 0 1 ${CX + r1} ${CY}L${CX + r0} ${CY}A${r0} ${r0} 0 0 0 ${CX - r0} ${CY}Z`;
}

export default function FanCell() {
  const id = useId().replace(/:/g, '');

  return (
    <svg
      className='pr-fan'
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      shapeRendering='crispEdges'
      aria-hidden='true'
    >
      <defs>
        {TIERS.map((k) => (
          <pattern
            key={k}
            id={`${id}-t${k}`}
            width={CELL * 4}
            height={CELL * 4}
            patternUnits='userSpaceOnUse'
          >
            <path d={bayerTile(k, CELL)} fill='currentColor' />
          </pattern>
        ))}
      </defs>
      {TIERS.map((k, i) => (
        <path key={k} d={halfAnnulus(RADII[i] ?? 0, RADII[i + 1] ?? 0)} fill={`url(#${id}-t${k})`} />
      ))}
    </svg>
  );
}
