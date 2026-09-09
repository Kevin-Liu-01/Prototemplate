'use client';

import { useGSAP } from '@gsap/react';
import { useRef, useState } from 'react';

import { usePtShell } from '@/components/viewer/shell-context';
import { shellKeyRows } from '@/components/viewer/useShellKeys';
import type { ShellKeyGroup, ShellKeyRow } from '@/components/viewer/useShellKeys';
import type { ShellKeys } from '@/lib/shell-data';
import { useMountEffect } from '@/lib/use-mount-effect';

import './HelpCard.css';

/**
 * The keyboard card, opened with ? from every route. Its rows come from the
 * one key table in useShellKeys (shellKeyRows), grouped as Move, View,
 * Panels and Theme (directive 7.6), so the card is always true for the route
 * that shows it: flow routes drop the paging rows because Space and the
 * arrows scroll there, and a mode key appears only when the route offers
 * that mode. Click anywhere closes it; Escape is handled by the key owner.
 *
 * Motion (directive 7.4): the scrim fades over the toast duration and the
 * card fades and rises 8px over the enter duration. On close the card stays
 * mounted for the toast duration with .is-closing so both can fade back out.
 */
export type HelpCardProps = {
  /** replaces the rows derived from the shell */
  rows?: readonly ShellKeyRow[];
  /** replaces the footnote derived from the shell; an empty string hides it */
  note?: string;
};

const GROUPS: readonly ShellKeyGroup[] = ['Move', 'View', 'Panels', 'Theme'];

/** How long the card stays for its exit; matches --pt-dur-toast in tokens.css. */
const OUT_MS = 160;

/** The footnote for a route. */
export function helpNote(keys: ShellKeys): string {
  return keys === 'paged'
    ? 'Click the left or right half of the sheet to move, or swipe on touch. In the book view, click a page to open it. The URL hash tracks your place.'
    : 'The sheet scrolls in place; the sidebar tracks the section in view. The URL hash tracks your place.';
}

export function HelpCard({ rows, note }: HelpCardProps) {
  const shell = usePtShell();
  const { helpOpen } = shell;
  /* true from the close until the exit has run, so the card is still there to fade */
  const [closing, setClosing] = useState(false);
  const wasOpen = useRef(false);
  const timer = useRef(0);

  useGSAP(
    () => {
      window.clearTimeout(timer.current);
      if (helpOpen) {
        wasOpen.current = true;
        setClosing(false);
        return;
      }
      if (!wasOpen.current) return;
      wasOpen.current = false;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      setClosing(true);
      timer.current = window.setTimeout(() => setClosing(false), OUT_MS);
    },
    { dependencies: [helpOpen] }
  );

  useMountEffect(() => () => window.clearTimeout(timer.current));

  if (!helpOpen && !closing) return null;
  const list = rows ?? shellKeyRows(shell);
  const foot = note ?? helpNote(shell.keys);
  const groups = GROUPS.map((group) => ({ group, rows: list.filter((row) => row.group === group) })).filter(
    (entry) => entry.rows.length > 0
  );
  return (
    <div
      className={helpOpen ? 'pt-help' : 'pt-help is-closing'}
      aria-hidden={!helpOpen}
      onClick={() => shell.setHelp(false)}
    >
      <div className='pt-help-card' role='dialog' aria-modal='true' aria-label='Keyboard shortcuts'>
        <h3>Keyboard shortcuts</h3>
        <table>
          {groups.map((entry) => (
            <tbody key={entry.group}>
              <tr className='pt-help-group'>
                <th colSpan={2}>{entry.group}</th>
              </tr>
              {entry.rows.map((row) => (
                <tr key={row.keys}>
                  <td>{row.keys}</td>
                  <td>{row.action}</td>
                </tr>
              ))}
            </tbody>
          ))}
        </table>
        {foot ? <p>{foot}</p> : null}
      </div>
    </div>
  );
}
