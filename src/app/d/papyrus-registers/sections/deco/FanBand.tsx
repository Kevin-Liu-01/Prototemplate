'use client';

import { useMemo } from 'react';

import { umbelFans } from '../../fields';
import { usePapyrusDither } from '../../use-dither';

/**
 * papyrus-registers · deco · the fan band.
 * Ornament home: the hero crown. The vignette register above the claim: a
 * row of nine papyrus umbels as radiating bars, rendered in gold by the
 * Bayer engine over the canon grid, transparent where unlit so the grid
 * shows through. Nine fans on a band eighteen squares wide: one fan per two
 * squares. The rays sway slowly; under reduced motion the engine paints one
 * still.
 */
export default function FanBand() {
  const field = useMemo(() => umbelFans({ fans: 9, aspect: 6, rays: 14 }), []);
  const canvas = usePapyrusDither(field, { inkToken: '--pr-ornament', scale: 3, fps: 24, speed: 1 });

  return (
    <div className='pr-fanband'>
      <canvas ref={canvas} className='pr-fanband-canvas' aria-hidden='true' />
    </div>
  );
}
