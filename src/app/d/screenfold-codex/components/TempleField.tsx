'use client';

import { useRef } from 'react';

import { createDitherLoop, type FieldFn } from '@/lib/dither';
import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * The night panel's live plate: a stepped pyramid of seven terraces rising
 * from a ground line, and to its upper right a sun disk of concentric rings
 * with two bars to either side, the winged disk reduced to circle and bar.
 * Every terrace and ring is one flat coverage tier, so the ordered dither
 * renders the geometry as stepped tone; a slow light sweeps the terraces
 * and the rings alternate. Rendered by the CPU Bayer engine at one device
 * pixel per cell, paused off screen and on hidden tabs, one still under
 * reduced motion, destroyed on unmount. Ink and ground are the panel's own
 * tokens, read from the canvas's computed style.
 *
 * Ornament home: the night panel's left register.
 */
const TAU = Math.PI * 2;
const TERRACES = 7;
const GROUND = 0.94;

function quantize(x: number, levels: number): number {
  return Math.round(x * levels) / levels;
}

function templeField(aspect: number): FieldFn {
  const cx = 0.76;
  const cy = 0.2;
  const R = 0.11;
  return (u, v, t) => {
    if (v > GROUND) return 0.3;

    const h = (GROUND - v) / GROUND;
    const level = Math.floor(h * TERRACES);
    if (level < TERRACES) {
      const half = 0.46 - level * (0.4 / (TERRACES - 1));
      if (Math.abs(u - 0.5) < half) {
        const base = 0.16 + (level / (TERRACES - 1)) * 0.5;
        const sweep = 0.06 * Math.sin(TAU * (u * 0.5 - t * 0.04));
        return quantize(base + sweep, 8);
      }
    }

    const dx = (u - cx) * aspect;
    const dy = v - cy;
    const r = Math.hypot(dx, dy);
    if (r < R) {
      const band = Math.floor((r / R) * 4);
      const pulse = Math.sin(t * 0.5 + band * 1.4) > 0;
      if (band % 2 === 0) return pulse ? 0.62 : 0.5;
      return 0.2;
    }
    const adx = Math.abs(dx);
    if (Math.abs(dy) < 0.012 && adx > R + 0.04 && adx < R + 0.22) return 0.5;
    if (Math.abs(dy - 0.035) < 0.008 && adx > R + 0.08 && adx < R + 0.17) return 0.36;
    return 0;
  };
}

export default function TempleField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useMountEffect(() => {
    const canvas = ref.current;
    if (canvas === null) return;
    const style = getComputedStyle(canvas);
    const ink = style.getPropertyValue('--sfc-night-ink').trim();
    const paper = style.getPropertyValue('--sfc-night').trim();
    const aspectOf = () => {
      const rect = canvas.getBoundingClientRect();
      return rect.height > 0 ? rect.width / rect.height : 1.6;
    };
    const handle = createDitherLoop(canvas, templeField(aspectOf()), {
      scale: 3,
      ink,
      paper,
      fps: 24,
      reducedMotionTime: 1.5,
    });
    const resize =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(() => handle.setField(templeField(aspectOf())));
    resize?.observe(canvas);
    return () => {
      resize?.disconnect();
      handle.destroy();
    };
  });

  return (
    <canvas
      ref={ref}
      className='sfc-temple'
      role='img'
      aria-label='A stepped pyramid of seven terraces and a ringed sun disk with two bars, drawn in one-bit dither.'
    />
  );
}
