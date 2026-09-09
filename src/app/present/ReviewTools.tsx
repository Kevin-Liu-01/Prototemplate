'use client';

import { useRef, useState } from 'react';

import { ToolButton } from '@/components/viewer/ToolButton';
import { usePtShell } from '@/components/viewer/shell-context';
import { DIRECTIONS } from '@/lib/directions';
import { useMountEffect } from '@/lib/use-mount-effect';

import { useDirectionIndex } from './presenterStore';
import { setReview, useReviews } from './viewer/reviewStore';

import './ReviewTools.css';

type Tool = 'rating' | 'notes';

const RATINGS = [1, 2, 3, 4, 5] as const;

/* 16px solid glyphs, drawn here because the shell's icon set has no star or note */
function StarIcon() {
  return (
    <svg viewBox='0 0 16 16' width='16' height='16' aria-hidden='true'>
      <path d='M8 1.2l2.1 4.5 4.9.6-3.6 3.4.9 4.9L8 12.2l-4.3 2.4.9-4.9L1 6.3l4.9-.6z' />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg viewBox='0 0 16 16' width='16' height='16' aria-hidden='true'>
      <path fillRule='evenodd' d='M2 1h12v14H2zM4 4v1.5h8V4zm0 3.5V9h8V7.5zM4 11v1.5h5V11z' />
    </svg>
  );
}

/** A ref callback, not an effect: the field takes focus as the notes open. */
function focusOnMount(el: HTMLTextAreaElement | null): void {
  el?.focus();
}

/**
 * The presenter's toolbar slot: Rate and Notes for the direction loaded in
 * the prototype viewer, shown while the prototypes slide is active. Each
 * opens a small paper card under the bar; the review persists under
 * gt-presenter-review:v1 through reviewStore, as the dock did. Escape closes
 * an open card before the shell's ladder runs (the shell bails on a
 * defaultPrevented key), and so does a press anywhere outside it.
 */
export default function ReviewTools() {
  const { active } = usePtShell();
  const index = useDirectionIndex();
  const reviews = useReviews();
  const [open, setOpen] = useState<Tool | null>(null);
  const openRef = useRef(open);
  openRef.current = open;
  const box = useRef<HTMLDivElement>(null);

  useMountEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !openRef.current) return;
      event.preventDefault();
      setOpen(null);
    };
    const onPointer = (event: PointerEvent) => {
      if (!openRef.current) return;
      const target = event.target;
      if (target instanceof Node && box.current?.contains(target)) return;
      setOpen(null);
    };
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('pointerdown', onPointer, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.removeEventListener('pointerdown', onPointer, true);
    };
  });

  if (active !== 'prototypes') return null;
  const current = DIRECTIONS[index];
  if (!current) return null;
  const review = reviews[current.slug];
  const rating = review?.rating ?? 0;
  const note = review?.note ?? '';
  const toggle = (tool: Tool) => setOpen(open === tool ? null : tool);

  return (
    <div ref={box} className='pr-tools'>
      <ToolButton
        label={rating ? `Rated ${rating}` : 'Rate'}
        title={`Rate ${current.name}, 1 to 5`}
        pressed={open === 'rating'}
        onClick={() => toggle('rating')}
      >
        <StarIcon />
      </ToolButton>
      <ToolButton
        label={note ? 'Noted' : 'Notes'}
        title={`Notes on ${current.name}`}
        pressed={open === 'notes'}
        onClick={() => toggle('notes')}
      >
        <NoteIcon />
      </ToolButton>
      {open === 'rating' ? (
        <div className='pr-review' role='dialog' aria-label={`Rating for ${current.name}`}>
          <div className='pr-review-head'>
            <b>{current.name}</b>
            <span>{rating ? `${rating} of 5` : 'Not rated'}</span>
          </div>
          <div className='pt-seg pr-review-scale' role='group' aria-label='Rating, 1 to 5'>
            {RATINGS.map((n) => (
              <ToolButton
                key={n}
                title={n === rating ? `${n} of 5, click again to clear` : `${n} of 5`}
                pressed={n <= rating}
                onClick={() => setReview(current.slug, { rating: n === rating ? 0 : n })}
              >
                <span className='pt-glyph'>{n}</span>
              </ToolButton>
            ))}
          </div>
        </div>
      ) : null}
      {open === 'notes' ? (
        <div className='pr-review pr-review-notes' role='dialog' aria-label={`Notes on ${current.name}`}>
          <div className='pr-review-head'>
            <b>{current.name}</b>
            <span>Notes</span>
          </div>
          <textarea
            ref={focusOnMount}
            value={note}
            placeholder='What works and what does not'
            aria-label={`Notes on ${current.name}`}
            onChange={(event) => setReview(current.slug, { note: event.target.value })}
          />
        </div>
      ) : null}
    </div>
  );
}
