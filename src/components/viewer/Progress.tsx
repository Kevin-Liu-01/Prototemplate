'use client';

import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

import { usePtShell } from '@/components/viewer/shell-context';
import { useMountEffect } from '@/lib/use-mount-effect';

import './Progress.css';

/**
 * The 2px hairline under the stage. On paged routes it fills to
 * (index + 1) / total, written as an inline transform so the server render
 * already carries it. On flow routes it follows the scroll position of the
 * scrolling box inside .pt-stagewrap, read from one passive listener on the
 * document in the capture phase (scroll events do not bubble), so the flow
 * sheet does not have to hand its element up to the shell. The listener is
 * always attached because a route can change tables with its mode (the
 * gallery pages in the slide and scrolls in the book); it reads the key
 * table through a ref at event time and returns at once on a paged route,
 * where the book and the grid scroll but the value would be discarded. The
 * rest is coalesced to one animation frame and written straight to the
 * fill's transform, so a scroll never renders React (directive 7.5). Where
 * the browser has scroll timelines, the first scroll of a box binds the
 * fill to it (a transform animation on a ScrollTimeline of that box), and
 * the browser moves the fill from then on: later scroll events of the same
 * box read nothing, so no scroll forces a style or layout pass. Elsewhere
 * the scroll range (scrollHeight less clientHeight) of each box is cached
 * and refreshed by a ResizeObserver on the box and its direct children (for
 * a reading page, .pt-flow-col), so a scroll event reads only scrollTop. A
 * paged state drops the binding, so its inline fraction shows. A value prop
 * overrides both for routes that measure their own progress.
 */

/** The scroll timeline constructor, where the browser has one (TypeScript's DOM library does not declare it yet). */
type ScrollTimelineCtor = new (options: { source: Element; axis?: 'block' | 'inline' }) => AnimationTimeline;

function scrollTimeline(): ScrollTimelineCtor | null {
  const ctor = (globalThis as { ScrollTimeline?: ScrollTimelineCtor }).ScrollTimeline;
  return typeof ctor === 'function' ? ctor : null;
}
export type ProgressProps = {
  /** 0 to 1; replaces the shell-derived fraction */
  value?: number;
};

function clamp(fraction: number): number {
  if (!Number.isFinite(fraction)) return 0;
  return Math.min(1, Math.max(0, fraction));
}

function scaleOf(fraction: number): string {
  return `scaleX(${Math.round(fraction * 10000) / 10000})`;
}

export function Progress({ value }: ProgressProps) {
  const shell = usePtShell();
  const fill = useRef<HTMLElement>(null);

  const paged = shell.total > 0 && shell.index >= 0 ? (shell.index + 1) / shell.total : 0;
  /* the fraction React owns: a value, or the paged place; null while a flow route's scroll owns it */
  const fixed = value !== undefined ? clamp(value) : shell.keys === 'paged' ? clamp(paged) : null;

  /* the scroll listener reads these at event time */
  const fixedRef = useRef(fixed);
  fixedRef.current = fixed;
  /* the fill's binding to a scroll box, dropped when React owns the fraction */
  const unbindRef = useRef<() => void>(() => {});
  useGSAP(
    () => {
      if (fixed !== null) unbindRef.current();
    },
    { dependencies: [fixed !== null] }
  );

  useMountEffect(() => {
    let frame = 0;
    let next = 0;
    /* each scroll box's range, kept current by one observer */
    const ranges = new WeakMap<Element, number>();
    const measure = (el: HTMLElement) => ranges.set(el, el.scrollHeight - el.clientHeight);
    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver((entries) => {
            const seen = new Set<HTMLElement>();
            for (const entry of entries) {
              const target = entry.target;
              const owner = ranges.has(target) ? target : target.parentElement;
              if (owner instanceof HTMLElement && ranges.has(owner) && !seen.has(owner)) {
                seen.add(owner);
                measure(owner);
              }
            }
          });
    const watch = (el: HTMLElement) => {
      measure(el);
      if (!observer) return;
      observer.observe(el);
      for (const child of el.children) observer.observe(child);
    };
    const paint = () => {
      frame = 0;
      const el = fill.current;
      if (el && fixedRef.current === null) el.style.transform = scaleOf(next);
    };
    const Timeline = scrollTimeline();
    let bound: { box: Element; anim: Animation } | null = null;
    const unbind = () => {
      bound?.anim.cancel();
      bound = null;
    };
    unbindRef.current = unbind;
    const onScroll = (event: Event) => {
      if (fixedRef.current !== null) return;
      const box = event.target;
      if (!(box instanceof HTMLElement)) return;
      if (bound?.box === box) return;
      if (!box.closest('.pt-stagewrap') || box.closest('.pt-panel')) return;
      const el = fill.current;
      if (Timeline && el) {
        unbind();
        const anim = el.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], {
          timeline: new Timeline({ source: box, axis: 'block' }),
          fill: 'both',
        });
        bound = { box, anim };
        return;
      }
      if (!ranges.has(box)) watch(box);
      const range = ranges.get(box) ?? 0;
      next = range > 0 ? clamp(box.scrollTop / range) : 0;
      if (!frame) frame = requestAnimationFrame(paint);
    };
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    return () => {
      document.removeEventListener('scroll', onScroll, { capture: true });
      unbind();
      observer?.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  });

  /* a flow route leaves the transform to the listener: React writes nothing,
     so a re-render of the shell never resets a scroll position it did not
     measure; the switch back from paged to flow starts the fill at 0 and the
     sheet's first scroll (its landing included) corrects it */
  return (
    <div className='pt-progress' aria-hidden='true'>
      <i ref={fill} style={fixed !== null ? { transform: scaleOf(fixed) } : undefined} />
    </div>
  );
}
