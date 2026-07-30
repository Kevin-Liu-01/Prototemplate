'use client';

import { useSyncExternalStore } from 'react';

export type PrototypeReview = {
  /** 0 = unrated, 1–5 stars. */
  rating: number;
  note: string;
};

type ReviewMap = Record<string, PrototypeReview>;

const STORAGE_KEY = 'gt-presenter-review:v1';
const EMPTY: ReviewMap = {};

let cache: ReviewMap = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load(): ReviewMap {
  if (!loaded) {
    loaded = true;
    try {
      cache = JSON.parse(
        window.localStorage.getItem(STORAGE_KEY) ?? '{}'
      ) as ReviewMap;
    } catch {
      cache = {};
    }
  }
  return cache;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setReview(slug: string, patch: Partial<PrototypeReview>) {
  const current = load()[slug] ?? { rating: 0, note: '' };
  cache = { ...cache, [slug]: { ...current, ...patch } };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // Private-mode quota failures lose persistence but not the session state.
  }
  listeners.forEach((l) => l());
}

/** Live map of slug → review, shared by the dock, the roll, and the scoreboard. */
export function useReviews(): ReviewMap {
  return useSyncExternalStore(subscribe, load, () => EMPTY);
}
