'use client';

import { useGSAP } from '@gsap/react';
import type { ReactNode, RefObject } from 'react';
import { Fragment, useRef, useState } from 'react';

import { ListRow } from '@/components/viewer/ListRow';
import { Sheet } from '@/components/viewer/Sheet';
import { usePtShell } from '@/components/viewer/shell-context';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { cn } from '@/lib/cn';
import type { ShellMode } from '@/lib/shell-data';
import { pad2 } from '@/lib/shell-data';
import { useMountEffect } from '@/lib/use-mount-effect';

import { BRAND_COUNT, BRAND_SECTIONS, BRAND_SHELL_SECTIONS, headingsOf } from './brand-sections';

/* the sidebar head: the mark, this, and `10 sections` share 208px */
const BRAND_TITLE = 'Brand';
const BRAND_MODES: readonly ShellMode[] = ['book', 'grid'];

/**
 * The spy line: a section is the one being read once its top has passed
 * this fraction of the scroll region's height. Above the line at the very
 * top of the book, the first section holds.
 */
const SPY_LINE = 0.3;

/** How long the spy stands down after a programmatic jump, so the jump's own scroll event does not re-select. */
const JUMP_LOCK_MS = 250;

/** One section's rendered content, keyed by its id. */
export type BrandPage = { id: string; body: ReactNode };

type Jump = (id: string) => void;

/** The section and heading the spy currently sees. */
type SpyReading = { section: string; heading: string | null };

/**
 * Reads the book: the last section whose top has crossed the spy line, and
 * within it the last heading that has. At the very top nothing has crossed
 * and the first section holds; at the very bottom the last section holds
 * even when it is too short to reach the line.
 */
function readSpy(region: HTMLElement): SpyReading | null {
  const sections = region.querySelectorAll<HTMLElement>('.ptb-page');
  const first = sections.item(0);
  if (!first) return null;
  const top = region.getBoundingClientRect().top;
  const line = top + region.clientHeight * SPY_LINE;
  const atEnd = region.scrollTop + region.clientHeight >= region.scrollHeight - 2;

  let current = first;
  if (atEnd) {
    current = sections.item(sections.length - 1) ?? first;
  } else {
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= line) current = section;
    });
  }

  let heading: string | null = null;
  current.querySelectorAll<HTMLElement>('h3[id]').forEach((h3) => {
    if (h3.getBoundingClientRect().top <= line) heading = h3.id;
  });
  return { section: current.dataset.id ?? first.dataset.id ?? '', heading };
}

type BrandBookProps = {
  /** the article opener: the h1, the byline, the intro, the mark figure */
  opener: ReactNode;
  pages: readonly BrandPage[];
  /** the heading the spy sees, for the rows in the list */
  onHeading: (id: string | null) => void;
  /** filled with the jump so the list rows, outside the stage, can scroll the book */
  jumpRef: RefObject<Jump>;
};

/**
 * The flow sheet at the rail width holding the article: the opener as the
 * head, then every section as a page row with its number in the gutter. A
 * passive scroll listener on the sheet spies the section and heading being
 * read and selects the section through the shell, which moves the hash and
 * the list without scrolling the book; a selection from anywhere else (the
 * list, the grid, the keys, the hash) jumps the book to the section.
 */
