'use client';

import { useGSAP } from '@gsap/react';
import Link from 'next/link';
import type { MouseEvent, ReactNode, RefObject } from 'react';
import { useRef } from 'react';

import BrandFilm from '@/app/brand/BrandFilm';
import { BookHead } from '@/components/viewer/BookView';
import { Sheet } from '@/components/viewer/Sheet';
import { usePtShell } from '@/components/viewer/shell-context';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { cn } from '@/lib/cn';
import { MOTION_FILMS, MOTION_SECTIONS, MOTION_STATUS_LABEL } from '@/lib/motion';
import type { MotionFilm, MotionStatus } from '@/lib/motion';
import type { ShellMode } from '@/lib/shell-data';
import { useMountEffect } from '@/lib/use-mount-effect';

import { motionSections } from './sections';

import '../graphics/graphics.css';
import './motion.css';

const TITLE = 'Motion';
const MODES: readonly ShellMode[] = ['book'];
const SECTIONS = motionSections('index');
const LEAD =
  'This page lists every film on the motion roster with its length and its status. A film is rendered when its final render exists, in production when its folder or research package exists, and planned otherwise. A rendered film plays here when its web copy is published with the site: the two blog films and the three films of the translation series. A final render without a web copy stays in the motion folder and is listed by its path. Each film of the translation series opens its research package, with the script, the post, the vocabulary, the sources and the fact-check list.';

/** The read line: the lowest row crossing the top tenth of the sheet is the one being read. */
const SPY_MARGIN = '0px 0px -90% 0px';
/** How long the spy waits for a jump to reach its row before it reads the page again. */
const SETTLE_MS = 1200;

function cssEscape(value: string): string {
  return typeof CSS !== 'undefined' && 'escape' in CSS ? CSS.escape(value) : value;
}

function rangeText(films: readonly MotionFilm[]): string {
  const first = films[0];
  const last = films[films.length - 1];
  if (!first || !last) return '';
  return films.length > 1 ? `${first.n} to ${last.n}` : first.n;
}

function countOf(status: MotionStatus): string {
  return String(MOTION_FILMS.filter((film) => film.status === status).length);
}

/** The film's local path the meta line names: the final render when it is not published, the folder while the film is in production. */
function localPath(film: MotionFilm): string | undefined {
  if (film.media) return undefined;
  if (film.status === 'rendered') return film.local?.video;
  if (film.status === 'in-production') return film.local?.folder;
  return undefined;
}

type MotionBookProps = {
  summaries: Readonly<Record<string, ReactNode>>;
  /** the flow sheet's scroll region */
  sheetRef: RefObject<HTMLDivElement | null>;
  /** receives the row jump, for a re-click on the active film in the list */
  jumpRef: RefObject<(id: string) => void>;
  /** the active film, read by the shell's onSelect outside this component */
  activeOut: RefObject<string>;
};

/**
 * The roster read top to bottom inside the flow sheet: the head with the
 * counts, a contents list, then the two sections under their dividers as
 * ruled rows, one per film, in the graphics book's row grammar. A film with
 * a published render carries its player; a film of the translation series
 * links its package page. The reading state works as the graphics book's
 * does: an IntersectionObserver selects the row under the read line through
 * the shell, and a selection from anywhere else jumps the sheet to its row
 * and mutes the spy until it lands. Jumps are instant (the site does not
 * smooth-scroll).
 */
