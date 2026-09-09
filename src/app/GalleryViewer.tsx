'use client';

import { useGSAP } from '@gsap/react';
import Link from 'next/link';
import type { ReactNode, RefObject } from 'react';
import { useRef, useState } from 'react';

import PrismaticField from '@/components/shared/PrismaticField';
import { Icon } from '@/components/viewer/icons';
import { Sheet } from '@/components/viewer/Sheet';
import { usePtShell } from '@/components/viewer/shell-context';
import { ThumbShot } from '@/components/viewer/ThumbShot';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { ARCHIVE, ARCHIVE_DELETION, archiveDate, archiveDesc, archiveFull, archiveHost, archiveShot } from '@/lib/archive';
import type { ArchiveEntry } from '@/lib/archive';
import { cn } from '@/lib/cn';
import { DIRECTIONS } from '@/lib/directions';
import type { Direction } from '@/lib/directions';
import type { ShellItem, ShellMode, ShellSection } from '@/lib/shell-data';
import { useMountEffect } from '@/lib/use-mount-effect';

import PrototemplateHero from './PrototemplateHero';
import SiteCompare from './SiteCompare';

import './GalleryViewer.css';

/**
 * The gallery on the viewer shell. Three modes: the book (default) is the
 * existing editorial article inside the flow sheet at the 1170px rail, with
 * the sidebar tracking the direction in view and nothing marked while the
 * nameplate and the opener are on screen; the slide is one live 1440x900
 * exhibit of the active direction in the fixed sheet; the grid is every
 * capture at once. The shell draws the site map (Pages, Documents) around
 * the gallery's own sections (Sites, Explorations, Archive), so the one
 * order holds on every route. Keys are paged only while the slide is up; in
 * the book and the grid the arrows and Space scroll. The archive rows can be
 * selected but are not counted: the count reads the 17 directions.
 */

const GALLERY_TITLE = 'Prototemplate';
const GALLERY_MODES: readonly ShellMode[] = ['book', 'slide', 'grid'];

/** the live exhibit's stage in CSS pixels, before the sheet scales it */
const EXHIBIT_W = 1440;
const EXHIBIT_H = 900;

/** how long a new selection waits before the exhibit frame loads it, so rapid arrowing does not load every page */
const SETTLE_MS = 300;

/** the band in the middle of the book that decides the direction in view */
const IO_ROOT_MARGIN = '-42% 0px -42% 0px';
const IO_THRESHOLDS = [0, 0.25, 0.5, 1];

/**
 * An archived version: one of the retired /d routes, kept viewable as its
 * captures after the code left the tree (decision 1). The list lives in
 * src/lib/archive.ts with one entry per route: the slug, the name, the
 * capture date, the source address, the capture sizes and the commit that
 * last held the code. Captures live at public/shots/archive/<slug>.jpg (the
 * 1440x900 crop) and <slug>-full.jpg (the full page).
 */

/** The full site concepts and the shipped reference together, then the single-page explorations in label order. */
const SITES = DIRECTIONS.filter((d) => d.site);
const REFERENCE = DIRECTIONS.find((d) => d.reference);
const EXPLORATIONS = DIRECTIONS.filter((d) => !d.site);

function directionItem(d: Direction): ShellItem {
  return {
    id: d.slug,
    /* the sites carry no number: the labels belong to the explorations */
    n: d.site ? '' : (d.label ?? ''),
    title: d.name,
    href: `/d/${d.slug}`,
    desc: d.reference ? `${d.concept} Live at generaltranslation.com.` : d.concept,
    shot: { light: `/shots/light/${d.slug}.jpg`, dark: `/shots/dark/${d.slug}.jpg` },
  };
}

function archiveItem(entry: ArchiveEntry): ShellItem {
  return {
    id: entry.slug,
    n: '',
    title: entry.name,
    desc: archiveDesc(entry),
    shot: { light: archiveShot(entry) },
  };
}

const ALL_SECTIONS: readonly ShellSection[] = [
  { id: 'sites', label: 'Sites', items: SITES.map(directionItem) },
  { id: 'explorations', label: 'Explorations', items: EXPLORATIONS.map(directionItem) },
  { id: 'archive', label: 'Archive', items: ARCHIVE.map(archiveItem), paged: false },
];

const SECTIONS: readonly ShellSection[] = ALL_SECTIONS.filter((section) => section.items.length > 0);

