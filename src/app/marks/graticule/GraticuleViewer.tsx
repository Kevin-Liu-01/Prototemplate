'use client';

import Link from 'next/link';
import type { CSSProperties, MouseEvent, ReactNode, RefObject } from 'react';
import { useRef } from 'react';

import { BookHead } from '@/components/viewer/BookView';
import { Sheet } from '@/components/viewer/Sheet';
import { usePtShell } from '@/components/viewer/shell-context';
import { useReadLine } from '@/components/viewer/useReadLine';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { cn } from '@/lib/cn';
import type { CatalogMark } from '@/lib/marks';
import { boxMask, catalogMark } from '@/lib/marks';
import { PAGE_NAMES } from '@/lib/page-names';
import type { PageUpdated } from '@/lib/page-updated';
import type { ShellMode, ShellSection } from '@/lib/shell-data';
import { pad2 } from '@/lib/shell-data';

import {
  GRATICULE_MARKS,
  LEAD,
  MARKS_ID,
  MARKS_TITLE,
  marksIn,
  PROGRESSION_STEPS,
  PROGRESSIONS,
  PROGRESSIONS_ID,
  PROGRESSIONS_TITLE,
  progressionsIn,
} from './content';

import './graticule.css';

const MODES: readonly ShellMode[] = ['book'];

type Part = { id: string; title: string; count: number; fact: string };

/** The page's two sections in order, each with its count for the contents and its fact for the gutter; each opens on its h2 alone. */
const PARTS: readonly Part[] = [
  { id: MARKS_ID, title: MARKS_TITLE, count: GRATICULE_MARKS.length, fact: marksIn(GRATICULE_MARKS.length) },
  { id: PROGRESSIONS_ID, title: PROGRESSIONS_TITLE, count: PROGRESSIONS.length, fact: progressionsIn(PROGRESSIONS.length) },
];

/** The list under Knowledge > Marks > Graticule. */
const SECTIONS: readonly ShellSection[] = [
  {
    id: 'graticule-book',
    label: PAGE_NAMES.graticule.name,
    under: 'graticule',
    items: PARTS.map((part, i) => ({ id: part.id, n: pad2(i + 1), title: part.title })),
  },
];

/** A mark's card on /marks, by its id: a shortlisted mark's card is a section the shell lands on, every other dynamic card carries its id as an anchor. */
const cardHref = (id: string) => `/marks#${id}`;

/** A mark's name as a heading that links to its card on /marks; both sections name their marks this way. */
function MarkName({ id, name }: { id: string; name: string }) {
  return (
    <h3>
      <Link href={cardHref(id)}>{name}</Link>
    </h3>
  );
}

/** A catalog mark drawn by mask from its public file, cropped to its drawn box, so it takes the page's ink in both themes and every ring fills its figure. */
function MarkArt({ mark }: { mark: CatalogMark }) {
  const crop = mark.box ? boxMask(mark.box) : undefined;
  const style: CSSProperties = {
    '--gr-mask': `url('${mark.file}')`,
    ...(crop ? { '--gr-mask-size': crop.size, '--gr-mask-pos': crop.position, aspectRatio: String(crop.aspect) } : {}),
  };
  return <span className='gr-art' style={style} aria-hidden='true' />;
}

/** One mark: the drawing and its name link to its card on /marks, and its catalog note follows. */
function MarkFigure({ mark }: { mark: CatalogMark }) {
  return (
    <figure className='gr-fig'>
      <Link href={cardHref(mark.id)} className='gr-art-link' tabIndex={-1} aria-hidden='true'>
        <MarkArt mark={mark} />
      </Link>
      <figcaption>
        <MarkName id={mark.id} name={mark.name} />
        {mark.note && <p>{mark.note}</p>}
      </figcaption>
    </figure>
  );
}

/**
 * A progression drawn by mask from its public file, so it takes the page's
 * ink in both themes. Each globe is its own square cell, masked by the whole
 * file at the file's aspect and shifted to that globe, so the steps lie in
 * one row as the file draws them and wrap two by two on a phone.
 */