function MotionBook({ summaries, sheetRef, jumpRef, activeOut }: MotionBookProps) {
  const { active, select } = usePtShell();
  activeOut.current = active;

  const activeRef = useRef(active);
  activeRef.current = active;
  const selectRef = useRef(select);
  selectRef.current = select;

  const lastActive = useRef<string | null>(null);
  const fromScroll = useRef<string | null>(null);
  const settling = useRef<Element | null>(null);
  const settleTimer = useRef(0);

  const rowFor = (id: string): HTMLElement | null =>
    sheetRef.current?.querySelector<HTMLElement>(`.gx-row[data-id="${cssEscape(id)}"]`) ?? null;

  const scrollTo = (id: string) => {
    const row = rowFor(id);
    if (!row) return;
    settling.current = row;
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      settling.current = null;
    }, SETTLE_MS);
    row.scrollIntoView({ block: 'start', behavior: 'auto' });
  };

  jumpRef.current = scrollTo;

  useMountEffect(() => {
    const root = sheetRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;
    const rows = Array.from(root.querySelectorAll<HTMLElement>('.gx-row'));
    const order = new Map<Element, number>(rows.map((el, i) => [el, i]));
    const visible = new Set<Element>();
    const lowest = (): HTMLElement | null => {
      let best: HTMLElement | null = null;
      let rank = -1;
      for (const el of visible) {
        const i = order.get(el) ?? -1;
        if (i > rank) {
          rank = i;
          best = el as HTMLElement;
        }
      }
      return best;
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        const best = lowest();
        if (!best) return;
        if (settling.current) {
          if (best !== settling.current) return;
          settling.current = null;
          window.clearTimeout(settleTimer.current);
        }
        const id = best.dataset.id;
        if (!id || id === activeRef.current) return;
        fromScroll.current = id;
        selectRef.current(id);
      },
      { root, rootMargin: SPY_MARGIN, threshold: 0 }
    );
    rows.forEach((el) => observer.observe(el));
    const onScrollEnd = () => {
      if (!settling.current) return;
      settling.current = null;
      window.clearTimeout(settleTimer.current);
    };
    root.addEventListener('scrollend', onScrollEnd);
    return () => {
      observer.disconnect();
      root.removeEventListener('scrollend', onScrollEnd);
      window.clearTimeout(settleTimer.current);
    };
  });

  /* a selection the spy did not make (the list, the keys, the hash on landing) jumps to its row */
  useGSAP(
    () => {
      const previous = lastActive.current;
      lastActive.current = active;
      if (previous === null || previous === active) return;
      if (fromScroll.current === active) {
        fromScroll.current = null;
        return;
      }
      scrollTo(active);
    },
    { dependencies: [active] }
  );

  const onContents = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (id === activeRef.current) scrollTo(id);
    else select(id);
  };

  return (
    <div className='gx-book mo-book'>
      <BookHead
        title={TITLE}
        lead={LEAD}
        meta={[
          { key: 'Films', value: String(MOTION_FILMS.length) },
          { key: 'Rendered', value: countOf('rendered') },
          { key: 'In production', value: countOf('in-production') },
          { key: 'Planned', value: countOf('planned') },
        ]}
      />

      <nav className='gx-toc' aria-label='Contents'>
        {MOTION_SECTIONS.map((section) => {
          const films = MOTION_FILMS.filter((film) => film.section === section.id);
          const first = films[0];
          if (!first) return null;
          return (
            <a key={section.id} href={`#${first.id}`} onClick={(e) => onContents(e, first.id)}>
              <span>{section.label}</span>
              <small>{rangeText(films)}</small>
            </a>
          );
        })}
      </nav>

      {MOTION_SECTIONS.map((section) => {
        const films = MOTION_FILMS.filter((film) => film.section === section.id);
        if (films.length === 0) return null;
        return (
          <section key={section.id} className='gx-cat' aria-labelledby={`mo-${section.id}`}>
            <div className='gx-sec'>
              <small>
                <span>{films.length} films</span>
                <span>Films {rangeText(films)}</span>
              </small>
              <div>
                <h2 id={`mo-${section.id}`}>{section.label}</h2>
                <p>{section.lead}</p>
              </div>
            </div>
            {films.map((film) => {
              const isActive = film.id === active;
              const path = localPath(film);
              return (
                <article
                  key={film.id}
                  id={film.id}
                  className={cn('gx-row', isActive && 'is-active')}
                  data-id={film.id}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <div className='gx-n'>
                    <b>{film.n}</b>
                  </div>
                  <div className='gx-body'>
                    <h3>{film.title}</h3>
                    <p>{summaries[film.id]}</p>
                    {film.media ? (
                      <figure className='mo-film'>
                        <BrandFilm name={`the ${film.title} film`} poster={film.media.poster} src={film.media.video} />
                      </figure>
                    ) : null}
                    {film.pkg || film.post ? (
                      <p className='mo-links'>
                        {film.pkg ? <Link href={`/motion/${film.slug}`}>Read the research package</Link> : null}
                        {film.pkg && film.post ? ' · ' : null}
                        {film.post ? <Link href={film.post}>Read the post</Link> : null}
                      </p>
                    ) : null}
                    <p className='gx-line'>
                      {film.runtime ?? film.length}
                      {film.note ? ` · ${film.note}` : null}
                      {' · '}
                      <span className={cn('mo-status', film.status === 'rendered' && 'is-rendered')}>
                        {MOTION_STATUS_LABEL[film.status]}
                      </span>
                      {path ? (
                        <>
                          {' · '}
                          <code>{path}</code>
                        </>
                      ) : null}
                    </p>
                  </div>
                </article>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}

type MotionViewerProps = {
  /** each film's summary, rendered on the server, by film id */
  summaries: Readonly<Record<string, ReactNode>>;
};

/**
 * The motion roster on the viewer shell: the films and the translation
 * series nested under Knowledge > Motion in the list, the roster as ruled
 * rows inside the 1280px flow sheet. Flow keys, so Space and the arrows
 * scroll; the sidebar filter matches titles and summaries. The hash names
 * the row in view. A series row in the list opens its package page; the
 * spy only selects, so scrolling past a series row never navigates.
 */
export default function MotionViewer({ summaries }: MotionViewerProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const jumpRef = useRef<(id: string) => void>(() => {});
  const activeOut = useRef(MOTION_FILMS[0]?.id ?? '');

  return (
    <ViewerShell
      id='motion'
      title={TITLE}
      mark='pt'
      count={`${MOTION_FILMS.length} films`}
      sections={SECTIONS}
      modes={MODES}
      thumb='row'
      surfaces='site'
      keys='flow'
      noun='film'
      onSelect={(id) => {
        /* re-clicking the active film brings its row back to the read line */
        if (id === activeOut.current) jumpRef.current(id);
      }}
    >
      <Sheet variant='flow' width={1280} scrollRef={sheetRef}>
        <MotionBook summaries={summaries} sheetRef={sheetRef} jumpRef={jumpRef} activeOut={activeOut} />
      </Sheet>
    </ViewerShell>
  );
}
