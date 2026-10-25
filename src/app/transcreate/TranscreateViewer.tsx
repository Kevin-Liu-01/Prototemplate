'use client';

import Link from 'next/link';
import type { ReactNode, RefObject } from 'react';
import { useRef, useState } from 'react';

import BrandFilm from '@/app/brand/BrandFilm';
import type { BookFact } from '@/components/viewer/BookView';
import { BookHead } from '@/components/viewer/BookView';
import { Seg } from '@/components/viewer/Seg';
import { Sheet } from '@/components/viewer/Sheet';
import { usePtShell } from '@/components/viewer/shell-context';
import { useReadLine } from '@/components/viewer/useReadLine';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { cn } from '@/lib/cn';
import { PAGE_NAMES } from '@/lib/page-names';
import type { PageUpdated } from '@/lib/page-updated';
import type { ShellMode } from '@/lib/shell-data';
import { pad2 } from '@/lib/shell-data';

import type { TranscreateRoute } from './sections';
import { CREDITS_ROW, GRID_ROW, ROUTE_PAGE, ROUTE_PATH, transcreateSections, videoRow } from './sections';
import { GRID, MEDIA, OWNERS, PANEL_WIDTH, VIDEOS } from './videos';

import '../graphics/graphics.css';
import './transcreate.css';

const MODES: readonly ShellMode[] = ['book'];

/** One way to show a video: its file stem, its pixel size and where each language sits. */
type View = {
  key: string;
  label: string;
  file: string;
  width: number;
  height: number;
  /** where each language sits, the meta line's first words and the option's tooltip */
  layout: string;
  /** a frame taller than it is wide for its column, drawn narrower so it fits the window */
  narrow?: true;
};

/** One row: a video with the ways it can be shown. */
type Entry = {
  id: string;
  n: string;
  title: string;
  /** the label under the title */
  line: string;
  /** what a screen reader calls the video */
  name: string;
  views: readonly View[];
  seconds: number;
  /** true for a copy with the original's sound, which starts muted */
  sound: boolean;
};

const RANGE = `Videos 01 to ${pad2(VIDEOS.length)}`;

const GRID_ENTRY: Entry = {
  id: GRID_ROW,
  n: '01',
  title: 'Eight videos in English and Japanese',
  line: 'Each cell holds one product video, labelled with its name.',
  name: 'the grid of all eight videos',
  views: [
    { key: 'side', label: 'Side by side', file: GRID.side.file, width: GRID.side.width, height: GRID.side.height, layout: 'English left, Japanese right in each cell' },
    { key: 'columns', label: 'Columns', file: GRID.columns.file, width: GRID.columns.width, height: GRID.columns.height, layout: 'English on top, Japanese below in each column' },
  ],
  seconds: GRID.seconds,
  sound: false,
};

const VIDEO_ENTRIES: readonly Entry[] = VIDEOS.map((video, i) => ({
  id: videoRow(video.slug),
  n: pad2(i + 1),
  title: video.name,
  line: 'English to Japanese',
  name: `the ${video.name} video`,
  views: [
    { key: 'side', label: 'Side by side', file: `${video.slug}-side`, width: 2 * PANEL_WIDTH, height: video.panelHeight, layout: 'English left, Japanese right' },
    { key: 'stacked', label: 'Stacked', file: `${video.slug}-stacked`, width: PANEL_WIDTH, height: 2 * video.panelHeight, layout: 'English on top, Japanese below', narrow: true },
  ],
  seconds: video.seconds,
  sound: true,
}));

/** What each page's head says: its lead and its three facts. */
const HEAD: Readonly<Record<TranscreateRoute, { lead: string; facts: readonly [BookFact, BookFact, BookFact] }>> = {
  overview: {
    lead: 'Transcreate replaces the on-screen text of a product video with its translation. The new text follows every cut, animation and effect of the original.',
    facts: [
      { icon: 'film', key: 'Videos', value: VIDEOS.length },
      { icon: 'language', key: 'Languages', value: 'English to Japanese' },
      { icon: 'duration', key: 'Length', value: '29 to 30 s each' },
    ],
  },
  videos: {
    lead: 'Each of the eight product videos plays from English to Japanese with its original sound. The switch above a video sets the two languages side by side or one above the other.',
    facts: [
      { icon: 'film', key: 'Videos', value: VIDEOS.length },
      { icon: 'columns', key: 'Layouts', value: 'Side by side or stacked' },
      { icon: 'duration', key: 'Length', value: '29 to 30 s each' },
    ],
  },
  credits: {
    lead: 'Each original video belongs to its company. Each clip on these pages shows 29 to 30 seconds of its original.',
    facts: [
      { icon: 'film', key: 'Videos', value: VIDEOS.length },
      { icon: 'people', key: 'Companies', value: OWNERS.length },
      { icon: 'link', key: 'Linked originals', value: VIDEOS.filter((video) => video.source).length },
    ],
  },
};

