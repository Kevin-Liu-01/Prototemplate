'use client';

import type { CSSProperties, MouseEvent, ReactNode, RefObject } from 'react';
import { useRef } from 'react';

import { BookHead } from '@/components/viewer/BookView';
import { Sheet } from '@/components/viewer/Sheet';
import { usePtShell } from '@/components/viewer/shell-context';
import { useReadLine } from '@/components/viewer/useReadLine';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { cn } from '@/lib/cn';
import { byline } from '@/lib/credit';
import { PAGE_NAMES } from '@/lib/page-names';
import type { PageUpdated } from '@/lib/page-updated';
import type { ShellMode, ShellSection } from '@/lib/shell-data';
import { pad2 } from '@/lib/shell-data';

import {
  ARMILLARY_ID,
  ARMILLARY_LEAD,
  ARMILLARY_FILES,
  ARMILLARY_TITLE,
  ASCII_ARMILLARY_FILES,
  ASCII_ARMILLARY_ID,
  ASCII_ARMILLARY_LEAD,
  ASCII_ARMILLARY_TITLE,
  BUILD_ID,
  BUILD_LEAD,
  BUILD_PARTS,
  BUILD_TITLE,
  FILES,
  GIMBAL_FILES,
  GIMBAL_ID,
  GIMBAL_LEAD,
  GIMBAL_TITLE,
  GLOBE_FILES,
  GLOBE_ID,
  GLOBE_LEAD,
  GLOBE_TITLE,
  GRID_ROWS,
  HEADER_FILES,
  HEADER_ID,
  HEADER_LEAD,
  HEADER_TITLE,
  kb,
  LEAD,
  RINGS_FILES,
  RINGS_ID,
  RINGS_LEAD,
  RINGS_TITLE,
  sectionsIn,
  SPHERE_FILES,
  SPHERE_ID,
  SPHERE_LEAD,
  SPHERE_TITLE,
  STILL_FILES,
  STILL_ID,
  STILL_LEAD,
  STILL_TITLE,
  TEXT_CAPTION,
  TEXT_TITLE,
} from './content';
import type { AsciiFile } from './content';

import './ascii.css';

const MODES: readonly ShellMode[] = ['book'];

type Part = { id: string; title: string; lead: string; fact: string; count: number };

/** The page's sections in order; the header leads. */
const PARTS: readonly Part[] = [
  { id: HEADER_ID, title: HEADER_TITLE, lead: HEADER_LEAD, fact: `${HEADER_FILES.length} files`, count: HEADER_FILES.length },
  { id: ASCII_ARMILLARY_ID, title: ASCII_ARMILLARY_TITLE, lead: ASCII_ARMILLARY_LEAD, fact: '2 GIFs', count: ASCII_ARMILLARY_FILES.length },
  { id: ARMILLARY_ID, title: ARMILLARY_TITLE, lead: ARMILLARY_LEAD, fact: `${ARMILLARY_FILES.length} GIFs`, count: ARMILLARY_FILES.length },
  { id: RINGS_ID, title: RINGS_TITLE, lead: RINGS_LEAD, fact: `${RINGS_FILES.length} GIFs`, count: RINGS_FILES.length },
  { id: GIMBAL_ID, title: GIMBAL_TITLE, lead: GIMBAL_LEAD, fact: `${GIMBAL_FILES.length} GIFs`, count: GIMBAL_FILES.length },
  { id: SPHERE_ID, title: SPHERE_TITLE, lead: SPHERE_LEAD, fact: `${SPHERE_FILES.length} GIFs`, count: SPHERE_FILES.length },
  { id: STILL_ID, title: STILL_TITLE, lead: STILL_LEAD, fact: `${STILL_FILES.length} GIFs`, count: STILL_FILES.length },
  { id: GLOBE_ID, title: GLOBE_TITLE, lead: GLOBE_LEAD, fact: `${GLOBE_FILES.length} GIFs`, count: GLOBE_FILES.length },
  { id: BUILD_ID, title: BUILD_TITLE, lead: BUILD_LEAD, fact: `${BUILD_PARTS.length} scripts`, count: BUILD_PARTS.length },
];

/** The list under Knowledge > Marks > ASCII. */
const SECTIONS: readonly ShellSection[] = [
  {
    id: 'ascii-book',
    label: PAGE_NAMES.ascii.name,
    under: 'ascii',
    items: PARTS.map((part, i) => ({ id: part.id, n: pad2(i + 1), title: part.title })),
  },
];

