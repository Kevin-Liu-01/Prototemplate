'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';

import type { MagazineIssue, StoryCard } from './content';
import { dms } from './coords';
import { EditionContext, HOME_CITY, homeOf, storyHref, WHERE, type Edition } from './edition';
import { useLayoutWork, useMountEffect } from './hooks';
import { LANGS, TOPIC_NAMES, TOPICS, type Lang, type LangCode, type Topic } from './stories';
import { bookTitle } from './titles';
import { landed, move, plainClick } from './transition';
import Book, { bookDepth } from './ui/Book';
import Flag from './ui/Flag';
import HallGuides from './ui/HallGuides';
import LanguageRing from './ui/LanguageRing';
import Globe from './ui/Globe';
import Locator from './ui/Locator';
import HomeMark from './ui/HomeMark';
import PressMark from './ui/PressMark';
import { RowIcon, StackIcon } from './ui/icons';
import MagazineView, { loadArticle, prepareIssues } from './riffle/MagazineView';
import StopSlider from './ui/StopSlider';
import ThemeSwitch from './ui/ThemeSwitch';
import ViewSwitch from './ui/ViewSwitch';

type Mode = 'row' | 'stack';

const WHEEL_STEP = 40;
const WHEEL_REST = 420;
/** The gap between books lying in the stack. */
const STACK_GAP = 12;
/** How much thicker a book is on the shelf than in the reader. */
const SHELF_DEPTH = 1.7;
/** How far a press has to travel before it counts as a drag and not a click. */
const DRAG_SLOP = 6;

/** Every language starts at its first place. */
const FIRST_PLACES = Object.fromEntries(LANGS.map((l) => [l.code, 0])) as Record<LangCode, number>;

/* GT Atlas's front page. The books stand in a row that scrolls sideways
   (drag it, wheel it or swipe it), each turned a little so its spine shows;
   the book under the pointer turns to face it and lifts. The switch at the
   foot gathers them into a stack of spines. A click on a book opens its
   story. Each book's slot holds a still hit area and the link, so a book
   can lift and turn without slipping out from under the pointer. The flags
   at the foot set the titles' language and move the coordinates in the
   corner to one of its cities, flipping like a split-flap board; the globe
   beside them opens into the locator, the city on the globe with its
   coordinates. On the magazine's front page (/atlas) each story stands as a
   thin magazine with its cover lines; on the shelf kept from the direction
   before (/atlas/shelf), as a hardcover.

   On the rack a magazine's bottom right corner lifts under the pointer and
   shows its inside page; a click there opens the magazine over the hall
   (riffle/MagazineView), where its pages turn. A click anywhere else on the
   magazine opens the story's web page, as before. */