const ITEM_BY_ID = new Map(SECTIONS.flatMap((section) => section.items).map((item) => [item.id, item]));
const DIRECTION_BY_SLUG = new Map(DIRECTIONS.map((d) => [d.slug, d]));
const ARCHIVE_BY_SLUG = new Map(ARCHIVE.map((entry) => [entry.slug, entry]));

/** where the archive's Escape lands: the last direction before the archive */
const LAST_EXHIBIT = (EXPLORATIONS[EXPLORATIONS.length - 1] ?? DIRECTIONS[DIRECTIONS.length - 1]).slug;

/**
 * Where the article should open when it mounts: `top` from the Gallery row,
 * `archive` from the archive sheet's Escape, or the hash landing when null.
 * A ref, not state, because it is consumed once by the mount that follows.
 */
type MountIntent = 'top' | 'archive' | null;

/** The item id in the hash, decoded; empty when there is none. */
function readHash(): string {
  const raw = window.location.hash.replace(/^#/, '');
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
}

/* ---- the opener's distillation figure, as data ----
   One continuous corridor, narrowing in two throats: a 7x3 field of
   sketched direction cells (the eight retired ones hatched out), the
   thirteen structured cards that survived review, and the three full
   sites as cascaded browser windows, fidelity rising as the count
   falls. Stroke lengths vary deterministically so no two cells read
   alike. Grids sit 8 units inside the walls so no rule ever doubles. */
const FUNNEL_RETIRED = new Set([2, 5, 7, 10, 13, 15, 18, 19]);

/** Stage one: 21 direction cells on a 47/37 pitch, 8 hatched retired. */
const FUNNEL_FIELD = Array.from({ length: 21 }, (_, i) => ({
  x: 20 + (i % 7) * 47,
  y: 16 + Math.floor(i / 7) * 37,
  retired: FUNNEL_RETIRED.has(i),
  t: 8 + ((i * 5) % 9),
  b: 18 + ((i * 7) % 9),
  b2: 11 + ((i * 3) % 11),
}));

/** Stage two: the 13 survivors as headered cards, rows of 5 / 5 / 3. */
const FUNNEL_SURVIVORS = [
  ...Array.from({ length: 5 }, (_, i) => ({ x: 76 + i * 43, y: 208, b: 14 + ((i * 5) % 11), b2: 9 + ((i * 7) % 9) })),
  ...Array.from({ length: 5 }, (_, i) => ({ x: 76 + i * 43, y: 242, b: 16 + ((i * 7) % 9), b2: 11 + ((i * 5) % 9) })),
  ...Array.from({ length: 3 }, (_, i) => ({ x: 119 + i * 43, y: 276, b: 15 + ((i * 6) % 10), b2: 10 + ((i * 4) % 9) })),
];

/** Stage three: the three sites, browser windows cascaded like the fan. */
const FUNNEL_SITES = Array.from({ length: 3 }, (_, i) => ({ x: 134 + i * 14, y: 386 + i * 8 }));

/** The presenter's actual running order. */
const DECK = [
  { n: '01', name: 'Intro', note: 'the nameplate' },
  { n: '02', name: 'Why', note: 'the case for a redesign' },
  { n: '03', name: 'Principles', note: 'the rules the system runs on' },
  { n: '04', name: 'Craft', note: 'the details, measured' },
  { n: '05', name: 'Type detail', note: 'letterforms at working size' },
  { n: '06', name: 'Prototypes', note: 'every direction, live' },
  { n: '07', name: 'Scoreboard', note: 'how each round was judged' },
] as const;

/**
 * Resolves the presenter's `?d=<slug>` deep link into the slide on mount:
 * setMode persists the choice before the shell reads it, select writes the
 * hash, and the query string is dropped.
 */
function DeepLink() {
  const { setMode, select } = usePtShell();

  useMountEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('d');
    if (!slug || !DIRECTION_BY_SLUG.has(slug)) return;
    setMode('slide');
    select(slug);
    try {
      window.history.replaceState(null, '', `${window.location.pathname}#${encodeURIComponent(slug)}`);
    } catch {
      // a sandboxed document: the state moved, the address stays
    }
  });

  return null;
}

/**
 * Two rungs the gallery adds to the shell's Escape ladder. Registered from a
 * child of the shell, so this listener runs before the shell's and can claim
 * the key (the shell honors defaultPrevented). Presenting a live exhibit:
 * Escape leaves presentation mode and stays on the exhibit, where the shell
 * would return to the book first. An archived capture in the book: Escape
 * returns to the article at its Archive section.
 */
