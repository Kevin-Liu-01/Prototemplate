'use client';

import { usePtShell } from '@/components/viewer/shell-context';
import { shellKeyRows } from '@/components/viewer/useShellKeys';
import type { ShellKeyGroup, ShellKeyRow } from '@/components/viewer/useShellKeys';
import type { ShellKeys } from '@/lib/shell-data';

import './HelpCard.css';

/**
 * The keyboard card, opened with ? from every route. Its rows come from the
 * one key table in useShellKeys (shellKeyRows), grouped as Move, View,
 * Panels and Theme (directive 7.6), so the card is always true for the route
 * that shows it: flow routes drop the paging rows because Space and the
 * arrows scroll there, and a mode key appears only when the route offers
 * that mode. Click anywhere closes it; Escape is handled by the key owner.
 */
export type HelpCardProps = {
  /** replaces the rows derived from the shell */
  rows?: readonly ShellKeyRow[];
  /** replaces the footnote derived from the shell; an empty string hides it */
  note?: string;
};

const GROUPS: readonly ShellKeyGroup[] = ['Move', 'View', 'Panels', 'Theme'];

/** The footnote for a route. */
export function helpNote(keys: ShellKeys): string {
  return keys === 'paged'
    ? 'Click the left or right half of the sheet to move, or swipe on touch. In the book view, click a page to open it. The URL hash tracks your place.'
    : 'The sheet scrolls in place; the sidebar tracks the section in view. The URL hash tracks your place.';
}

export function HelpCard({ rows, note }: HelpCardProps) {
  const shell = usePtShell();
  if (!shell.helpOpen) return null;
  const list = rows ?? shellKeyRows(shell);
  const foot = note ?? helpNote(shell.keys);
  const groups = GROUPS.map((group) => ({ group, rows: list.filter((row) => row.group === group) })).filter(
    (entry) => entry.rows.length > 0
  );
  return (
    <div className='pt-help' onClick={() => shell.setHelp(false)}>
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
