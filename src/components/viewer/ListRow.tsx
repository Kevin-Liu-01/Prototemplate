'use client';

import type { KeyboardEvent } from 'react';

import { cn } from '@/lib/cn';
import type { ShellItem } from '@/lib/shell-data';

import './ListRow.css';

/**
 * Enter and Space activate a role="button" element the way a native button
 * does. Space also stops here: in a paged route the shell's document
 * listener reads Space as "next", and the row's own selection must win.
 * Enter keeps bubbling so the digit buffer (1, 2, then Enter) still lands.
 */
export function activateOnKey(
  event: KeyboardEvent<HTMLElement>,
  act: () => void
): void {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  event.preventDefault();
  if (event.key === ' ') event.stopPropagation();
  act();
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
 * scroll-spied heading rather than the shell's active item.
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
      onClick={select}
      onKeyDown={(event) => activateOnKey(event, select)}
    >
      <span className='n'>{item.n ?? ''}</span>
      <span className='pt-row-title'>{item.title}</span>
    </div>
  );
}