function BrandBook({ opener, pages, onHeading, jumpRef }: BrandBookProps) {
  const { active, index, select } = usePtShell();
  const region = useRef<HTMLDivElement>(null);

  /* the listeners read the latest values through refs; assigned every render */
  const activeRef = useRef(active);
  activeRef.current = active;
  const selectRef = useRef(select);
  selectRef.current = select;
  const onHeadingRef = useRef(onHeading);
  onHeadingRef.current = onHeading;
  /** the id the spy just selected, so the jump effect leaves the reader's scroll alone */
  const fromScroll = useRef<string | null>(null);
  /** the active id the jump effect last saw; null before the first run */
  const lastActive = useRef<string | null>(null);
  /** the spy stands down until this time after a jump */
  const lockUntil = useRef(0);
  const lastHeading = useRef<string | null>(null);

  const bodies = new Map(pages.map((page) => [page.id, page.body]));

  const reportHeading = (id: string | null) => {
    if (lastHeading.current === id) return;
    lastHeading.current = id;
    onHeadingRef.current(id);
  };

  const jump: Jump = (id) => {
    const book = region.current;
    if (!book) return;
    const target = book.querySelector<HTMLElement>(`.ptb-page[data-id="${id}"], h3[id="${id}"]`);
    if (!target) return;
    lockUntil.current = performance.now() + JUMP_LOCK_MS;
    target.scrollIntoView({ block: 'start' });
    if (target.tagName === 'H3') reportHeading(id);
    else reportHeading(null);
  };
  jumpRef.current = jump;

  useMountEffect(() => {
    const book = region.current;
    if (!book) return;
    let frame = 0;
    const spy = () => {
      frame = 0;
      if (performance.now() < lockUntil.current) return;
      const seen = readSpy(book);
      if (!seen) return;
      reportHeading(seen.heading);
      if (seen.section && seen.section !== activeRef.current) {
        fromScroll.current = seen.section;
        selectRef.current(seen.section);
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(spy);
    };
    book.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      book.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  });

  /* the one dependency effect: when the active section changes from outside
     the book, bring it to the top. The first run is the mount, where only a
     deep link moves the book; a change the spy caused is left alone. */
  useGSAP(
    () => {
      const previous = lastActive.current;
      lastActive.current = active;
      if (previous === active) return;
      if (previous === null) {
        if (index > 0) jump(active);
        return;
      }
      if (fromScroll.current === active) {
        fromScroll.current = null;
        return;
      }
      jump(active);
    },
    { dependencies: [active] }
  );

  return (
    <Sheet variant='flow' width='rail' scrollRef={region}>
      <div className='pt-root ptb-book'>
        <article className='pt-post'>
          <header className='ptb-head pt-sec pt-post-sec'>{opener}</header>
          {BRAND_SECTIONS.map((section, i) => (
            <Fragment key={section.id}>
              <div className='pt-hatch' aria-hidden='true' />
              <section
                className={cn('ptb-page pt-sec', section.id === active && 'is-active')}
                id={section.id}
                data-id={section.id}
              >
                <div className='ptb-pn' aria-hidden='true'>
                  <b>{pad2(i + 1)}</b>
                </div>
                <div className='ptb-page-body pt-post-sec'>{bodies.get(section.id)}</div>
              </section>
            </Fragment>
          ))}
        </article>
      </div>
    </Sheet>
  );
}

type BrandHeadingRowsProps = {
  sectionId: string;
  heading: string | null;
  onJump: Jump;
};

/**
 * The h3 rows under the active section in the list. Rendered inside the
 * shell's provider, so it can read the mode and stand down in the grid,
 * where the cards carry no rows.
 */
function BrandHeadingRows({ sectionId, heading, onJump }: BrandHeadingRowsProps) {
  const { mode } = usePtShell();
  if (mode === 'grid') return null;
  return headingsOf(sectionId).map((row) => (
    <ListRow
      key={row.id}
      item={{ id: row.id, title: row.title }}
      active={row.id === heading}
      onSelect={onJump}
    />
  ));
}

export type BrandViewerProps = {
  opener: ReactNode;
  pages: readonly BrandPage[];
};

/**
 * The brand book on the viewer shell: ten sections as captured thumbnails
 * in the list and the grid, the article itself in a flow sheet at the rail
 * width as the book, the site map in the index panel. Flow keys, so Space
 * and the arrows scroll; the hash carries the section.
 */
export default function BrandViewer({ opener, pages }: BrandViewerProps) {
  const [heading, setHeading] = useState<string | null>(null);
  const jump = useRef<Jump>(() => undefined);

  return (
    <ViewerShell
      id='brand'
      title={BRAND_TITLE}
      mark='pt'
      count={`${BRAND_COUNT} sections`}
      sections={BRAND_SHELL_SECTIONS}
      modes={BRAND_MODES}
      thumb='shot'
      surfaces='site'
      keys='flow'
      noun='section'
      renderSub={(item, active) =>
        active && headingsOf(item.id).length > 0 ? (
          <BrandHeadingRows sectionId={item.id} heading={heading} onJump={(id) => jump.current(id)} />
        ) : null
      }
    >
      <BrandBook opener={opener} pages={pages} onHeading={setHeading} jumpRef={jump} />
    </ViewerShell>
  );
}
