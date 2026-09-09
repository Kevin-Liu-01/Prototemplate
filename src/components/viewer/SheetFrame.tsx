'use client';

import { pad2 } from '@/lib/shell-data';

import { GtMark } from './GtMark';
import { usePtShell } from './shell-context';

import './SheetFrame.css';

export type SheetFrameProps = {
  /** the 28x18 mark at the bottom left */
  wordmark?: boolean;
  /** the `01 / 52` counter at the bottom right */
  counter?: boolean;
};

/**
 * The edge grid the viewer draws on every slide sheet: two rails and two
 * rules at 56px, four 11x11 registration crosses where they meet, the
 * wordmark and the counter inside the bottom margin. Copied from the deck
 * viewer (parts/head.html). Rendered as the first child of .stage so it
 * scales with the content; a slide never redraws it. Thumbnail and page
 * clones pass wordmark={false} counter={false} to carry the grid alone.
 */
export function SheetFrame({ wordmark = true, counter = true }: SheetFrameProps) {
  const { index, total } = usePtShell();
  return (
    <>
      <div className='pt-sheet-frame' aria-hidden='true'>
        <span className='pt-sheet-rule is-top' />
        <span className='pt-sheet-rule is-bottom' />
        <span className='pt-sheet-cross is-tl' />
        <span className='pt-sheet-cross is-tr' />
        <span className='pt-sheet-cross is-bl' />
        <span className='pt-sheet-cross is-br' />
      </div>
      {wordmark ? (
        <div className='pt-sheet-wordmark' aria-hidden='true'>
          <GtMark width={28} height={18} />
        </div>
      ) : null}
      {counter ? (
        <div className='pt-sheet-counter'>{`${pad2(Math.max(0, index) + 1)} / ${pad2(total)}`}</div>
      ) : null}
    </>
  );
}
