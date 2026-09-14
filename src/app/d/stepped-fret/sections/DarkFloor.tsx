'use client';

import { gradientRamp, mapField, multiplyFields } from '@/lib/dither';
import type { FieldFn } from '@/lib/dither';

import { useDither } from '../use-dither';

/**
 * Ornament home: the dark band. The floor of the band is limestone grain on
 * black: dense at the ground line and dissolving upward, with a slow drift
 * across it, so the ziggurat stands on a dithered floor rather than a flat
 * one. Ink is the band's own color (fixed limestone in both themes).
 */
function floorField(): FieldFn {
  const ramp = gradientRamp({ angle: -Math.PI / 2, from: 0, to: 0.72, exponent: 2.2 });
  const drift = gradientRamp({ angle: 0, from: 0.7, to: 1, wobble: 0.16, wobbleFrequency: 2.2, speed: 0.012 });
  return mapField(multiplyFields(ramp, drift), (v) => Math.min(1, v));
}

export default function DarkFloor() {
  const ref = useDither(() => floorField(), { scale: 3, fps: 20, reducedMotionTime: 3 });
  return <canvas ref={ref} className='sf-dark-floor' aria-hidden='true' />;
}
