'use client';

import { useRef } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

import { createWedgeLoop, steleField } from '../../fields';

/**
 * Home: the dark moment (C1 item 5), the stele's lower register.
 *
 * The wedge dither in motion: bands of impressions rise slowly from the foot
 * of the stone and thin out toward the top. The canvas reads its ink from its
 * own computed color, so the stele's constant slip token drives it and no
 * colour literal lives in TSX. The stele never remaps, so no theme observer
 * is needed. One still under reduced motion; paused offscreen; destroyed on
 * unmount, all through createWedgeLoop.
 */
export default function SteleField() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useMountEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ink = getComputedStyle(el).color;
    const loop = createWedgeLoop(el, steleField(), { cell: 14, ink, fps: 24 });
    return () => loop.destroy();
  });

  return <canvas className='ct-stele-canvas' ref={canvas} aria-hidden='true' />;
}
