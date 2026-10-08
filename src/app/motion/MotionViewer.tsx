'use client';

import { useGSAP } from '@gsap/react';
import Link from 'next/link';
import type { MouseEvent, ReactNode, RefObject } from 'react';
import { useRef } from 'react';

import BrandFilm from '@/app/brand/BrandFilm';
import { BadgeWords } from '@/components/viewer/BadgeCycle';
import { BookHead } from '@/components/viewer/BookView';
import { Icon } from '@/components/viewer/icons';
import { Sheet } from '@/components/viewer/Sheet';
import { usePtShell } from '@/components/viewer/shell-context';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { cn } from '@/lib/cn';
import { MOTION_FILMS, MOTION_SECTIONS, MOTION_STATUS_LABEL } from '@/lib/motion';
import type { MotionFilm, MotionStatus } from '@/lib/motion';
import { PAGE_NAMES } from '@/lib/page-names';
import type { PageUpdated } from '@/lib/page-updated';
import type { ShellMode } from '@/lib/shell-data';
import { useMountEffect } from '@/lib/use-mount-effect';

import { cutWords, megabytes, reviewWords } from './records-words';
import { motionSections } from './sections';

import '../graphics/graphics.css';
import './motion.css';

const TITLE = PAGE_NAMES.motion.name;
const MODES: readonly ShellMode[] = ['book'];
const SECTIONS = motionSections('index');
const LEAD =
  'Every film on the General Translation motion roster, with its length and its status. Each rendered film plays here from the copy the site publishes.';
const NOTE =
  'A film is rendered when its final render exists, in production when its folder or research package exists, and planned otherwise. A final render without a web copy stays in the motion folder, and its row gives the path.';

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

function countOf(status: MotionStatus): number {
  return MOTION_FILMS.filter((film) => film.status === status).length;
}

/** The film's local path the meta line names: the final render when it is not published, the folder while the film is in production. */
function localPath(film: MotionFilm): string | undefined {
  if (film.media) return undefined;
  if (film.status === 'rendered') return film.local?.video;
  if (film.status === 'in-production') return film.local?.folder;
  return undefined;
}

/** `200 frames`, or the sheet's format when its grid is not the kit's. */
function sheetWords(film: MotionFilm): string {
  return film.sheet?.frames ? `${film.sheet.frames} frames` : 'WebP';
}

type FilmRecordsProps = {
  film: MotionFilm;
  /** the full blocks, for a film with no page of its own to link to (records.tsx, rendered on the server) */
  more?: ReactNode;
};

/**
 * A roster row's records, compactly: the published cut's contact sheet and
 * script as one line each, linked to their sections on the film's page,
 * and the cut in review by its label and length. A film without a page
 * opens the full blocks in place under the line. A film whose published
 * cut has no records, with a newer cut in review, says so in one line.
 */
function FilmRecords({ film, more }: FilmRecordsProps) {
  const { sheet, script, review } = film;
  if (!sheet && !script && !review) return null;
  const page = film.pkg ? `/motion/${film.slug}` : undefined;
  const made = Boolean(sheet || script);
  return (
    <>
      <dl className='mo-rec'>
        {sheet ? (
          <div>
            <dt>
              <Icon name='grid' />
              Contact sheet
            </dt>
            <dd>
              {page ? <Link href={`${page}#contact-sheet`}>{sheetWords(film)}</Link> : sheetWords(film)}
              {sheet.png && sheet.pngBytes ? (
                <>
                  {' · '}
                  <a aria-label={`download the PNG of the contact sheet of ${film.title}`} download href={sheet.png}>
                    PNG, {megabytes(sheet.pngBytes)}
                  </a>
                </>
              ) : null}
            </dd>
          </div>
        ) : null}
        {script ? (
          <div>
            <dt>
              <Icon name='document' />
              Script
            </dt>
            <dd>
              {page ? <Link href={`${page}#film-script`}>{script.lines} lines</Link> : `${script.lines} lines`}
              {` · ${cutWords(script.label)}`}
            </dd>
          </div>
        ) : null}
        {review ? (
          <div>
            <dt>
              <Icon name='in-progress' />
              {made ? 'In review' : 'Contact sheet and script'}
            </dt>
            <dd>
              {made
                ? reviewWords(review)
                : review.label
                  ? `${cutWords(review.label)} in review, ${review.length}`
                  : `${review.length} cut in review`}
            </dd>
          </div>
        ) : null}
      </dl>
      {more ? (
        <details className='mo-rec-more'>
          <summary>Contact sheet and script</summary>
          {more}
        </details>
      ) : null}
    </>
  );
}

