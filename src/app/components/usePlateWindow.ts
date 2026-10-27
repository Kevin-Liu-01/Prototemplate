'use client';

import { useState } from 'react';
import type { RefObject } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

/** A row this close to the sheet's viewport mounts its plate: one screen above it and one below. */
const NEAR = '100% 0px';
/** A row further than this unmounts its plate: two screens away. */
const FAR = '200% 0px';
/** How long the sheet stays still before rows mount, so a jump's scroll never moves its own target. */
const IDLE_MS = 140;

export type PlateWindow = {
  /** the rows whose plate runs */
  live: ReadonlySet<string>;
  /** the height each row measured when its plate last unmounted, at the sheet's current width */
  kept: ReadonlyMap<string, number>;
};

const EMPTY: PlateWindow = { live: new Set(), kept: new Map() };

function sameSet(a: ReadonlySet<string>, b: ReadonlySet<string>): boolean {
  return a.size === b.size && [...a].every((id) => b.has(id));
}

/**
 * Which plates run on /components. Every slot ([data-plate] inside the
 * sheet's scroll region) is watched at two margins: a slot within one
 * screen of the viewport mounts its plate once the sheet has been still
 * for IDLE_MS, and a slot more than two screens away unmounts it, so only
 * a handful run at once and each engine's teardown frees its context. A
 * slot that unmounts keeps the height it measured, until the sheet's width
 * changes.
 *
 * The sheet holds its place as plates resize: when a slot above the
 * viewport's top changes height (a plate mounts, or its content settles),
 * the scroll moves by the same amount, so the row being read stays put and
 * a jump lands on its row. Browser scroll anchoring is off on the book
 * (components.css), so the two never both correct.
 */
export function usePlateWindow(rootRef: RefObject<HTMLElement | null>): PlateWindow {
  const [view, setView] = useState<PlateWindow>(EMPTY);

  useMountEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === 'undefined' || typeof ResizeObserver === 'undefined') return;
    const slots = Array.from(root.querySelectorAll<HTMLElement>('[data-plate]'));
    const byId = new Map(slots.map((el) => [el.dataset.plate ?? '', el]));
    const near = new Set<string>();
    const inFar = new Set<string>();
    let state = EMPTY;
    let timer = 0;
    let lastScroll = Number.NEGATIVE_INFINITY;

    const commit = (next: PlateWindow) => {
      state = next;
      setView(next);
    };

    const apply = () => {
      const still = performance.now() - lastScroll >= IDLE_MS;
      const live = new Set<string>();
      let kept: Map<string, number> | null = null;
      for (const id of state.live) {
        if (inFar.has(id)) {
          live.add(id);
        } else {
          kept ??= new Map(state.kept);
          kept.set(id, byId.get(id)?.getBoundingClientRect().height ?? 0);
        }
      }
      if (still) for (const id of near) live.add(id);
      if (!kept && sameSet(live, state.live)) return;
      commit({ live, kept: kept ?? state.kept });
    };

    const watch = (set: Set<string>, rootMargin: string) =>
      new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const id = (entry.target as HTMLElement).dataset.plate ?? '';
            if (entry.isIntersecting) set.add(id);
            else set.delete(id);
          }
          apply();
        },
        { root, rootMargin }
      );
    const nearWatch = watch(near, NEAR);
    const farWatch = watch(inFar, FAR);

    const onScroll = () => {
      lastScroll = performance.now();
      window.clearTimeout(timer);
      timer = window.setTimeout(apply, IDLE_MS);
    };

    /* the anchor: a resize above the viewport's top moves the scroll by the
       same amount. The entries arrive in page order, so a slot's top before
       this batch is its top now less the growth already counted above it. */
    const heights = new Map<Element, number>();
    const anchor = new ResizeObserver((entries) => {
      const top = root.getBoundingClientRect().top;
      let shift = 0;
      for (const entry of entries) {
        const height = entry.borderBoxSize[0]?.blockSize ?? entry.target.getBoundingClientRect().height;
        const before = heights.get(entry.target);
        heights.set(entry.target, height);
        if (before !== undefined && entry.target.getBoundingClientRect().top - shift < top) shift += height - before;
      }
      if (shift !== 0) root.scrollTop += shift;
    });

    /* a new width changes every plate's height: the kept heights go */
    let width = root.clientWidth;
    const resize = new ResizeObserver(() => {
      if (root.clientWidth === width) return;
      width = root.clientWidth;
      if (state.kept.size > 0) commit({ live: state.live, kept: new Map() });
    });

    for (const el of slots) {
      nearWatch.observe(el);
      farWatch.observe(el);
      anchor.observe(el);
    }
    resize.observe(root);
    root.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      nearWatch.disconnect();
      farWatch.disconnect();
      anchor.disconnect();
      resize.disconnect();
      root.removeEventListener('scroll', onScroll);
      window.clearTimeout(timer);
    };
  });

  return view;
}
