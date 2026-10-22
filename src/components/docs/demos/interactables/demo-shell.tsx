'use client';

import { useRef, useState, useSyncExternalStore } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';

import { ShellContext } from '@/components/viewer/shell-context';
import type { ShellDir, ShellState } from '@/components/viewer/shell-context';
import { toggleTheme } from '@/components/viewer/ThemeButton';
import { Toast, useToast } from '@/components/viewer/Toast';
import type { ToastState } from '@/components/viewer/Toast';
import type { ShellItem, ShellKeys, ShellMode } from '@/lib/shell-data';

/**
 * A small stand-in for ViewerShell, so the shell's own components (the
 * toolbar, the index panel, the help card, the install field) mount on a
 * docs page. It publishes the same ShellState through ShellContext, keeps
 * the mode, the active item and the two panels in React state, and hands
 * say() to a Toast drawn inside the plate. The viewport it renders is a
 * containing block for fixed children, so the search palette, the help
 * card and the toast open inside the plate and never over the docs page.
 * Keys act only while focus is inside the viewport: the docs page keeps
 * Cmd K and every other key of its own.
 */

/** ViewerShell's narrow test: at or below 900px, or a phone on its side. */
const NARROW_QUERY = '(max-width: 900px), (pointer: coarse) and (max-height: 500px)';

function subscribeNarrow(onChange: () => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const query = window.matchMedia(NARROW_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function readNarrow(): boolean {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.(NARROW_QUERY).matches);
}

export type DemoShellOptions = {
  /** the storage namespace ViewerShell would use; nothing is stored here */
  id: string;
  modes?: readonly ShellMode[];
  keys?: ShellKeys;
  noun?: string;
  items?: readonly ShellItem[];
  /** the item marked on mount; none when absent */
  start?: string;
  /** the list column starts open, as it does on a first visit at desktop width */
  listOpen?: boolean;
  /** what the toast says when a control asks for a part this plate leaves out */
  missing?: { sidebar?: string; present?: string };
};

export type DemoShell = { state: ShellState; toast: ToastState };

const NO_ITEMS: readonly ShellItem[] = [];
const FLOW_MODES: readonly ShellMode[] = ['book'];

/** The shell state a plate publishes, with its toast. */
export function useDemoShell({
  id,
  modes = FLOW_MODES,
  keys = 'flow',
  noun = 'page',
  items = NO_ITEMS,
  start = '',
  listOpen = false,
  missing,
}: DemoShellOptions): DemoShell {
  const toast = useToast();
  const narrow = useSyncExternalStore(subscribeNarrow, readNarrow, () => false);
  const [picked, setMode] = useState<ShellMode>(modes[0] ?? 'book');
  /* a route that drops the picked view falls back to its first */
  const mode = modes.includes(picked) ? picked : (modes[0] ?? 'book');
  const [active, setActive] = useState(start);
  const [dir, setDir] = useState<ShellDir>('next');
  const [panelOpen, setPanel] = useState(false);
  const [helpOpen, setHelp] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(listOpen);
  const activeRef = useRef(active);
  activeRef.current = active;

  const index = items.findIndex((item) => item.id === active);

  const select = (next: string) => {
    if (next && !items.some((item) => item.id === next)) return;
    const from = items.findIndex((item) => item.id === activeRef.current);
    const to = items.findIndex((item) => item.id === next);
    if (from >= 0 && to >= 0 && from !== to) setDir(to > from ? 'next' : 'prev');
    activeRef.current = next;
    setActive(next);
  };

  const step = (delta: number) => {
    if (items.length === 0) return;
    const at = items.findIndex((item) => item.id === activeRef.current);
    const next = at < 0 ? (delta > 0 ? 0 : items.length - 1) : Math.max(0, Math.min(items.length - 1, at + delta));
    const target = items[next];
    if (target && target.id !== activeRef.current) select(target.id);
  };

  const state: ShellState = {
    id,
    modes,
    keys,
    noun,
    items,
    paged: items,
    mode,
    transition: null,
    density: 'outline',
    sidebarOpen,
    sidebarShown: false,
    panelOpen,
    helpOpen,
    present: false,
    narrow,
    active,
    index,
    dir,
    total: items.length,
    ready: true,
    setMode,
    setDensity: () => {},
    setSidebar: (open) => {
      setSidebarOpen(open);
      if (open && missing?.sidebar) toast.say(missing.sidebar);
    },
    setPanel,
    setHelp,
    setPresent: (on) => {
      if (on && missing?.present) toast.say(missing.present);
    },
    select,
    step,
    say: toast.say,
  };
  return { state, toast };
}

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
}

