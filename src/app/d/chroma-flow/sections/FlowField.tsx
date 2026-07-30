'use client';

import { useGSAP } from '@gsap/react';
import type { RefObject } from 'react';
import { useRef } from 'react';

import { createFlowField, type FlowFieldHandle, type FlowParams } from '../lib/flow-field';

export type FlowFieldProps = {
  className?: string;
  params?: Partial<FlowParams>;
  /**
   * Extra params merged on top when the viewport is narrow (< 700px CSS px at
   * mount). The phone hero needs a denser, wilder field: the obstacle spans
   * almost the whole width, so without more perturbation the wrap-around arcs
   * read as smooth concentric rings instead of a flow.
   */
  narrowParams?: Partial<FlowParams>;
  speed?: number;
  dpr?: number;
  /**
   * Element the streamlines part around. Its box (relative to the canvas) is
   * measured and fed to the shader as the flow obstacle, so the composition —
   * type inside the calm of the flow — holds at every viewport.
   */
  carveRef?: RefObject<HTMLElement | null>;
};

/**
 * A canvas registered with the shared flow-field engine (one WebGL context per
 * session — see ../lib/flow-field.ts). Renders nothing but the canvas; callers
 * position it. Falls back to plain paper when WebGL2 is unavailable.
 */
export default function FlowField({
  className,
  params,
  narrowParams,
  speed = 1,
  dpr,
  carveRef,
}: FlowFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const narrow = window.matchMedia('(max-width: 700px)').matches;
    const merged = narrow && narrowParams ? { ...params, ...narrowParams } : params;
    const field: FlowFieldHandle | null = createFlowField(canvas, { params: merged, speed, dpr });
    if (!field) return;

    const measure = () => {
      const carve = carveRef?.current;
      if (!carve) return;
      const box = carve.getBoundingClientRect();
      const own = canvas.getBoundingClientRect();
      if (box.width < 2 || own.width < 2) return;
      const halfW = box.width / 2;
      const halfH = box.height / 2;
      /* The physics ellipse hugs the box — a step past it, no more. At
         1.34/1.62 the clearing owned half the hero viewport and the still
         read hollow; the shader's hard rect cut keeps the corners clean. */
      const tight = own.width < 700;
      field.setParams({
        center: [box.left - own.left + halfW, box.top - own.top + halfH],
        radii: tight ? [halfW * 1.06, halfH * 1.16] : [halfW * 1.12, halfH * 1.3],
        half: [halfW, halfH],
      });
    };

    let observer: ResizeObserver | undefined;
    let raf = 0;
    const arm = () => {
      const carve = carveRef?.current;
      /* The carve target can be a later sibling whose ref is not attached yet
         when this layout effect runs — wait a frame for it. */
      if (!carve) {
        raf = requestAnimationFrame(arm);
        return;
      }
      measure();
      /* Re-measure when either box changes: font load, viewport resize,
         content wrap. */
      observer = new ResizeObserver(measure);
      observer.observe(carve);
      observer.observe(canvas);
      void document.fonts?.ready.then(measure);
    };
    if (carveRef) arm();

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
      field.destroy();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
