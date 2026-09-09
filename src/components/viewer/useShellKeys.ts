'use client';

import { useRef } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

import type { ShellState } from './shell-context';

/** How long typed digits wait for Enter. */
const DIGIT_HOLD_MS = 1500;

/** The deck's delay before the index filter takes focus, so the panel has started to slide in. */
const PANEL_FOCUS_MS = 200;

export type ShellKeyOptions = {
  /** flips html[data-theme] and persists gt-theme; ThemeButton owns the logic */
  toggleTheme: () => void;
  /** defaults to toggleFullscreen() below */
  toggleFullscreen?: () => void;
  /** the word in the digit toast and the help rows: `Slide 12, press Enter` */
  noun?: string;
};

/** One row of the help card: the keys, then what they do. */
export type ShellKeyRow = { keys: string; action: string };

/** Enter or leave fullscreen on the document. Shared with the toolbar button. */
export function toggleFullscreen(): void {
  if (document.fullscreenElement) {
    void document.exitFullscreen();
    return;
  }
  const root = document.documentElement;
  if (root.requestFullscreen) void root.requestFullscreen();
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * The key table for a route, in the order the help card shows it. Built
 * from the same descriptors the hook reads, so the card is always true for
 * the route: paged rows only on paged routes, mode rows only when the mode
 * is offered, present only where present exists.
 */
export function shellKeyRows(
  route: Pick<ShellState, 'keys' | 'modes'>,
  noun = 'slide'
): readonly ShellKeyRow[] {
  const paged = route.keys === 'paged';
  const grid = route.modes.includes('grid');
  const book = route.modes.includes('book');
  const rows: ShellKeyRow[] = [];
  if (paged) {
    rows.push({ keys: 'Right, Space, J', action: `Next ${noun}` });
    rows.push({ keys: 'Left, K', action: `Previous ${noun}` });
    rows.push({ keys: 'Home, End', action: `First and last ${noun}` });
    if (book) rows.push({ keys: 'Up, Down', action: `Previous and next ${noun} in the book` });
  }
  rows.push({ keys: '1 to 9, then Enter', action: `Go to a ${noun} by number` });
  if (grid) rows.push({ keys: 'G', action: `Grid of every ${noun}` });
  if (book) rows.push({ keys: 'B', action: 'Book view, read top to bottom' });
  rows.push({ keys: 'R, Cmd K', action: 'Index of pages and surfaces' });
  rows.push({ keys: '[ or S', action: 'Show or hide the list' });
  rows.push({ keys: 'D', action: 'Dark or light' });
  if (paged) rows.push({ keys: 'P', action: 'Presentation mode, chrome hidden' });
  rows.push({ keys: 'F', action: 'Fullscreen' });
  rows.push({ keys: '?', action: 'Keyboard shortcuts' });
  rows.push({ keys: 'Esc', action: 'Back one layer: help, index, mode, presentation, list' });
  return rows;
}

function isEditable(target: EventTarget | null): target is HTMLElement {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
}

function focusPanelFilter(): void {
  const input = document.querySelector<HTMLInputElement>('.pt-panel input[type="search"]');
  input?.focus();
}

/**
 * The shell's one document keydown owner. ViewerShell calls it with the
 * state it publishes; the listener registers once on mount and reads the
 * latest state through a ref, so no key ever acts on a stale closure.
 *
 * Meta, Ctrl and Alt combinations pass through, except Cmd K and Ctrl K,
 * which open the index and focus its filter. Inside an input or textarea
 * only Escape acts and it closes the index. Events a component already
 * handled (defaultPrevented) pass through, so Enter on a focused thumb
 * does not also page. Digits accumulate for 1500ms behind the toast
 * `Slide 12, press Enter`; Enter jumps.
 *
 * Paged routes: Right, Space, PageDown, J, L next; Left, PageUp, K, H,
 * Backspace previous; Down and Up page in book mode only; Home and End.
 * Every route: G grid and B book when offered, R index, [ or S sidebar,
 * D theme, P present (paged only), F fullscreen, ? help. Escape steps back
 * one layer: help, then the index, then a non-default mode, then present
 * when not fullscreen, then the open narrow sidebar. Flow routes drop the
 * paging keys so Space and the arrows scroll the sheet.
 */
export function useShellKeys(state: ShellState, options: ShellKeyOptions): void {
  /* assigned every render so the mount-time listener reads current state */
  const stateRef = useRef(state);
  stateRef.current = state;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useMountEffect(() => {
    let digits = '';
    let digitTimer = 0;
    let focusTimer = 0;

    const clearDigits = () => {
      digits = '';
      window.clearTimeout(digitTimer);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      const o = optionsRef.current;
      const noun = o.noun ?? 'slide';
      const key = e.key;
      const low = key.length === 1 ? key.toLowerCase() : key;

      if (e.defaultPrevented || e.isComposing) return;

      if ((e.metaKey || e.ctrlKey) && !e.altKey && low === 'k') {
        e.preventDefault();
        s.setPanel(true);
        window.clearTimeout(focusTimer);
        focusTimer = window.setTimeout(focusPanelFilter, PANEL_FOCUS_MS);
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (isEditable(e.target)) {
        if (key === 'Escape') {
          e.preventDefault();
          s.setPanel(false);
          e.target.blur();
        }
        return;
      }

      if (key.length === 1 && key >= '0' && key <= '9') {
        digits += key;
        window.clearTimeout(digitTimer);
        digitTimer = window.setTimeout(clearDigits, DIGIT_HOLD_MS);
        s.say(`${capitalize(noun)} ${digits}, press Enter`);
        return;
      }

      if (key === 'Enter') {
        if (!digits) return;
        const n = parseInt(digits, 10);
        clearDigits();
        const item = s.items[n - 1];
        if (!item) {
          s.say(`No ${noun} ${n}`);
          return;
        }
        e.preventDefault();
        if (s.mode === 'grid') s.setMode(s.modes[0]);
        s.select(item.id);
        return;
      }

      const paged = s.keys === 'paged';
      const inBook = s.mode === 'book';

      if (paged) {
        if (
          key === 'ArrowRight' ||
          key === ' ' ||
          key === 'PageDown' ||
          low === 'j' ||
          low === 'l' ||
          (inBook && key === 'ArrowDown')
        ) {
          e.preventDefault();
          s.step(1);
          return;
        }
        if (
          key === 'ArrowLeft' ||
          key === 'PageUp' ||
          low === 'k' ||
          low === 'h' ||
          key === 'Backspace' ||
          (inBook && key === 'ArrowUp')
        ) {
          e.preventDefault();
          s.step(-1);
          return;
        }
        if (key === 'Home') {
          e.preventDefault();
          const first = s.items[0];
          if (first) s.select(first.id);
          return;
        }
        if (key === 'End') {
          e.preventDefault();
          const last = s.items[s.items.length - 1];
          if (last) s.select(last.id);
          return;
        }
      }

      switch (low) {
        case 'g':
          if (s.modes.includes('grid')) s.setMode(s.mode === 'grid' ? s.modes[0] : 'grid');
          return;
        case 'b':
          if (s.modes.includes('book')) s.setMode(s.mode === 'book' ? s.modes[0] : 'book');
          return;
        case 'r':
          s.setPanel(!s.panelOpen);
          return;
        case '[':
        case 's':
          s.setSidebar(!s.sidebarOpen);
          return;
        case 'd':
          o.toggleTheme();
          return;
        case 'p':
          if (paged) s.setPresent(!s.present);
          return;
        case 'f':
          (o.toggleFullscreen ?? toggleFullscreen)();
          return;
        case '?':
          s.setHelp(!s.helpOpen);
          return;
        default:
          break;
      }

      if (key === 'Escape') {
        if (s.helpOpen) s.setHelp(false);
        else if (s.panelOpen) s.setPanel(false);
        else if (s.mode !== s.modes[0]) s.setMode(s.modes[0]);
        else if (s.present && !document.fullscreenElement) s.setPresent(false);
        else if (s.narrow && s.sidebarOpen) s.setSidebar(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(digitTimer);
      window.clearTimeout(focusTimer);
    };
  });
}
