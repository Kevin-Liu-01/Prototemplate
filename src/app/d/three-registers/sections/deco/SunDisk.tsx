'use client';

import { smoothstep, useStillDither } from '../dither-still';
import type { StillField } from '../dither-still';

/**
 * Deco home: the hero crown (C1.4).
 *
 * The sun disk reduced to circle geometry: a solid gold core whose halo
 * thins into the stone as an ordered-dither ramp, ringed once by a
 * hairline. The two bars beside it in the crown stand for the wings. No
 * figure, no rays: one circle, one ring, two bars.
 */
const disk: StillField = () => (u, v) => {
  const dx = u - 0.5;
  const dy = v - 0.5;
  const r = Math.sqrt(dx * dx + dy * dy);
  if (r < 0.19) return 1;
  return 1 - smoothstep(0.19, 0.47, r);
};

export function SunDisk() {
  const ref = useStillDither(disk, { scale: 2, inkToken: '--deco-ornament' });
  return (
    <span className='tr-disk' aria-hidden='true'>
      <canvas className='tr-disk-canvas' ref={ref} aria-hidden='true' />
      <svg className='tr-disk-ring' viewBox='0 0 80 80' aria-hidden='true' focusable='false'>
        <circle cx='40' cy='40' r='39.5' fill='none' stroke='currentColor' vectorEffect='non-scaling-stroke' />
      </svg>
    </span>
  );
}
