'use client';

import { useRef } from 'react';

import { createDitherLoop } from '@/lib/dither';
import type { DitherLoopOptions, FieldFn } from '@/lib/dither';
import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * Mounts one Bayer dither loop on a canvas and honours the engine contract:
 * one still under reduced motion, paused offscreen and on hidden tabs,
 * destroyed on unmount. The ink is never a literal: it is the canvas's own
 * computed `color`, so the page tokens set it, and it is re-read on every
 * `data-theme` flip so a theme change repaints in the new ink. The field is
 * rebuilt from the canvas box's aspect on mount and on resize, so geometry
 * drawn in cell space stays square.
 */
export function useDither(
  fieldFor: (aspect: number) => FieldFn,
  options: Omit<DitherLoopOptions, 'ink'> = {}
) {
  const ref = useRef<HTMLCanvasElement>(null);

  useMountEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const aspectOf = () => {
      const rect = canvas.getBoundingClientRect();
      return rect.height > 0 ? rect.width / rect.height : 1;
    };
    const inkOf = () => getComputedStyle(canvas).color;

    const handle = createDitherLoop(canvas, fieldFor(aspectOf()), {
      paper: 'transparent',
      ...options,
      ink: inkOf(),
    });

    let lastAspect = aspectOf();
    const resize = new ResizeObserver(() => {
      const aspect = aspectOf();
      if (Math.abs(aspect - lastAspect) < 0.01) return;
      lastAspect = aspect;
      handle.setField(fieldFor(aspect));
    });
    resize.observe(canvas);

    const theme = new MutationObserver(() => {
      handle.setOptions({ ink: inkOf() });
    });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      resize.disconnect();
      theme.disconnect();
      handle.destroy();
    };
  });

  return ref;
}