/** The download links of a set of files, each with its size. */
function Downloads({ files }: { files: readonly AsciiFile[] }) {
  return (
    <p className='ax-files'>
      <span className='ax-verb'>Download</span>
      {files.map((f) => (
        <a key={f.file} download href={`${FILES}/${f.file}`}>
          {f.label} <small>{kb(f.bytes)}</small>
        </a>
      ))}
    </p>
  );
}

function Terms({ items }: { items: readonly { term: string; body: string }[] }) {
  return (
    <dl className='ax-terms'>
      {items.map((item) => (
        <div key={item.term}>
          <dt>{item.term}</dt>
          <dd>{item.body}</dd>
        </div>
      ))}
    </dl>
  );
}

type SectionProps = { id: string; n: number; fact: string; title: string; lead: string; active: boolean; children: ReactNode };

/** One section of the book: the shared divider, its h2 and its lead, and its fact in the gutter note. */
function Section({ id, n, fact, title, lead, active, children }: SectionProps) {
  return (
    <section className={cn('pt-book-part ax-sec', active && 'is-active')} data-id={id} aria-labelledby={`ax-${id}`}>
      <div className='pt-book-sec'>
        <small>
          <span>Section {n}</span>
          <span>{fact}</span>
        </small>
        <div>
          <h2 id={`ax-${id}`}>{title}</h2>
          <p>{lead}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

type GifFile = AsciiFile & { ground: string };

type Files = {
  headerFiles: readonly AsciiFile[];
  asciiArmillaryFiles: readonly GifFile[];
  armillaryFiles: readonly GifFile[];
  ringsFiles: readonly GifFile[];
  gimbalFiles: readonly GifFile[];
  sphereFiles: readonly GifFile[];
  stillFiles: readonly GifFile[];
  globeFiles: readonly GifFile[];
  /** the header as plain text */
  text: string;
  /** the header's grid in dots, from its SVG's viewBox */
  grid: { cols: number; rows: number };
  /** the armillary's laps in seconds, the shortest and the longest of its versions, from scripts/build/armillary.json */
  laps: { min: number; max: number };
};

type BookProps = Files & {
  sheetRef: RefObject<HTMLDivElement | null>;
  jumpRef: RefObject<(id: string) => void>;
  activeOut: RefObject<string>;
  updated: PageUpdated;
};

/** One version of the armillary in ink: its GIF on each ground, then its downloads. */
function InkGifs({ files, alt }: { files: readonly GifFile[]; alt: string }) {
  return (
    <div className='ax-body'>
      <div className='ax-gifs'>
        {files.map((f) => (
          <figure key={f.file} className='ax-fig'>
            <img className='ax-gif' src={`${FILES}/${f.file}`} width={496} height={496} alt={`${alt}, ${f.ground.toLowerCase()}`} loading='lazy' decoding='async' />
            <figcaption>
              <h3>{f.ground}</h3>
            </figcaption>
          </figure>
        ))}
      </div>
      <Downloads files={files} />
    </div>
  );
}

function AsciiBook({ sheetRef, jumpRef, activeOut, updated, headerFiles, asciiArmillaryFiles, armillaryFiles, ringsFiles, gimbalFiles, sphereFiles, stillFiles, globeFiles, text, grid, laps }: BookProps) {
  const { active, ready, select } = usePtShell();
  activeOut.current = active;

  const { jump, onContents } = useReadLine({ rootRef: sheetRef, selector: '.ax-sec', active, select, ready, smooth: true });
  jumpRef.current = jump;

  const body = (id: string): ReactNode => {
    if (id === HEADER_ID)
      return (
        <div className='ax-body'>
          <figure className='ax-fig'>
            {/* the currentColor SVG as a mask, so the dots take the page's ink on either ground */}
            <div className='ax-header' role='img' aria-label='General Translation, the globe and the name drawn in round dots' style={{ aspectRatio: `${grid.cols} / ${grid.rows}`, maskImage: `url(${FILES}/gt-ascii-header.svg)`, WebkitMaskImage: `url(${FILES}/gt-ascii-header.svg)` }} />
            <Downloads files={headerFiles} />
          </figure>
          <Terms items={GRID_ROWS} />
          <figure className='ax-fig ax-text'>
            <pre aria-label='The header as plain text' style={{ '--ax-cols': grid.cols } as CSSProperties}>
              {text}
            </pre>
            <figcaption>
              <h3>{TEXT_TITLE}</h3>
              <p>{TEXT_CAPTION}</p>
            </figcaption>
          </figure>
        </div>
      );
    if (id === ASCII_ARMILLARY_ID)
      return (
        <div className='ax-body'>
          <div className='ax-gifs is-wide'>
            {asciiArmillaryFiles
              .filter((f) => f.file.endsWith('.gif'))
              .map((f) => (
                <figure key={f.file} className='ax-fig'>
                  <img className='ax-gif' src={`${FILES}/${f.file}`} width={456} height={456} alt={`The armillary in round dots, its pieces turning, ${f.ground.toLowerCase()}`} loading='lazy' decoding='async' />
                  <figcaption>
                    <h3>{f.ground}</h3>
                  </figcaption>
                </figure>
              ))}
          </div>
          <Downloads files={asciiArmillaryFiles} />
        </div>
      );
    if (id === ARMILLARY_ID) return <InkGifs files={armillaryFiles} alt='The logo as an armillary sphere, its pieces turning' />;
    if (id === RINGS_ID) return <InkGifs files={ringsFiles} alt='The logo as an armillary sphere, the meridian and the G turning round their own rings' />;
    if (id === GIMBAL_ID) return <InkGifs files={gimbalFiles} alt='The logo as a gimbal, its rings parting and turning round the still T' />;
    if (id === SPHERE_ID) return <InkGifs files={sphereFiles} alt='The logo as a gimbal, its rings turning on one sphere round the still T' />;
    if (id === STILL_ID) return <InkGifs files={stillFiles} alt='The logo as a gimbal, its rings turning behind the T held as the logo draws it' />;
    if (id === GLOBE_ID) return <InkGifs files={globeFiles} alt='The logo as a globe of three rings on the T, the rings turning round the still T' />;
    return (
      <div className='ax-body'>
        <Terms items={BUILD_PARTS} />
      </div>
    );
  };

  return (
    <div className='pt-book-col'>
      <BookHead
        skill='gt-brand'
        title={PAGE_NAMES.ascii.name}
        lead={LEAD}
        note={byline()}
        updated={updated}
        facts={[
          { icon: 'globe', key: 'Grid', value: `${grid.cols} by ${grid.rows} dots` },
          { icon: 'sync', key: 'Laps', value: laps.min === laps.max ? `${laps.min} s` : `${laps.min} to ${laps.max} s` },
          { icon: 'attachment', key: 'Files', value: headerFiles.length + asciiArmillaryFiles.length + armillaryFiles.length + ringsFiles.length + gimbalFiles.length + sphereFiles.length + stillFiles.length + globeFiles.length },
        ]}
        contents={
          <nav className='pt-book-toc' aria-label='Contents'>
            {PARTS.map((part) => (
              <a key={part.id} href={`#${part.id}`} onClick={(e: MouseEvent<HTMLAnchorElement>) => onContents(e, part.id)}>
                <span>{part.title}</span>
                <small>{part.count}</small>
              </a>
            ))}
          </nav>
        }
      />

      {PARTS.map((part, i) => (
        <Section key={part.id} id={part.id} n={i + 1} fact={part.fact} title={part.title} lead={part.lead} active={active === part.id}>
          {body(part.id)}
        </Section>
      ))}
    </div>
  );
}

export type AsciiViewerProps = Files & {
  /** the /marks/ascii entry in src/lib/updated.ts, from the server page */
  updated: PageUpdated;
};

/**
 * The dot-matrix header, the ASCII armillary and the armillary GIFs on the viewer shell. The list
 * hangs under Marks > ASCII; flow keys, so Space and the arrows scroll.
 */
export default function AsciiViewer({ updated, headerFiles, asciiArmillaryFiles, armillaryFiles, ringsFiles, gimbalFiles, sphereFiles, stillFiles, globeFiles, text, grid, laps }: AsciiViewerProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const jumpRef = useRef<(id: string) => void>(() => {});
  const activeOut = useRef<string>(HEADER_ID);

  return (
    <ViewerShell
      id='ascii'
      title={PAGE_NAMES.ascii.name}
      mark='pt'
      count={sectionsIn(PARTS.length)}
      sections={SECTIONS}
      modes={MODES}
      thumb='row'
      surfaces='site'
      keys='flow'
      noun='section'
      onSelect={(id) => {
        /* re-clicking the active row brings its section back to the read line */
        if (id === activeOut.current) jumpRef.current(id);
      }}
    >
      <Sheet variant='flow' scrollRef={sheetRef}>
        <AsciiBook sheetRef={sheetRef} jumpRef={jumpRef} activeOut={activeOut} updated={updated} headerFiles={headerFiles} asciiArmillaryFiles={asciiArmillaryFiles} armillaryFiles={armillaryFiles} ringsFiles={ringsFiles} gimbalFiles={gimbalFiles} sphereFiles={sphereFiles} stillFiles={stillFiles} globeFiles={globeFiles} text={text} grid={grid} laps={laps} />
      </Sheet>
    </ViewerShell>
  );
}
