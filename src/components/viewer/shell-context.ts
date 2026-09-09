'use client';

import { createContext, useContext } from 'react';

import type { ShellDensity, ShellItem, ShellKeys, ShellMode } from '@/lib/shell-data';

/** The stage box, published by ViewerShell's ResizeObserver on .pt-stagewrap. */
export type StageSize = { width: number; height: number };

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
  density: ShellDensity;
  sidebarOpen: boolean;
  panelOpen: boolean;
  helpOpen: boolean;
  present: boolean;
  /** window.innerWidth at or below 900 */
  narrow: boolean;
  /** the active item id; empty when nothing is marked (the gallery's book at its top) */
  active: string;
  /** position of the active item in paged, or -1 */
  index: number;
  /** paged.length */
  total: number;
  /** a word before the count, when the count needs one: `Left` on /compare */
  countLabel?: string;
  stageSize: StageSize;
  /** the index panel's box width, measured by the same observer; what an open panel takes from the stage */
  panelWidth: number;
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
