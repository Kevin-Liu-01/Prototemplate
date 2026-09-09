'use client';

import { usePtShell } from '@/components/viewer/shell-context';
import type { ShellState } from '@/components/viewer/shell-context';
import type { ShellKeys } from '@/lib/shell-data';

import './HelpCard.css';

/**
 * The keyboard card, opened with ? from every route. Its rows are built
 * from the route's key table (useShellKeys, specification section 2.9) so
 * the card is always true for the route that shows it: flow routes drop the
 * paging rows because Space and the arrows scroll there, and a mode key
 * appears only when the route offers that mode. Click anywhere closes it;
 * Escape is handled by the key owner.
 */
export type HelpRow = { keys: string; action: string };

export type HelpCardProps = {
  /** replaces the rows derived from the shell */
  rows?: readonly HelpRow[];
  /** replaces the footnote derived from the shell; an empty string hides it */
  note?: string;
};

/** The rows for a route, from its keys and the modes it offers. */
export function helpRows(state: Pick<ShellState, 'keys' | 'modes'>): readonly HelpRow[] {
  const paged = state.keys === 'paged';
  const rows: HelpRow[] = [];
  if (paged) {
    rows.push(
      { keys: 'Right arrow, Space, Page down, J, L', action: 'Next' },
      { keys: 'Left arrow, Page up, Backspace, K, H', action: 'Previous' }
    );
    if (state.modes.includes('book')) {
      rows.push({ keys: 'Down and up arrows', action: 'Next and previous in the book view' });
    }
    rows.push({ keys: 'Home, End', action: 'First and last' }, { keys: 'Digits, then Enter', action: 'Go to a number' });
  } else {
    rows.push({ keys: 'Space, arrows', action: 'Scroll the sheet' });
  }
  if (state.modes.includes('grid')) rows.push({ keys: 'G', action: 'Grid view' });
  if (state.modes.includes('book')) rows.push({ keys: 'B', action: 'Book view, read top to bottom' });
  rows.push(
    { keys: 'R, Cmd K or Ctrl K', action: 'Index panel, with the filter focused' },
    { keys: '[ or S', action: 'Show or hide the list' },
    { keys: 'D', action: 'Dark or light' }
  );
  if (paged) rows.push({ keys: 'P', action: 'Presentation mode, chrome hidden' });
  rows.push(
    { keys: 'F', action: 'Fullscreen' },
    { keys: '?', action: 'This card' },
    { keys: 'Esc', action: 'Back one layer: this card, the panel, the view, presentation mode, the list' }
  );
  return rows;
}

/** The footnote for a route. */
export function helpNote(keys: ShellKeys): string {
  return keys === 'paged'
    ? 'Click the left or right half of the sheet to move, or swipe on touch. In the book view, click a page to open it. The URL hash tracks your place.'
    : 'The sheet scrolls in place; the sidebar tracks the section in view. The URL hash tracks your place.';
}

export function HelpCard({ rows, note }: HelpCardProps) {
  const shell = usePtShell();
  if (!shell.helpOpen) return null;
  const list = rows ?? helpRows(shell);
  const foot = note ?? helpNote(shell.keys);
  return (
    <div className='pt-help' onClick={() => shell.setHelp(false)}>
      <div className='pt-help-card' role='dialog' aria-modal='true' aria-label='Keyboard shortcuts'>
        <h3>Keyboard shortcuts</h3>
        <table>
          <tbody>
            {list.map((row) => (
              <tr key={row.keys}>
                <td>{row.keys}</td>
                <td>{row.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {foot ? <p>{foot}</p> : null}
      </div>
    </div>
  );
}