function GalleryEscape({ intent }: { intent: RefObject<MountIntent> }) {
  const shell = usePtShell();
  const shellRef = useRef(shell);
  shellRef.current = shell;

  useMountEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      if (isEditable(e.target)) return;
      const s = shellRef.current;
      if (s.helpOpen || s.panelOpen) return;
      if (s.present && s.mode === 'slide') {
        if (document.fullscreenElement) return;
        e.preventDefault();
        s.setPresent(false);
        return;
      }
      if (s.mode === 'book' && !s.present && ARCHIVE_BY_SLUG.has(s.active)) {
        e.preventDefault();
        intent.current = 'archive';
        s.select(LAST_EXHIBIT);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  });

  return null;
}

/**
 * Fills the ref the shell's Gallery row calls: the book comes back to its
 * top with nothing marked. From the slide, the grid or an archived capture
 * the article is about to mount, so it opens at the top instead of at the
 * hash.
 */
type HomeProps = {
  home: RefObject<() => void>;
  scrollRef: RefObject<HTMLDivElement | null>;
  intent: RefObject<MountIntent>;
};

function GalleryHome({ home, scrollRef, intent }: HomeProps) {
  const shell = usePtShell();
  home.current = () => {
    if (shell.mode !== 'book' || ARCHIVE_BY_SLUG.has(shell.active)) intent.current = 'top';
    else scrollRef.current?.scrollTo({ top: 0 });
    shell.select('');
    shell.setMode('book');
  };
  return null;
}

/** The toolbar slot: opens the marked direction as its own page, named. Absent while no direction is marked. */
function OpenPage() {
  const { active } = usePtShell();
  const direction = DIRECTION_BY_SLUG.get(active);
  if (!direction) return null;
  return (
    <Link className='pt-ib gv-open' href={`/d/${direction.slug}`} title={`Open ${direction.name} as its own page`}>
      <Icon name='open-page' />
      <span className='pt-lb'>Open {direction.name}</span>
    </Link>
  );
}

/**
 * The live exhibit in slide mode: one same-origin iframe of the direction
 * page with its corner hidden, at 1440x900 inside the fixed sheet, which
 * scales it. The static capture sits behind it and shows until the page has
 * loaded; a new selection waits SETTLE_MS before the frame takes it, so
 * arrowing through the list loads only where the reader stops. The frame is
 * keyed by its address, so a late load event from a page that was skipped
 * never marks the next one ready. The gt:freeze gate the presenter uses for
 * its wall is not needed here: this is the one live frame, and it unmounts
 * with the mode. The theme reaches the frame through the storage event the
 * boot script in layout.tsx listens for.
 */
function ExhibitFrame({ direction }: { direction: Direction }) {
  const [src, setSrc] = useState<string | null>(null);
  const [ready, setReady] = useState<string | null>(null);

  useGSAP(
    () => {
      const timer = window.setTimeout(() => setSrc(`/d/${direction.slug}?chrome=0`), SETTLE_MS);
      return () => window.clearTimeout(timer);
    },
    { dependencies: [direction.slug], revertOnUpdate: true }
  );

  const item = ITEM_BY_ID.get(direction.slug) ?? directionItem(direction);
  const on = src !== null && ready === src;

  return (
    <div className='gv-exhibit'>
      <ThumbShot item={item} />
      {src ? (
        <iframe
          key={src}
          className={cn('gv-frame', on && 'is-on')}
          src={src}
          title={`${direction.name}, live at 1440 pixels wide`}
          onLoad={() => setReady(src)}
        />
      ) : null}
    </div>
  );
}

/**
 * An archived version: its full-page capture in a flow sheet under the name,
 * the source address, the capture date and the commit that last held the
 * code. Shown whenever the active item is an archive entry, in the book and
 * the slide alike; Escape (GalleryEscape) or any sidebar item leaves it. The
 * same record opens on its own address at /archive/<slug>.
 */
