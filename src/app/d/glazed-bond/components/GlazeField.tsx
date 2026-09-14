'use client';

import { useRef } from 'react';

import { createDitherLoop, gradientRamp } from '@/lib/dither';
import type { DitherLoopHandle, FieldFn } from '@/lib/dither';
import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * Deco homes: the sky in the arch (the sun disc) and the court's floor.
 *
 * Two Bayer surfaces on the CPU engine. `sun` is the winged disc reduced to
 * its geometry: a solid disc with a dithered edge, five concentric rings,
 * and sixteen rays that turn slowly and thin out with radius, so the field
 * is dense at the crown of the arch and empty where the claim sits. `floor`
 * is a static vertical ramp, the glazed plinth of the court dissolving into
 * the wall above it.
 *
 * The ink is read from the canvas's own computed `color`, so the sheet sets
 * it with a token and a theme flip re-resolves it through a MutationObserver
 * on <html data-theme>. Paper is transparent: the field composites over the
 * host's ground. The loop pauses offscreen and on hidden tabs, renders one
 * still under reduced motion, and is destroyed on unmount.
 */

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

function smoothstep(e0: number, e1: number, x: number): number {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
}

/** The sun disc: disc, rings, rays. `aspect` keeps the circle round. */
function sunField(aspect: number): FieldFn {
  const cx = 0.5;
  const cy = 0.19;
  const R = 0.16;
  const rays = 16;
  return (u, v, t) => {
    const dx = (u - cx) * aspect;
    const dy = v - cy;
    const r = Math.sqrt(dx * dx + dy * dy) / R;

    // the disc: solid core, dithered rim
    let value = 0.92 * (1 - smoothstep(0.34, 0.5, r));

    // five thin rings outside the core
    for (let k = 0; k < 5; k++) {
      const rk = 0.62 + k * 0.16;
      const d = Math.abs(r - rk);
      value += 0.55 * (1 - smoothstep(0.012, 0.03, d)) * (1 - k * 0.12);
    }

    // rays: sharpened cosine lobes that thin out with radius
    if (r > 0.5) {
      const angle = Math.atan2(dy, dx) + t * 0.07;
      const lobe = 0.5 + 0.5 * Math.cos(angle * rays);
      const ray = lobe * lobe * lobe * lobe;
      const fall = 1 - smoothstep(0.7, 2.6, r);
      value += ray * fall * 0.42 * smoothstep(0.5, 0.8, r);
    }

    // nothing below the crown: the field is gone before the h1 begins
    // (the claim stack's top padding puts the headline near v = 0.3)
    value *= 1 - smoothstep(0.24, 0.34, v);
    return clamp01(value);
  };
}

const floorField: FieldFn = gradientRamp({
  angle: Math.PI / 2,
  from: 0,
  to: 0.62,
  smooth: true,
  wobble: 0.012,
  wobbleFrequency: 3,
});

export type GlazeFieldProps = {
  kind: 'sun' | 'floor';
  className?: string;
  /** CSS pixels per dither cell. Default 3. */
  scale?: number;
};

export default function GlazeField({ kind, className, scale = 3 }: GlazeFieldProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useMountEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const readInk = () => getComputedStyle(canvas).color;
    const build = (): FieldFn => {
      if (kind === 'floor') return floorField;
      const rect = canvas.getBoundingClientRect();
      const aspect = rect.height > 0 ? rect.width / rect.height : 1;
      return sunField(aspect);
    };

    const animated = kind === 'sun';
    const handle: DitherLoopHandle = createDitherLoop(canvas, build(), {
      scale,
      ink: readInk(),
      paper: 'transparent',
      fps: 24,
      speed: 1,
      pauseOffscreen: animated,
    });
    // a static field never needs a frame loop: one still, redrawn on resize
    if (!animated) handle.stop();

    let sized: ResizeObserver | undefined;
    if (animated && typeof ResizeObserver !== 'undefined') {
      sized = new ResizeObserver(() => handle.setField(build()));
      sized.observe(canvas);
    }

    const themed = new MutationObserver(() => handle.setOptions({ ink: readInk() }));
    themed.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      themed.disconnect();
      sized?.disconnect();
      handle.destroy();
    };
  });

  return (
    <canvas
      ref={ref}
      className={className ? `gb-field ${className}` : 'gb-field'}
      aria-hidden='true'
    />
  );
}
