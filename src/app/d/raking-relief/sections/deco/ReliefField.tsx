'use client';

import { useRef } from 'react';

import { createDitherLoop, gradientRamp, streakBands } from '@/lib/dither';
import type { DitherLoopOptions, FieldFn } from '@/lib/dither';
import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * The two dithered stone surfaces: the hero wall and the recess floor.
 * Both are Bayer fields from the shared engine, rendered in the canvas's
 * own computed color over a transparent paper so the ground shows through,
 * one still under reduced motion, paused offscreen and on hidden tabs,
 * destroyed on unmount, and re-inked when the theme flips.
 * Home: the hero course ground and the dark recess's floor.
 */

type Options = Omit<DitherLoopOptions, 'ink' | 'paper'>;

function useReliefField(field: FieldFn, options: Options) {
  const ref = useRef<HTMLCanvasElement>(null);
  useMountEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const readInk = () => getComputedStyle(canvas).color;
    const loop = createDitherLoop(canvas, field, { ...options, ink: readInk(), paper: 'transparent' });
    const observer = new MutationObserver(() => loop.setOptions({ ink: readInk() }));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => {
      observer.disconnect();
      loop.destroy();
    };
  });
  return ref;
}

/* The wall under raking light from the left: bright at the left edge,
   deepening rightward, over fine horizontal tooling strata that drift
   very slowly. Coverage tops out well under half so the wall stays a
   wall and the panel over it stays the brightest plane. */
const wallRamp = gradientRamp({ from: 0.02, to: 0.46, exponent: 1.45 });
const wallStrata = streakBands({
  bands: 72,
  duty: 0.5,
  softness: 0.9,
  waviness: 0.015,
  waveFrequency: 0.7,
  turbulence: 0.3,
  taper: 0,
  speed: 0.01,
});
const heroWall: FieldFn = (u, v, t) => wallRamp(u, v, t) * (0.55 + 0.45 * wallStrata(u, v, t));

export function HeroWall() {
  const ref = useReliefField(heroWall, { scale: 3, fps: 20, speed: 1 });
  return <canvas className='rr-hero-wall' ref={ref} aria-hidden='true' />;
}

/* The recess floor: chisel strata in alabaster ink on the black stone. The
   light enters from the left over the rim, so the floor near the left rim
   lies in the rim's shadow and the strata grow denser toward the lit wall
   on the right. The strata field tapers rightward by design; reading it
   at 1 - u turns that taper into the rise toward the light. */
const floorStrata = streakBands({
  bands: 54,
  duty: 0.42,
  softness: 0.85,
  waviness: 0.03,
  waveFrequency: 1.1,
  turbulence: 0.45,
  taper: 0.86,
  speed: 0.02,
});
const recessFloor: FieldFn = (u, v, t) => floorStrata(1 - u, v, t) * 0.42;

export function RecessFloor() {
  const ref = useReliefField(recessFloor, { scale: 3, fps: 20, speed: 1 });
  return <canvas className='rr-recess-canvas' ref={ref} aria-hidden='true' />;
}
