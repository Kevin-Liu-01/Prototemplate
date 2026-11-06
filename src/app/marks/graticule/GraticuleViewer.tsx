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
import type { LineLoops } from '@/lib/graticule/line-loop';
import { LINE_ANIMATION_TITLES } from '@/lib/graticule/line-loop';
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
  BEST,
  BEST_ID,
  BEST_LEAD,
  BEST_TITLE,
  GRATICULE_MARKS,
  LEAD,
  MARKS_ID,
  MARKS_TITLE,
  marksIn,
  STUDIES,
  VARIATIONS,
  VARIATIONS_ID,
  VARIATIONS_LEAD,
  VARIATIONS_BOX_OF,
  VARIATIONS_TITLE,
  variationsIn,
} from './content';
import type { Animation, Best, Study, Variation } from './content';

import './graticule.css';

const MODES: readonly ShellMode[] = ['book'];

type Part = { id: string; title: string; lead?: string; count: number; fact: string };

/** The page's sections in order, each with its count for the contents and its fact for the gutter; a section opens on its h2 and its lead, where it has one. */
const PARTS: readonly Part[] = [
  { id: BEST_ID, title: BEST_TITLE, lead: BEST_LEAD, count: BEST.length, fact: marksIn(BEST.length) },
  { id: MARKS_ID, title: MARKS_TITLE, count: GRATICULE_MARKS.length, fact: marksIn(GRATICULE_MARKS.length) },
  { id: ANIMATIONS_ID, title: ANIMATIONS_TITLE, lead: ANIMATIONS_LEAD, count: ANIMATIONS.length, fact: animationsIn(ANIMATIONS.length) },
  { id: VARIATIONS_ID, title: VARIATIONS_TITLE, lead: VARIATIONS_LEAD, count: VARIATIONS.length, fact: variationsIn(VARIATIONS.length) },
];

/** The marks every animation plays on, heavy first, with the name and the drawn box of each one's catalog row. */
const ANIMATED = ANIMATED_MARKS.map(({ mark, id }) => {
  const row = catalogMark(id);
  return { mark, name: row?.name ?? id, box: row?.box };
});

/** The drawn box a variation shares with Graticule jaw, thicker, or with the catalog mark its entry names. */
const variationBox = (variation: Variation) => catalogMark(variation.boxOf ?? VARIATIONS_BOX_OF)?.box;

/** A figure's heading level: h3 directly under a section's h2, h4 under a study's h3. */
type Level = 'h3' | 'h4';

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
function AnimationFigure({ animation, loops }: { animation: Animation; loops: LineLoops[Animation['id']] }) {
  const figureRef = useRef<HTMLElement>(null);
  return (
    <figure ref={figureRef} className='gr-fig'>
      <div className='gr-pair'>
        {ANIMATED.map(({ mark, name, box }) => (
          <LineGlobe key={`${animation.id}-${mark}`} loop={loops[mark]} label={name} box={box} watch={figureRef} className='gr-line' />
        ))}
      </div>
      <figcaption>
        <h3>{LINE_ANIMATION_TITLES[animation.id]}</h3>
        <p>{animation.caption}</p>
      </figcaption>
    </figure>
  );
}

/** One variation: the drawing, then its name and what it draws or changes. It has no card on /marks, so nothing links. */
function VariationFigure({ variation, level: H = 'h3' }: { variation: Variation; level?: Level }) {
  return (
    <figure className='gr-fig'>
      <MarkArt file={variation.file} box={variationBox(variation)} />
      <figcaption>
        <H>{variation.name}</H>
        <p>{variation.caption}</p>
      </figcaption>
    </figure>
  );
}

/** One best mark: a catalog mark's figure, which links to its card, or a variation's. */
function BestFigure({ best }: { best: Best }) {
  return best.kind === 'mark' ? <MarkFigure mark={best.mark} /> : <VariationFigure variation={best.variation} />;
}

/** One study of the variations: its sub-head and lead on the text's line, then its drawings. */
function StudyBlock({ study }: { study: Study }) {
  return (
    <section className='gr-study' id={study.id} aria-labelledby={`gr-${study.id}`}>
      <header className='gr-study-head'>
        <h3 id={`gr-${study.id}`}>{study.title}</h3>
        <p>{study.lead}</p>
      </header>
      <div className='gr-row is-small'>
        {study.variations.map((variation) => (
          <VariationFigure key={variation.id} variation={variation} level='h4' />
        ))}
      </div>
    </section>
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
  loops: LineLoops;
};

function GraticuleBook({ sheetRef, jumpRef, activeOut, updated, loops }: BookProps) {
  const { active, ready, select } = usePtShell();
  activeOut.current = active;

  const { jump, onContents } = useReadLine({ rootRef: sheetRef, selector: '.gr-sec', active, select, ready, smooth: true });
  jumpRef.current = jump;

  const body = (id: string): ReactNode => {
    if (id === BEST_ID)
      return (
        <div className='gr-row'>
          {BEST.map((best) => (
            <BestFigure key={best.kind === 'mark' ? best.mark.id : best.variation.id} best={best} />
          ))}
        </div>
      );
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
            <AnimationFigure key={animation.id} animation={animation} loops={loops[animation.id]} />
          ))}
        </div>
      );
    return STUDIES.map((study) => <StudyBlock key={study.id} study={study} />);
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
  /** every line globe loop with its still, drawn by the server page, so hydration runs no geometry */
  loops: LineLoops;
};

/**
 * The best graticule marks on the viewer shell, then every graticule mark,
 * then its line globe animations, then every variation by study, newest
 * first. The list hangs under Marks > Graticule; flow keys, so Space and the
 * arrows scroll.
 */
export default function GraticuleViewer({ updated, loops }: GraticuleViewerProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const jumpRef = useRef<(id: string) => void>(() => {});
  const activeOut = useRef<string>(PARTS[0].id);

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
        <GraticuleBook sheetRef={sheetRef} jumpRef={jumpRef} activeOut={activeOut} updated={updated} loops={loops} />
      </Sheet>
    </ViewerShell>
  );
}
