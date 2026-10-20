'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';

import type { StoryCard } from './content';
import { useLayoutWork, useMountEffect } from './hooks';
import { dms, dmsPair, HOME } from './coords';
import { bookTitle } from './titles';
import { LANGS, TOPICS, type Lang, type LangCode, type Topic } from './stories';
import Book, { bookDepth } from './ui/Book';
import Globe from './ui/Globe';
import Flag from './ui/Flag';
import PressMark from './ui/PressMark';
import { ArrowIcon, RowIcon, StackIcon } from './ui/icons';
import StopSlider from './ui/StopSlider';

type Mode = 'row' | 'stack';

const WHEEL_STEP = 40;
const WHEEL_REST = 420;
/** The gap between books lying in the stack. */
const STACK_GAP = 12;
/** How much thicker a book is on the shelf than in the reader. */
const SHELF_DEPTH = 1.7;
/** How far a press has to travel before it counts as a drag and not a click. */
const DRAG_SLOP = 6;

const pad = (n: number) => String(n).padStart(2, '0');

/* GT Atlas's front page. The books stand square to the reader in a row that
   scrolls sideways (drag it, wheel it or swipe it). The book under the
   pointer turns to face it, lifts and leans toward it. The
   switch at the foot gathers them into a stack of spines and lays them back
   out. Choosing a book in either view brings it forward at a larger size
   while the shelf dims behind it, and the panel beside it gives the
   summary, one line of details, the contents and the Read link; Escape, the dimmed
   shelf or the close button put it back. Every pose is drawn through the
   book's own perspective, so each book stays square to the reader wherever
   it sits. The plates along the foot are Direction 01's: the language by
   its flag, the globe, the scripts and the characters. */
