'use client';

import Link from 'next/link';
import type { MouseEvent, ReactNode, RefObject } from 'react';
import { useCallback, useRef, useState } from 'react';

import { BookHead } from '@/components/viewer/BookView';
import { Sheet } from '@/components/viewer/Sheet';
import { usePtShell } from '@/components/viewer/shell-context';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { cn } from '@/lib/cn';
import { PAGE_NAMES } from '@/lib/page-names';
import type { PageUpdated } from '@/lib/page-updated';
import type { ShellItem, ShellMode } from '@/lib/shell-data';
import { pad2 } from '@/lib/shell-data';
import { useLayoutWork } from '@/lib/use-layout-work';
import { useMountEffect } from '@/lib/use-mount-effect';

import { BRAND_COUNT, BRAND_SECTIONS, BRAND_SHELL_SECTIONS, headingsOf } from './brand-sections';
import GtVariants from './GtVariants';

/* the sidebar head: the mark, this, and `10 sections` share 208px */
const BRAND_TITLE = PAGE_NAMES.brand.name;
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
  /** the head's lead and note (BookHead), above the article */
  lead: ReactNode;
  note: ReactNode;
  /** the head's Updated row: the /brand entry in src/lib/updated.ts */
  updated: PageUpdated;
  /** the head's Reading fact: BRAND.md's reading time in minutes, from the server page */
  readingMinutes: number;
  pages: readonly BrandPage[];
  /** the heading the spy sees, for the rows in the list */
  onHeading: (id: string | null) => void;
  /** filled with the jump so the list rows, outside the stage, can scroll the book */
  jumpRef: RefObject<Jump>;
};

/**
 * The flow sheet at the book width holding the book: the shell's BookHead
 * (the title, the lead, the panel, the note, the contents and the band) on
 * the shell's tokens, then the article with every section opened by the
 * shared divider (Section n and its source in the gutter, the title at
 * d2) and its body in the title's column. A passive scroll listener on the sheet spies the section and heading being
 * read and selects the section through the shell, which moves the hash and
 * the list without scrolling the book; a selection from anywhere else (the
 * list, the grid, the keys, the hash) jumps the book to the section.
 */
function BrandBook({ lead, note, updated, readingMinutes, pages, onHeading, jumpRef }: BrandBookProps) {
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
  useLayoutWork(
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

  const onContents = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (id === activeRef.current) jump(id);
    else select(id);
  };

  return (
    <Sheet variant='flow' scrollRef={region}>
      <div className='pt-book-col'>
        <BookHead
          title={PAGE_NAMES.brand.name}
          badge={<GtVariants />}
          lead={lead}
          note={note}
          updated={updated}
          facts={[
            { icon: 'index', key: 'Sections', value: BRAND_SECTIONS.length },
            {
              icon: 'document',
              key: 'Canon',
              value: (
                <>
                  <Link href='/docs/brand'>BRAND.md</Link>, <Link href='/docs/design'>DESIGN.md</Link>
                </>
              ),
            },
            { icon: 'duration', key: 'Reading', value: `${readingMinutes} min` },
          ]}
          contents={
            <nav className='pt-book-toc' aria-label='Contents'>
              {BRAND_SECTIONS.map((section, i) => (
                <a key={section.id} href={`#${section.id}`} onClick={(e) => onContents(e, section.id)}>
                  <span>{section.title}</span>
                  <small>{pad2(i + 1)}</small>
                </a>
              ))}
            </nav>
          }
        />
        <div className='pt-root ptb-book'>
          <article className='pt-book-col ptb-article'>
            {BRAND_SECTIONS.map((section, i) => (
              <section
                key={section.id}
                className={cn('pt-book-part ptb-page', section.id === active && 'is-active')}
                id={section.id}
                data-id={section.id}
              >
                <div className='pt-book-sec'>
                  <small>
                    <span>Section {i + 1}</span>
                    <span>{section.source}</span>
                  </small>
                  <h2>{section.title}</h2>
                </div>
                <div className='ptb-page-body pt-post-sec'>{bodies.get(section.id)}</div>
              </section>
            ))}
          </article>
        </div>
      </div>
    </Sheet>
  );
}

export type BrandViewerProps = {
  /** the head's lead: two or three lines that say what the page is */
  lead: ReactNode;
  /** the rest of the introduction, under the head's rule */
  note: ReactNode;
  pages: readonly BrandPage[];
  /** the /brand entry in src/lib/updated.ts, from the server page */
  updated: PageUpdated;
  /** BRAND.md's reading time in minutes, for the head's Reading fact */
  readingMinutes: number;
};

/**
 * The brand book on the viewer shell: ten sections as the run under Pages
 * > Brand in the list (with the h3s of the section being read under it)
 * and as captured thumbnails in the grid, the article itself in a flow
 * sheet at the book width (1280px, as every book) as the book, the site
 * map in the index panel.
 * Flow keys, so Space and the arrows scroll; the hash carries the section.
 */
export default function BrandViewer({ lead, note, pages, updated, readingMinutes }: BrandViewerProps) {
  const [heading, setHeading] = useState<string | null>(null);
  const jump = useRef<Jump>(() => undefined);
  /* the h3s of the section being read, as the deep run under its row; stable between heading changes */
  const subRows = useCallback(
    (item: ShellItem, active: boolean) =>
      active
        ? headingsOf(item.id).map((h) => ({
            id: h.id,
            title: h.title,
            href: `/brand#${h.id}`,
            active: h.id === heading,
            onSelect: () => jump.current(h.id),
          }))
        : null,
    [heading]
  );

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
      subRows={subRows}
    >
      <BrandBook
        lead={lead}
        note={note}
        updated={updated}
        readingMinutes={readingMinutes}
        pages={pages}
        onHeading={setHeading}
        jumpRef={jump}
      />
    </ViewerShell>
  );
}
