'use client';

/**
 * calendar-rings: the negative ring's floor.
 *
 * Ornament home: the dark band. The band's lower edge shows the bottom of
 * a much larger ring as four arcs of stepping dither density, rendered in
 * the band's ink over its ground. The field is still: one frame at mount,
 * one on resize, one when the theme flips the two tokens.
 */
import { useRef } from 'react';

import { ditherToCanvas } from '@/lib/dither';
import { useMountEffect } from '@/lib/use-mount-effect';

import { onThemeChange, readToken, ringFloor } from '../fields';

export function NegativeFloor() {
  const ref = useRef<HTMLCanvasElement>(null);

  useMountEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const host = canvas.closest('.cr-negative') ?? canvas;
    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      ditherToCanvas(canvas, ringFloor(rect.width / rect.height), {
        scale: 3,
        ink: readToken(host, '--cr-ink') || 'currentColor',
        paper: 'transparent',
        cssWidth: rect.width,
        cssHeight: rect.height,
      });
    };
    draw();
    const release = onThemeChange(draw);
    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(draw);
      observer.observe(canvas);
    }
    return () => {
      release();
      observer?.disconnect();
    };
  });

  return <canvas className='cr-negative-floor' ref={ref} aria-hidden='true' />;
}