function ArchiveSheet({ entry }: { entry: ArchiveEntry }) {
  return (
    <Sheet variant='flow'>
      <div className='gv-archive'>
        <div className='gv-archive-head'>
          <div>
            <h1>{entry.name}</h1>
            <p>
              Captured from{' '}
              <a href={entry.source} target='_blank' rel='noreferrer'>
                {archiveHost(entry)}
              </a>
            </p>
          </div>
          <dl className='gv-archive-meta'>
            <div>
              <dt>Captured</dt>
              <dd>{archiveDate(entry)}</dd>
            </div>
            <div>
              <dt>Last held in</dt>
              <dd>{entry.lastCommit}</dd>
            </div>
            <div>
              <dt>Size</dt>
              <dd>
                {entry.width} by {entry.fullHeight}
              </dd>
            </div>
          </dl>
        </div>
        <p className='gv-archive-note'>
          The page was captured at {entry.width} pixels wide in the light theme before its route was deleted.
          The code stays in the repository history under commit {entry.lastCommit}. The route was removed in the
          next commit, {ARCHIVE_DELETION.hash}, &ldquo;{ARCHIVE_DELETION.subject}&rdquo;, on branch{' '}
          {ARCHIVE_DELETION.branch}. Press Escape to return to the gallery.
        </p>
        <p className='gv-archive-static'>
          This is a static capture; nothing in it is live.{' '}
          <a href={archiveShot(entry)} target='_blank' rel='noreferrer'>
            Open the 1440 by 900 crop
          </a>
        </p>
        <img
          className='gv-archive-full'
          src={archiveFull(entry)}
          alt={`${entry.name}, the full page at ${entry.width} pixels wide`}
        />
      </div>
    </Sheet>
  );
}

type ArticleProps = {
  fontClass: string;
  anatomy: ReactNode;
  ledger: ReactNode;
  scrollRef: RefObject<HTMLDivElement | null>;
  intent: RefObject<MountIntent>;
};

/**
 * The book: the gallery article as it was, inside the flow sheet at the
 * 1170px rail, under .pt-root so it keeps its own token family (decision 6)
 * and the nameplate's two faces (decision 3). The old top nav is gone; the
 * shell's sidebar and index panel take its place. The sections that stand
 * for a direction carry data-gv-id, and the nameplate with the opener
 * carries data-gv-top: an IntersectionObserver on the sheet marks the one in
 * the middle band active through the shell (the top clears the mark, so
 * only the Gallery row is current while nothing is on screen), which
 * updates the hash without scrolling, and a selection from anywhere else
 * (the sidebar, the keys, a grid click that landed in the book) scrolls its
 * section into view. The archive rows are not spied, so reading past them
 * never opens a capture uninvited.
 */