function Progression({ file, aspect, label }: { file: string; aspect: number; label: string }) {
  const style: CSSProperties = { '--gr-mask': `url('${file}')`, '--gr-aspect': aspect, '--gr-steps': PROGRESSION_STEPS };
  return (
    <span className='gr-steps' style={style} role='img' aria-label={label}>
      {Array.from({ length: PROGRESSION_STEPS }, (_, i) => (
        <span key={i} className='gr-step' style={{ '--gr-at': `${(i / (PROGRESSION_STEPS - 1)) * 100}%` }} />
      ))}
    </span>
  );
}

type SectionProps = { id: string; n: number; fact: string; title: string; active: boolean; children: ReactNode };

/** One section of the book: a part that opens with the shared divider, its h2 alone, and its fact in the gutter note. */
function Section({ id, n, fact, title, active, children }: SectionProps) {
  return (
    <section className={cn('pt-book-part gr-sec', active && 'is-active')} data-id={id} aria-labelledby={`gr-${id}`}>
      <div className='pt-book-sec'>
        <small>
          <span>Section {n}</span>
          <span>{fact}</span>
        </small>
        <div>
          <h2 id={`gr-${id}`}>{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

type BookProps = {
  /** the progressions' viewBox aspect, width over height, read from their files on the server */
  progressionAspect: number;
  sheetRef: RefObject<HTMLDivElement | null>;
  /** receives the section jump, for a re-click on the active row in the list */
  jumpRef: RefObject<(id: string) => void>;
  /** the active id, read by the shell's onSelect outside this component */
  activeOut: RefObject<string>;
  updated: PageUpdated;
};

function GraticuleBook({ progressionAspect, sheetRef, jumpRef, activeOut, updated }: BookProps) {
  const { active, ready, select } = usePtShell();
  activeOut.current = active;

  const { jump, onContents } = useReadLine({ rootRef: sheetRef, selector: '.gr-sec', active, select, ready, smooth: true });
  jumpRef.current = jump;

  const body = (id: string): ReactNode =>
    id === MARKS_ID ? (
      <div className='gr-row'>
        {GRATICULE_MARKS.map((mark) => (
          <MarkFigure key={mark.id} mark={mark} />
        ))}
      </div>
    ) : (
      <div className='gr-row is-steps'>
        {PROGRESSIONS.map(({ mark, file }) => {
          const name = catalogMark(mark)?.name ?? mark;
          return (
            <figure key={mark} className='gr-fig'>
              <Progression file={file} aspect={progressionAspect} label={`A wireframe globe becoming ${name} in four steps`} />
              <figcaption>
                <MarkName id={mark} name={name} />
              </figcaption>
            </figure>
          );
        })}
      </div>
    );

  return (
    <div className='pt-book-col'>
      <BookHead
        title={PAGE_NAMES.graticule.name}
        lead={LEAD}
        updated={updated}
        facts={[
          { icon: 'swatch', key: 'Marks', value: GRATICULE_MARKS.length },
          { icon: 'globe', key: 'Progressions', value: PROGRESSIONS.length },
          { icon: 'arrow-right-circle', key: 'Steps', value: PROGRESSION_STEPS },
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
        <Section key={part.id} id={part.id} n={i + 1} fact={part.fact} title={part.title} active={active === part.id}>
          {body(part.id)}
        </Section>
      ))}
    </div>
  );
}

export type GraticuleViewerProps = {
  progressionAspect: number;
  /** the /marks/graticule entry in src/lib/updated.ts, from the server page */
  updated: PageUpdated;
};

/**
 * Every graticule mark on the viewer shell, then the two progressions from
 * a full globe to a mark. The list hangs under Marks > Graticule; flow
 * keys, so Space and the arrows scroll.
 */
export default function GraticuleViewer({ progressionAspect, updated }: GraticuleViewerProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const jumpRef = useRef<(id: string) => void>(() => {});
  const activeOut = useRef<string>(MARKS_ID);

  return (
    <ViewerShell
      id='graticule'
      title={PAGE_NAMES.graticule.name}
      mark='pt'
      count={marksIn(GRATICULE_MARKS.length)}
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
        <GraticuleBook progressionAspect={progressionAspect} sheetRef={sheetRef} jumpRef={jumpRef} activeOut={activeOut} updated={updated} />
      </Sheet>
    </ViewerShell>
  );
}