export type DemoKeys = {
  /** ? opens and closes the help card */
  help?: boolean;
  /** R opens and closes the index panel */
  index?: boolean;
  /** the arrows, Home and End move the active item; G and B pick the grid and the book */
  paging?: boolean;
  /** D flips the page theme, as the shell's D does */
  theme?: boolean;
  /** / presses the plate's own search trigger */
  search?: boolean;
};

/**
 * The shell's key ladder, scoped to the plate: the handler sits on the
 * viewport, so a key acts only while focus is inside it. Modified keys
 * pass through untouched (Cmd K stays the docs search), and a key a
 * component already answered (defaultPrevented) is left alone. Escape
 * steps back one layer: the help card, the index panel, then a view other
 * than the first.
 */
export function demoKeyHandler(state: ShellState, keys: DemoKeys) {
  return (event: KeyboardEvent<HTMLElement>) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
    if (isEditable(event.target)) return;
    const { key } = event;
    const done = () => event.preventDefault();
    if (key === 'Escape') {
      if (state.helpOpen) {
        state.setHelp(false);
        done();
      } else if (state.panelOpen) {
        state.setPanel(false);
        done();
      } else if (keys.paging && state.mode !== state.modes[0]) {
        state.setMode(state.modes[0] ?? 'book');
        done();
      }
      return;
    }
    if (keys.help && key === '?') {
      state.setHelp(!state.helpOpen);
      done();
      return;
    }
    if (keys.index && (key === 'r' || key === 'R')) {
      state.setPanel(!state.panelOpen);
      done();
      return;
    }
    if (keys.theme && (key === 'd' || key === 'D')) {
      const next = toggleTheme();
      state.say(next === 'dark' ? 'Dark theme' : 'Light theme');
      done();
      return;
    }
    if (keys.search && key === '/') {
      const trigger = event.currentTarget.querySelector<HTMLButtonElement>('.pt-search-btn, .ixa-search-tool .pt-ib');
      if (trigger) {
        trigger.click();
        done();
      }
      return;
    }
    if (!keys.paging) return;
    const target = event.target;
    /* a focused button keeps Space and Enter; the arrows page as the shell's document keys do */
    if (key === 'ArrowRight') {
      state.step(1);
      done();
    } else if (key === 'ArrowLeft') {
      state.step(-1);
      done();
    } else if (key === 'Home' || key === 'End') {
      const item = key === 'Home' ? state.paged[0] : state.paged[state.paged.length - 1];
      if (item) state.select(item.id);
      done();
    } else if ((key === 'g' || key === 'G') && state.modes.includes('grid')) {
      state.setMode('grid');
      done();
    } else if ((key === 'b' || key === 'B') && state.modes.includes('book')) {
      state.setMode('book');
      done();
    } else if (key === ' ' && !(target instanceof HTMLButtonElement)) {
      state.step(event.shiftKey ? -1 : 1);
      done();
    }
  };
}

export type DemoViewportProps = {
  shell: DemoShell;
  /** the viewport's accessible name */
  label: string;
  keys?: DemoKeys;
  /** stamp the list column's state, so the bar shows its brand only while the list is closed */
  list?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * The plate's small shell: the provider, the viewport (a containing block
 * for the fixed overlays) and the toast, drawn last so it sits over the
 * panels as it does in ViewerShell.
 */
export function DemoViewport({ shell, label, keys, list, className, children }: DemoViewportProps) {
  const classes = className ? `ixa-viewport ${className}` : 'ixa-viewport';
  return (
    <ShellContext.Provider value={shell.state}>
      <div
        aria-label={label}
        className={classes}
        data-sb={list ? (shell.state.sidebarOpen ? 'outline' : '0') : undefined}
        role='region'
        onKeyDown={keys ? demoKeyHandler(shell.state, keys) : undefined}
      >
        {children}
        <Toast message={shell.toast.message} on={shell.toast.on} />
      </div>
    </ShellContext.Provider>
  );
}
