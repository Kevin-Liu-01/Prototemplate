'use client';

import { useGSAP } from '@gsap/react';
import type { MouseEvent, ReactNode } from 'react';
import { Fragment, useMemo, useRef } from 'react';

import type { ShellItem, ShellSection } from '@/lib/shell-data';
import { pad2 } from '@/lib/shell-data';
import { useMountEffect } from '@/lib/use-mount-effect';

import { usePtShell } from './shell-context';

import './BookView.css';

/** The word for one page in the divider text: `Slides 13 to 24`, `Slide 49`. */
export type BookNoun = { one: string; many: string };

export type BookViewProps = {
  title: string;
  lead?: string;
  /** right-aligned lines under the head rule: `8 sections`, `52 slides`, `September 2026` */
  meta?: readonly string[];
  /** the book's sections; each becomes a contents entry and a divider */
  sections: readonly ShellSection[];
  /** what fills a page: a ThumbShot, or the real content of a section */
  renderPage: (item: ShellItem, index: number) => ReactNode;
  /** wrap each page in the 16:9 frame; off when pages hold flowing content */
  frame?: boolean;
  noun?: BookNoun;
  label?: string;
};

const PAGE_NOUN: BookNoun = { one: 'Page', many: 'Pages' };

/** the band in the middle of the book that decides the active page */
const IO_ROOT_MARGIN = '-42% 0px -42% 0px';
const IO_THRESHOLDS = [0, 0.25, 0.5, 1];

/** 1-based positions in the flattened item list */
type PageRange = { first: number; last: number };

type Block = { section: ShellSection; range: PageRange; ordinal: number };

function rangeText(range: PageRange): string {
  return range.last > range.first ? `${pad2(range.first)} to ${pad2(range.last)}` : pad2(range.first);
}

function dividerText(range: PageRange, noun: BookNoun): string {
  return range.last > range.first
    ? `${noun.many} ${pad2(range.first)} to ${pad2(range.last)}`
    : `${noun.one} ${pad2(range.first)}`;
}

/**
 * The route read top to bottom: a head, a contents list, then every item
 * as a page under its section divider. An IntersectionObserver on the
 * scroll region marks the page in the middle band active and selects it
 * through the shell, which updates the hash without scrolling the book;
 * selections from anywhere else (keys, sidebar, contents) scroll the page
 * into view. Content-agnostic: what a page holds comes from renderPage.
 */
