'use client';

import { useGSAP } from '@gsap/react';
import type { MouseEvent, ReactNode } from 'react';
import { useMemo, useRef, useSyncExternalStore } from 'react';

import { formatDay, localDay, relativeDay } from '@/lib/dates';
import { COMMIT_URL } from '@/lib/page-updated';
import type { PageUpdated } from '@/lib/page-updated';
import type { ShellItem, ShellSection } from '@/lib/shell-data';
import { pad2, previewId } from '@/lib/shell-data';
import { useMountEffect } from '@/lib/use-mount-effect';

import { Icon } from './icons';
import type { IconName } from './icons';
import { InstallField } from './InstallField';
import { usePtShell } from './shell-context';

import './BookView.css';

/** The word for one page in the divider text: `Slides 13 to 24`, `Slide 49`. */
export type BookNoun = { one: string; many: string };

/** One row of the head panel: a shell glyph, a label and a short value (a count, a name, links). */
export type BookFact = { icon: IconName; key: string; value: ReactNode };

/** The panel's four slots after Updated's one: three facts, or one fact and the install field (two slots). */
export type BookSlots =
  | { facts: readonly [BookFact, BookFact, BookFact]; install?: undefined }
  | { facts: readonly [BookFact]; install: string };

export type BookHeadProps = BookSlots & {
  /** the page's plain name from PAGE_NAMES, or a record's own title */
  title: string;
  /** a figure on the title's line after the name (the brand's traced monogram); decorative, so hidden from the accessible name */
  badge?: ReactNode;
  /** one to three lines at the lead measure, 200 characters at most */
  lead: ReactNode;
  /** the page's entry in src/lib/updated.ts, passed down from its server page.tsx */
  updated: PageUpdated;
  /** the rest of the introduction, under the mast's rule at the body step */
  note?: ReactNode;
  /** the route's contents nav (.pt-book-toc); left out on a page of fewer than two sections */
  contents?: ReactNode;
};

export type BookViewProps = BookSlots & {
  title: string;
  /** the head's badge (BadgeCycle.tsx) */
  badge?: ReactNode;
  lead: ReactNode;
  /** the rest of the introduction, under the head's rule */
  note?: ReactNode;
  /** the route's entry in src/lib/updated.ts */
  updated: PageUpdated;
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

const noop = () => () => {};
const noDay = () => null;

/**
 * The Updated row's value: the day as `Oct 5, 2026` in a time element,
 * linked to its commit (plain while the change is uncommitted), and the
 * relative hint before it once the page has hydrated. The reader's day is
 * read through useSyncExternalStore, null on the server and in the
 * hydrating render, so the markup matches; the hint mounts after, left of
 * the right-aligned date, so the date never moves.
 */
function UpdatedValue({ updated }: { updated: PageUpdated }) {
  const today = useSyncExternalStore(noop, localDay, noDay);
  const ago = today ? relativeDay(updated.day, today) : null;
  const date = <time dateTime={updated.at}>{formatDay(updated.day)}</time>;
  return (
    <>
      {ago ? <small>{ago}</small> : null}
      {updated.commit ? (
        <a href={`${COMMIT_URL}${updated.commit}`} title={`Commit ${updated.commit}`}>
          {date}
        </a>
      ) : (
        date
      )}
    </>
  );
}

/**
 * The front matter of a book (DESIGN.md section 4, The book page), the same
 * on every page: the mast (the title across the top, with an optional badge
 * after the name, then the lead and the panel side by side from the lead's
 * first line, one --pt-hair rule under the taller of the two, run across
 * the stage), the note under the rule, the route's contents,
 * and the hatch band that ends the front matter. The panel holds four
 * slots after Updated: three facts, or one fact and the install field. A
 * page differs from another only in its words and its facts. Rendered
 * inside the route's .pt-book-col, before its first section.pt-book-part.
 */
export function BookHead({ title, badge, lead, updated, note, contents, facts, install }: BookHeadProps) {
  return (
    <>
      <header className='pt-book-head'>
        <div className='pt-book-mast'>
          <h1>
            {badge ? (
              <>
                {title.slice(0, title.lastIndexOf(' ') + 1)}
                <span className='pt-book-title-end'>
                  {title.slice(title.lastIndexOf(' ') + 1)}
                  <span className='pt-book-badge' aria-hidden='true'>
                    {badge}
                  </span>
                </span>
              </>
            ) : (
              title
            )}
          </h1>
          <p className='pt-book-lead'>{lead}</p>
          <aside className='pt-book-panel' aria-label='About this page'>
            <dl>
              <div className='pt-book-fact is-updated'>
                <dt>
                  <Icon name='updated' />
                  Updated
                </dt>
                <dd>
                  <UpdatedValue updated={updated} />
                </dd>
              </div>
              {facts.map((fact) => (
                <div key={fact.key} className='pt-book-fact'>
                  <dt>
                    <Icon name={fact.icon} />
                    {fact.key}
                  </dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
              {install ? (
                <div className='pt-book-fact is-field'>
                  <dt className='pt-book-vh'>Install command</dt>
                  <dd>
                    <InstallField command={install} />
                  </dd>
                </div>
              ) : null}
            </dl>
          </aside>
        </div>
        {note ? <div className='pt-book-note'>{typeof note === 'string' ? <p>{note}</p> : note}</div> : null}
      </header>
      {contents}
      <div className='pt-book-band' aria-hidden='true' />
    </>
  );
}

/**
 * The route read top to bottom: a head, a contents list, then every item
 * as a page under its section divider. One IntersectionObserver on the
 * scroll region marks the page in the middle band active and selects it
 * through the shell on the next animation frame, which updates the hash
 * without scrolling the book; selections from anywhere else (keys, sidebar,
 * contents) scroll the page into view. Pages hold static captures (or a
 * route's flowing content) and skip rendering off screen; a click on a
 * framed page opens the item live in slide mode where the route offers one
 * (directive 7.5). Content-agnostic: what a page holds comes from renderPage.
 */
export function BookView({
  title,
  badge,
  lead,
  note,
  updated,
  facts,
  install,
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

  /* the one observer for this view (directive 7.5): it reads every page and
     hands the winner to a frame callback, so a fast scroll that fires the
     observer several times a frame selects once, on the next paint */
  useMountEffect(() => {
    const book = root.current;
    if (!book || typeof IntersectionObserver === 'undefined') return;
    let frame = 0;
    let pending: string | null = null;
    const commit = () => {
      frame = 0;
      const id = pending;
      pending = null;
      if (!id || id === activeRef.current || modeRef.current !== 'book') return;
      fromScroll.current = id;
      selectRef.current(id);
    };
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
        pending = id;
        if (!frame) frame = requestAnimationFrame(commit);
      },
      { root: book, rootMargin: IO_ROOT_MARGIN, threshold: IO_THRESHOLDS }
    );
    book.querySelectorAll<HTMLElement>('.pt-page').forEach((page) => observer.observe(page));
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
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
        <BookHead
          {...(install === undefined ? { facts } : { facts, install })}
          title={title}
          badge={badge}
          lead={lead}
          note={note}
          updated={updated}
          contents={
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
          }
        />

        {blocks.map(({ section, range, ordinal }) => (
          <section key={section.id} className='pt-book-part'>
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
                  <div className='pt-pn' data-preview={previewId(item)}>
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
          </section>
        ))}
      </div>
    </div>
  );
}
