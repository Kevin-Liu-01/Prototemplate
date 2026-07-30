'use client';

import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

import { createPrismaticField, type PrismaticFieldHandle, type PrismaticParams } from '@/lib/prismatic-field';

export type PrismaticFieldProps = {
  /** '1' = wide horizontal burst, '2' = arc/dome over a dark core. */
  preset?: '1' | '2';
  /** Higher exposureScale = dimmer. Raise it when content sits on top. */
  params?: Partial<PrismaticParams>;
  /** Device pixel ratio cap. The soft upscale is part of the look; keep at or below 1. */
  dpr?: number;
  speed?: number;
  className?: string;
  /**
   * Retained for call-site compatibility. Offscreen fields are always skipped
   * by the shared engine, so this no longer has an effect.
   */
  pauseOffscreen?: boolean;
};

/**
 * The canonical prismatic light field — a raw-WebGL port of the reference shader.
 *
 * Renders nothing but a canvas; callers position it. Falls back to a transparent
 * canvas when WebGL is unavailable, so the parent must supply its own dark
 * background rather than relying on this for base color.
 */
export default function PrismaticField({
  preset = '1',
  params,
  dpr = 1,
  speed = 1,
  className,
}: PrismaticFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // The shared engine already skips fields that are scrolled out of view, so
    // there is no per-instance observer here.
    const field: PrismaticFieldHandle | null = createPrismaticField(canvas, {
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