export function BookView({
  title,
  lead,
  meta,
  sections,
  renderPage,
  frame = true,
  noun = PAGE_NOUN,
  label = 'Book',
}: BookViewProps) {
  const { items, active, index, mode, modes, select, setMode } = usePtShell();
  const root = useRef<HTMLDivElement>(null);

  /* the observer and the scroll effect read the latest state through refs;
     the assignments run every render so the mount-time listeners never
     see a stale closure */
  const activeRef = useRef(active);
  activeRef.current = active;
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const selectRef = useRef(select);
  selectRef.current = select;
  /** the id the observer just selected, so the scroll effect leaves the reader's scroll alone */
  const fromScroll = useRef<string | null>(null);
  /** the active id the scroll effect last saw; null before the first run */
  const lastActive = useRef<string | null>(null);

  const position = useMemo(() => {
    const map = new Map<string, number>();
    items.forEach((item, i) => map.set(item.id, i));
    return map;
  }, [items]);

  const blocks = useMemo<readonly Block[]>(() => {
    const out: Block[] = [];
    for (const section of sections) {
      const first = section.items[0];
      const last = section.items[section.items.length - 1];
      if (!first || !last) continue;
      const firstPos = (position.get(first.id) ?? 0) + 1;
      const lastPos = (position.get(last.id) ?? firstPos - 1) + 1;
      out.push({ section, range: { first: firstPos, last: lastPos }, ordinal: out.length + 1 });
    }
    return out;
  }, [sections, position]);

  const slideOffered = modes.includes('slide');

  const scrollToPage = (id: string, behavior: ScrollBehavior) => {
    const book = root.current;
    if (!book) return;
    for (const page of book.querySelectorAll<HTMLElement>('.pt-page')) {
      if (page.dataset.id !== id) continue;
      page.scrollIntoView({ block: 'start', behavior });
      return;
    }
  };

  useMountEffect(() => {
    const book = root.current;
    if (!book || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (modeRef.current !== 'book') return;
        let best: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (entry.isIntersecting && (!best || entry.intersectionRatio > best.intersectionRatio)) best = entry;
        }
        if (!best) return;
        const id = (best.target as HTMLElement).dataset.id;
        if (!id || id === activeRef.current) return;
        fromScroll.current = id;
        selectRef.current(id);
      },
      { root: book, rootMargin: IO_ROOT_MARGIN, threshold: IO_THRESHOLDS }
    );
    book.querySelectorAll<HTMLElement>('.pt-page').forEach((page) => observer.observe(page));
    return () => observer.disconnect();
  });

  /* the one dependency effect: when the active item changes from outside
     the book, bring its page to the top. The first run is the mount, where
     the jump is instant; a change the observer caused is left alone. */
  useGSAP(
    () => {
      const previous = lastActive.current;
      lastActive.current = active;
      if (previous === active) return;
      if (previous === null) {
        if (index > 0) scrollToPage(active, 'instant');
        return;
      }
      if (fromScroll.current === active) {
        fromScroll.current = null;
        return;
      }
      scrollToPage(active, 'auto');
    },
    { dependencies: [active] }
  );

  const onContents = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (id === activeRef.current) scrollToPage(id, 'auto');
    else select(id);
  };

  const onPage = (e: MouseEvent<HTMLDivElement>, id: string) => {
    if (!slideOffered) return;
    if ((e.target as Element).closest('a, button, input, textarea, select')) return;
    setMode('slide');
    select(id);
  };

  return (
    <div ref={root} className='pt-book pt-scroll' role='region' aria-label={label}>
      <div className='pt-book-in'>
        <div className='pt-book-head'>
          <div>
            <h1>{title}</h1>
            {lead ? <p>{lead}</p> : null}
          </div>
          {meta && meta.length > 0 ? (
            <div className='pt-book-meta'>
              {meta.map((line, i) => (
                <span key={i}>{line}</span>
              ))}
            </div>
          ) : null}
        </div>

        <nav className='pt-book-toc' aria-label='Contents'>
          {blocks.map(({ section, range }) => {
            const first = section.items[0];
            return (
              <a key={section.id} href={`#${first.id}`} onClick={(e) => onContents(e, first.id)}>
                <span>{section.label}</span>
                <small>{rangeText(range)}</small>
              </a>
            );
          })}
        </nav>

        {blocks.map(({ section, range, ordinal }) => (
          <Fragment key={section.id}>
            <div className='pt-book-sec'>
              <small>
                <span>Section {ordinal}</span>
                <span>{dividerText(range, noun)}</span>
              </small>
              <h2>{section.label}</h2>
            </div>
            {section.items.map((item) => {
              const pos = position.get(item.id) ?? 0;
              const on = item.id === active;
              return (
                <article key={item.id} className={on ? 'pt-page is-active' : 'pt-page'} data-id={item.id}>
                  <div className='pt-pn'>
                    {item.n ? <b>{item.n}</b> : null}
                    <span>{item.title}</span>
                  </div>
                  {frame ? (
                    <div
                      className={slideOffered ? 'pt-page-frame is-link' : 'pt-page-frame'}
                      onClick={(e) => onPage(e, item.id)}
                    >
                      {renderPage(item, pos)}
                    </div>
                  ) : (
                    <div className='pt-page-body'>{renderPage(item, pos)}</div>
                  )}
                </article>
              );
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
