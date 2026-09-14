'use client';

import { globe } from '@/lib/dither';

import { useDither } from '../use-dither';

/**
 * The halftone globe beside the variants ledger: twelve meridians, seven
 * parallels, a slow spin, at three CSS pixels per cell. Ink from the page
 * token through the canvas's own color; one still under reduced motion.
 */
export default function Globe() {
  const ref = useDither(
    (aspect) =>
      globe({
        aspect,
        radius: 0.42,
        graticule: 0.3,
        meridians: 12,
        parallels: 7,
        landmass: 0.18,
        spin: 0.18,
      }),
    { scale: 3, fps: 24, reducedMotionTime: 4 }
  );
  return (
    <canvas
      ref={ref}
      className='sf-globe'
      role='img'
      aria-label='A halftone globe with twelve meridians and seven parallels, turning slowly'
    />
  );
}