type MotionBookProps = {
  summaries: Readonly<Record<string, ReactNode>>;
  /** the full record blocks of each film without a page, by film id */
  records: Readonly<Record<string, ReactNode>>;
  /** the flow sheet's scroll region */
  sheetRef: RefObject<HTMLDivElement | null>;
  /** receives the row jump, for a re-click on the active film in the list */
  jumpRef: RefObject<(id: string) => void>;
  /** the active film, read by the shell's onSelect outside this component */
  activeOut: RefObject<string>;
  /** the head's Updated row: the /motion entry in src/lib/updated.ts */
  updated: PageUpdated;
};

/**
 * The roster read top to bottom inside the flow sheet: the head with the
 * counts, a contents list, then the two sections under their dividers as
 * ruled rows, one per film, in the graphics book's row grammar. A film with
 * a published render carries its player and its records (FilmRecords: the
 * published cut's contact sheet and script, and a newer cut in review); a
 * film of the translation series links its package page. The reading state works as the graphics book's
 * does: an IntersectionObserver selects the row under the read line through
 * the shell, and a selection from anywhere else jumps the sheet to its row
 * and mutes the spy until it lands. Jumps are instant (the site does not
 * smooth-scroll).
 */
function MotionBook({ summaries, records, sheetRef, jumpRef, activeOut, updated }: MotionBookProps) {
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
    <div className='gx-book mo-book pt-book-col'>
      <BookHead
        title={TITLE}
        badge={<BadgeWords words={MOTION_FILMS.map((film) => film.slug)} />}
        lead={LEAD}
        note={NOTE}
        updated={updated}
        facts={[
          { icon: 'done', key: 'Rendered', value: `${countOf('rendered')} of ${MOTION_FILMS.length}` },
          { icon: 'in-progress', key: 'In production', value: countOf('in-production') },
          { icon: 'planned', key: 'Planned', value: countOf('planned') },
        ]}
        contents={
          <nav className='gx-toc pt-book-toc' aria-label='Contents'>
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
        }
      />

      {MOTION_SECTIONS.filter((section) => MOTION_FILMS.some((film) => film.section === section.id)).map((section, i) => {
        const films = MOTION_FILMS.filter((film) => film.section === section.id);
        return (
          <section key={section.id} className='pt-book-part gx-cat' aria-labelledby={`mo-${section.id}`}>
            <div className='gx-sec pt-book-sec'>
              <small>
                <span>Section {i + 1}</span>
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
                    <FilmRecords film={film} more={records[film.id]} />
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
  /** the contact sheet and script blocks of each film without a page, rendered on the server, by film id */
  records: Readonly<Record<string, ReactNode>>;
  /** the /motion entry in src/lib/updated.ts, from the server page */
  updated: PageUpdated;
};

/**
 * The motion roster on the viewer shell: the films and the translation
 * series nested under Knowledge > Motion in the list, the roster as ruled
 * rows inside the 1280px flow sheet. Flow keys, so Space and the arrows
 * scroll; the sidebar filter matches titles and summaries. The hash names
 * the row in view. A series row in the list opens its package page; the
 * spy only selects, so scrolling past a series row never navigates.
 */
export default function MotionViewer({ summaries, records, updated }: MotionViewerProps) {
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
      <Sheet variant='flow' scrollRef={sheetRef}>
        <MotionBook
          summaries={summaries}
          records={records}
          sheetRef={sheetRef}
          jumpRef={jumpRef}
          activeOut={activeOut}
          updated={updated}
        />
      </Sheet>
    </ViewerShell>
  );
}
