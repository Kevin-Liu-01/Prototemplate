'use client';

import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

import {
  createStudioField,
  type StudioFieldHandle,
  type StudioParams,
  type StudioPreset,
} from '@/lib/studio-field';

export type StudioFieldProps = {
  /**
   * 'lines' = the ruled line field (the house motif, lit and warped);
   * 'dither' = the Bayer print-dither flow; 'grain' = the pigment wash;
   * 'topo' = animated contour lines; 'void' = the radiant aperture;
   * 'mesh' = two breathing focal blues.
   */
  preset?: StudioPreset;
  /** Per-mount overrides on the preset. */
  params?: Partial<StudioParams>;
  /** Device pixel ratio cap; the engine defaults to 2 (dither needs pixels). */
  dpr?: number;
  speed?: number;
  className?: string;
};

/**
 * The glyphfield studio materials in band form (src/lib/studio-field.ts) —
 * the founder's own shader studies, house-tuned to ink grounds and the
 * terminal blues. Drop-in for PrismaticField: renders nothing but a canvas;
 * callers position it and keep their own dark plate behind it, since WebGL
 * absence falls back to a transparent canvas.
 */
export default function StudioField({ preset = 'lines', params, dpr, speed = 1, className }: StudioFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // The shared engine already skips fields that are scrolled out of view.
    const field: StudioFieldHandle | null = createStudioField(canvas, {
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
