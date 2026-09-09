'use client';

import { useRef } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

import type { ShellState } from './shell-context';

/** How long typed digits wait for Enter. */
const DIGIT_HOLD_MS = 1500;

export type ShellKeyOptions = {
  /** flips html[data-theme] and persists gt-theme; ThemeButton owns the logic */
  toggleTheme: () => void;
  /** defaults to toggleFullscreen() below */
  toggleFullscreen?: () => void | Promise<void>;
  /** the Escape ladder's filter rung: clears the sidebar filter and returns true when it held text */
  clearFilter?: () => boolean;
};

/** The help card's four groups (directive 7.6). */
export type ShellKeyGroup = 'Move' | 'View' | 'Panels' | 'Theme';

/** One row of the help card: the group, the keys, then what they do. */
export type ShellKeyRow = { group: ShellKeyGroup; keys: string; action: string };

/**
 * Enter or leave fullscreen on the document. The one implementation, shared
 * by the F key and the toolbar button. A refusal (an iframe without
 * allowfullscreen, which the gallery and compare embeds are, or a call
 * without a gesture) is swallowed: there is nothing to report to the user.
 */
export async function toggleFullscreen(): Promise<void> {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await document.documentElement.requestFullscreen();
    }
  } catch {
    // refused by the browser; the F key and the button simply do nothing here
  }
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * The key table for a route, grouped as the help card shows it: Move, View,
 * Panels, Theme. The one table, kept next to the handler below so the card
 * is always true for the route: paged rows only on paged routes (flow
 * routes say that Space and the arrows scroll), mode rows only when the
 * mode is offered, present only where a slide exists. Wording follows the
 * copy rules: sentence case, no trailing periods.
 */
export function shellKeyRows(route: Pick<ShellState, 'keys' | 'modes' | 'noun'>): readonly ShellKeyRow[] {
  const paged = route.keys === 'paged';
  const grid = route.modes.includes('grid');
  const book = route.modes.includes('book');
  const slide = route.modes.includes('slide');
  const noun = route.noun;
  const rows: ShellKeyRow[] = [];
  if (paged) {
    rows.push({ group: 'Move', keys: 'Right arrow, Space, Page down, J, L', action: `Next ${noun}` });
    rows.push({ group: 'Move', keys: 'Left arrow, Page up, Backspace, K, H', action: `Previous ${noun}` });
    if (book) rows.push({ group: 'Move', keys: 'Down and up arrows', action: `Next and previous ${noun} in the book view` });
    rows.push({ group: 'Move', keys: 'Home, End', action: `First and last ${noun}` });
  } else {
    rows.push({ group: 'Move', keys: 'Space, arrows', action: 'Scroll the sheet' });
  }
  rows.push({ group: 'Move', keys: 'Digits, then Enter', action: `Go to a ${noun} by number (or click the count)` });
  if (grid) rows.push({ group: 'View', keys: 'G', action: 'Grid view' });
  if (book) rows.push({ group: 'View', keys: 'B', action: 'Book view, read top to bottom' });
  if (slide) rows.push({ group: 'View', keys: 'P', action: 'Presentation mode, chrome hidden' });
  rows.push({ group: 'View', keys: 'F', action: 'Fullscreen' });
  rows.push({ group: 'Panels', keys: 'R, Cmd K or Ctrl K', action: 'Index panel, with the filter focused' });
  rows.push({ group: 'Panels', keys: '[ or S', action: 'Show or hide the list' });
  rows.push({ group: 'Panels', keys: '?', action: 'Keyboard shortcuts' });
  rows.push({
    group: 'Panels',
    keys: 'Esc',
    action: 'Back one layer: the shortcuts, the index, the list filter, the view, presentation mode, the list',
  });
  rows.push({ group: 'Theme', keys: 'D', action: 'Dark or light' });
  return rows;
}

function isEditable(target: EventTarget | null): target is HTMLElement {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
}

/**
 * Focus and select the index filter. Used when Cmd K lands on a panel that
 * is already open; a panel that is opening focuses the filter itself.
 */
