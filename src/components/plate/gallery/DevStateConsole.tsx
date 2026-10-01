'use client';

import { Suspense, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, GripVertical, Menu, X } from 'lucide-react';

import {
  devPath,
  devPathPosition,
  type DevState,
} from '@/components/plate/gallery/devStates';
import { useFlow } from '@/components/plate/gallery/flow';
import { useMountEffect } from '@/components/plate/hooks/use-mount-effect';
import { Button } from '@/components/plate/ui/button';

type DevStateConsoleProps = {
  states: DevState[];
  currentId: string;
};

type Group = { name: string; states: DevState[] };

type Point = { x: number; y: number };

/** Where a dragged console sits between loads, per browser. */
const POSITION_KEY = 'gt-dev-console-position';

/** Under this width the console folds into its handle (the frame's md cut). */
const PHONE_QUERY = '(max-width: 767px)';

function readPosition(): Point | null {
  try {
    const raw = window.localStorage.getItem(POSITION_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<Point>;
    return typeof value.x === 'number' && typeof value.y === 'number'
      ? { x: value.x, y: value.y }
      : null;
  } catch {
    return null;
  }
}

function writePosition(point: Point | null): void {
  try {
    if (point) window.localStorage.setItem(POSITION_KEY, JSON.stringify(point));
    else window.localStorage.removeItem(POSITION_KEY);
  } catch {
    /* Storage can be unavailable; the console then just starts in the corner. */
  }
}

/** Keeps the console's box inside the viewport. */
function clamp(point: Point, width: number, height: number): Point {
  return {
    x: Math.min(Math.max(0, point.x), Math.max(0, window.innerWidth - width)),
    y: Math.min(Math.max(0, point.y), Math.max(0, window.innerHeight - height)),
  };
}

/** The list's groups, in list order. */
function groupStates(states: DevState[]): Group[] {
  const groups: Group[] = [];
  for (const state of states) {
    const last = groups[groups.length - 1];
    if (last && last.name === state.group) last.states.push(state);
    else groups.push({ name: state.group, states: [state] });
  }
  return groups;
}

/**
 * The console of the plate gallery, copied from the dashboard's
 * development gallery. Previous and next (and the arrow keys) walk the
 * journey's path, so every move shows the transition a user sees; from a
 * variant, next continues the path after the state it varies and previous
 * returns to that state. The list jumps anywhere, grouped, with the
 * variants marked; Shift with an arrow key steps through every state in
 * list order; a focused field keeps the arrows only while it has text or
 * a selection for them to move, so the sign-in page's autofocused email
 * does not swallow the walk. Every move goes through the flow hook, and
 * the gallery writes the state to `?state=`, so each state keeps a link.
 * The console
 * starts in the upper right corner, clear of the picture's plate and its
 * button in the lower right, and can be dragged by its title row anywhere
 * in the viewport; the position is kept per browser, and a double-click
 * on the title puts it back. Two rows and no prose: the title row carries
 * the state's name and the path counter; the second row the previous and
 * next arrows around the list. Under 768px the console folds into one
 * 44px round handle in the upper left, above the mark, that opens the two
 * rows across the bottom with 44px controls and a close button in place
 * of the grip; the lower right is left to the foot's theme flip, which
 * sits there whenever the foot is in view, and the upper right to the
 * direction corner. While the rows are open they cover the bottom of the
 * viewport, so the console adds the same height of ground after the page,
 * and the foot's controls scroll clear above the rows. The
 * dashboard's account switch is not here: the port has no seeded account
 * and no dashboard states for it to gate. Hidden under ?chrome=0, as the
 * direction corner is, so the captures and the page check see the page
 * alone.
 */
function Console({ states, currentId }: DevStateConsoleProps) {
  const params = useSearchParams();
  const { go } = useFlow();
  /* null: the corner the classes put it in; a point: dragged there. */
  const [position, setPosition] = useState<Point | null>(null);
  /* Whether the viewport is under the md cut; read at mount, so the server
     render and the first client render agree, then kept by the media query. */
  const [phone, setPhone] = useState(false);
  /* The folded console's open state; only read under the md cut. */
  const [open, setOpen] = useState(false);
  const asideRef = useRef<HTMLElement>(null);
  const dragRef = useRef<{ pointer: Point; origin: Point } | null>(null);
  /* The console's box as last measured while shown, for a clamp that runs
     while the aside is hidden under the md cut and measures 0 by 0. */
  const sizeRef = useRef<{ width: number; height: number } | null>(null);
  const index = Math.max(
    0,
    states.findIndex((state) => state.id === currentId)
  );
  const current = states[index]!;
  const pathPosition = devPathPosition(current.id);

  // The key listener is bound once; it reads the current position through
  // the refs so it never goes stale.
  const indexRef = useRef(index);
  indexRef.current = index;
  const positionRef = useRef(pathPosition);
  positionRef.current = pathPosition;

  function show(id: string) {
    go(id);
  }

  /** One step along the path. From a variant, back lands on its state. */
  function walk(direction: 1 | -1) {
    const { step, onPath } = positionRef.current;
    const target = direction === 1 || onPath ? step + direction : step;
    show(devPath[(target + devPath.length) % devPath.length]!);
  }

  /** One step through every state, in list order. */
  function stepAll(direction: 1 | -1) {
    const target = indexRef.current + direction;
    show(states[(target + states.length) % states.length]!.id);
  }

  useMountEffect(() => {
    const media = window.matchMedia(PHONE_QUERY);
    setPhone(media.matches);

    /* The console's box: measured while it is shown, else the last
       measurement; null before the first one. Under the md cut the aside
       is display none and measures 0 by 0, and a clamp with that box would
       pull the kept spot to the phone's width. */
    const measure = () => {
      const box = asideRef.current;
      if (!box) return sizeRef.current;
      if (box.offsetWidth === 0) return sizeRef.current;
      sizeRef.current = { width: box.offsetWidth, height: box.offsetHeight };
      return sizeRef.current;
    };
    /* A spot kept from a wider window would sit off screen. */
    const fit = () => {
      const size = measure();
      if (!size) return;
      setPosition((at) => (at ? clamp(at, size.width, size.height) : null));
    };

    const stored = readPosition();
    if (stored) {
      const size = measure();
      /* Loaded under the md cut, the spot waits unclamped, since it is not
         applied there; the media change fits it once the aside is shown. */
      setPosition(size ? clamp(stored, size.width, size.height) : stored);
    }

    /* Under the md cut the spot is not applied and the aside is hidden or
       lies across the bottom, so there is nothing to fit; the spot waits
       for the desktop as it was, and the media change fits it then. A
       dragged console that crosses a phone width and comes back is where
       it was left. */
    const onResize = () => {
      if (media.matches) return;
      fit();
    };
    const onMedia = (event: MediaQueryListEvent) => {
      setPhone(event.matches);
      if (!event.matches) fit();
    };
    media.addEventListener('change', onMedia);
    window.addEventListener('resize', onResize);
    return () => {
      media.removeEventListener('change', onMedia);
      window.removeEventListener('resize', onResize);
    };
  });

  function onHandlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const aside = asideRef.current;
    if (!aside || event.button !== 0) return;
    /* Under the md cut the console sits across the bottom; it does not drag. */
    if (window.matchMedia(PHONE_QUERY).matches) return;
    /* A press on a control in the title row is a click, not a drag. */
    if ((event.target as HTMLElement).closest('button')) return;
    const rect = aside.getBoundingClientRect();
    dragRef.current = {
      pointer: { x: event.clientX, y: event.clientY },
      origin: { x: rect.left, y: rect.top },
    };
    const move = (moveEvent: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      setPosition(
        clamp(
          {
            x: drag.origin.x + (moveEvent.clientX - drag.pointer.x),
            y: drag.origin.y + (moveEvent.clientY - drag.pointer.y),
          },
          aside.offsetWidth,
          aside.offsetHeight
        )
      );
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      dragRef.current = null;
      /* The position in the state at release; the closure's is stale, so
         read it off the element. */
      const left = Number.parseFloat(aside.style.left);
      const top = Number.parseFloat(aside.style.top);
      if (!Number.isNaN(left) && !Number.isNaN(top)) {
        writePosition({ x: left, y: top });
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    event.preventDefault();
  }

  function resetPosition() {
    setPosition(null);
    writePosition(null);
  }

  useMountEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target) {
        /* A field that has something for the arrows to do keeps them: a
           select, editable text, and an input or textarea with text (the
           caret moves) or with a selection. An empty field gives them up,
           so the sign-in page's autofocused email input does not swallow
           the walk before the visitor has typed anything. */
        if (target.isContentEditable || target.tagName === 'SELECT') return;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          const field = target as HTMLInputElement | HTMLTextAreaElement;
          if (
            field.value !== '' ||
            field.selectionStart !== field.selectionEnd
          ) {
            return;
          }
        }
      }
      const direction =
        event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (direction === 0) return;
      if (event.shiftKey) stepAll(direction);
      else walk(direction);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (params.get('chrome') === '0') return null;

  return (
    <>
      {/* The folded console under the md cut: one round 44px handle in the
          upper left, above the mark, which starts 94px down on every framed
          state; the bare states and the snapshots leave that square empty
          too. The lower right is the foot's: its theme flip sits there on a
          page shorter than the viewport and at the end of a longer one, and
          the direction corner holds the upper right on these pages. From md
          up the aside is always shown and this is not. */}
      <button
        type='button'
        aria-label='Open the state console'
        aria-expanded={open}
        aria-controls='dev-state-console'
        className={
          open
            ? 'hidden'
            : 'bg-background text-foreground fixed top-4 left-4 z-50 flex size-11 items-center justify-center rounded-full border md:hidden'
        }
        data-testid='dev-state-console-handle-phone'
        onClick={() => setOpen(true)}
      >
        <Menu aria-hidden='true' className='size-4' />
      </button>
      <aside
        id='dev-state-console'
        ref={asideRef}
        aria-label='State console'
        className={`bg-background fixed top-4 right-4 z-50 flex w-[280px] flex-col gap-2 rounded-md border p-2 max-md:top-auto max-md:right-4 max-md:bottom-4 max-md:left-4 max-md:w-auto ${open ? '' : 'max-md:hidden'}`}
        data-testid='dev-state-console'
        style={
          position && !phone
            ? {
                left: position.x,
                top: position.y,
                right: 'auto',
                bottom: 'auto',
              }
            : undefined
        }
      >
        <div
          className='flex cursor-move touch-none items-center justify-between gap-2 select-none max-md:cursor-default'
          title='Drag to move. Double-click to put it back in the corner.'
          data-testid='dev-state-console-handle'
          onPointerDown={onHandlePointerDown}
          onDoubleClick={(event) => {
            if ((event.target as HTMLElement).closest('button')) return;
            resetPosition();
          }}
        >
          <p className='flex min-w-0 items-center gap-1.5 text-xs leading-tight max-md:text-sm'>
            <GripVertical
              aria-hidden='true'
              className='text-muted-foreground size-3.5 shrink-0 max-md:hidden'
            />
            <span className='truncate font-medium' title={current.title}>
              {current.title}
            </span>
          </p>
          <div className='flex shrink-0 items-center gap-2'>
            <p className='typo-counter' data-testid='dev-state-step'>
              {pathPosition.step + 1} / {devPath.length}
            </p>
            <Button
              variant='outline'
              size='icon'
              className='size-11 shrink-0 md:hidden'
              aria-label='Close the state console'
              onClick={() => setOpen(false)}
            >
              <X aria-hidden='true' className='size-4' />
            </Button>
          </div>
        </div>
        <div className='flex items-center gap-1.5'>
          <Button
            variant='outline'
            size='icon'
            className='size-8 shrink-0 max-md:size-11'
            aria-label='Previous'
            onClick={() => walk(-1)}
          >
            <ChevronLeft aria-hidden='true' className='size-4' />
          </Button>
          <select
            aria-label='State'
            value={current.id}
            onChange={(event) => show(event.target.value)}
            className='bg-background h-8 min-w-0 flex-1 rounded-md border px-1.5 text-xs max-md:h-11 max-md:text-sm'
          >
            {groupStates(states).map((group) => (
              <optgroup key={group.name} label={group.name}>
                {group.states.map((state) => (
                  <option key={state.id} value={state.id}>
                    {devPathPosition(state.id).onPath
                      ? state.title
                      : `– ${state.title}`}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <Button
            variant='outline'
            size='icon'
            className='size-8 shrink-0 max-md:size-11'
            aria-label='Next'
            onClick={() => walk(1)}
          >
            <ChevronRight aria-hidden='true' className='size-4' />
          </Button>
        </div>
      </aside>
      {/* The open rows are fixed over the bottom 130px of a phone (114px
          tall at bottom-4) and covered the foot's language and theme flip.
          This block follows the page in flow while they are open, 144px of
          the plate's ground, so at the scroll end the foot sits above the
          rows; closing the console removes it. The page check loads under
          ?chrome=0, where none of this renders. */}
      {open && (
        <div
          aria-hidden='true'
          className='bg-background h-36 md:hidden'
          data-testid='dev-state-console-room'
        />
      )}
    </>
  );
}

/** useSearchParams reads the address on the client, so the console mounts behind a Suspense boundary, as the direction corner does. */
export default function DevStateConsole(props: DevStateConsoleProps) {
  return (
    <Suspense fallback={null}>
      <Console {...props} />
    </Suspense>
  );
}
