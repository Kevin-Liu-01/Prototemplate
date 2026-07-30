'use client';

import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

import { createAuroraWash, type AuroraHandle, type AuroraParams } from '../lib/aurora-wash';

export type AuroraWashProps = {
  /** 'paper' = the hero's chroma-on-paper register; 'ink' = the dark band's. */
  preset?: 'paper' | 'ink';
  params?: Partial<AuroraParams>;
  /** Device pixel ratio cap. The soft upscale is part of the look; keep <= 1. */
  dpr?: number;
  speed?: number;
  className?: string;
};

/**
 * This direction's own shader surface — the soft aurora wash. Renders nothing
 * but a canvas; callers position and mask it. When WebGL is unavailable the
 * canvas stays blank and the parent's own surface color shows, so parents
 * must already be the wash's base color.
 */
export default function AuroraWash({ preset = 'paper', params, dpr = 1, speed = 1, className }: AuroraWashProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const wash: AuroraHandle | null = createAuroraWash(canvas, { preset, dpr, speed, params });
    if (!wash) return;

    return () => wash.destroy();
  }, [preset, dpr, speed]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
