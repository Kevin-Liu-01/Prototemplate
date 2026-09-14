'use client';

import { heroFretField } from '../fret';
import { useDither } from '../use-dither';

/**
 * Ornament home: the hero. The monumental fret rendered by the Bayer engine
 * at three CSS pixels per cell: solid limestone-black at the base of the
 * stair, thinning to ordered grain by the end of the coil. The canvas reads
 * its ink from its own `color` (the page ink token) and repaints on theme
 * flips; the loop pauses offscreen and draws one still under reduced motion.
 */
export default function HeroFret() {
  const ref = useDither((aspect) => heroFretField(aspect), {
    scale: 3,
    fps: 24,
    reducedMotionTime: 7,
  });
  return (
    <canvas
      ref={ref}
      className='sf-hero-canvas'
      role='img'
      aria-label='A monumental stepped fret: a stair climbing to a bar that coils into a square spiral, solid at the base and dissolving into halftone grain along its length'
    />
  );
}
