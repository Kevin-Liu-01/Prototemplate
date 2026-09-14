'use client';

import { useRef } from 'react';

import { createDitherLoop, gradientRamp, streakBands } from '@/lib/dither';
import type { DitherLoopOptions, FieldFn } from '@/lib/dither';
import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * The two dithered stone surfaces: the hero wall and the stele face.
 * Both are Bayer fields from the shared engine, rendered in the canvas's
 * own computed color over a transparent paper so the wall shows through,
 * one still under reduced motion, paused offscreen and on hidden tabs,
 * destroyed on unmount, and re-inked when the theme flips.
 * Home: the hero course ground and the dark stele's tooled border.
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

/* The stele's tooled border: chisel strata in alabaster ink on the black
   stone, lit from the left and fading to the right. The inscribed
   registers sit on polished ground over it. */
const steleStrata = streakBands({
  bands: 54,
  duty: 0.42,
  softness: 0.85,
  waviness: 0.03,
  waveFrequency: 1.1,
  turbulence: 0.45,
  taper: 0.82,
  speed: 0.02,
});
const steleWall: FieldFn = (u, v, t) => steleStrata(u, v, t) * 0.5;

export function SteleWall() {
  const ref = useReliefField(steleWall, { scale: 3, fps: 20, speed: 1 });
  return <canvas className='rr-stele-wall' ref={ref} aria-hidden='true' />;
}