/**
 * The meta line under a frame: where each language sits, the pixel size,
 * the running time and the sound. Every item but the first holds together
 * with no-break spaces, and each separator follows one, so a wrapped line
 * breaks between items and never starts with the dot.
 */
function metaLine(view: View, entry: Entry): string {
  const items = [`${view.width} by ${view.height}`, `${entry.seconds} s`, entry.sound ? 'starts muted' : 'no sound'];
  return [view.layout, ...items.map((item) => item.replaceAll(' ', ' '))].join(' · ');
}

/**
 * A row's video with the switch between its views above it, as the
 * language toggle sits above a film on /motion: the frame below changes
 * size with the view, and the switch keeps its place. The chosen view's
 * copy plays in BrandFilm, remounted per view so the poster and the play
 * button come back; a switch while it plays starts the new view at once.
 * A copy with sound starts muted, and a switch carries the reader's sound
 * state to the next view: the keyed wrapper's ref sets it before
 * BrandFilm's mount effect can start the video.
 */
function VideoFigure({ entry }: { entry: Entry }) {
  const first = entry.views[0];
  const [key, setKey] = useState(first?.key ?? '');
  const [autoStart, setAutoStart] = useState(false);
  const figureRef = useRef<HTMLElement>(null);
  const muted = useRef(true);
  const startMuted = useRef((el: HTMLDivElement | null) => {
    const video = el?.querySelector('video');
    if (video) video.muted = muted.current;
  }).current;
  const view = entry.views.find((v) => v.key === key) ?? first;
  if (!view) return null;

  const choose = (next: string) => {
    if (next === key) return;
    const video = figureRef.current?.querySelector('video');
    setAutoStart(Boolean(video && !video.paused && !video.ended));
    if (video) muted.current = video.muted;
    setKey(next);
  };

  return (
    <>
      {entry.views.length > 1 ? (
        <Seg
          className='tc-seg'
          label={`Layout of ${entry.name}`}
          options={entry.views.map((v) => ({ value: v.key, label: v.label, title: v.layout }))}
          value={view.key}
          onChange={choose}
        />
      ) : null}
      <figure
        ref={figureRef}
        className={cn('tc-film', view.narrow && 'is-narrow')}
        style={{ '--tc-ratio': `${view.width} / ${view.height}` }}
      >
        <div key={view.key} ref={entry.sound ? startMuted : undefined}>
          <BrandFilm autoStart={autoStart} name={entry.name} poster={`${MEDIA}/${view.file}.jpg`} src={`${MEDIA}/${view.file}.mp4`} />
        </div>
      </figure>
      <p className='gx-line'>{metaLine(view, entry)}</p>
    </>
  );
}

