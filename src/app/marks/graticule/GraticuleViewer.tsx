'use client';

import Link from 'next/link';
import type { CSSProperties, MouseEvent, ReactNode, RefObject } from 'react';
import { useRef } from 'react';

import { BookHead } from '@/components/viewer/BookView';
import LineGlobe from '@/components/shared/LineGlobe';
import { Sheet } from '@/components/viewer/Sheet';
import { usePtShell } from '@/components/viewer/shell-context';
import { useReadLine } from '@/components/viewer/useReadLine';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { cn } from '@/lib/cn';
import { LINE_ANIMATIONS } from '@/lib/graticule/line-animations';
import type { CatalogMark } from '@/lib/marks';
import { boxMask, catalogMark } from '@/lib/marks';
import { PAGE_NAMES } from '@/lib/page-names';
import type { PageUpdated } from '@/lib/page-updated';
import type { ShellMode, ShellSection } from '@/lib/shell-data';
import { pad2 } from '@/lib/shell-data';

import {
  ANIMATED_MARKS,
  ANIMATIONS,
  ANIMATIONS_ID,
  ANIMATIONS_LEAD,
  ANIMATIONS_TITLE,
  animationsIn,
  GRATICULE_MARKS,
  LEAD,
  MARKS_ID,
  MARKS_TITLE,
  marksIn,
  VARIATIONS,
  VARIATIONS_ID,
  VARIATIONS_LEAD,
  VARIATIONS_OF,
  VARIATIONS_TITLE,
  variationsIn,
} from './content';
import type { Animation, Variation } from './content';

import './graticule.css';

const MODES: readonly ShellMode[] = ['book'];

type Part = { id: string; title: string; lead?: string; count: number; fact: string };

/** The page's sections in order, each with its count for the contents and its fact for the gutter; a section opens on its h2 and its lead, where it has one. */
const PARTS: readonly Part[] = [
  { id: MARKS_ID, title: MARKS_TITLE, count: GRATICULE_MARKS.length, fact: marksIn(GRATICULE_MARKS.length) },
  { id: ANIMATIONS_ID, title: ANIMATIONS_TITLE, lead: ANIMATIONS_LEAD, count: ANIMATIONS.length, fact: animationsIn(ANIMATIONS.length) },
  { id: VARIATIONS_ID, title: VARIATIONS_TITLE, lead: VARIATIONS_LEAD, count: VARIATIONS.length, fact: variationsIn(VARIATIONS.length) },
];

/** The marks every animation plays on, heavy first, with the name and the drawn box of each one's catalog row. */
const ANIMATED = ANIMATED_MARKS.map(({ mark, id }) => {
  const row = catalogMark(id);
  return { mark, name: row?.name ?? id, box: row?.box };
});

/** The drawn box the variations share with the mark they redraw. */
const VARIATION_BOX = catalogMark(VARIATIONS_OF)?.box;

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

/** A mark's name as a heading that links to its card on /marks. */
function MarkName({ id, name }: { id: string; name: string }) {
  return (
    <h3>
      <Link href={cardHref(id)}>{name}</Link>
    </h3>
  );
}

/** A mark drawn by mask from its public file, cropped to its drawn box, so it takes the page's ink in both themes and every ring fills its figure. */
function MarkArt({ file, box }: { file: string; box: CatalogMark['box'] }) {
  const crop = box ? boxMask(box) : undefined;
  const style: CSSProperties = {
    '--gr-mask': `url('${file}')`,
    ...(crop ? { '--gr-mask-size': crop.size, '--gr-mask-pos': crop.position, aspectRatio: String(crop.aspect) } : {}),
  };
  return <span className='gr-art' style={style} aria-hidden='true' />;
}

/** One mark: the drawing and its name link to its card on /marks, and its catalog note follows. */
function MarkFigure({ mark }: { mark: CatalogMark }) {
  return (
    <figure className='gr-fig'>
      <Link href={cardHref(mark.id)} className='gr-art-link' tabIndex={-1} aria-hidden='true'>
        <MarkArt file={mark.file} box={mark.box} />
      </Link>
      <figcaption>
        <MarkName id={mark.id} name={mark.name} />
        {mark.note && <p>{mark.note}</p>}
      </figcaption>
    </figure>
  );
}