export default function Landing({ catalog }: { catalog: StoryCard[] }) {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<Mode>('row');
  const [open, setOpen] = useState(false);
  const [pressed, setPressed] = useState<number | null>(null);
  /** The book under the pointer, or the one the arrow keys moved to; only it lifts, turns and runs its cover. */
  const [hover, setHover] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [code, setCode] = useState<LangCode>('en');
  const [topic, setTopic] = useState<Topic | null>(null);
  /** The globe opened out into the language readouts. */
  const [globeOpen, setGlobeOpen] = useState(false);
  /** Set by the press that closes the languages, so its click is swallowed. */
  const closing = useRef(false);
  const state = useRef({ active: 0, open: false, mode: 'row' as Mode, globeOpen: false });
  state.current = { active, open, mode, globeOpen };
  const wheel = useRef({ sum: 0, last: 0 });
  const drag = useRef({ id: -1, x: 0, scroll: 0, moved: false, swallow: false });
  const shelf = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLElement>(null);

  const n = catalog.length;
  const lang: Lang = LANGS.find((l) => l.code === code) ?? LANGS[0]!;
  const story = catalog[active];

  // the row: every book the same size, standing on one baseline
  const sizes = catalog.map(() => 1);
  const before = sizes.map((_, i) => sizes.slice(0, i).reduce((sum, k) => sum + k, 0));
  const span = sizes.reduce((sum, k) => sum + k, 0);

  // the stack, first story on top: each book's centre height from the stack's middle, y down
  const depths = catalog.map(() => Math.round(bookDepth() * SHELF_DEPTH));
  const total = depths.reduce((sum, d) => sum + d, 0) + STACK_GAP * (n - 1);
  let top = -total / 2;
  const heights = depths.map((d) => {
    const centre = top + d / 2;
    top += d + STACK_GAP;
    return centre;
  });

  /** Where in the scrolled row the stack and the chosen book centre: the middle of what the reader sees now. */
  const anchor = () => {
    const el = shelf.current;
    if (el) el.style.setProperty('--anchor', `${el.scrollLeft + el.clientWidth / 2}px`);
  };

  const reveal = (i: number) => {
    const item = shelf.current?.querySelectorAll<HTMLElement>('.gtp-shelf-item')[i];
    item?.scrollIntoView({ inline: 'center', block: 'nearest' });
  };

  const browse = (i: number) => {
    const next = Math.max(0, Math.min(n - 1, i));
    setActive(next);
    setHover(next);
    if (state.current.mode === 'row') reveal(next);
  };

  const choose = (i: number) => {
    setActive(i);
    setOpen(true);
  };

  /** Shows one topic's books and fades the rest; the address keeps it as ?topic=. */
  const pickTopic = (next: Topic | null) => {
    setTopic(next);
    setOpen(false);
    const url = new URL(location.href);
    if (next) url.searchParams.set('topic', next);
    else url.searchParams.delete('topic');
    history.replaceState(null, '', url);
    const first = next ? catalog.findIndex((s) => s.topics.includes(next)) : -1;
    if (first >= 0) browse(first);
  };

  useLayoutWork(anchor, { dependencies: [mode, open] });

  // the panel takes the focus when a book is chosen, and gives it back to the shelf when it goes
  useLayoutWork(
    () => {
      if (open) panel.current?.querySelector<HTMLElement>('.gtp-read')?.focus({ preventScroll: true });
    },
    { dependencies: [open] }
  );

  useMountEffect(() => {
    const asked = new URLSearchParams(location.search).get('topic');
    const known = TOPICS.find((x) => x === asked);
    if (known) setTopic(known);
  });

  useMountEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest('input, textarea, [role="radiogroup"]')) return;
      const { active: a, open: o, globeOpen: g } = state.current;
      if (e.key === 'Escape' && g) setGlobeOpen(false);
      else if (e.key === 'Escape' && o) setOpen(false);
      else if ((e.key === 'ArrowRight' || e.key === 'ArrowDown') && !o) {
        e.preventDefault();
        browse(a + 1);
      } else if ((e.key === 'ArrowLeft' || e.key === 'ArrowUp') && !o) {
        e.preventDefault();
        browse(a - 1);
      } else if (e.key === 'Enter' && (!target || target === document.body)) {
        if (!o) choose(a);
        else router.push(`/press/${catalog[a]?.slug}`);
      }
    };
    addEventListener('keydown', onKey);
    const observer = new ResizeObserver(anchor);
    if (shelf.current) observer.observe(shelf.current);
    return () => {
      removeEventListener('keydown', onKey);
      observer.disconnect();
    };
  });

  /* a mouse wheel turns the row sideways; in the stack it steps through the spines */
  const onWheel = (deltaY: number, deltaX: number) => {
    const { mode: m, open: o, active: a } = state.current;
    if (o) return;
    if (m === 'row') {
      if (Math.abs(deltaY) > Math.abs(deltaX)) shelf.current?.scrollBy({ left: deltaY });
      return;
    }
    const w = wheel.current;
    const now = performance.now();
    w.sum += deltaY;
    if (Math.abs(w.sum) < WHEEL_STEP || now - w.last < WHEEL_REST) return;
    browse(a + Math.sign(w.sum));
    w.sum = 0;
    w.last = now;
  };

  /* a mouse drags the row; a touch scrolls it natively */
  const dragStart = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || state.current.open || state.current.mode !== 'row') return;
    drag.current = { id: e.pointerId, x: e.clientX, scroll: e.currentTarget.scrollLeft, moved: false, swallow: false };
  };
  const dragMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > DRAG_SLOP) {
      d.moved = true;
      setDragging(true);
      setPressed(null);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (d.moved) e.currentTarget.scrollLeft = d.scroll - dx;
  };
  const dragEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (d.id !== e.pointerId) return;
    d.swallow = d.moved;
    d.id = -1;
    setDragging(false);
  };

  return (
    <div
      className='gtp gtp-landing'
      data-mode={mode}
      data-open={open}
      data-drag={dragging}
      data-langs={globeOpen}
      onPointerDown={(e) => {
        // a press anywhere off the languages closes them, and the click it ends in does nothing else
        closing.current = globeOpen && e.target instanceof Element && !e.target.closest('.gtp-langs, .gtp-globe-button');
        if (closing.current) setGlobeOpen(false);
      }}
      onClickCapture={(e) => {
        if (!closing.current) return;
        closing.current = false;
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <main className='gtp-hall'>
        <header className='gtp-hall-head'>
          <h1 className='gtp-wordmark' aria-label='GT Atlas'>
            <PressMark className='gtp-wordmark-mark' />
            <span className='gtp-wordmark-word'>Atlas</span>
          </h1>
        </header>

        <div className='gtp-hall-coords'>
          <span className='gtp-mono' aria-hidden='true'>
            {dms(HOME.lat, 'lat')}
          </span>
          <span className='gtp-mono' aria-hidden='true'>
            {dms(HOME.lon, 'lon')}
          </span>
          <nav className='gtp-tags' aria-label='Topics'>
            {TOPICS.map((x) => (
              <a
                key={x}
                href={`/press?topic=${encodeURIComponent(x)}`}
                aria-current={topic === x ? 'true' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  pickTopic(topic === x ? null : x);
                }}
              >
                {x}
              </a>
            ))}
          </nav>
        </div>

        <p className='gtp-backdrop' lang='ja' aria-hidden='true'>
          <span>世界へ</span>
          <span className='gtp-backdrop-band'>羽ばたく</span>
          <span>ために</span>
        </p>

        <div
          ref={shelf}
          className='gtp-shelf'
          onWheel={(e) => onWheel(e.deltaY, e.deltaX)}
          onPointerDown={dragStart}
          onPointerMove={dragMove}
          onPointerUp={dragEnd}
          onPointerCancel={dragEnd}
          onClickCapture={(e) => {
            // a drag that ends over a book is not a click on it
            if (drag.current.swallow) {
              drag.current.swallow = false;
              e.stopPropagation();
              e.preventDefault();
            }
          }}
        >
          <ol className='gtp-shelf-track' style={{ '--n': n, '--span': span } as CSSProperties}>
            <li className='gtp-shelf-scrim' aria-hidden='true' onClick={() => setOpen(false)} />
            {catalog.map((s, i) => (
              <li
                key={s.slug}
                className='gtp-shelf-item'
                data-on={hover === i}
                data-chosen={open && i === active}
                data-pressed={pressed === i}
                data-dim={topic !== null && !s.topics.includes(topic)}
                style={{ '--i': i, '--k': sizes[i], '--before': before[i], '--stack-y': `${heights[i]}px` } as CSSProperties}
                onPointerEnter={() => {
                  if (state.current.open || drag.current.moved) return;
                  setActive(i);
                  setHover(i);
                }}
                onPointerMove={(e) => {
                  if (state.current.open || drag.current.moved) return;
                  const box = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty('--hx', ((e.clientX - box.left) / box.width - 0.5).toFixed(3));
                  e.currentTarget.style.setProperty('--hy', ((e.clientY - box.top) / box.height - 0.5).toFixed(3));
                }}
                onPointerLeave={(e) => {
                  e.currentTarget.style.removeProperty('--hx');
                  e.currentTarget.style.removeProperty('--hy');
                  setPressed((p) => (p === i ? null : p));
                  setHover((h) => (h === i ? null : h));
                }}
                onPointerDown={() => setPressed(i)}
                onPointerUp={() => setPressed(null)}
              >
                <span className='gtp-shelf-shadow' aria-hidden='true' />
                <Book
                  className='gtp-book-shelf'
                  story={s}
                  title={s.titles[code]}
                  lang={lang}
                  playing={hover === i || (open && i === active)}
                  on={hover === i}
                  style={{ '--bd': `${depths[i]}px` } as CSSProperties}
                  onClick={() => {
                    if (open && i === active) return;
                    choose(i);
                  }}
                />
              </li>
            ))}
          </ol>
        </div>

        {story ? (
          <aside ref={panel} className='gtp-presented' aria-hidden={!open} inert={!open} aria-label={story.titles[code]}>
            <button type='button' className='gtp-dismiss' onClick={() => setOpen(false)} aria-label='Put the book back'>
              <span aria-hidden='true'>×</span>
            </button>
            <h2 lang={lang.code} dir={lang.dir}>
              {bookTitle(story.titles[code], lang.code)}
            </h2>
            <p>{story.summary}</p>
            <p className='gtp-presented-meta'>
              {story.authors.join(', ')} · {story.date} · {story.minutes} min
            </p>
            <ol className='gtp-presented-contents'>
              {story.sections.map((section, k) => (
                <li key={section.id}>
                  <Link href={`/press/${story.slug}#${section.id}`}>
                    <span className='gtp-mono'>{pad(k + 1)}</span>
                    {section.text}
                  </Link>
                </li>
              ))}
            </ol>
            <div className='gtp-presented-actions'>
              <Link className='gtp-read' href={`/press/${story.slug}`}>
                Read
                <ArrowIcon size={14} />
              </Link>
            </div>
          </aside>
        ) : null}

        <section id='gtp-langs' className='gtp-langs' data-open={globeOpen} aria-hidden={!globeOpen} inert={!globeOpen} aria-label='Languages'>
          <Globe place={lang} className='gtp-langs-globe' cell={2} />
          <ol className='gtp-langs-list'>
            {LANGS.map((l) => (
              <li key={l.code}>
                <button type='button' aria-pressed={l.code === code} onClick={() => setCode(l.code)}>
                  <Flag code={l.code} size={20} />
                  <span className='gtp-langs-name' lang={l.code}>
                    {l.name}
                  </span>
                  <span className='gtp-langs-city'>{l.city}</span>
                  <span className='gtp-mono gtp-langs-dms'>{dmsPair(l)}</span>
                </button>
              </li>
            ))}
          </ol>
          <button type='button' className='gtp-dismiss' onClick={() => setGlobeOpen(false)} aria-label='Close the languages'>
            <span aria-hidden='true'>×</span>
          </button>
        </section>

        <div className='gtp-band'>
          <div className='gtp-instrument'>
            <button type='button' className='gtp-globe-button' aria-expanded={globeOpen} aria-controls='gtp-langs' aria-label='Languages' onClick={() => setGlobeOpen((g) => !g)}>
              <Globe place={lang} className='gtp-instrument-globe' cell={2} />
            </button>
            <div className='gtp-instrument-body'>
              <div className='gtp-flags' role='radiogroup' aria-label='Language of the titles'>
                {LANGS.map((l) => (
                  <button key={l.code} type='button' role='radio' aria-checked={l.code === code} aria-label={l.name} title={l.name} onClick={() => setCode(l.code)}>
                    <Flag code={l.code} size={20} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className='gtp-band-view'>
            <StopSlider
              stops={[
                { value: 'row', label: <RowIcon size={14} /> },
                { value: 'stack', label: <StackIcon size={14} /> },
              ]}
              value={mode}
              onChange={(v) => {
                setOpen(false);
                setMode(v as Mode);
              }}
              label='Lay the books out in a row or a stack'
              className='gtp-view'
              tone='stage'
            />
          </div>
        </div>

      </main>
    </div>
  );
}
