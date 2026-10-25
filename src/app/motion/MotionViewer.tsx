'use client';

import Link from 'next/link';
import type { ReactNode, RefObject } from 'react';
import { useRef } from 'react';

import { BookHead } from '@/components/viewer/BookView';
import { Icon } from '@/components/viewer/icons';
import { Sheet } from '@/components/viewer/Sheet';
import { usePtShell } from '@/components/viewer/shell-context';
import { useReadLine } from '@/components/viewer/useReadLine';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { cn } from '@/lib/cn';
import type { MotionFilm, MotionStatus } from '@/lib/motion';
import { PAGE_NAMES } from '@/lib/page-names';
import type { PageUpdated } from '@/lib/page-updated';
import { rangeText } from '@/lib/shell-data';
import type { ShellMode, ShellSection } from '@/lib/shell-data';

import type { FilmCutState } from './FilmCutPlayer';
import FilmCutPlayer, { useFilmCut } from './FilmCutPlayer';
import { cutWords, megabytes, reviewWords } from './records-words';
import type { MotionSectionInfo } from './sections';

import '../graphics/graphics.css';
import './motion.css';

const TITLE = PAGE_NAMES.motion.name;
const MODES: readonly ShellMode[] = ['book'];
const LEAD =
  'Every film on the General Translation motion roster, with its length and its status. Each rendered film plays here from the copy the site publishes.';
const NOTE =
  'A film is rendered when its final render exists, in production when its folder or research package exists, and planned otherwise. A final render without a web copy stays in the motion folder, and its row gives the path.';

/**
 * The roster as the server page passes it: the films with the fields this
 * page reads (page.tsx, rosterFilm), the three sections, the status words
 * and the shell's sections, so the client never bundles the generated
 * src/lib/motion.ts with its search text.
 */
export type MotionRoster = {
  films: readonly MotionFilm[];
  sections: readonly MotionSectionInfo[];
  statusLabel: Readonly<Record<MotionStatus, string>>;
  shellSections: readonly ShellSection[];
};

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

/**
 * A roster row's records, compactly: the published cut's contact sheet and
 * script as one line each, linked to their sections on the film's page,
 * and the cut in review by its label and length. A film whose published
 * cut has no records, with a newer cut in review, says so in one line.
 */
function RecordLine({ film }: { film: MotionFilm }) {
  const { sheet, script, review } = film;
  if (!sheet && !script && !review) return null;
  const page = film.pkg ? `/motion/${film.slug}` : undefined;
  const made = Boolean(sheet || script);
  return (
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
  );
}

/** A roster row's meta line: the cut's running time, its note, its status and its local path. */
function MetaLine({ film, statusLabel }: { film: MotionFilm; statusLabel: MotionRoster['statusLabel'] }) {
  const path = localPath(film);
  return (
    <p className='gx-line'>
      {film.runtime ?? film.length}
      {film.note ? ` · ${film.note}` : null}
      {' · '}
      <span className={cn('mo-status', film.status === 'rendered' && 'is-rendered')}>{statusLabel[film.status]}</span>
      {path ? (
        <>
          {' · '}
          <code>{path}</code>
        </>
      ) : null}
    </p>
  );
}

type CutStackProps = {
  state: FilmCutState;
  line: (film: MotionFilm) => ReactNode;
};

/**
 * One line of a film with language versions, drawn for every cut in one
 * grid cell with only the chosen cut's shown: the cell holds the tallest
 * cut's line, so a version whose line wraps on a phone moves nothing below
 * it. The other cuts' lines are hidden and inert. A film with one cut gets
 * its line alone.
 */
function CutStack({ state, line }: CutStackProps) {
  const { cuts, current } = state;
  if (cuts.length < 2) return line(current.film);
  return (
    <div className='mo-cuts'>
      {cuts.map((cut) => {
        const on = cut.key === current.key;
        return (
          <div key={cut.key} className={cn('mo-cut', !on && 'is-off')} aria-hidden={on ? undefined : true} inert={!on}>
            {line(cut.film)}
          </div>
        );
      })}
    </div>
  );
}

type FilmBodyProps = {
  film: MotionFilm;
  summary: ReactNode;
  statusLabel: MotionRoster['statusLabel'];
  /** the full record blocks of each cut without a page, by the cut's row id */
  records: Readonly<Record<string, ReactNode>>;
};

/**
 * A roster row's body: the title and summary, then the chosen cut's player
 * (FilmCutPlayer, with the language toggle when the film has language
 * versions), the links, the cut's records and its meta line. The toggle
 * swaps everything that belongs to one cut: the video, its poster and
 * captions, its contact sheet and script, its running time and its path.
 * A film without a page opens the chosen cut's full blocks in place under
 * the record line. The record and meta lines of a film with versions sit in
 * a CutStack, so a switch moves nothing below them.
 */
