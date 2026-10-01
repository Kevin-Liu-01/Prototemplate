'use client';

import { useId, useRef, useState, type PointerEvent } from 'react';
import { InformationCircleIcon } from '@heroicons/react/16/solid';
import { useGT } from '@/components/plate/shims/gt-next';
import { X } from 'lucide-react';

import { useMountEffect } from '@/components/plate/hooks/use-mount-effect';
import {
  MOOD_PICTURES,
  type PictureName,
} from '@/components/plate/brand/moodPictures';
import { cn } from '@/components/plate/lib/utils';

/**
 * Whether the plate is pinned open, kept per tab so a document swap between
 * two plate pages (sign-in to onboarding) keeps a reader's choice.
 */
const OPEN_KEY = 'gt-mood-plate-open';

/** How long the pointer rests on the button before the card slides out. */
export const PEEK_DELAY_MS = 120;
/** How long the card stays after the pointer leaves it and the button. */
export const LEAVE_DELAY_MS = 200;

function readOpen(): boolean {
  try {
    return window.sessionStorage.getItem(OPEN_KEY) === '1';
  } catch {
    return false;
  }
}

function writeOpen(open: boolean): void {
  try {
    window.sessionStorage.setItem(OPEN_KEY, open ? '1' : '0');
  } catch {
    /* Storage can be unavailable; the plate then starts closed next time. */
  }
}

/**
 * The deck's plate for the picture on the field: its name, why it is in
 * the deck, and the credit, in the viewport's lower right corner where the
 * deck prints it. Closed, it is one small round button with an information
 * glyph. The card is the button's only hover surface: resting the pointer
 * on the button slides the card in from the right edge (300ms, none under
 * reduced motion), moving onto the card keeps it, and leaving both slides
 * it back. A click pins it, turns the glyph into a close mark and keeps it
 * open until the close mark, a second click or Escape. Closing by click or
 * Escape with the pointer still on the button does not let the hover bring
 * it straight back: the pointer has to leave first, and that holds for an
 * Escape pressed over a closed or peeking plate too. A tooltip on hover
 * and then the card on click put two surfaces on one button, so hover and
 * click now show the same card, hover for as long as the pointer stays and
 * click for good. Focus from the keyboard shows the card the way hover
 * does, Enter or Space pins it, and a press on the card's text does not
 * close it.
 *
 * The plate is a small card that hovers 12px inside the corner with
 * rounded corners and a hairline, the close mark 8px inside its lower
 * right: 12px medium title in ink, note at 11px in the second ink, credit
 * at 10px lighter, so it never competes with the column.
 *
 * Page changes while it is pinned: the plate stays open and its text swaps
 * with the rows' own fade (the inner block is keyed on the picture), since
 * a reader who pinned it wants the captions as the steps go by; the pinned
 * state is kept per tab, so the swap from the sign-in document to the
 * onboarding document keeps it too. A page without a picture renders no
 * plate at all (PlateRoot), so there is nothing to carry there.
 *
 * A coarse pointer (touch) has no hover, so there a tap pins and a second
 * tap closes. Fixed, like the scene 1 field it captions, so a page taller
 * than the viewport keeps it beside the picture; only from lg up, since
 * below that the field is a band or hidden and the plate column would run
 * under it. Everything is an overlay, so nothing in the column moves.
 */
