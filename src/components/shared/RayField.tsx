'use client';

import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

import { createRayField, type RayFieldHandle, type RayParams, type RayPreset } from '@/lib/ray-field';

export type RayFieldProps = {
  /**
   * 'converge' = rays bend in from both flanks toward the center column;
   * 'shafts' = near-vertical shafts rising through the band;
   * 'horizon' = a low, wide fan off the band's floor line.
   */
  preset?: RayPreset;
  /** Per-mount overrides on the preset (exposure is a gain — higher = brighter). */
  params?: Partial<RayParams>;
  /** Device pixel ratio cap. The soft upscale is part of the look; keep at or below 1. */
  dpr?: number;
  speed?: number;
  className?: string;
};

/**
 * The sci-fi ray field — bézier light paths drawn by traveling pulses, in the
 * house blues (src/lib/ray-field.ts). Drop-in for PrismaticField: renders
 * nothing but a canvas; callers position it and keep their own dark plate
 * behind it, since WebGL absence falls back to a transparent canvas.
 */
export default function RayField({ preset = 'converge', params, dpr = 1, speed = 1, className }: RayFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // The shared engine already skips fields that are scrolled out of view.
    const field: RayFieldHandle | null = createRayField(canvas, {
      preset,
      dpr,
      speed,
      params,
    });
    if (!field) return;

    return () => field.destroy();
  }, [preset, dpr, speed]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
