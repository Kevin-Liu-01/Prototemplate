'use client';

import { useRef } from 'react';

import { createDitherLoop, type FieldFn } from '@/lib/dither';
import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * A Bayer dither canvas mounted under the engine's lifecycle contract. Home:
 * the hero crown (the sun disk) and the sanctuary floor. The wrapper sizes
 * the canvas; the ink is read from the wrapper's computed `color`, so the
 * page's tokens decide it, and it re-resolves when the theme attribute
 * flips. One still under reduced motion; paused offscreen and on hidden
 * tabs; destroyed on unmount.
 */
type DitherPlateProps = {
  field: FieldFn;
  className?: string;
  /** CSS pixels per dither cell. */
  scale?: number;
  fps?: number;
  speed?: number;
  /** Field time for the one frame drawn under reduced motion. */
  reducedMotionTime?: number;
  /** A functional plate names itself; a decorative one is hidden from the tree. */
  label?: string;
};

export default function DitherPlate({
  field,
  className,
  scale = 3,
  fps = 24,
  speed = 1,
  reducedMotionTime = 0,
  label,
}: DitherPlateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useMountEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const readInk = () => getComputedStyle(canvas).color;
    const loop = createDitherLoop(canvas, field, {
      scale,
      fps,
      speed,
      reducedMotionTime,
      ink: readInk(),
      paper: 'transparent',
    });
    const observer = new MutationObserver(() => loop.setOptions({ ink: readInk() }));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => {
      observer.disconnect();
      loop.destroy();
    };
  });

  const decorative = label === undefined;

  return (
    <div className={className} aria-hidden={decorative ? 'true' : undefined}>
      {decorative ? (
        <canvas ref={canvasRef} aria-hidden='true' />
      ) : (
        <canvas ref={canvasRef} role='img' aria-label={label} />
      )}
    </div>
  );
}
