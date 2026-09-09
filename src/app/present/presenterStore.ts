'use client';

import { useSyncExternalStore } from 'react';

import { DIRECTIONS } from '@/lib/directions';

/**
 * Presenter state that lives outside the stage tree: the position the
 * scroll has reached (slide and beat) and the direction loaded in the
 * prototype viewer. The sidebar rows mark themselves from it and the
 * toolbar tools rate and annotate the direction it names. Plain module
 * stores read through useSyncExternalStore, like reviewStore.
 */
type Store<T> = {
  get: () => T;
  set: (next: T) => void;
  subscribe: (listener: () => void) => () => void;
};

function createStore<T>(initial: T): Store<T> {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set: (next) => {
      if (Object.is(next, value)) return;
      value = next;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export type PresenterPosition = {
  /** the slide the scroll sits on */
  slide: number;
  /** the beat inside it, or -1 for a slide without beats */
  sub: number;
};

const START: PresenterPosition = { slide: 0, sub: -1 };
const position = createStore<PresenterPosition>(START);
const direction = createStore(0);

export function usePresenterPosition(): PresenterPosition {
  return useSyncExternalStore(position.subscribe, position.get, () => START);
}

export function setPresenterPosition(next: PresenterPosition): void {
  const current = position.get();
  if (current.slide === next.slide && current.sub === next.sub) return;
  position.set(next);
}

/** The direction loaded in the prototype viewer, as its position in DIRECTIONS. */
export function useDirectionIndex(): number {
  return useSyncExternalStore(direction.subscribe, direction.get, () => 0);
}

export function setDirectionIndex(index: number): void {
  const count = DIRECTIONS.length;
  direction.set(((index % count) + count) % count);
}

/**
 * Loads a direction in the viewer and scrolls the stage to it. One event for
 * every caller (the sidebar rows, the verdict cards, the detail tiles);
 * PrototypeViewer listens and owns the scroll.
 */
export function jumpToDirection(slug: string): void {
  window.dispatchEvent(new CustomEvent('pr:goto', { detail: slug }));
}
