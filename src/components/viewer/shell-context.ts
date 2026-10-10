'use client';

import { createContext, useContext, useSyncExternalStore } from 'react';

import type { ShellDensity, ShellItem, ShellKeys, ShellMode } from '@/lib/shell-data';

/** The stage box, published by ViewerShell's ResizeObserver on .pt-stagewrap. */
export type StageSize = { width: number; height: number };

/**
 * The stage geometry. It lives outside React state, in a store the shell's
 * ResizeObserver writes on every frame of the sidebar's 220ms width
 * transition and on every window resize; only its readers (the fixed sheet
 * and the compare rig, through usePtStage) subscribe, so a tick re-renders
 * them alone and never the shell, the sidebar rows, the toolbar, the panel
 * or the book (directive 7.5).
 */
export type StageState = { stageSize: StageSize };

/** The stage box outside React state: the ResizeObserver writes it on every frame of the column's transition, and only its readers (the fixed sheet, the compare rig) render. */
export type StageStore = { get: () => StageSize; set: (next: StageSize) => void; subscribe: (fn: () => void) => () => void };

export function createStageStore(): StageStore {
  let size: StageSize = { width: 0, height: 0 };
  const fns = new Set<() => void>();
  return {
    get: () => size,
    set: (next) => {
      if (next.width === size.width && next.height === size.height) return;
      size = next;
      for (const fn of fns) fn();
    },
    subscribe: (fn) => {
      fns.add(fn);
      return () => fns.delete(fn);
    },
  };
}

/* the server's and the first client frame's stage: nothing measured yet */
const NO_STAGE: StageSize = { width: 0, height: 0 };

/** Which way the last paged move went; the slide-change animation reads it. */
export type ShellDir = 'next' | 'prev';

/**
 * A mode change in flight (directive 7.4): the view that is leaving and the
 * one that is entering. Set for the length of the cross-fade and null at
 * rest. `mode` already names the entering view while this is set.
 */
export type ShellTransition = { from: ShellMode; to: ShellMode };

/**
 * Everything ViewerShell publishes to its children and to route code.
 * Read it with usePtShell(). The route descriptors (id, modes, keys, items)
 * mirror the shell's props so a child never needs them passed twice.
 */
export type ShellState = {
  /** the shell's id prop; the storage namespace (`gt-shell-mode:<id>`) */
  id: string;
  /** the modes the route offers; the first is the default */
  modes: readonly ShellMode[];
  /** the key table for the current mode */
  keys: ShellKeys;
  /** the word for one item in the toasts and the help rows: `slide`, `direction` */
  noun: string;
  /** every selectable item across sections, in order */
  items: readonly ShellItem[];
  /** the items the count and the arrows run over: every item of every paged section */
  paged: readonly ShellItem[];
  mode: ShellMode;
  /**
   * The mode change being animated, or null at rest; the mode field already
   * names its destination. Optional, like the other two motion fields, so a
   * state assembled outside ViewerShell (DirectionCorner's small states for
   * the list, the panel and the help card) can leave motion out: read an
   * absent value as null.
   */
  transition?: ShellTransition | null;
  density: ShellDensity;
  /** the list toggle's state: what the reader asked for, and what the toolbar's List button shows pressed */
  sidebarOpen: boolean;
  /**
   * True while the list should be in the DOM: it follows sidebarOpen at once
   * when the list opens and lags it by the sidebar duration (--pt-dur-sb,
   * 220ms) when the list closes or present mode begins, so the content can
   * fade out while the column narrows (directive 7.4). Sidebar reads this
   * for its hidden state (`sidebarShown ?? (sidebarOpen && !present)` when
   * it may be absent); sidebarOpen stays the pressed state.
   */
  sidebarShown?: boolean;
  panelOpen: boolean;
  helpOpen: boolean;
  present: boolean;
  /** window.innerWidth at or below 900, or a phone on its side (ViewerShell.tsx PHONE_SIDEWAYS) */
  narrow: boolean;
  /** the active item id; empty when nothing is marked (the gallery's book at its top) */
  active: string;
  /** position of the active item in paged, or -1 */
  index: number;
  /** which way the last paged move went; `next` until the first move backwards, and when absent */
  dir?: ShellDir;
  /** paged.length */
  total: number;
  /** a word before the count, when the count needs one: `Left` on /compare */
  countLabel?: string;
  /**
   * False until the shell's mount effect has applied the saved state and the
   * hash; the sidebar spends its one centering scroll only after that, so a
   * deep link lands its row in the middle of the list instead of the SSR
   * default row taking it. Optional so a state assembled outside ViewerShell
   * (DirectionCorner) can leave it out: read an absent value as true.
   */
  ready?: boolean;
  setMode: (mode: ShellMode) => void;
  setDensity: (density: ShellDensity) => void;
  setSidebar: (open: boolean) => void;
  setPanel: (open: boolean) => void;
  setHelp: (open: boolean) => void;
  setPresent: (on: boolean) => void;
  /** make an item active: updates the hash, scrolls its row into view, calls onSelect; an empty id clears the mark */
  select: (id: string) => void;
  /** move the active item by delta through the paged items, clamped to the first and last */
  step: (delta: number) => void;
  /** show the toast for 1400ms, or for `hold` milliseconds */
  say: (msg: string, hold?: number) => void;
};

/** What ViewerShell passes to the provider. Null outside a shell. */
export type ShellProviderValue = ShellState | null;

export const ShellContext = createContext<ShellProviderValue>(null);

/** Shell state for any component under ViewerShell. Throws outside one. */
export function usePtShell(): ShellState {
  const value = useContext(ShellContext);
  if (!value) throw new Error('usePtShell must be called inside ViewerShell');
  return value;
}

export const StageContext = createContext<StageStore | null>(null);

/** The stage box for the fixed sheet and the compare rig. Throws outside ViewerShell. */
export function usePtStage(): StageState {
  const store = useContext(StageContext);
  if (!store) throw new Error('usePtStage must be called inside ViewerShell');
  return { stageSize: useSyncExternalStore(store.subscribe, store.get, () => NO_STAGE) };
}