export default function FieldMoodPlate({ picture }: { picture: PictureName }) {
  const gt = useGT();
  const { caption } = MOOD_PICTURES[picture];
  const [pinned, setPinned] = useState(false);
  /* Mirrors `pinned` for the window's key handler, which outlives renders. */
  const pinnedRef = useRef(false);
  /* The card shown by hover or focus alone; it goes when they do. */
  const [peek, setPeek] = useState(false);
  /* True for the mount frame that restores a pinned plate, so it paints
     open at once instead of sliding in from the closed position. */
  const [restoring, setRestoring] = useState(false);
  const [coarse, setCoarse] = useState(false);
  /* Whether the pointer is over the button or the card right now. */
  const inside = useRef(false);
  /* Set when a click or Escape closed the card under the pointer: the hover
     may not reopen it until the pointer has left. Closing with the pointer
     elsewhere sets nothing, so the next hover opens as usual. */
  const hold = useRef(false);
  const timer = useRef<number | undefined>(undefined);
  const panelId = useId();
  const open = pinned || peek;

  function clearTimer() {
    if (timer.current !== undefined) {
      window.clearTimeout(timer.current);
      timer.current = undefined;
    }
  }

  function peekAfter(next: boolean, delay: number) {
    clearTimer();
    timer.current = window.setTimeout(() => {
      timer.current = undefined;
      setPeek(next);
    }, delay);
  }

  useMountEffect(() => {
    if (typeof window.matchMedia === 'function') {
      setCoarse(window.matchMedia('(pointer: coarse)').matches);
    }
    if (readOpen()) {
      pinnedRef.current = true;
      setPinned(true);
      setRestoring(true);
      const frame =
        typeof window.requestAnimationFrame === 'function'
          ? window.requestAnimationFrame.bind(window)
          : (callback: () => void) => window.setTimeout(callback, 0);
      frame(() => setRestoring(false));
    }
    function onKey(event: KeyboardEvent) {
      // A layer above (a dialog, a menu) that took the Escape marks it
      // handled; a closed plate has nothing to do and keeps the stored
      // choice as it is.
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      clearTimer();
      setPeek(false);
      hold.current = inside.current;
      if (pinnedRef.current) {
        pinnedRef.current = false;
        setPinned(false);
        writeOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      clearTimer();
    };
  });

  function onPointerEnter(event: PointerEvent<HTMLDivElement>) {
    inside.current = true;
    if (coarse || event.pointerType === 'touch' || hold.current) return;
    peekAfter(true, PEEK_DELAY_MS);
  }

  function onPointerLeave(event: PointerEvent<HTMLDivElement>) {
    inside.current = false;
    hold.current = false;
    if (coarse || event.pointerType === 'touch') return;
    peekAfter(false, LEAVE_DELAY_MS);
  }

  function onFocus() {
    if (hold.current) return;
    clearTimer();
    setPeek(true);
  }

  function onBlur() {
    // A press on the card's text takes the focus from the button; with the
    // pointer still inside, the card stays and the leave timer closes it.
    if (inside.current) return;
    clearTimer();
    setPeek(false);
  }

  function toggle() {
    clearTimer();
    if (pinned) {
      // Closed under the pointer: the hover waits for the pointer to leave.
      hold.current = inside.current;
      setPeek(false);
      pinnedRef.current = false;
      setPinned(false);
      writeOpen(false);
    } else {
      pinnedRef.current = true;
      setPinned(true);
      writeOpen(true);
    }
  }

  return (
    <div
      className='pointer-events-none fixed right-0 bottom-0 z-10 hidden lg:block'
      data-testid='field-mood-plate'
      data-picture={picture}
      data-open={open ? 'true' : 'false'}
      data-pinned={pinned ? 'true' : 'false'}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <aside
        id={panelId}
        aria-label={caption.title}
        aria-hidden={!open}
        data-testid='field-mood-plate-card'
        className={cn(
          // Tailwind 4 writes translate-x-* to the translate property, so that is
          // the property that moves; a closed or closing card takes no pointer, so
          // one that slides under a resting pointer does not reopen itself.
          // The closed card is also visibility hidden, which its children
          // inherit: faded alone, their boxes still sit past the viewport's
          // right edge (the page check reads them there) and the card stays
          // in hit testing. visibility is in the transition list so the slide
          // out plays to its end before the card goes hidden, and the slide
          // in starts visible at once.
          'bg-background absolute right-3 bottom-3 flex w-[272px] flex-col rounded-md border py-3 pr-12 pl-4 text-(--ink-2) transition-[translate,opacity,visibility] duration-300 ease-out motion-reduce:transition-none',
          open
            ? 'pointer-events-auto visible translate-x-0 opacity-100'
            : 'pointer-events-none invisible translate-x-[calc(100%+0.75rem)] opacity-0',
          restoring && 'transition-none'
        )}
      >
        <div key={picture} className='plate-row-in flex flex-col gap-1.5'>
          <p className='text-foreground text-xs leading-[1.3] font-medium text-balance'>
            {caption.title}
          </p>
          <p className='text-[11px] leading-[1.45]'>{caption.note}</p>
          <p className='text-muted-foreground text-[10px] leading-[1.45] italic'>
            {caption.credit}
          </p>
        </div>
      </aside>
      <button
        type='button'
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={
          pinned ? gt('Hide the picture caption') : gt('About this picture')
        }
        data-testid='field-mood-plate-toggle'
        onClick={toggle}
        onFocus={onFocus}
        onBlur={onBlur}
        className='bg-background hover:text-foreground pointer-events-auto absolute right-5 bottom-5 flex size-8 cursor-pointer items-center justify-center rounded-full border text-(--ink-2) transition-colors duration-150'
      >
        {pinned ? (
          <X aria-hidden='true' className='size-4' />
        ) : (
          <InformationCircleIcon aria-hidden='true' className='size-4' />
        )}
      </button>
    </div>
  );
}
