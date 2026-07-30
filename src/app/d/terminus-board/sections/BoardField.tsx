'use client';

import { useGSAP } from '@gsap/react';
import type { RefObject } from 'react';
import { useRef } from 'react';

import {
  BOARD_DARK,
  BOARD_LIGHT,
  createBoardField,
  type BoardFieldHandle,
  type BoardParams,
  type GapRect,
} from '../lib/board-field';

export type BoardFieldProps = {
  className?: string;
  params?: Partial<BoardParams>;
  /**
   * Element the board's structural gap hugs. Its box (relative to the canvas)
   * is measured and the grid rows behind it are simply never drawn, so the
   * composition — type in the board's own gap — holds at every viewport.
   */
  gapRef?: RefObject<HTMLElement | null>;
  /**
   * Solid furniture standing over the canvas (the departures rail): their
   * rows are masked the same way, so the field never spends an announcement
   * on cells nobody can see.
   */
  maskRefs?: RefObject<HTMLElement | null>[];
};

/**
 * A canvas running the terminus board field (per-mount CPU loop — see
 * ../lib/board-field.ts). Renders nothing but the canvas; callers position
 * it. The ink set follows the page theme live via the data-theme attribute
 * the theme toggle stamps on <html>; the canvas ground stays transparent so
 * the page's paper — light or dark — is always the board's ground.
 */
export default function BoardField({ className, params, gapRef, maskRefs }: BoardFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const doc = document.documentElement;
    const inkFor = () => (doc.getAttribute('data-theme') === 'dark' ? BOARD_DARK : BOARD_LIGHT);
    const field: BoardFieldHandle | null = createBoardField(canvas, { params, ink: inkFor() });
    if (!field) return;

    const theme = new MutationObserver(() => field.setInk(inkFor()));
    theme.observe(doc, { attributes: true, attributeFilter: ['data-theme'] });

    const maskEls = () =>
      [gapRef?.current ?? null, ...(maskRefs ?? []).map((ref) => ref.current)].filter(
        (el): el is HTMLElement => el !== null
      );

    const measure = () => {
      const own = canvas.getBoundingClientRect();
      if (own.width < 2) return;
      const rects: GapRect[] = [];
      const gapEl = gapRef?.current;
      for (const el of maskEls()) {
        const box = el.getBoundingClientRect();
        if (box.width < 2) continue;
        rects.push({
          x: box.left - own.left,
          y: box.top - own.top,
          width: box.width,
          height: box.height,
          /* furniture masks hug their own edge; only the type gap gets the moat */
          ...(el === gapEl ? {} : { pad: 2 }),
        });
      }
      if (rects.length) field.setMasks(rects);
    };

    let observer: ResizeObserver | undefined;
    let raf = 0;
    const arm = () => {
      const gapEl = gapRef?.current;
      /* The gap target can be a later sibling whose ref is not attached yet
         when this layout effect runs — wait a frame for it. */
      if (!gapEl) {
        raf = requestAnimationFrame(arm);
        return;
      }
      measure();
      /* Re-measure when any box changes: font load, resize, wrap. */
      observer = new ResizeObserver(measure);
      for (const el of maskEls()) observer.observe(el);
      observer.observe(canvas);
      void document.fonts?.ready.then(measure);
    };
    if (gapRef) arm();

    return () => {
      cancelAnimationFrame(raf);
      theme.disconnect();
      observer?.disconnect();
      field.destroy();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
