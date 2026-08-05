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
   * The Bayer family: 'bayer' = the founder's pick, the 4×4 matrix over
   * flow-clouds; the other nine ('bayer8', 'bayerContour', 'bayerRadial',
   * 'bayerSweep', 'bayerWaves', 'bayerChunk', 'bayerPulse', 'bayerInk',
   * 'bayerHot') vary matrix order, cell scale, tone field, motion and
   * palette balance — see src/lib/studio-field.ts for the roster.
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
 * The studio Bayer family in band form (src/lib/studio-field.ts) — the
 * founder's picked dither and its variations, house-tuned to ink grounds
 * and the terminal blues. Drop-in for PrismaticField: renders nothing but
 * a canvas; callers position it and keep their own dark plate behind it,
 * since WebGL absence falls back to a transparent canvas.
 */
export default function StudioField({ preset = 'bayer', params, dpr, speed = 1, className }: StudioFieldProps) {
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