function FilmBody({ film, summary, statusLabel, records }: FilmBodyProps) {
  const state = useFilmCut(film);
  const { current } = state;
  const view = current.film;
  const more = records[current.rowId];
  return (
    <div className='gx-body'>
      <h3>{film.title}</h3>
      <p>{summary}</p>
      <FilmCutPlayer film={film} state={state} className='mo-film' />
      {film.pkg || film.post ? (
        <p className='mo-links'>
          {film.pkg ? <Link href={`/motion/${film.slug}`}>Read the research package</Link> : null}
          {film.pkg && film.post ? ' · ' : null}
          {film.post ? <Link href={film.post}>Read the post</Link> : null}
        </p>
      ) : null}
      <CutStack state={state} line={(cut) => <RecordLine film={cut} />} />
      {more && (view.sheet || view.script || view.review) ? (
        <details className='mo-rec-more'>
          <summary>Contact sheet and script</summary>
          {more}
        </details>
      ) : null}
      <CutStack state={state} line={(cut) => <MetaLine film={cut} statusLabel={statusLabel} />} />
    </div>
  );
}

type MotionBookProps = {
  roster: MotionRoster;
  summaries: Readonly<Record<string, ReactNode>>;
  /** the full record blocks of each cut of a film without a page, by the cut's row id */
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
 * counts, a contents list, then the three sections under their dividers as
 * ruled rows, one per film, in the graphics book's row grammar. A film with
 * a published render carries its player and its records (RecordLine: the
 * published cut's contact sheet and script, and a newer cut in review); a
 * film of the translation series links its package page. The reading
 * state is the shared read line (useReadLine): the row under the line is
 * selected through the shell, and a selection from anywhere else jumps the
 * sheet to its row. Jumps are instant.
 */
function MotionBook({ roster, summaries, records, sheetRef, jumpRef, activeOut, updated }: MotionBookProps) {
  const { films, sections, statusLabel } = roster;
  const countOf = (status: MotionStatus) => films.filter((film) => film.status === status).length;
  const { active, select } = usePtShell();
  activeOut.current = active;

  const { jump, onContents } = useReadLine({ rootRef: sheetRef, selector: '.gx-row', active, select });
  jumpRef.current = jump;

  return (
    <div className='gx-book mo-book pt-book-col'>
      <BookHead
        title={TITLE}
        lead={LEAD}
        note={NOTE}
        updated={updated}
        facts={[
          { icon: 'done', key: 'Rendered', value: `${countOf('rendered')} of ${films.length}` },
          { icon: 'in-progress', key: 'In production', value: countOf('in-production') },
          { icon: 'planned', key: 'Planned', value: countOf('planned') },
        ]}
        contents={
          <nav className='gx-toc pt-book-toc' aria-label='Contents'>
            {sections.map((section) => {
              const run = films.filter((film) => film.section === section.id);
              const first = run[0];
              if (!first) return null;
              return (
                <a key={section.id} href={`#${first.id}`} onClick={(e) => onContents(e, first.id)}>
                  <span>{section.label}</span>
                  <small>{rangeText(run)}</small>
                </a>
              );
            })}
          </nav>
        }
      />

      {sections.filter((section) => films.some((film) => film.section === section.id)).map((section, i) => {
        const run = films.filter((film) => film.section === section.id);
        return (
          <section key={section.id} className='pt-book-part gx-cat' aria-labelledby={`mo-${section.id}`}>
            <div className='gx-sec pt-book-sec'>
              <small>
                <span>Section {i + 1}</span>
                <span>Films {rangeText(run)}</span>
              </small>
              <div>
                <h2 id={`mo-${section.id}`}>{section.label}</h2>
                <p>{section.lead}</p>
              </div>
            </div>
            {run.map((film) => {
              const isActive = film.id === active;
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
                  <FilmBody film={film} summary={summaries[film.id]} statusLabel={statusLabel} records={records} />
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
  roster: MotionRoster;
  /** each film's summary, rendered on the server, by film id */
  summaries: Readonly<Record<string, ReactNode>>;
  /** the contact sheet and script blocks of each cut of a film without a page, rendered on the server, by the cut's row id */
  records: Readonly<Record<string, ReactNode>>;
  /** the /motion entry in src/lib/updated.ts, from the server page */
  updated: PageUpdated;
};

/**
 * The motion roster on the viewer shell: the films, the translation series
 * and the knowledge base nested under Knowledge > Motion in the list, the roster as ruled
 * rows inside the 1280px flow sheet. Flow keys, so Space and the arrows
 * scroll; the sidebar filter matches titles and summaries. The hash names
 * the row in view. A series row in the list opens its package page; the
 * spy only selects, so scrolling past a series row never navigates.
 */
export default function MotionViewer({ roster, summaries, records, updated }: MotionViewerProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const jumpRef = useRef<(id: string) => void>(() => {});
  const activeOut = useRef(roster.films[0]?.id ?? '');

  return (
    <ViewerShell
      id='motion'
      title={TITLE}
      mark='pt'
      count={`${roster.films.length} films`}
      sections={roster.shellSections}
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
          roster={roster}
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
