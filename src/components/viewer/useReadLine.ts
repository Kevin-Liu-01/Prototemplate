'use client';

import type { MouseEvent, RefObject } from 'react';
import { useRef } from 'react';

import { scrollBehavior } from '@/lib/reduced-motion';
import { useLayoutWork } from '@/lib/use-layout-work';
import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * The read line. An element that crosses the top tenth of the sheet is the
 * one being read; among several, the lowest on the page wins, so the
 * element whose top has just passed under the line is the active one, and
 * an element scrolled to the top of the sheet (a hash landing, a
 * selection) is the one the spy confirms. A band in the middle of the
 * sheet cannot do this: a short row parked at the top never reaches it, a
 * row further down wins instead, and the hash never round-trips.
 */
const READ_LINE = '0px 0px -90% 0px';

/** How long the spy waits for a jump to reach its element before it reads the page again. */
const SETTLE_MS = 1200;

type ReadLineOptions = {
  /** the sheet's scroll region; the read line sits at its top */
  rootRef: RefObject<HTMLElement | null>;
  /** the elements the spy watches, in page order, collected inside the scroll region on mount */
  selector: string;
  /** the marked item: the shell's active id, or a route's own state */
  active: string;
  /** marks an item: the shell's select, or a route's own setter */
  select: (id: string) => void;
  /** the shell's ready flag: with smooth jumps, a change that arrives before the shell has applied the hash is a cut */
  ready?: boolean;
  /** jumps after the landing scroll smoothly (a cut under reduced motion); without it every jump is a cut */
  smooth?: boolean;
  /** the id a watched element names; by default its data-id. An empty id names no item and clears the mark */
  idOf?: (el: HTMLElement) => string | undefined;
  /** the element an id jumps to; by default the watched element whose data-id is the id */
  find?: (id: string) => HTMLElement | null;
  /** the id the spy marks while no watched element crosses the line; without it the last mark stays */
  none?: string;
  /** an id with no element of its own (a page's own row) returns the sheet to the top */
  topWhenMissing?: boolean;
  /** a change of `active` that the spy did not make jumps to its element; false when the route jumps itself */
  follow?: boolean;
};

type ReadLine = {
  /** jumps to an id's element; a re-click on the active row in the list calls it */
  jump: (id: string) => void;
  /** a contents link: jumps when the id is already marked, else marks it and the follow jumps */
  onContents: (event: MouseEvent<HTMLAnchorElement>, id: string) => void;
  /** scrolls an element to the read line and mutes the spy until `settle` (the element by default) reaches it */
  scrollTo: (el: HTMLElement | null, behavior: ScrollBehavior, settle?: Element | null) => void;
};

function dataId(el: HTMLElement): string | undefined {
  return el.dataset.id || undefined;
}

/**
 * The scroll spy of a book in a flow sheet. An IntersectionObserver on the
 * scroll region marks the lowest watched element crossing the read line
 * through `select`, so the list and the hash follow the reader. A jump
 * mutes the spy until its element arrives, the scroll ends or SETTLE_MS
 * passes, so the elements the scroll passes are never marked and a jump
 * that ends short of its element (the last rows cannot reach the line)
 * keeps the chosen mark. A change of `active` from anywhere else (the
 * list, the keys, the hash on landing) jumps to its element; a change the
 * spy made is left alone.
 */
export function useReadLine({
  rootRef,
  selector,
  active,
  select,
  ready = false,
  smooth = false,
  idOf = dataId,
  find,
  none,
  topWhenMissing = false,
  follow = true,
}: ReadLineOptions): ReadLine {
  /* the observer reads the latest values through refs; the assignments run
     every render so the mount-time listener never sees a stale closure */
  const activeRef = useRef(active);
  activeRef.current = active;
  const selectRef = useRef(select);
  selectRef.current = select;
  const idOfRef = useRef(idOf);
  idOfRef.current = idOf;

  /** the active id the follow last saw; null before its first run */
  const lastActive = useRef<string | null>(null);
  /** true once the shell has applied the hash: from here on a smooth route's jumps move */
  const landed = useRef(false);
  /** the id the spy just marked, so the follow leaves the reader's scroll alone */
  const fromScroll = useRef<string | null>(null);
  /** the element a jump is heading for; the spy waits for it */
  const settling = useRef<Element | null>(null);
  const settleTimer = useRef(0);

  const scrollTo = (el: HTMLElement | null, behavior: ScrollBehavior, settle: Element | null = el) => {
    if (!el) return;
    settling.current = settle;
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      settling.current = null;
    }, SETTLE_MS);
    el.scrollIntoView({ block: 'start', behavior });
  };

  const elementFor = (id: string): HTMLElement | null =>
    find ? find(id) : (rootRef.current?.querySelector<HTMLElement>(`${selector}[data-id="${CSS.escape(id)}"]`) ?? null);

  const go = (id: string, behavior: ScrollBehavior) => {
    const el = elementFor(id);
    if (!el && topWhenMissing) {
      rootRef.current?.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }
    scrollTo(el, behavior);
  };

  const jump = (id: string) => go(id, smooth ? scrollBehavior() : 'auto');

  useMountEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;
    const watched = Array.from(root.querySelectorAll<HTMLElement>(selector));
    const order = new Map<Element, number>(watched.map((el, i) => [el, i]));
    const visible = new Set<Element>();
    const lowest = (): HTMLElement | null => {
      let best: HTMLElement | null = null;
      let rank = -1;
      for (const el of visible) {
        const i = order.get(el) ?? -1;
        if (i > rank) {
          rank = i;
          best = el as HTMLElement;
        }
      }
      return best;
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        const best = lowest();
        if (settling.current) {
          if (best !== settling.current) return;
          settling.current = null;
          window.clearTimeout(settleTimer.current);
        }
        const id = best ? idOfRef.current(best) : none;
        if (id === undefined || id === activeRef.current) return;
        fromScroll.current = id;
        selectRef.current(id);
      },
      { root, rootMargin: READ_LINE, threshold: 0 }
    );
    watched.forEach((el) => observer.observe(el));
    const onScrollEnd = () => {
      if (!settling.current) return;
      settling.current = null;
      window.clearTimeout(settleTimer.current);
    };
    root.addEventListener('scrollend', onScrollEnd);
    return () => {
      observer.disconnect();
      root.removeEventListener('scrollend', onScrollEnd);
      window.clearTimeout(settleTimer.current);
    };
  });

  /* the follow: the first run is the mount; the landing on a deep link is a
     cut, and a smooth route's later jumps move */
  useLayoutWork(
    () => {
      const wasLanded = landed.current;
      if (ready) landed.current = true;
      const previous = lastActive.current;
      lastActive.current = active;
      if (!follow || previous === null || previous === active) return;
      if (fromScroll.current === active) {
        fromScroll.current = null;
        return;
      }
      go(active, !smooth ? 'auto' : wasLanded ? scrollBehavior() : 'instant');
    },
    { dependencies: [active, ready] }
  );

  const onContents = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    if (id === activeRef.current) jump(id);
    else select(id);
  };

  return { jump, onContents, scrollTo };
}