function focusPanelFilter(): void {
  const input = document.querySelector<HTMLInputElement>('.pt-panel input[type="search"]');
  if (!input) return;
  input.focus({ preventScroll: true });
  input.select();
}

/**
 * The shell's one document keydown owner. ViewerShell calls it with the
 * state it publishes; the listener registers once on mount and reads the
 * latest state through a ref, so no key ever acts on a stale closure.
 *
 * Meta, Ctrl and Alt combinations pass through, except Cmd K and Ctrl K,
 * which open the index (the panel focuses its filter as it opens) or, when
 * it is already open, refocus and select the filter. Inside an input or
 * textarea only Escape acts and it closes the index, unless the field has
 * already answered the key itself (the sidebar filter and the count field
 * clear or close on their own Escape). Digits accumulate for 1500ms behind
 * the toast `Slide 12, press Enter`; Enter jumps, and that jump is read
 * before the defaultPrevented bail so it wins over a focused thumb's own
 * Enter activation, as in the deck. Every other event a component already
 * handled (defaultPrevented) passes through, so Space on a focused thumb
 * selects it and does not also page.
 *
 * Paged routes: Right, Space, PageDown, J, L next; Left, PageUp, K, H,
 * Backspace previous; Down and Up page in book mode only; Home and End.
 * Every route: G grid and B book when offered, R index, [ or S sidebar,
 * D theme, P present (where a slide mode exists; from the book or the grid
 * it opens the slide first), F fullscreen, ? help. Escape steps back one
 * layer: help, then the index, then the list filter, then a non-default
 * mode, then present when not fullscreen, then the open narrow sidebar.
 * Flow routes drop the paging keys so Space and the arrows scroll the sheet.
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

    const clearDigits = () => {
      digits = '';
      window.clearTimeout(digitTimer);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      const o = optionsRef.current;
      const noun = s.noun;
      const key = e.key;
      const low = key.length === 1 ? key.toLowerCase() : key;

      if (e.isComposing) return;

      if ((e.metaKey || e.ctrlKey) && !e.altKey && low === 'k') {
        e.preventDefault();
        if (s.panelOpen) focusPanelFilter();
        else s.setPanel(true);
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (isEditable(e.target)) {
        if (key === 'Escape' && !e.defaultPrevented) {
          e.preventDefault();
          s.setPanel(false);
          e.target.blur();
        }
        return;
      }

      /* the digit jump, ahead of the defaultPrevented bail: a focused thumb
         re-selects itself on Enter, and the typed number has to win */
      if (key === 'Enter' && digits) {
        const n = parseInt(digits, 10);
        clearDigits();
        const item = s.paged[n - 1];
        if (!item) {
          s.say(`No ${noun} ${n}`);
          return;
        }
        e.preventDefault();
        if (s.mode === 'grid') s.setMode(s.modes.includes('slide') ? 'slide' : s.modes[0]);
        s.select(item.id);
        return;
      }

      if (e.defaultPrevented) return;

      if (key.length === 1 && key >= '0' && key <= '9') {
        digits += key;
        window.clearTimeout(digitTimer);
        digitTimer = window.setTimeout(clearDigits, DIGIT_HOLD_MS);
        s.say(`${capitalize(noun)} ${digits}, press Enter`);
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
          const first = s.paged[0];
          if (first) s.select(first.id);
          return;
        }
        if (key === 'End') {
          e.preventDefault();
          const last = s.paged[s.paged.length - 1];
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
          if (!s.modes.includes('slide')) return;
          if (s.present) {
            s.setPresent(false);
            return;
          }
          if (s.mode !== 'slide') s.setMode('slide');
          s.setPresent(true);
          return;
        case 'f':
          void (o.toggleFullscreen ?? toggleFullscreen)();
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
        else if (o.clearFilter?.()) return;
        else if (s.mode !== s.modes[0]) s.setMode(s.modes[0]);
        else if (s.present && !document.fullscreenElement) s.setPresent(false);
        else if (s.narrow && s.sidebarOpen) s.setSidebar(false);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(digitTimer);
    };
  });
}