export default function Landing({ catalog, edition = 'magazine', issues }: { catalog: StoryCard[]; edition?: Edition; issues?: Record<string, MagazineIssue> }) {
  const router = useRouter();
  const format = edition === 'magazine' ? 'magazine' : 'book';
  const home = homeOf(edition);
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<Mode>('row');
  const [pressed, setPressed] = useState<number | null>(null);
  /** The book under the pointer, or the one the arrow keys moved to; only it lifts, turns and runs its cover. */
  const [hover, setHover] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [code, setCode] = useState<LangCode>('en');
  /** Which of each language's places the globe shows. */
  const [places, setPlaces] = useState(FIRST_PLACES);
  const visited = useRef(new Set<LangCode>(['en']));
  const [topic, setTopic] = useState<Topic | null>(null);
  /** The globe opened out into the locator. */
  const [globeOpen, setGlobeOpen] = useState(false);
  /** The magazine whose corner is lifted, and the one open over the hall. */
  const [peel, setPeel] = useState<number | null>(null);
  const [reading, setReading] = useState<number | null>(null);
  const magazine = edition === 'magazine';
  /** Set by the press that closes the locator, so its click is swallowed. */
  const closing = useRef(false);
  const state = useRef({ active: 0, mode: 'row' as Mode, globeOpen: false, reading: null as number | null });
  state.current = { active, mode, globeOpen, reading };
  const wheel = useRef({ sum: 0, last: 0 });
  const drag = useRef({ id: -1, x: 0, scroll: 0, moved: false, swallow: false });
  const shelf = useRef<HTMLDivElement>(null);

  const n = catalog.length;
  const lang: Lang = LANGS.find((l) => l.code === code) ?? LANGS[0]!;
  const place = lang.places[places[code] % lang.places.length] ?? lang.places[0]!;
  // the language under the pointer on the globe's ring, whose city the globe turns to while it rests there
  const [peeked, setPeeked] = useState<LangCode | null>(null);
  const peekLang = peeked ? LANGS.find((l) => l.code === peeked) : undefined;
  const seen = peekLang ? (peekLang.places[places[peekLang.code] % peekLang.places.length] ?? peekLang.places[0]!) : place;

  // the row: every book the same size, standing on one baseline
  const sizes = catalog.map(() => 1);
  const before = sizes.map((_, i) => sizes.slice(0, i).reduce((sum, k) => sum + k, 0));
  const span = sizes.reduce((sum, k) => sum + k, 0);

  // the stack, first story on top: each book's centre height from the stack's middle, y down
  const depths = catalog.map(() => Math.round(bookDepth(format) * SHELF_DEPTH));
  const total = depths.reduce((sum, d) => sum + d, 0) + STACK_GAP * (n - 1);
  let top = -total / 2;
  const heights = depths.map((d) => {
    const centre = top + d / 2;
    top += d + STACK_GAP;
    return centre;
  });

  /** Where in the scrolled row the stack centres: the middle of what the reader sees now. */
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

  /** A language picked again moves on to its next city, so no language is pinned to one place. */
  const pick = (next: LangCode) => {
    if (visited.current.has(next)) setPlaces((p) => ({ ...p, [next]: p[next] + 1 }));
    visited.current.add(next);
    setCode(next);
  };

  /** Shows one topic's books and fades the rest; the address keeps it as ?topic=. */
  const pickTopic = (next: Topic | null) => {
    setTopic(next);
    const url = new URL(location.href);
    if (next) url.searchParams.set('topic', next);
    else url.searchParams.delete('topic');
    history.replaceState(null, '', url);
    const first = next ? catalog.findIndex((s) => s.topics.includes(next)) : -1;
    if (first >= 0) browse(first);
  };

  useLayoutWork(anchor, { dependencies: [mode] });

  /** Opens a story through the press's crossfade (transition.ts), at one of its sections when `hash` names one. */
  const open = (i: number, hash = '') => {
    const s = catalog[i];
    if (s) move((href) => router.push(href), `${storyHref(edition, s.slug)}${hash ? `#${hash}` : ''}`);
  };

  /** Closes the open magazine and gives the focus back to the corner that opened it. */
  const closeMagazine = () => {
    const i = state.current.reading;
    setReading(null);
    setPeel(null);
    if (i !== null) requestAnimationFrame(() => shelf.current?.querySelectorAll<HTMLElement>('.gtp-shelf-corner')[i]?.focus());
  };

  // back from a story: the crossfade can capture the shelf now; then, once the browser is idle, every story and its
  // magazine is fetched ahead, so a click opens it at once
  useMountEffect(() => {
    landed();
    const fetchAll = () => {
      catalog.forEach((s) => router.prefetch(storyHref(edition, s.slug)));
      if (edition === 'magazine') prepareIssues(catalog.map((s) => storyHref(edition, s.slug)));
    };
    const idle = typeof requestIdleCallback === 'function' ? requestIdleCallback(fetchAll, { timeout: 2500 }) : window.setTimeout(fetchAll, 1200);
    return () => (typeof cancelIdleCallback === 'function' ? cancelIdleCallback(idle) : window.clearTimeout(idle));
  });

  // below the wide screen the view's switch is hidden, so the row comes back there rather than leave a stack with no way out
  useMountEffect(() => {
    const narrow = matchMedia('(max-width: 999px)');
    const sync = () => {
      if (narrow.matches) setMode('row');
    };
    sync();
    narrow.addEventListener('change', sync);
    return () => narrow.removeEventListener('change', sync);
  });

  // the dateline names the city the reader is in, as the host's edge reads it, and San Francisco until then or otherwise
  const [here, setHere] = useState(HOME_CITY);
  useMountEffect(() => {
    if (edition !== 'magazine') return;
    const ask = new AbortController();
    fetch(WHERE, { signal: ask.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((found: typeof HOME_CITY | null) => {
        if (found?.city) setHere(found);
      })
      .catch(() => {});
    return () => ask.abort();
  });

  useMountEffect(() => {
    if (edition !== 'shelf') return;
    const asked = new URLSearchParams(location.search).get('topic');
    const known = TOPICS.find((x) => x === asked);
    if (known) setTopic(known);
  });

  useMountEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest('input, textarea, [role="radiogroup"]')) return;
      const { active: a, globeOpen: g, reading: r } = state.current;
      // the open magazine takes the keys for its pages
      if (r !== null) return;
      if (e.key === 'Escape' && g) setGlobeOpen(false);
      else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        browse(a + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        browse(a - 1);
      } else if (e.key === 'Enter' && (!target || target === document.body)) {
        open(a);
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
    const { mode: m, active: a } = state.current;
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
    if (e.pointerType !== 'mouse' || e.button !== 0 || state.current.mode !== 'row') return;
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
    // the drag is over: the next hover lifts and leans again (the click it ends on is still swallowed)
    d.moved = false;
    d.id = -1;
    setDragging(false);
  };

  const flags = (size: number, named: boolean) =>
    LANGS.map((l) => (
      <button key={l.code} type='button' role='radio' aria-checked={l.code === code} aria-label={l.name} title={named ? undefined : l.name} onClick={() => pick(l.code)}>
        <Flag code={l.code} size={size} />
        {named ? (
          <span lang={l.code} dir={l.dir}>
            {l.name}
          </span>
        ) : null}
      </button>
    ));

  // the globe in its dial: a click opens the locator
  const globeButton = (
    <button type='button' className='gtp-globe-button' aria-expanded={globeOpen} aria-label='Languages on the globe' onClick={() => setGlobeOpen((g) => !g)}>
      <Globe place={seen} className='gtp-instrument-globe' cell={0.5} graticule label={false} />
    </button>
  );

  return (
    <EditionContext value={edition}>
    <div
      className='gtp gtp-landing'
      data-edition={edition}
      data-mode={mode}
      data-drag={dragging}
      data-langs={globeOpen}
      onPointerDown={(e) => {
        // a press anywhere off the locator closes it, and the click it ends in does nothing else
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
      <main className='gtp-hall' inert={reading !== null}>
        {edition === 'magazine' ? <HallGuides count={catalog.length} /> : null}
        <header className='gtp-hall-head'>
          {edition === 'magazine' ? (
            // the magazine's nameplate: the book imprint as tall as the capitals, its GT a link home, then Atlas in Katagami Serif
            <h1 className='gtp-nameplate' aria-label='GT Atlas'>
              <HomeMark className='gtp-nameplate-mark' />
              <span className='gtp-nameplate-word' aria-hidden='true'>
                Atlas
              </span>
            </h1>
          ) : (
            <h1 className='gtp-wordmark' aria-label='GT Atlas'>
              <PressMark className='gtp-wordmark-mark' />
              <span className='gtp-wordmark-word'>Atlas</span>
            </h1>
          )}
        </header>

        <div className='gtp-hall-coords'>
          {edition === 'magazine' ? (
            // the magazine's controls in one box, centred on the nameplate: the row or the stack, then the theme
            <div className='gtp-hall-tools'>
              <ViewSwitch value={mode} onChange={setMode} />
              <i className='gtp-hall-tools-rule' aria-hidden='true' />
              <ThemeSwitch />
            </div>
          ) : (
            <p className='gtp-hall-dms' aria-label={place.city}>
              <span>{dms(place.lat, 'lat')}</span>
              <span>{dms(place.lon, 'lon')}</span>
            </p>
          )}
          {/* the shelf keeps its topic tags and its theme switch here */}
          {edition === 'shelf' ? (
            <nav className='gtp-tags' aria-label='Topics'>
              {TOPICS.map((x) => (
                <a
                  key={x}
                  href={`${home}?topic=${x}`}
                  aria-current={topic === x ? 'true' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    pickTopic(topic === x ? null : x);
                  }}
                >
                  {TOPIC_NAMES[x]}
                </a>
              ))}
            </nav>
          ) : null}
          {edition === 'shelf' ? <ThemeSwitch /> : null}
        </div>

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
            {catalog.map((s, i) => (
              <li
                key={s.slug}
                className='gtp-shelf-item'
                data-on={hover === i}
                data-pressed={pressed === i}
                data-dim={topic !== null && !s.topics.includes(topic)}
                data-peel={peel === i}
                style={{ '--i': i, '--k': sizes[i], '--before': before[i], '--stack-y': `${heights[i]}px`, '--sbd': `${depths[i]}px` } as CSSProperties}
                onPointerEnter={() => {
                  if (drag.current.moved) return;
                  setActive(i);
                  setHover(i);
                  // fetch the story while the pointer is on its book, so the move can start as soon as it is clicked
                  router.prefetch(storyHref(edition, s.slug));
                }}
                onPointerMove={(e) => {
                  if (drag.current.moved) return;
                  const box = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty('--hx', ((e.clientX - box.left) / box.width - 0.5).toFixed(3));
                  e.currentTarget.style.setProperty('--hy', ((e.clientY - box.top) / box.height - 0.5).toFixed(3));
                }}
                onPointerLeave={(e) => {
                  e.currentTarget.style.removeProperty('--hx');
                  e.currentTarget.style.removeProperty('--hy');
                  setPressed((p) => (p === i ? null : p));
                  setHover((h) => (h === i ? null : h));
                  setPeel((k) => (k === i ? null : k));
                }}
                onPointerDown={() => setPressed(i)}
                onPointerUp={() => setPressed(null)}
              >
                <span className='gtp-shelf-shadow' aria-hidden='true' />
                <Book
                  className='gtp-book-shelf'
                  format={format}
                  issue={magazine ? issues?.[s.slug] : undefined}
                  story={s}
                  title={s.titles[code]}
                  lang={lang}
                  playing={hover === i}
                  on={hover === i}
                  style={{ '--bd': `${depths[i]}px` } as CSSProperties}
                />
                <Link
                  className='gtp-shelf-hit'
                  href={storyHref(edition, s.slug)}
                  aria-label={bookTitle(s.titles[code], code)}
                  onClick={(e) => {
                    if (!plainClick(e)) return;
                    e.preventDefault();
                    open(i);
                  }}
                  onFocus={() => {
                    setActive(i);
                    setHover(i);
                  }}
                  onBlur={() => setHover((h) => (h === i ? null : h))}
                />
                {magazine && issues?.[s.slug] ? (
                  // the corner that lifts: a pointer over it peels the page back, a click opens the magazine
                  <button
                    type='button'
                    className='gtp-shelf-corner'
                    aria-label={`Open ${bookTitle(s.titles[code], code)} as a magazine`}
                    onPointerEnter={() => {
                      setPeel(i);
                      // the magazine's article, fetched as the corner lifts, so the magazine opens at once
                      void loadArticle(storyHref(edition, s.slug));
                    }}
                    onPointerLeave={() => setPeel((k) => (k === i ? null : k))}
                    onFocus={() => {
                      setActive(i);
                      setHover(i);
                      setPeel(i);
                      void loadArticle(storyHref(edition, s.slug));
                    }}
                    onBlur={() => setPeel((k) => (k === i ? null : k))}
                    onClick={() => {
                      if (drag.current.swallow) return;
                      setReading(i);
                    }}
                  />
                ) : null}
              </li>
            ))}
          </ol>
        </div>

        <section className='gtp-langs' data-open={globeOpen} aria-hidden={!globeOpen} inert={!globeOpen} aria-label='Languages'>
          <Locator place={place} className='gtp-langs-locator' />
          <div className='gtp-langs-flags' role='radiogroup' aria-label='Language of the titles'>
            {flags(22, true)}
          </div>
          <button type='button' className='gtp-dismiss' onClick={() => setGlobeOpen(false)} aria-label='Close the languages'>
            <svg viewBox='0 0 20 20' aria-hidden='true'>
              <path d='M5.5 5.5l9 9M14.5 5.5l-9 9' />
            </svg>
          </button>
        </section>

        <div className='gtp-band'>
          <div className='gtp-instrument'>
            {edition === 'magazine' ? (
              // the languages stand round the globe's dial, the chosen one at its right
              <LanguageRing value={code} onPick={pick} onPeek={setPeeked}>
                {globeButton}
              </LanguageRing>
            ) : (
              <>
                {globeButton}
                <div className='gtp-flags' role='radiogroup' aria-label='Language of the titles'>
                  {flags(20, false)}
                </div>
              </>
            )}
          </div>
          <div className='gtp-band-view'>
            {edition === 'magazine' ? (
              // the dateline as an engineering journal's box: three ruled rows, each a short field name and its value, the city
              // the reader is in (after a fine crosshair), then its latitude, then its longitude
              <dl className='gtp-dateline'>
                <dt>Loc</dt>
                <dd className='gtp-dateline-city'>
                  <svg className='gtp-hall-crosshair' viewBox='-12 -12 24 24' aria-hidden='true'>
                    <circle r='6' />
                    <path d='M-12 0 H-3 M3 0 H12 M0 -12 V-3 M0 3 V12' />
                  </svg>
                  <span>{here.city}</span>
                </dd>
                <dt>Lat</dt>
                <dd className='gtp-hall-dms'>
                  {dms(here.lat, 'lat')}
                </dd>
                <dt>Lon</dt>
                <dd className='gtp-hall-dms'>
                  {dms(here.lon, 'lon')}
                </dd>
              </dl>
            ) : (
              <StopSlider
                stops={[
                  { value: 'row', label: <RowIcon size={14} /> },
                  { value: 'stack', label: <StackIcon size={14} /> },
                ]}
                value={mode}
                onChange={(v) => setMode(v as Mode)}
                label='Lay the books out in a row or a stack'
                className='gtp-view'
                tone='stage'
              />
            )}
          </div>
        </div>
      </main>
      {reading !== null && catalog[reading] && issues?.[catalog[reading]!.slug] ? (
        <MagazineView
          story={catalog[reading]!}
          href={storyHref(edition, catalog[reading]!.slug)}
          onRead={(hash) => open(reading, hash)}
          onClose={closeMagazine}
        />
      ) : null}
    </div>
    </EditionContext>
  );
}
