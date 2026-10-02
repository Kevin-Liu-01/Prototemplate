'use client';

import { Suspense, useId, useRef, useState } from 'react';
import type {
  CSSProperties,
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
} from 'react';
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/plate/ui/select';

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

/**
 * The open list's gap to the viewport's edges when it flips or shifts to
 * stay on screen: the console's own inset (top-4 right-4, and left-4
 * right-4 under the md cut), so a list pushed against an edge lines up
 * with the console's edge there.
 */
const LIST_EDGE = 16;

/**
 * The air between the console's box and the open list. Past the line
 * law's 4px, so the console's edge and the list's edge never read as one
 * doubled line.
 */
const LIST_GAP = 8;

/** The list's height cap, the CLI wizard's (24rem). */
const LIST_MAX_HEIGHT = 384;

/**
 * The list's least height, about three rows between the scroll buttons. A
 * viewport with less room than this on both sides of the console is the
 * one case where the list may cover the console.
 */
const LIST_MIN_HEIGHT = 96;

/** Radix's typeahead drops what was typed this long after the last key. */
const TYPEAHEAD_WINDOW = 1000;

type Side = 'top' | 'bottom';

type ListPlacement = {
  side: Side;
  /** From the trigger's edge on that side to the list. */
  sideOffset: number;
  align: 'start' | 'end';
  /** From the trigger's aligned edge to the console's edge on that end. */
  alignOffset: number;
  collisionPadding: Record<Side | 'left' | 'right', number>;
  /** The room on the chosen side, between LIST_MIN_HEIGHT and LIST_MAX_HEIGHT. */
  maxHeight: number;
  /** The console's width: the list's width under the md cut, its least width from md up. */
  width: number;
  phone: boolean;
};

const INITIAL_LIST_PLACEMENT: ListPlacement = {
  side: 'bottom',
  sideOffset: LIST_GAP,
  align: 'end',
  alignOffset: 0,
  collisionPadding: {
    top: LIST_EDGE,
    right: LIST_EDGE,
    bottom: LIST_EDGE,
    left: LIST_EDGE,
  },
  maxHeight: LIST_MAX_HEIGHT,
  width: 280,
  phone: false,
};

/**
 * Where the state list opens, read when it opens, from the console's box.
 *
 * Side: under the box when the whole list fits there or there is more
 * room there than over it, else over the box, clear of the box by
 * LIST_GAP either way. The offset runs from the trigger, the Select's
 * anchor, past the rest of the box, so a list over the box never covers
 * the title row. The list's height is capped at the room on that side, so
 * it always fits there and Radix never flips it: a flip keeps the offset
 * of the side it left, which put the list over the title row.
 *
 * Edges: under the md cut the list is the box's width and shares both of
 * its edges. From md up the list is wider than the box, so it shares the
 * box's edge on the side of the viewport the console sits in and grows
 * toward the middle, where there is always room for it; Radix then has
 * nothing to shift. Each side's padding to the viewport is the console's
 * own inset, or less where the console was dragged closer to an edge.
 */
function placeList(aside: HTMLElement, trigger: HTMLElement): ListPlacement {
  const box = aside.getBoundingClientRect();
  const anchor = trigger.getBoundingClientRect();
  const phone = window.matchMedia(PHONE_QUERY).matches;
  const below = window.innerHeight - box.bottom - LIST_GAP - LIST_EDGE;
  const above = box.top - LIST_GAP - LIST_EDGE;
  const inset = (room: number) => Math.max(0, Math.min(LIST_EDGE, room));
  const collisionPadding = {
    top: LIST_EDGE,
    bottom: LIST_EDGE,
    left: inset(box.left),
    right: inset(window.innerWidth - box.right),
  };
  const end = !phone && box.left + box.width / 2 > window.innerWidth / 2;
  const edges = {
    align: end ? ('end' as const) : ('start' as const),
    alignOffset: end ? anchor.right - box.right : box.left - anchor.left,
    collisionPadding,
    width: box.width,
    phone,
  };
  const fit = (room: number) =>
    Math.max(LIST_MIN_HEIGHT, Math.min(LIST_MAX_HEIGHT, Math.floor(room)));
  if (below >= LIST_MAX_HEIGHT || below >= above) {
    return {
      side: 'bottom',
      sideOffset: box.bottom - anchor.bottom + LIST_GAP,
      maxHeight: fit(below),
      ...edges,
    };
  }
  return {
    side: 'top',
    sideOffset: anchor.top - box.top + LIST_GAP,
    maxHeight: fit(above),
    ...edges,
  };
}