/**
 * One animation: both marks playing it live, heavy first, then its name and
 * what moves. Both drawings watch the figure, so they start, pause and resume
 * together and stay in step.
 */
function AnimationFigure({ animation }: { animation: Animation }) {
  const figureRef = useRef<HTMLElement>(null);
  return (
    <figure ref={figureRef} className='gr-fig'>
      <div className='gr-pair'>
        {ANIMATED.map(({ mark, name, box }) => (
          <LineGlobe key={`${animation.id}-${mark}`} animation={animation.id} mark={mark} label={name} box={box} watch={figureRef} className='gr-line' />
        ))}
      </div>
      <figcaption>
        <h3>{LINE_ANIMATIONS[animation.id].title}</h3>
        <p>{animation.caption}</p>
      </figcaption>
    </figure>
  );
}

/** One variation: the drawing, then its name and what it changes. It has no card on /marks, so nothing links. */
function VariationFigure({ variation }: { variation: Variation }) {
  return (
    <figure className='gr-fig'>
      <MarkArt file={variation.file} box={VARIATION_BOX} />
      <figcaption>
        <h3>{variation.name}</h3>
        <p>{variation.caption}</p>
      </figcaption>
    </figure>
  );
}

type SectionProps = { id: string; n: number; fact: string; title: string; lead?: string; active: boolean; children: ReactNode };

/** One section of the book: a part that opens with the shared divider, its h2 and its lead, and its fact in the gutter note. */
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
          {lead && <p>{lead}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

type BookProps = {
  sheetRef: RefObject<HTMLDivElement | null>;
  /** receives the section jump, for a re-click on the active row in the list */
  jumpRef: RefObject<(id: string) => void>;
  /** the active id, read by the shell's onSelect outside this component */
  activeOut: RefObject<string>;
  updated: PageUpdated;
};

function GraticuleBook({ sheetRef, jumpRef, activeOut, updated }: BookProps) {
  const { active, ready, select } = usePtShell();
  activeOut.current = active;

  const { jump, onContents } = useReadLine({ rootRef: sheetRef, selector: '.gr-sec', active, select, ready, smooth: true });
  jumpRef.current = jump;

  const body = (id: string): ReactNode => {
    if (id === MARKS_ID)
      return (
        <div className='gr-row'>
          {GRATICULE_MARKS.map((mark) => (
            <MarkFigure key={mark.id} mark={mark} />
          ))}
        </div>
      );
    if (id === ANIMATIONS_ID)
      return (
        <div className='gr-row is-anim'>
          {ANIMATIONS.map((animation) => (
            <AnimationFigure key={animation.id} animation={animation} />
          ))}
        </div>
      );
    return (
      <div className='gr-row is-small'>
        {VARIATIONS.map((variation) => (
          <VariationFigure key={variation.id} variation={variation} />
        ))}
      </div>
    );
  };

  return (
    <div className='pt-book-col'>
      <BookHead
        title={PAGE_NAMES.graticule.name}
        lead={LEAD}
        updated={updated}
        facts={[
          { icon: 'swatch', key: 'Marks', value: GRATICULE_MARKS.length },
          { icon: 'film', key: 'Animations', value: ANIMATIONS.length },
          { icon: 'grid', key: 'Variations', value: VARIATIONS.length },
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

export type GraticuleViewerProps = {
  /** the /marks/graticule entry in src/lib/updated.ts, from the server page */
  updated: PageUpdated;
};

/**
 * Every graticule mark on the viewer shell, then its line globe animations,
 * then the variations of Graticule jaw, thicker. The list hangs under Marks > Graticule; flow keys, so Space
 * and the arrows scroll.
 */
export default function GraticuleViewer({ updated }: GraticuleViewerProps) {
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
        <GraticuleBook sheetRef={sheetRef} jumpRef={jumpRef} activeOut={activeOut} updated={updated} />
      </Sheet>
    </ViewerShell>
  );
}
