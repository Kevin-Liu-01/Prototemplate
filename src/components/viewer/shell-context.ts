'use client';

import { createContext, useContext } from 'react';

import type { ShellItem, ShellKeys, ShellMode } from '@/lib/shell-data';

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
  keys: ShellKeys;
  /** the word for one item in the toasts and the help rows: `slide`, `direction` */
  noun: string;
  /** every item across sections, in order */
  items: readonly ShellItem[];
  mode: ShellMode;
  sidebarOpen: boolean;
  panelOpen: boolean;
  helpOpen: boolean;
  present: boolean;
  /** window.innerWidth at or below 900 */
  narrow: boolean;
  /** the active item id */
  active: string;
  /** position of the active item in items, or -1 */
  index: number;
  /** items.length */
  total: number;
  stageSize: StageSize;
  /** the index panel's box width, measured by the same observer; what an open panel takes from the stage */
  panelWidth: number;
  setMode: (mode: ShellMode) => void;
  setSidebar: (open: boolean) => void;
  setPanel: (open: boolean) => void;
  setHelp: (open: boolean) => void;
  setPresent: (on: boolean) => void;
  /** make an item active: updates the hash, scrolls its thumb into view, calls onSelect */
  select: (id: string) => void;
  /** move the active item by delta, clamped to the first and last item */
  step: (delta: number) => void;
  /** show the toast for 1400ms */
  say: (msg: string) => void;
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