/**
 * Whether Radix's typeahead finds a state for what has been typed: a title
 * that starts with it, case aside. A run of one repeated character
 * searches for that character alone, as Radix does.
 */
function typeaheadMatches(states: DevState[], search: string): boolean {
  const repeated =
    search.length > 1 && [...search].every((char) => char === search[0]);
  const needle = (repeated ? search.charAt(0) : search).toLowerCase();
  return states.some((state) => state.title.toLowerCase().startsWith(needle));
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
 * returns to that state. The list is the plate's Select (ui/select), as
 * on the CLI wizard and the survey, and jumps anywhere: the journey's
 * groups are its labels, the off-path variants sit indented under the
 * state they vary (and say so to a screen reader), and the current state
 * carries the check. Shift with an
 * arrow key steps through every state in list order; a focused field
 * keeps the arrows only while it has text or a selection for them to
 * move, so the sign-in page's autofocused email does not swallow the
 * walk. While the list is open its keys are its own (typeahead, the
 * arrows, Home, End, Enter, Escape): none of them walks the states or
 * reaches the direction corner's letter keys. Every move goes through the
 * flow hook, and the gallery writes the state to `?state=`, so each state
 * keeps a link. The console
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
  const triggerRef = useRef<HTMLButtonElement>(null);
  /* Whether the state list is open; the key listener reads it to stand
     aside while the list has the keys. */
  const listOpenRef = useRef(false);
  const [listPlacement, setListPlacement] = useState(INITIAL_LIST_PLACEMENT);
  /* What has been typed on the closed trigger, and when, mirroring the
     search Radix keeps there (onRowKeyDown). */
  const typeaheadRef = useRef({ search: '', at: 0 });
  /* Prefixes the ids of the variants' descriptions in the list. */
  const idPrefix = useId();
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

  /**
   * A character typed on the closed picker feeds its typeahead: the
   * picker moves to the next state whose title starts with what has been
   * typed in the last second (the row hears the key after the trigger).
   * When that finds a title, the key is marked handled, so the direction
   * corner, which skips a handled key, does not act on it as well (D flips
   * the theme, R opens the index, [ the list, ? the help). A key that
   * finds no title goes on to the corner, so its shortcuts still work
   * while the trigger has focus, as it does after every pick. Space and
   * Enter open the list, and Radix marks them handled itself. The open
   * list stops its keys at its own edge (the content's onKeyDown below).
   */
  function onRowKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.target !== triggerRef.current) return;
    if (event.defaultPrevented) return;
    if (event.key.length !== 1) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const run = typeaheadRef.current;
    const live = event.timeStamp - run.at < TYPEAHEAD_WINDOW;
    const search = (live ? run.search : '') + event.key;
    typeaheadRef.current = { search, at: event.timeStamp };
    if (typeaheadMatches(states, search)) event.preventDefault();
  }

  useMountEffect(() => {
    function onKey(event: KeyboardEvent) {
      /* The open state list owns the keys: its arrows move the
         highlight, never the state. */
      if (listOpenRef.current) return;
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

  const titleById = new Map(states.map((state) => [state.id, state.title]));
  /* The list's height cap (placeList), still under the room Radix reads
     while the list is open, should the viewport shrink; and its width,
     the console's under the md cut. */
  const listStyle: CSSProperties = {
    maxHeight: `min(var(--radix-select-content-available-height, ${listPlacement.maxHeight}px), ${listPlacement.maxHeight}px)`,
    ...(listPlacement.phone
      ? { width: listPlacement.width }
      : { minWidth: listPlacement.width }),
  };

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
      {/* width-before-scroll-bar is react-remove-scroll's class for fixed
          elements: while the open list locks the page's scroll and the
          document's scrollbar goes, it adds the scrollbar's width as a
          right margin, so the console neither moves nor widens under the
          list (the inset it is placed from grows by that width). */}
      <aside
        id='dev-state-console'
        ref={asideRef}
        aria-label='State console'
        className={`width-before-scroll-bar bg-background fixed top-4 right-4 z-50 flex w-[280px] flex-col gap-2 rounded-md border p-2 max-md:top-auto max-md:right-4 max-md:bottom-4 max-md:left-4 max-md:w-auto ${open ? '' : 'max-md:hidden'}`}
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
        <div className='flex items-center gap-1.5' onKeyDown={onRowKeyDown}>
          <Button
            variant='outline'
            size='icon'
            className='size-8 shrink-0 max-md:size-11'
            aria-label='Previous'
            onClick={() => walk(-1)}
          >
            <ChevronLeft aria-hidden='true' className='size-4' />
          </Button>
          {/* The trigger renders the title itself (SelectValue's
              children), so the server's HTML carries the state the
              address names; without children the value fills in only once
              the client has mounted the items. */}
          <Select
            value={current.id}
            onValueChange={show}
            onOpenChange={(next) => {
              listOpenRef.current = next;
              /* Radix clears the trigger's typeahead when the list opens. */
              typeaheadRef.current = { search: '', at: 0 };
              const aside = asideRef.current;
              const trigger = triggerRef.current;
              if (next && aside && trigger) {
                setListPlacement(placeList(aside, trigger));
              }
            }}
          >
            <SelectTrigger
              ref={triggerRef}
              aria-label='State'
              title={current.title}
              className='h-8 min-w-0 flex-1 gap-1.5 px-2.5 py-0 text-xs max-md:h-11 max-md:px-3 max-md:text-sm'
              data-testid='dev-state-select'
            >
              <SelectValue>{current.title}</SelectValue>
            </SelectTrigger>
            {/* Placed from the console's box (placeList): clear of it on
                the side with room, sharing its edge on the side of the
                viewport it sits in, as wide as the longest title from md
                up (rounded up to a whole pixel, so that edge meets the
                console's exactly) and as wide as the console under the md
                cut, and as tall as the room on its side allows up to the
                CLI wizard's cap. The offset is Radix's sideOffset, so the
                Select's own 4px nudge is dropped. z 110 puts it over the
                console (z-50) and over the direction corner (100) and its
                list and index layer (101) where they meet, under the
                corner's hover preview (120), which cannot open while the
                list holds the pointer. Its keys stop at its edge, so the
                listeners on the document and the window never hear them.
                Radix hides the console from assistive tech while the list
                is open, so the list carries the trigger's name itself. */}
            <SelectContent
              aria-label='State'
              side={listPlacement.side}
              sideOffset={listPlacement.sideOffset}
              align={listPlacement.align}
              alignOffset={listPlacement.alignOffset}
              collisionPadding={listPlacement.collisionPadding}
              className='z-[110] data-[side=bottom]:translate-y-0 data-[side=top]:translate-y-0 md:w-[calc-size(max-content,round(up,size,1px))]'
              style={listStyle}
              onKeyDown={(event) => event.stopPropagation()}
              data-testid='dev-state-list'
            >
              {groupStates(states).map((group) => (
                <SelectGroup key={group.name} className='not-first:mt-1'>
                  {/* The key style's size and weight; the color is the
                      secondary text token, since titanium on the light
                      list is under 4.5:1 at 13px. */}
                  <SelectLabel className='text-muted-foreground text-[0.8125rem] leading-[1.45] font-medium'>
                    {group.name}
                  </SelectLabel>
                  {group.states.map((state) => {
                    const { step, onPath } = devPathPosition(state.id);
                    const variantId = `${idPrefix}-${state.id}-variant`;
                    /* The highlighted row (the keys' and the pointer's,
                       which Radix shares) carries the search palette's
                       mark, a 2px bar in ink at its left edge; the
                       Select's own fill is too faint to find alone. */
                    return (
                      <SelectItem
                        key={state.id}
                        value={state.id}
                        textValue={state.title}
                        aria-describedby={onPath ? undefined : variantId}
                        className={`${onPath ? '' : 'pl-6 '}data-[highlighted]:before:bg-foreground data-[highlighted]:before:absolute data-[highlighted]:before:inset-y-1 data-[highlighted]:before:left-0 data-[highlighted]:before:w-0.5`}
                      >
                        {state.title}
                        {/* The indent's meaning, in words, as the
                            option's description: hidden, so the name
                            stays the title (the option is named by this
                            text's parent), and textValue keeps the
                            typeahead on the title. */}
                        {onPath ? null : (
                          <span hidden id={variantId}>
                            variant of {titleById.get(devPath[step]!)}
                          </span>
                        )}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
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