function GalleryArticle({ fontClass, anatomy, ledger, scrollRef, intent }: ArticleProps) {
  const { active, select } = usePtShell();
  const root = useRef<HTMLDivElement>(null);

  /* the observer and the scroll effect read the latest state through refs;
     the assignments run every render so the mount-time listeners never see
     a stale closure */
  const activeRef = useRef(active);
  activeRef.current = active;
  const selectRef = useRef(select);
  selectRef.current = select;
  /** the id the observer just selected, so the scroll effect leaves the reader's scroll alone */
  const fromScroll = useRef<string | null>(null);
  /** the active id the scroll effect last saw; null before the first run */
  const lastActive = useRef<string | null>(null);
  /** true once the first frame after mount has passed; a change that lands before it is a landing, not a move */
  const landed = useRef(false);

  const target = (id: string): HTMLElement | null =>
    root.current?.querySelector<HTMLElement>(`[data-gv-id="${CSS.escape(id)}"]`) ?? null;

  const scrollTo = (el: HTMLElement | null, behavior: ScrollBehavior) => {
    if (el) el.scrollIntoView({ block: 'start', behavior });
  };

  useMountEffect(() => {
    const box = root.current;
    const scroller = scrollRef.current;

    /* the landing: an intent from the Gallery row or the archive's Escape
       wins; otherwise a hash that names the active item opens the book at
       its section, and a plain visit opens at the nameplate */
    const want = intent.current;
    intent.current = null;
    if (want === 'archive') {
      scrollTo(box?.querySelector<HTMLElement>('[data-gv-anchor="archive"]') ?? null, 'instant');
    } else if (want !== 'top' && activeRef.current && readHash() === activeRef.current) {
      scrollTo(target(activeRef.current), 'instant');
    }
    const frame = requestAnimationFrame(() => {
      landed.current = true;
    });

    let observer: IntersectionObserver | null = null;
    if (box && scroller && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          let best: IntersectionObserverEntry | null = null;
          for (const entry of entries) {
            if (entry.isIntersecting && (!best || entry.intersectionRatio > best.intersectionRatio)) best = entry;
          }
          if (!best) return;
          const el = best.target as HTMLElement;
          /* the nameplate and the opener: nothing is marked */
          const id = el.dataset.gvTop !== undefined ? '' : el.dataset.gvId;
          if (id === undefined || id === activeRef.current) return;
          fromScroll.current = id;
          selectRef.current(id);
        },
        { root: scroller, rootMargin: IO_ROOT_MARGIN, threshold: IO_THRESHOLDS }
      );
      box.querySelectorAll<HTMLElement>('[data-gv-id], [data-gv-top]').forEach((el) => observer?.observe(el));
    }

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  });

  /* the one dependency effect: when the active item changes from outside
     the article, bring its section to the top. A change the observer caused
     is left alone; one that arrives before the first frame (the shell
     reading the hash after this mount) jumps instead of scrolling. */
  useGSAP(
    () => {
      const previous = lastActive.current;
      lastActive.current = active;
      if (previous === null || previous === active) return;
      if (fromScroll.current === active) {
        fromScroll.current = null;
        return;
      }
      if (!active) return;
      scrollTo(target(active), landed.current ? 'auto' : 'instant');
    },
    { dependencies: [active] }
  );

  return (
    <div ref={root} className={cn('pt-root', 'gv-article', fontClass)}>
      <section className='pt-sec' data-gv-top=''>
        <PrototemplateHero />
      </section>

      <div className='pt-hatch' aria-hidden='true' />

      {/* ---- the post: a short article (motivation, research, discovery,
           sharing) set in Lausanne at reading scale. No eyebrows, no
           display sizes; the rails, hatches and hairlines carry the
           structure the way they do everywhere else. ---- */}
      <article className='pt-post'>
        <section className='pt-sec pt-post-sec pt-opener' data-gv-top=''>
          <div className='pt-opener-copy'>
            <h1>Redesigning General Translation</h1>
            <p className='pt-post-byline'>Kevin Liu · August 2026</p>
            <p>
              This site is the working file of a redesign: every direction I tried, the tooling
              that judged them, and the three full sites that came out the other end. Everything
              here is live: real pages, not mockups.
            </p>
            <p>
              The current site grew the way most startup sites do: section by section, launch
              by launch, each addition reasonable and the whole slowly losing its argument. I
              wanted to stop patching and ask the question properly: what should this company
              look like when the answer is built from the ground up?
            </p>
            <p>
              So instead of one redesign, I built many, made them compete, and built the tooling
              to judge them, down to a pixel auditor that walks every rendered line on every
              page and fails a round on a single doubled rule.
            </p>
          </div>

          {/* the distillation, held in a crop frame: the four rules extend
              from the diagram's edges to the section's own, the nameplate's
              frame grammar, one more time. Inside, the mass visibly narrows:
              the field of everything built, hatched shoulders carrying away
              what fell, down to the three windows fanned like the captures
              further down the page. */}
          <figure
            aria-label='The distillation: more than twenty directions built, thirteen survived review, three became full sites.'
            className='pt-opener-fig'
            role='img'
          >
            <i className='pt-xline is-h is-top' />
            <i className='pt-xline is-h is-bot' />
            <i className='pt-xline is-v is-l' />
            <i className='pt-xline is-v is-r' />
            <svg aria-hidden className='pt-funnel' viewBox='0 0 360 492'>
              <defs>
                {/* the shell's diagonal hatch, at token color: the one
                    sanctioned texture for what gets discarded */}
                <pattern
                  height='7'
                  id='pt-fnl-hatch'
                  patternTransform='rotate(-45)'
                  patternUnits='userSpaceOnUse'
                  width='7'
                >
                  <line className='pt-funnel-hatchline' x1='0.5' x2='0.5' y1='0' y2='7' />
                </pattern>
                {/* the mirror of the hatch for the LEFT shoulders, so both
                    sides shade outward from the throat */}
                <pattern
                  height='7'
                  id='pt-fnl-hatch-l'
                  patternTransform='rotate(45)'
                  patternUnits='userSpaceOnUse'
                  width='7'
                >
                  <line className='pt-funnel-hatchline' x1='0.5' x2='0.5' y1='0' y2='7' />
                </pattern>
              </defs>

              {/* the corridor: two continuous walls, vertical beside each
                  stage, diagonal through each throat, one funnel */}
              <path className='pt-funnel-wall' d='M12,8 V130 L68,202 V308 L112,376 V486' />
              <path className='pt-funnel-wall' d='M348,8 V130 L292,202 V308 L248,376 V486' />

              {/* the mass that falls away, pocketed in the throat corners:
                  fill only, the wall already draws the diagonal */}
              <polygon className='pt-funnel-shoulder is-left' points='12,130 68,202 12,202' />
              <polygon className='pt-funnel-shoulder' points='348,130 292,202 348,202' />
              <polygon className='pt-funnel-shoulder is-left' points='68,308 112,376 68,376' />
              <polygon className='pt-funnel-shoulder' points='292,308 248,376 292,376' />

              {/* stage one: the full field, twenty-one sketched cells */}
              {FUNNEL_FIELD.map((c) => (
                <g key={`fld-${c.x}-${c.y}`} transform={`translate(${c.x} ${c.y})`}>
                  <rect
                    className={c.retired ? 'pt-funnel-cell is-retired' : 'pt-funnel-cell'}
                    height='28'
                    width='38'
                  />
                  {!c.retired && (
                    <>
                      <line className='pt-funnel-stroke' x1='6' x2={6 + c.t} y1='9' y2='9' />
                      <line className='pt-funnel-stroke' x1='6' x2={6 + c.b} y1='16' y2='16' />
                      <line className='pt-funnel-stroke' x1='6' x2={6 + c.b2} y1='22' y2='22' />
                    </>
                  )}
                </g>
              ))}
              <text className='pt-funnel-cap' textAnchor='middle' x='180' y='170'>
                <tspan className='pt-funnel-n'>20+</tspan>
                <tspan className='pt-funnel-t' dx='12'>DIRECTIONS BUILT</tspan>
              </text>

              {/* stage two: the thirteen survivors, structured cards now */}
              {FUNNEL_SURVIVORS.map((c) => (
                <g key={`srv-${c.x}-${c.y}`} transform={`translate(${c.x} ${c.y})`}>
                  <rect className='pt-funnel-cell' height='26' width='36' />
                  <line className='pt-funnel-stroke' x1='0' x2='36' y1='7' y2='7' />
                  <line className='pt-funnel-stroke' x1='5' x2={5 + c.b} y1='14' y2='14' />
                  <line className='pt-funnel-stroke' x1='5' x2={5 + c.b2} y1='20' y2='20' />
                </g>
              ))}
              <text className='pt-funnel-cap' textAnchor='middle' x='180' y='346'>
                <tspan className='pt-funnel-n'>13</tspan>
                <tspan className='pt-funnel-t' dx='12'>SURVIVED REVIEW</tspan>
              </text>

              {/* stage three: the three full sites as browser windows,
                  cascaded the way the captures fan below; only the front
                  window carries content, the rest show their title bars */}
              {FUNNEL_SITES.map((c, i) => (
                <g key={`sit-${c.x}-${c.y}`} transform={`translate(${c.x} ${c.y})`}>
                  <rect className='pt-funnel-win' height='46' width='64' />
                  <line className='pt-funnel-stroke' x1='0' x2='64' y1='11' y2='11' />
                  {i === FUNNEL_SITES.length - 1 && (
                    <>
                      <line className='pt-funnel-stroke' x1='7' x2='34' y1='21' y2='21' />
                      <line className='pt-funnel-stroke' x1='7' x2='52' y1='28' y2='28' />
                      <line className='pt-funnel-stroke' x1='7' x2='44' y1='35' y2='35' />
                    </>
                  )}
                </g>
              ))}
              <text className='pt-funnel-cap' textAnchor='middle' x='180' y='480'>
                <tspan className='pt-funnel-n'>3</tspan>
                <tspan className='pt-funnel-t' dx='12'>FULL SITES</tspan>
              </text>
            </svg>
          </figure>
        </section>

        <div className='pt-hatch' aria-hidden='true' />

        <section className='pt-sec pt-feature-sec'>
          <div className='pt-feature'>
            <PrismaticField className='pt-feature-field' preset='1' speed={0.4} params={{ exposureScale: 4600 }} />
            <div>
              <h2>Walk the whole thing</h2>
              <p>
                The full deck: the storyboard, the principles, every live prototype, and the
                scoreboard that picked the winners.
              </p>
              <Link className='pt-feature-cta' href='/present'>
                ▶ Open the deck
              </Link>
            </div>
            <div className='pt-deck'>
              {DECK.map((slide) => (
                <div className='pt-deck-row' key={slide.n}>
                  <b>
                    {slide.n} {slide.name}
                  </b>
                  <span>{slide.note}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className='pt-hatch' aria-hidden='true' />

        {REFERENCE ? (
          <>
            {/* copy left, the finished site boxed right: the opener's
                crop-frame grammar, so the box's four rules run out to the
                section's own edges instead of stopping at the card */}
            <section className='pt-sec pt-post-sec pt-shipped' data-gv-id={REFERENCE.slug}>
              <div className='pt-shipped-copy'>
                <h2>What shipped</h2>
                <p>
                  The three below are proposals. This is what came out of them: the
                  site now live at generaltranslation.com, rebuilt here page for page
                  so it can be read in the same room as the directions that produced
                  it. Dossier is where most of it comes from; the rest is what
                  survived contact with a real codebase.
                </p>
              </div>

              <div className='pt-shipped-box'>
                <i className='pt-xline is-h is-top' />
                <i className='pt-xline is-h is-bot' />
                <i className='pt-xline is-v is-l' />
                <i className='pt-xline is-v is-r' />
                <h3>
                  {REFERENCE.name}
                  <span className='pt-site-flag'>generaltranslation.com</span>
                </h3>
                <p>{REFERENCE.signature}</p>
                <SiteCompare slug={REFERENCE.slug} name={REFERENCE.name} />
                <p className='pt-site-links'>
                  <Link href={`/d/${REFERENCE.slug}`}>open the home</Link>
                  <span aria-hidden> · </span>
                  <Link href={`/d/${REFERENCE.slug}/enterprise`}>open the enterprise page</Link>
                </p>
              </div>
            </section>

            <div className='pt-hatch' aria-hidden='true' />
          </>
        ) : null}

        <section className='pt-sec pt-post-sec pt-sites-intro'>
          <h2>The three sites</h2>
          <p>
            The three strongest ideas grew into complete sites: a home built on the toolchain system,
            each with its own take on the hero terminal, over an enterprise page built on the
            singularity gate. Dossier is the completed direction; Signal and Orbit keep their own
            heroes and now carry the previous-generation sections it retired. The two faces of
            each site are overlaid below. Drag the seam to sweep between them.
          </p>
          <p className='pt-site-links'>
            <Link href='/compare'>Compare any two, live →</Link>
          </p>
          {/* the three captures fanned at the right edge, absolutely placed
              and cut off by the section's own corner */}
          <span aria-hidden className='pt-sites-fan'>
            {SITES.filter((site) => !site.reference).map((site, i) => (
              <span className='pt-sites-fan-shot' key={site.slug} style={{ ['--i' as never]: i }}>
                <img alt='' className='is-light' draggable={false} loading='lazy' src={`/shots/light/${site.slug}.jpg`} />
                <img alt='' className='is-dark' draggable={false} loading='lazy' src={`/shots/dark/${site.slug}.jpg`} />
              </span>
            ))}
          </span>
        </section>

        <div className='pt-sites'>
          {SITES.filter((site) => !site.reference).map((site) => (
            <section className='pt-sec pt-site' key={site.slug} data-gv-id={site.slug}>
              <h3>
                {site.name}
                {site.slug === 'singularity-dossier' && (
                  <span className='pt-site-flag'>the completed direction</span>
                )}
              </h3>
              <p>{site.signature}</p>
              <SiteCompare slug={site.slug} name={site.name} />
              <p className='pt-site-links'>
                <Link href={`/d/${site.slug}`}>open the home</Link>
                <span aria-hidden> · </span>
                <Link href={`/d/${site.slug}/enterprise`}>open the enterprise page</Link>
              </p>
            </section>
          ))}
        </div>

        {/* AnatomyWall carries its own leading hatch */}
        {anatomy}

        <div className='pt-hatch' aria-hidden='true' />

        {ledger}

        <div className='pt-hatch' aria-hidden='true' />

        <section className='pt-sec pt-post-sec'>
          <h2>Every direction</h2>
          <p>
            Twenty-plus directions got built; thirteen survived review. Some are quiet
            evolutions of the current site, some are physics experiments with type. Each row
            below is a live page.
          </p>
        </section>

        <div className='pt-rows pt-post-rows'>
          {EXPLORATIONS.map((direction) => (
            <Link className='pt-row' href={`/d/${direction.slug}`} key={direction.slug} data-gv-id={direction.slug}>
              <span className='pt-row-label'>{direction.label}</span>
              <span className='pt-row-main'>
                <h3>{direction.name}</h3>
                <p>{direction.concept}</p>
              </span>
              <span aria-hidden='true' className='pt-row-shot'>
                <img alt='' className='is-light' loading='lazy' src={`/shots/light/${direction.slug}.jpg`} />
                <img alt='' className='is-dark' loading='lazy' src={`/shots/dark/${direction.slug}.jpg`} />
              </span>
            </Link>
          ))}
        </div>

        {ARCHIVE.length > 0 ? (
          <>
            <div className='pt-hatch' aria-hidden='true' />

            <section className='pt-sec pt-post-sec' data-gv-anchor='archive'>
              <h2>Archive</h2>
              <p>
                The versions retired from the site. Each row opens its full-page capture; the code
                stays in the repository history under the commit the capture names.
              </p>
            </section>

            <div className='gv-arows'>
              {ARCHIVE.map((entry) => (
                <button
                  type='button'
                  className='gv-arow'
                  key={entry.slug}
                  title={`Open the capture of ${entry.name}`}
                  onClick={() => select(entry.slug)}
                >
                  <span className='gv-arow-date'>{archiveDate(entry)}</span>
                  <span className='gv-arow-main'>
                    <h3>{entry.name}</h3>
                    <p>{archiveDesc(entry)}</p>
                  </span>
                  <span aria-hidden='true' className='gv-arow-shot'>
                    <img alt='' loading='lazy' src={archiveShot(entry)} />
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : null}
      </article>

      <footer className='pt-foot'>
        <span className='pt-foot-brand'>
          <span className='pt-mark' aria-hidden>
            <i className='pt-mark-line is-h is-top' />
            <i className='pt-mark-line is-h is-bot' />
            <i className='pt-mark-line is-v is-l' />
            <i className='pt-mark-line is-v is-r' />
            <i className='pt-mark-fill' />
          </span>
          Prototemplate
        </span>
        <span className='pt-foot-right'>
          prototype × template
          <a
            href='https://x.com/sabosugi/status/2081742206847828171'
            rel='noreferrer'
            target='_blank'
          >
            prismatic shader by @sabosugi ↗
          </a>
        </span>
      </footer>
    </div>
  );
}

type StageProps = ArticleProps;

/**
 * What the stage holds for the current mode and item. The grid is drawn by
 * the shell over the stage, so nothing is mounted under it and the live
 * frame and the shader field release their contexts. An archived item shows
 * its capture sheet in either remaining mode; otherwise the book holds the
 * article and the slide holds the live exhibit, on a sheet keyed by the
 * direction so the exhibit that leaves fades while the next rises in from
 * the side of the move (directive 7.4).
 */
function GalleryStage({ fontClass, anatomy, ledger, scrollRef, intent }: StageProps) {
  const { mode, active } = usePtShell();
  if (mode === 'grid') return null;

  const archived = ARCHIVE_BY_SLUG.get(active);
  if (archived) return <ArchiveSheet entry={archived} />;

  if (mode === 'book') {
    return (
      <div className='gv-book'>
        <Sheet variant='flow' width='rail' scrollRef={scrollRef}>
          <GalleryArticle
            fontClass={fontClass}
            anatomy={anatomy}
            ledger={ledger}
            scrollRef={scrollRef}
            intent={intent}
          />
        </Sheet>
      </div>
    );
  }

  const direction = DIRECTION_BY_SLUG.get(active);
  return (
    <Sheet variant='fixed' w={EXHIBIT_W} h={EXHIBIT_H} frame={false} itemKey={direction?.slug}>
      {direction ? <ExhibitFrame key={direction.slug} direction={direction} /> : null}
    </Sheet>
  );
}

export type GalleryViewerProps = {
  /** the Fraunces and Space Grotesk variable classes from next/font, for the nameplate */
  fontClass: string;
  /** AnatomyWall, rendered on the server because it reads the capture files */
  anatomy: ReactNode;
  /** SystemLedger, rendered on the server */
  ledger: ReactNode;
};

export default function GalleryViewer({ fontClass, anatomy, ledger }: GalleryViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const intent = useRef<MountIntent>(null);
  const home = useRef<() => void>(() => {});

  return (
    <ViewerShell
      id='gallery'
      title={GALLERY_TITLE}
      mark='pt'
      count={`${DIRECTIONS.length} directions`}
      sections={SECTIONS}
      active=''
      modes={GALLERY_MODES}
      thumb='shot'
      surfaces='site'
      keys={(mode) => (mode === 'slide' ? 'paged' : 'flow')}
      noun='direction'
      toolbarSlot={<OpenPage />}
      onCurrentPage={() => home.current()}
    >
      <DeepLink />
      <GalleryEscape intent={intent} />
      <GalleryHome home={home} scrollRef={scrollRef} intent={intent} />
      <GalleryStage fontClass={fontClass} anatomy={anatomy} ledger={ledger} scrollRef={scrollRef} intent={intent} />
    </ViewerShell>
  );
}
