'use client';

import { useRef } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

import './Sidebar.css';

/**
 * The nodes a mini clones: the 1600x900 slide, and the sheet frame (rails
 * and crosses) drawn under it when the stage has one. Resolved on the
 * client at mount, so the caller may query the DOM freely.
 */
export type MiniSource = { slide: Element | null; frame?: Element | null };

export type ThumbMiniProps = {
  /** Called on mount; called once more on the next frame if the slide is not in the DOM yet. */
  resolve: () => MiniSource;
};

const SHEET_W = 1600;

/** A deep copy with every id removed, so the page keeps one of each. */
function cleanClone(source: Element): Element {
  const clone = source.cloneNode(true) as Element;
  clone.removeAttribute('id');
  clone.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
  return clone;
}

/* One ResizeObserver serves every frame on the page. A frame's callback is
   looked up by target, so 52 thumbs in the list or the grid, or 52 pages in
   the book, cost one observer between them instead of one each. */
const resizeCallbacks = new WeakMap<Element, () => void>();
let sharedObserver: ResizeObserver | null = null;

function observeResize(target: Element, callback: () => void): () => void {
  if (typeof ResizeObserver === 'undefined') return () => {};
  if (!sharedObserver) {
    sharedObserver = new ResizeObserver((entries) => {
      for (const entry of entries) resizeCallbacks.get(entry.target)?.();
    });
  }
  resizeCallbacks.set(target, callback);
  sharedObserver.observe(target);
  return () => {
    resizeCallbacks.delete(target);
    sharedObserver?.unobserve(target);
  };
}

/**
 * A live copy of a slide, scaled into whatever frame holds it: .pt-thumb-frame
 * in the list and grid, .pt-page-frame in the book. The clone carries
 * .pt-slides so the authored slide CSS and the unprefixed tokens apply, and
 * --k = (frameWidth - 2) / 1600 is recomputed from the frame's width, so the
 * sidebar overlay, the grid columns and the book width all rescale it. The
 * copy is inert and hidden from assistive tech: the real slide on the stage
 * is the one that speaks.
 *
 * The cleanup cancels the pending fill and stops watching the frame. It is
 * safe under StrictMode because useMountEffect cancels the deferred cleanup
 * on the simulated remount, so the clone made on mount stays.
 */
export function ThumbMini({ resolve }: ThumbMiniProps) {
  const ref = useRef<HTMLDivElement>(null);

  useMountEffect(() => {
    const mini = ref.current;
    const host = mini?.parentElement;
    if (!mini || !host) return;

    const fill = (): boolean => {
      const { slide, frame } = resolve();
      if (!slide) return false;
      if (frame) mini.appendChild(cleanClone(frame));
      const copy = cleanClone(slide);
      copy.classList.add('is-on');
      mini.appendChild(copy);
      return true;
    };
    let frame = 0;
    if (!fill()) {
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (mini.isConnected && !mini.firstChild) fill();
      });
    }

    const scale = () => {
      const width = host.clientWidth;
      if (width > 0) mini.style.setProperty('--k', String((width - 2) / SHEET_W));
    };
    scale();
    const unobserve = observeResize(host, scale);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      unobserve();
    };
  });

  return <div ref={ref} className='pt-mini pt-slides' aria-hidden='true' inert />;
}