/** The credits: each product's original, linked where its title and address are recorded. */
function Credits() {
  return (
    <dl className='tc-credits'>
      {VIDEOS.map((video) => (
        <div key={video.slug}>
          <dt>{video.name}</dt>
          <dd>
            {video.source ? (
              <>
                The original is &ldquo;
                <a href={video.source.url} rel='noreferrer' target='_blank'>
                  {video.source.title}
                </a>
                &rdquo; by {video.owner}.
              </>
            ) : (
              <>The original video belongs to {video.owner}.</>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

type RowProps = { id: string; n: string; active: string; children: ReactNode };

function Row({ id, n, active, children }: RowProps) {
  const on = id === active;
  return (
    <article id={id} className={cn('gx-row', on && 'is-active')} data-id={id} aria-current={on ? 'true' : undefined}>
      <div className='gx-n'>
        <b>{n}</b>
      </div>
      <div className='gx-body'>{children}</div>
    </article>
  );
}

function VideoRow({ entry, active }: { entry: Entry; active: string }) {
  return (
    <Row id={entry.id} n={entry.n} active={active}>
      <h3>{entry.title}</h3>
      <p>{entry.line}</p>
      <VideoFigure entry={entry} />
    </Row>
  );
}

type PartProps = { index: number; id: string; label: string; fact: string; lead: string; children: ReactNode };

/** One section: its divider (`Section n`, one fact, the h2 and its lead), then its rows. */
function Part({ index, id, label, fact, lead, children }: PartProps) {
  return (
    <section className='pt-book-part gx-cat' aria-labelledby={`${id}-h`}>
      <div className='gx-sec pt-book-sec'>
        <small>
          <span>Section {index}</span>
          <span>{fact}</span>
        </small>
        <div>
          <h2 id={`${id}-h`}>{label}</h2>
          <p>{lead}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

type TranscreateBookProps = {
  route: TranscreateRoute;
  /** the flow sheet's scroll region */
  sheetRef: RefObject<HTMLDivElement | null>;
  /** receives the row jump, for a re-click on the active row in the list */
  jumpRef: RefObject<(id: string) => void>;
  /** the active row, read by the shell's onSelect outside this component */
  activeOut: RefObject<string>;
  /** the head's Updated row: the route's entry in src/lib/updated.ts */
  updated: PageUpdated;
};

/**
 * One Transcreate page read top to bottom inside the flow sheet, in the
 * graphics book's row grammar: the head, then the page's sections under
 * their dividers. The overview holds the grid of all eight and a contents
 * list of the three pages, the videos page each video, and the credits
 * page the originals. The reading state is the shared read line
 * (useReadLine), with /motion's instant jumps: the row under the line is
 * selected through the shell, and a selection from anywhere else jumps the
 * sheet to its row.
 */
function TranscreateBook({ route, sheetRef, jumpRef, activeOut, updated }: TranscreateBookProps) {
  const { active, select } = usePtShell();
  activeOut.current = active;

  /* a page's own row (Videos on the videos page) has no row of its own: it returns the sheet to the head */
  const { jump, onContents } = useReadLine({ rootRef: sheetRef, selector: '.gx-row', active, select, topWhenMissing: true });
  jumpRef.current = jump;

  const head = HEAD[route];
  const book = ROUTE_PAGE[route];
  const title = PAGE_NAMES[book].name;

  return (
    <div className='gx-book pt-book-col'>
      <BookHead
        title={title}
        lead={head.lead}
        updated={updated}
        facts={head.facts}
        contents={
          route === 'overview' ? (
            <nav className='gx-toc pt-book-toc' aria-label='Contents'>
              <a href={`#${GRID_ROW}`} onClick={(e) => onContents(e, GRID_ROW)}>
                <span>All eight videos</span>
                <small>8 videos</small>
              </a>
              <Link href={ROUTE_PATH.videos}>
                <span>Each video</span>
                <small>{RANGE}</small>
              </Link>
              <Link href={ROUTE_PATH.credits}>
                <span>Credits</span>
                <small>{`${VIDEOS.length} originals`}</small>
              </Link>
            </nav>
          ) : undefined
        }
      />

      {route === 'overview' ? (
        <Part index={1} id='transcreate-all' label='All eight videos' fact='8 videos' lead='The eight videos play at once in one frame.'>
          <VideoRow entry={GRID_ENTRY} active={active} />
        </Part>
      ) : null}

      {route === 'videos' ? (
        <Part index={1} id='transcreate-each' label='Each video' fact={RANGE} lead='Each video starts muted, and its controls turn the sound on.'>
          {VIDEO_ENTRIES.map((entry) => (
            <VideoRow key={entry.id} entry={entry} active={active} />
          ))}
        </Part>
      ) : null}

      {route === 'credits' ? (
        <Part
          index={1}
          id='transcreate-originals'
          label='Original videos'
          fact={`${VIDEOS.length} originals`}
          lead='Four originals have a recorded title and address, and each title links to it.'
        >
          <Row id={CREDITS_ROW} n='' active={active}>
            <h3>Sources</h3>
            <Credits />
          </Row>
        </Part>
      ) : null}
    </div>
  );
}

type TranscreateViewerProps = {
  route: TranscreateRoute;
  /** the route's entry in src/lib/updated.ts, from the server page */
  updated: PageUpdated;
};

/** Each route's sections, built once. */
const SECTIONS: Readonly<Record<TranscreateRoute, ReturnType<typeof transcreateSections>>> = {
  overview: transcreateSections('overview'),
  videos: transcreateSections('videos'),
  credits: transcreateSections('credits'),
};

/** The row each page opens on when the hash names none. */
const FIRST_ROW: Readonly<Record<TranscreateRoute, string>> = {
  overview: GRID_ROW,
  videos: videoRow(VIDEOS[0]?.slug ?? ''),
  credits: CREDITS_ROW,
};

/**
 * The Transcreate pages on the viewer shell: their rows open under
 * Knowledge > Transcreate in the list (sections.ts), and each page is ruled
 * rows inside the 1280px flow sheet. Flow keys, so Space and the arrows
 * scroll. The hash names the row in view. Every video waits for its play
 * button, and its poster loads lazily (BrandFilm), so a page fetches no
 * video it does not play.
 */
export default function TranscreateViewer({ route, updated }: TranscreateViewerProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const jumpRef = useRef<(id: string) => void>(() => {});
  const activeOut = useRef(FIRST_ROW[route]);

  return (
    <ViewerShell
      id='transcreate'
      title={PAGE_NAMES.transcreate.name}
      mark='pt'
      count={`${VIDEOS.length} videos`}
      sections={SECTIONS[route]}
      active={FIRST_ROW[route]}
      modes={MODES}
      thumb='row'
      surfaces='site'
      keys='flow'
      noun='video'
      onSelect={(id) => {
        /* re-clicking the active row brings it back to the read line */
        if (id === activeOut.current) jumpRef.current(id);
      }}
    >
      <Sheet variant='flow' scrollRef={sheetRef}>
        <TranscreateBook route={route} sheetRef={sheetRef} jumpRef={jumpRef} activeOut={activeOut} updated={updated} />
      </Sheet>
    </ViewerShell>
  );
}
