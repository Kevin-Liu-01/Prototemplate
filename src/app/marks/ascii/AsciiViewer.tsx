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
  GRID_ROWS,
  HEADER_FILES,
  HEADER_ID,
  HEADER_LEAD,
  HEADER_TITLE,
  kb,
  LEAD,
  sectionsIn,
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

type Files = {
  headerFiles: readonly AsciiFile[];
  asciiArmillaryFiles: readonly (AsciiFile & { ground: string })[];
  armillaryFiles: readonly (AsciiFile & { ground: string })[];
  /** the header as plain text */
  text: string;
  /** the header's grid in dots, from its SVG's viewBox */
  grid: { cols: number; rows: number };
  /** one lap of the armillary in seconds, from scripts/build/armillary.json */
  lap: number;
};

type BookProps = Files & {
  sheetRef: RefObject<HTMLDivElement | null>;
  jumpRef: RefObject<(id: string) => void>;
  activeOut: RefObject<string>;
  updated: PageUpdated;
};

function AsciiBook({ sheetRef, jumpRef, activeOut, updated, headerFiles, asciiArmillaryFiles, armillaryFiles, text, grid, lap }: BookProps) {
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
    if (id === ARMILLARY_ID)
      return (
        <div className='ax-body'>
          <div className='ax-gifs'>
            {armillaryFiles.map((f) => (
              <figure key={f.file} className='ax-fig'>
                <img className='ax-gif' src={`${FILES}/${f.file}`} width={496} height={496} alt={`The logo as an armillary sphere, its pieces turning, ${f.ground.toLowerCase()}`} loading='lazy' decoding='async' />
                <figcaption>
                  <h3>{f.ground}</h3>
                </figcaption>
              </figure>
            ))}
          </div>
          <Downloads files={armillaryFiles} />
        </div>
      );
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
          { icon: 'sync', key: 'Lap', value: `${lap} s` },
          { icon: 'attachment', key: 'Files', value: headerFiles.length + asciiArmillaryFiles.length + armillaryFiles.length },
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
 * The dot-matrix header, the ASCII armillary and the armillary GIF on the viewer shell. The list
 * hangs under Marks > ASCII; flow keys, so Space and the arrows scroll.
 */
export default function AsciiViewer({ updated, headerFiles, asciiArmillaryFiles, armillaryFiles, text, grid, lap }: AsciiViewerProps) {
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
        <AsciiBook sheetRef={sheetRef} jumpRef={jumpRef} activeOut={activeOut} updated={updated} headerFiles={headerFiles} asciiArmillaryFiles={asciiArmillaryFiles} armillaryFiles={armillaryFiles} text={text} grid={grid} lap={lap} />
      </Sheet>
    </ViewerShell>
  );
}
