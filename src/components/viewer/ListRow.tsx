'use client';

import type { KeyboardEvent, MouseEvent } from 'react';

import { cn } from '@/lib/cn';
import type { ShellItem } from '@/lib/shell-data';

import './ListRow.css';

/**
 * Enter and Space activate a role="button" element the way a native button
 * does. Space stops here: in a paged route the shell's document listener
 * reads Space as "next", and the row's own selection must win. Enter is
 * neither prevented nor stopped (a div has no Enter default to cancel), so
 * the digit buffer in useShellKeys (1, 2, then Enter) still lands and wins
 * over the row's activation.
 */
export function activateOnKey(
  event: KeyboardEvent<HTMLElement>,
  act: () => void
): void {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  if (event.key === ' ') {
    event.preventDefault();
    event.stopPropagation();
  }
  act();
}

/**
 * A pointer press on a row or a thumb must not park focus on it: a focused
 * item would answer Enter and Space itself for the rest of the visit, so a
 * mouse user who clicked slide 5 and then typed a number would see the row
 * re-select itself. Focus behaves as it would on a plain div: whatever was
 * focused lets go, and keyboard users still reach every item through Tab.
 */
export function pressWithoutFocus(event: MouseEvent<HTMLElement>): void {
  event.preventDefault();
  const focused = document.activeElement;
  if (focused instanceof HTMLElement && focused !== event.currentTarget) focused.blur();
}

export type ListRowProps = {
  item: ShellItem;
  active: boolean;
  onSelect: (id: string) => void;
};

/**
 * A frameless sidebar row: the 22px number column and a 13.5px title over
 * a soft rule. Used for the headings under the active document on /docs,
 * the sections on /brand, the sub-beats on /present, and as the whole list
 * when a shell's thumb is 'row'. Presentational on purpose: the caller
 * supplies active and onSelect, because a row's active state is often a
 * scroll-spied heading rather than the shell's active item. The title
 * attribute carries the full text, since the sidebar clamps the row to one
 * line and the preview card has no caption for a heading.
 */
export function ListRow({ item, active, onSelect }: ListRowProps) {
  const select = () => onSelect(item.id);
  return (
    <div
      className={cn('pt-row', active && 'is-active')}
      role='button'
      tabIndex={0}
      data-id={item.id}
      aria-current={active || undefined}
      onMouseDown={pressWithoutFocus}
      onClick={select}
      onKeyDown={(event) => activateOnKey(event, select)}
      title={item.title}
    >
      <span className='n'>{item.n ?? ''}</span>
      <span className='pt-row-title'>{item.title}</span>
    </div>
  );
}
