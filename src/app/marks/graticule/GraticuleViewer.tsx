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
  MARKS_LEAD,
  MARKS_TITLE,
  marksIn,
  PROGRESSIONS,
  PROGRESSIONS_ID,
  PROGRESSIONS_LEAD,
  PROGRESSIONS_TITLE,
} from './content';

import './graticule.css';

const MODES: readonly ShellMode[] = ['book'];

/** The page's two sections in order, each with its gutter fact. */
const PARTS = [
  { id: MARKS_ID, title: MARKS_TITLE, lead: MARKS_LEAD, fact: marksIn(GRATICULE_MARKS.length) },
  { id: PROGRESSIONS_ID, title: PROGRESSIONS_TITLE, lead: PROGRESSIONS_LEAD, fact: marksIn(PROGRESSIONS.length) },
] as const;

/** The list under Knowledge > Marks > Graticule. */
const SECTIONS: readonly ShellSection[] = [
  {
    id: 'graticule-book',
    label: PAGE_NAMES.graticule.name,
    under: 'graticule',
    items: PARTS.map((part, i) => ({ id: part.id, n: pad2(i + 1), title: part.title, desc: part.lead })),
  },
];

const PICKS = GRATICULE_MARKS.filter((mark) => mark.pick).length;

/** A mark's card on /marks: a shortlisted mark's card is a section the shell lands on, every other dynamic card carries its id as an anchor. */
const cardHref = (mark: CatalogMark) => `/marks#${mark.id}`;

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
  const href = cardHref(mark);
  return (
    <figure className='gr-fig'>
      <Link href={href} className='gr-art-link' tabIndex={-1} aria-hidden='true'>
        <MarkArt mark={mark} />
      </Link>
      <figcaption>
        <h3>
          <Link href={href}>{mark.name}</Link>
        </h3>
        {mark.note && <p>{mark.note}</p>}
      </figcaption>
    </figure>
  );
}

/** A progression drawn by mask from its public file, so it takes the page's ink in both themes. */
function Progression({ file, aspect, label }: { file: string; aspect: number; label: string }) {
  const style: CSSProperties = { '--gr-mask': `url('${file}')`, aspectRatio: String(aspect) };
  return <span className='gr-art' style={style} role='img' aria-label={label} />;
}

type SectionProps = { id: string; n: number; fact: string; title: string; lead: string; active: boolean; children: ReactNode };

/** One section of the book: a part that opens with the shared divider, its fact in the gutter note. */
function Section({ id, n, fact, title, lead, active, children }: SectionProps) {
  return (
    <section className={cn('pt-book-part gr-sec', active && 'is-active')} data-id={id} aria-labelledby={`gr-${id}`}>
      <div className='pt-book-sec'>
        <small>
          <span>Section {n}</span>
          <span>{fact}</span>
        </small>
        <div>
          <h2 id={`gr-${id}`}>{title}</h2>
          <p>{lead}</p>
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
  updated: PageUpdated;
};

function GraticuleBook({ progressionAspect, sheetRef, updated }: BookProps) {
  const { active, ready, select } = usePtShell();
  const { onContents } = useReadLine({ rootRef: sheetRef, selector: '.gr-sec', active, select, ready, smooth: true });

  const body = (id: string): ReactNode =>
    id === MARKS_ID ? (
      <div className='gr-row'>
        {GRATICULE_MARKS.map((mark) => (
          <MarkFigure key={mark.id} mark={mark} />
        ))}
      </div>
    ) : (
      <div className='gr-row is-wide'>
        {PROGRESSIONS.map(({ mark, file }) => {
          const name = catalogMark(mark)?.name ?? mark;
          return (
            <figure key={mark} className='gr-fig'>
              <Progression file={file} aspect={progressionAspect} label={`A wireframe globe becoming ${name} in four steps`} />
              <figcaption>
                <p>{name}</p>
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
          { icon: 'check', key: 'Picks', value: PICKS },
          { icon: 'globe', key: 'Progressions', value: PROGRESSIONS.length },
        ]}
        contents={
          <nav className='pt-book-toc' aria-label='Contents'>
            {PARTS.map((part) => (
              <a key={part.id} href={`#${part.id}`} onClick={(e: MouseEvent<HTMLAnchorElement>) => onContents(e, part.id)}>
                <span>{part.title}</span>
                <small>{part.fact}</small>
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
    >
      <Sheet variant='flow' scrollRef={sheetRef}>
        <GraticuleBook progressionAspect={progressionAspect} sheetRef={sheetRef} updated={updated} />
      </Sheet>
    </ViewerShell>
  );
}
