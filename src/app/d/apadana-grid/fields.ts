'use client';

/**
 * apadana-grid: the dither fields and the hook that mounts them.
 *
 * Three surfaces on the page are ordered dither through the house engine
 * (src/lib/dither.ts): the two sun-disk plates in the portico's outer bays,
 * the halftone globe at the center of the great hall, and the floor of the
 * throne hall. Every tonal step is a Bayer tier; nothing here is a gradient
 * or an opacity fade. The hook wraps createDitherLoop's lifecycle (one still
 * under reduced motion, pause offscreen and on hidden tabs, destroy on
 * unmount) and re-resolves the ink from the canvas's computed color when
 * the theme flips, so the same field prints in the ornament color of either
 * theme. Paper is transparent: the field composites over the stone.
 */
import { useRef } from 'react';

import { createDitherLoop } from '@/lib/dither';
import type { DitherLoopHandle, DitherLoopOptions, FieldFn } from '@/lib/dither';
import { useMountEffect } from '@/lib/use-mount-effect';

/** Quantize a 0..1 value onto `steps` even tiers, the way a ramp is cut into rings. */
function tier(value: number, steps: number): number {
  return Math.round(Math.min(1, Math.max(0, value)) * steps) / steps;
}

/**
 * The sun disk: the Achaemenid winged disk reduced to circle-and-bar
 * geometry. A disc of five concentric tiers at the center, a horizontal
 * wing bar either side that steps down in three tiers toward the edges, and
 * a breath on the disc's radius so the rings advance one cell and recede.
 * `aspect` is the plate's width over its height; the plates are square.
 */
export function sunDisk(aspect = 1): FieldFn {
  return (u, v, t) => {
    const dx = (u - 0.5) * aspect;
    const dy = v - 0.5;
    const breath = 1 + 0.035 * Math.sin(t * 0.45);
    const r = (Math.hypot(dx, dy) * 2) / breath;
    let disc = 0;
    if (r < 0.2) disc = 0.88;
    else if (r < 0.33) disc = 0.56;
    else if (r < 0.46) disc = 0.3;
    else if (r < 0.58) disc = 0.14;
    else if (r < 0.66) disc = 0.05;
    const ax = Math.abs(dx);
    let wing = 0;
    if (Math.abs(dy) < 0.05 && ax > 0.3) {
      const fall = 1 - (ax - 0.3) / 0.22;
      wing = tier(Math.max(0, fall) * 0.28, 3);
    }
    return Math.max(disc, wing);
  };
}

/**
 * The throne hall's floor: the light of one lamp at the center of the hall,
 * cut into four tiers so the floor reads as paved rings, drifting through a
 * cell over a long period. Coverage stays low; the plates sit on top.
 */
export function torchFloor(aspect = 1): FieldFn {
  return (u, v, t) => {
    const dx = (u - 0.5) * aspect;
    const dy = v - 0.5;
    const r = Math.hypot(dx, dy) * 2;
    const drift = 0.02 * Math.sin(t * 0.2);
    const light = Math.max(0, 1 - (r + drift) / 0.95);
    return tier(light * 0.22, 4);
  };
}

/** The great hall's globe spin, radians per second; the atlas value. */
export const GLOBE_SPIN = 0.18;

export type UseDitherOptions = Omit<DitherLoopOptions, 'ink' | 'paper'> & {
  /** rebuild the field from the box's aspect when the canvas is resized */
  aspectAware?: boolean;
};

/**
 * Mounts a dither loop on the returned canvas ref. The field factory takes
 * the box's aspect (width over height) so square geometry stays square in
 * any bay. Ink is read from the canvas's computed `color`, which the
 * stylesheet sets from a --deco token; the observer on <html data-theme>
 * re-reads it and redraws when the theme flips.
 */
export function useDither(
  factory: (aspect: number) => FieldFn,
  options: UseDitherOptions = {}
) {
  const ref = useRef<HTMLCanvasElement>(null);

  useMountEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const { aspectAware = true, ...loopOptions } = options;

    const aspectOf = () => {
      const w = canvas.clientWidth || canvas.width || 1;
      const h = canvas.clientHeight || canvas.height || 1;
      return w / h;
    };
    const inkOf = () => getComputedStyle(canvas).color || 'currentColor';

    let handle: DitherLoopHandle | null = createDitherLoop(canvas, factory(aspectOf()), {
      scale: 3,
      fps: 24,
      ...loopOptions,
      ink: inkOf(),
      paper: 'transparent',
    });
    /* the loop paints its first frame and starts itself; under reduced
       motion that first frame is the only one */

    const themeWatch = new MutationObserver(() => {
      if (!handle) return;
      handle.setOptions({ ink: inkOf() });
      /* a running loop picks the new ink up on its next tick; a still needs one frame */
      if (!handle.running) handle.render();
    });
    themeWatch.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    let sizeWatch: ResizeObserver | null = null;
    if (aspectAware && typeof ResizeObserver !== 'undefined') {
      let last = aspectOf();
      sizeWatch = new ResizeObserver(() => {
        if (!handle) return;
        const next = aspectOf();
        if (Math.abs(next - last) < 0.01) return;
        last = next;
        /* setField repaints a still itself; a running loop redraws on its next tick */
        handle.setField(factory(next));
      });
      sizeWatch.observe(canvas);
    }

    return () => {
      themeWatch.disconnect();
      sizeWatch?.disconnect();
      handle?.destroy();
      handle = null;
    };
  });

  return ref;
}
