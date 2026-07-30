'use client';

import { useGSAP } from '@gsap/react';
import type { RefObject } from 'react';
import { useRef } from 'react';

import { createGraphiteSheen, type SheenHandle, type SheenParams } from '../lib/graphite-sheen';

export type SheenFieldProps = {
  className?: string;
  params?: Partial<SheenParams>;
  speed?: number;
  dpr?: number;
  /**
   * The grain-flip cell. Its box (relative to the canvas) is measured and fed
   * to the shader, so the 90° grain and the rotated specular axis stay exactly
   * under the headline cell's hairlines at every viewport.
   */
  flipRef?: RefObject<HTMLElement | null>;
};

/**
 * A canvas registered with the shared graphite-sheen engine (one WebGL context
 * per session — see ../lib/graphite-sheen.ts). Renders nothing but the canvas;
 * callers position it. Falls back to plain paper when WebGL2 is unavailable.
 */
export default function SheenField({ className, params, speed = 1, dpr, flipRef }: SheenFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const field: SheenHandle | null = createGraphiteSheen(canvas, { params, speed, dpr });
    if (!field) return;

    const measure = () => {
      const cell = flipRef?.current;
      if (!cell) return;
      const box = cell.getBoundingClientRect();
      const own = canvas.getBoundingClientRect();
      if (box.width < 2 || own.width < 2) return;
      /* The cell is also a cascade plate, so the first ResizeObserver callback
         can land mid-entrance while it is translated and scaled. Back the
         cell's own transform out of the rect (translate + center-origin scale
         is all the cascade uses) so the flip edge is measured where the cell
         SETTLES, not where it happens to be this frame. */
      let dx = 0;
      let dy = 0;
      let sx = 1;
      let sy = 1;
      const t = getComputedStyle(cell).transform;
      if (t && t !== 'none') {
        const m = new DOMMatrixReadOnly(t);
        dx = m.e;
        dy = m.f;
        sx = m.a || 1;
        sy = m.d || 1;
      }
      /* The rect is the cell itself, uninflated — the flip edge has to sit
         under the cell's own hairline, not a step outside it. */
      field.setParams({
        flipCenter: [
          box.left + box.width / 2 - dx - own.left,
          box.top + box.height / 2 - dy - own.top,
        ],
        flipHalf: [box.width / 2 / sx, box.height / 2 / sy],
      });
    };

    let observer: ResizeObserver | undefined;
    let raf = 0;
    const arm = () => {
      const cell = flipRef?.current;
      /* The flip target can be a later sibling whose ref is not attached yet
         when this layout effect runs — wait a frame for it. */
      if (!cell) {
        raf = requestAnimationFrame(arm);
        return;
      }
      measure();
      /* Re-measure when either box changes: font load, viewport resize,
         content wrap. */
      observer = new ResizeObserver(measure);
      observer.observe(cell);
      observer.observe(canvas);
      void document.fonts?.ready.then(measure);
    };
    if (flipRef) arm();

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
      field.destroy();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
