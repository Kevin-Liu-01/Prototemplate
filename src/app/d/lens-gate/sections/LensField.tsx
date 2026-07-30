'use client';

import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

import { createLensField, type LensFieldHandle, type LensParams } from '../lib/lens-field';

export type LensFieldProps = {
  className?: string;
  params?: Partial<LensParams>;
  speed?: number;
  dpr?: number;
  /**
   * Receives the live field handle after mount (and null on unmount). The lens
   * placement policy — where the glass sits relative to the flat pane and the
   * ruled rows — is the HERO's layout concern, so the hero owns the measuring
   * ResizeObserver and pushes center/radius in through this handle rather than
   * this component guessing at geometry it cannot see.
   */
  onField?: (field: LensFieldHandle | null) => void;
};

/**
 * A canvas registered with the shared lens-field engine (one WebGL context per
 * session — see ../lib/lens-field.ts). Renders nothing but the canvas; callers
 * position it. Falls back to plain paper when WebGL2 is unavailable.
 */
export default function LensField({ className, params, speed = 1, dpr, onField }: LensFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const field = createLensField(canvas, { params, speed, dpr });
    if (!field) return;
    onField?.(field);

    return () => {
      onField?.(null);
      field.destroy();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
