'use client';

import { useGSAP } from '@gsap/react';
import type { MouseEvent, RefObject } from 'react';
import { useRef } from 'react';

import { Sheet } from '@/components/viewer/Sheet';
import { usePtShell } from '@/components/viewer/shell-context';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { cn } from '@/lib/cn';
import { MARK_FAMILIES, MARK_SIZES, MARK_TESTS, MARKS, markFamily, REFERENCE_MARK } from '@/lib/marks';
import type { Mark, MarkArt } from '@/lib/marks';
import type { ShellMode, ShellSection } from '@/lib/shell-data';
import { pad2 } from '@/lib/shell-data';
import { useMountEffect } from '@/lib/use-mount-effect';

import './marks.css';

const MARKS_TITLE = 'Marks';
const BOOK_TITLE = 'Mark explorations';
const MARKS_MODES: readonly ShellMode[] = ['book', 'grid'];

const METHOD_ID = 'method';
const PRESENTATION_ID = 'presentation';

const BOOK_LEAD =
  'New marks for General Translation, built on one principle: the picture lives in the letters. The G and the T carry a picture about translation in their counters, joins or reflections, and there is no separate icon. Every mark is one color, so it takes the ink of whatever it sits on, and every mark has to read at 16px as well as at 256px, on paper and on ink. Nine marks in three families follow, best first, each shown positive and reversed, at five sizes, as an app icon and a favicon, and with its construction. The current mark closes the page as the reference, not as a candidate.';

const METHOD_LEAD =
  'Every mark on this page passes the same six tests. A mark that fails one is dropped, whatever its idea. The tests come from the brief and from the sizes a mark actually lives at: a browser tab, a phone home screen, a slide.';

const PRESENTATION_LEAD =
  'The nine marks together at one size, positive and reversed, so the families can be compared as a set. The current doubled-line mark follows as the reference the explorations were measured against.';

const REFERENCE_CAPTION =
  'The current mark, the doubled-line GT monogram. It is the reference the explorations were measured against, and it is not a candidate.';

/** The name shown beside the favicon in the tab mock; the product name, not a claim. */
const TAB_TITLE = 'General Translation';

/** The share of the app icon tile the mark fills; 0.64 leaves the platform's own safe area clear. */
const APP_ICON_SHARE = 0.64;
const APP_ICON_PX = 128;
const APP_MARK_PX = Math.round(APP_ICON_PX * APP_ICON_SHARE);

/**
 * The read line. A section that crosses the top tenth of the sheet is the
 * one being read; among several, the lowest on the page wins, so the
 * section whose top has just passed under the line is the active one.
 */
const SPY_MARGIN = '0px 0px -90% 0px';

/** How long the spy waits for a programmatic scroll to reach its section before it reads the page again. */
const SETTLE_MS = 1200;

/** The route's list: Method, the nine marks by name, Presentation. The marks alone are paged, so digits 1 to 9 pick a mark. */
const SECTIONS: readonly ShellSection[] = [
  {
    id: METHOD_ID,
    label: 'Method',
    paged: false,
    items: [{ id: METHOD_ID, n: '', title: 'The six tests', desc: 'The tests every mark has to pass.' }],
  },
  {
    id: 'marks',
    label: 'Marks',
    items: MARKS.map((mark, i) => ({
      id: mark.id,
      n: pad2(i + 1),
      title: mark.name,
      desc: `${markFamily(mark).label}. ${mark.thesis}`,
    })),
  },
  {
    id: PRESENTATION_ID,
    label: 'Presentation',
    paged: false,
    items: [
      {
        id: PRESENTATION_ID,
        n: '',
        title: 'Nine marks together',
        desc: 'The set on one field, positive and reversed, and the current mark for reference.',
      },
    ],
  },
];

function cssEscape(value: string): string {
  return typeof CSS !== 'undefined' && 'escape' in CSS ? CSS.escape(value) : value;
}

function scrollBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

type ArtProps = {
  /** the SVG file's markup, read on the server */
  svg: string;
  /** the rendered box in CSS pixels; the SVG fills it */
  size: number;
  className?: string;
};

/**
 * One inlined SVG. The file is rendered as markup so its root keeps its own
 * attributes (the reflection overlays set their stroke on the root); the
 * wrapper sizes it and the plate's color reaches it as currentColor.
 */
function Art({ svg, size, className }: ArtProps) {
  return (
    <span
      className={cn('mk-svg', className)}
      style={{ width: size, height: size }}
      aria-hidden='true'
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

/** The current mark, drawn from its path; wider than tall, so it is set by width. */
function ReferenceArt({ width }: { width: number }) {
  return (
    <svg
      className='mk-ref-svg'
      viewBox={REFERENCE_MARK.viewBox}
      fill='currentColor'
      style={{ width }}
      aria-hidden='true'
    >
      <path fillRule='evenodd' d={REFERENCE_MARK.d} />
    </svg>
  );
}

type MarkSheetProps = {
  mark: Mark;
  n: string;
  art: MarkArt;
  active: boolean;
};

/**
 * One mark, presented the way a logo reel presents a logo: the mark large,
 * positive and reversed; a row of sizes on both grounds; the app icon and
 * the favicon in a tab; the clean mark beside its construction; then the
 * thesis, the construction and the small-size note as ruled rows.
 */
function MarkSheet({ mark, n, art, active }: MarkSheetProps) {
  const family = markFamily(mark);
  const headingId = `mk-${mark.id}`;
  return (
    <section
      className={cn('mk-sec', active && 'is-active')}
      data-id={mark.id}
      aria-labelledby={headingId}
      aria-current={active ? 'true' : undefined}
    >
      {/* the picture first, the words after: the thesis waits in the notes under the plates */}
      <div className='mk-div'>
        <small>
          <span>Mark {n}</span>
          <span>{family.label}</span>
        </small>
        <div>
          <h2 id={headingId}>{mark.name}</h2>
          <p className='mk-thesis'>{family.principle}</p>
        </div>
      </div>

      <div className='mk-pair'>
        <figure className='mk-plate is-paper'>
          <Art svg={art.clean} size={256} />
          <figcaption>Positive, 256px</figcaption>
        </figure>
        <figure className='mk-plate is-ink'>
          <Art svg={art.clean} size={256} />
          <figcaption>Reversed, 256px</figcaption>
        </figure>
      </div>

      <div className='mk-pair'>
        {(['paper', 'ink'] as const).map((ground) => (
          <figure key={ground} className={cn('mk-strip', ground === 'paper' ? 'is-paper' : 'is-ink')}>
            <div className='mk-strip-row'>
              {MARK_SIZES.map((size) => (
                <span key={size} className='mk-size'>
                  <Art svg={art.clean} size={size} />
                  <small>{size}</small>
                </span>
              ))}
            </div>
            <figcaption>{ground === 'paper' ? 'Positive' : 'Reversed'}, 16 to 128px</figcaption>
          </figure>
        ))}
      </div>

      <div className='mk-apps'>
        <figure className='mk-app'>
          <span className='mk-app-tile'>
            <Art svg={art.clean} size={APP_MARK_PX} />
          </span>
          <figcaption>App icon, {APP_ICON_PX}px</figcaption>
        </figure>
        <figure className='mk-fav'>
          <span className='mk-tab'>
            <Art svg={art.clean} size={16} />
            <span className='mk-tab-title'>{TAB_TITLE}</span>
          </span>
          <figcaption>Favicon, 16px</figcaption>
        </figure>
        <figure className='mk-plate is-paper is-build'>
          <Art svg={art.clean} size={192} />
          <figcaption>Clean</figcaption>
        </figure>
        <figure className='mk-plate is-paper is-build'>
          <Art svg={art.construction} size={192} />
          <figcaption>Construction</figcaption>
        </figure>
      </div>

      <dl className='mk-notes'>
        <div className='mk-note'>
          <dt>Thesis</dt>
          <dd>{mark.thesis}</dd>
        </div>
        <div className='mk-note'>
          <dt>Construction</dt>
          <dd>{mark.construction}</dd>
        </div>
        <div className='mk-note'>
          <dt>At 16px</dt>
          <dd>{mark.small}</dd>
        </div>
        <div className='mk-note'>
          <dt>Files</dt>
          <dd>
            <a href={mark.file}>{mark.file}</a>
            <span className='mk-sep'>and</span>
            <a href={mark.constructionFile}>{mark.constructionFile}</a>
          </dd>
        </div>
      </dl>
    </section>
  );
}

type MarksBookProps = {
  art: Readonly<Record<string, MarkArt>>;
  /** the flow sheet's scroll region */
  sheetRef: RefObject<HTMLDivElement | null>;
  /** receives the section jump, for a re-click on the active row in the list */
  jumpRef: RefObject<(id: string) => void>;
  /** the active id, read by the shell's onSelect outside this component */
  activeOut: RefObject<string>;
};

/**
 * The book: a head, a contents list, the Method section, one section per
 * mark and the Presentation, top to bottom inside the flow sheet. Owns the
 * reading state the way the skills book does: an IntersectionObserver on
 * the sheet marks the section under the read line and selects it through
 * the shell (the list and the hash follow); a selection from anywhere else
 * scrolls the sheet to the section and mutes the spy until it arrives. A
 * deep link lands without motion; the spy never selects at the head, so
 * Method stays marked there.
 */
function MarksBook({ art, sheetRef, jumpRef, activeOut }: MarksBookProps) {
  const { active, ready, select } = usePtShell();
  activeOut.current = active;

  const activeRef = useRef(active);
  activeRef.current = active;
  const selectRef = useRef(select);
  selectRef.current = select;

  const lastActive = useRef<string | null>(null);
  const landed = useRef(false);
  const fromScroll = useRef<string | null>(null);
  const settling = useRef<Element | null>(null);
  const settleTimer = useRef(0);

  const sectionFor = (id: string): HTMLElement | null =>
    sheetRef.current?.querySelector<HTMLElement>(`.mk-sec[data-id="${cssEscape(id)}"]`) ?? null;

  const scrollTo = (id: string, behavior: ScrollBehavior) => {
    const el = sectionFor(id);
    if (!el) return;
    settling.current = el;
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      settling.current = null;
    }, SETTLE_MS);
    el.scrollIntoView({ block: 'start', behavior });
  };

  jumpRef.current = (id: string) => scrollTo(id, scrollBehavior());

  /* the spy: the lowest section crossing the read line names the active item */
  useMountEffect(() => {
    const root = sheetRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;
    const sections = Array.from(root.querySelectorAll<HTMLElement>('.mk-sec'));
    const order = new Map<Element, number>(sections.map((el, i) => [el, i]));
    const visible = new Set<Element>();
    const lowest = (): HTMLElement | null => {
      let best: HTMLElement | null = null;
      let rank = -1;
      for (const el of visible) {
        const i = order.get(el) ?? -1;
        if (i > rank) {
          rank = i;
          best = el as HTMLElement;
        }
      }
      return best;
    };
    const apply = (best: HTMLElement) => {
      const id = best.dataset.id;
      if (!id || id === activeRef.current) return;
      fromScroll.current = id;
      selectRef.current(id);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target);
          else visible.delete(entry.target);
        }
        const best = lowest();
        if (!best) return;
        if (settling.current) {
          if (best !== settling.current) return;
          settling.current = null;
          window.clearTimeout(settleTimer.current);
        }
        apply(best);
      },
      { root, rootMargin: SPY_MARGIN, threshold: 0 }
    );
    sections.forEach((el) => observer.observe(el));
    const onScrollEnd = () => {
      if (!settling.current) return;
      settling.current = null;
      window.clearTimeout(settleTimer.current);
    };
    root.addEventListener('scrollend', onScrollEnd);
    return () => {
      observer.disconnect();
      root.removeEventListener('scrollend', onScrollEnd);
      window.clearTimeout(settleTimer.current);
    };
  });

  /* the one dependency effect: the active item changed from outside the
     book, so bring its section to the read line. The first run is the mount
     at the head; the landing on a deep link is a cut, every later change
     moves; a change the spy caused is left alone. */
  useGSAP(
    () => {
      const wasLanded = landed.current;
      if (ready) landed.current = true;
      const previous = lastActive.current;
      lastActive.current = active;
      if (previous === null || previous === active) return;
      if (fromScroll.current === active) {
        fromScroll.current = null;
        return;
      }
      scrollTo(active, wasLanded ? scrollBehavior() : 'instant');
    },
    { dependencies: [active, ready] }
  );

  const onContents = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    if (id === activeRef.current) scrollTo(id, scrollBehavior());
    else select(id);
  };

  const familyCount = (id: string) => MARKS.filter((mark) => mark.family === id).length;

  return (
    <div className='mk-book'>
      <header className='mk-head'>
        <div>
          <h1>{BOOK_TITLE}</h1>
          <p>{BOOK_LEAD}</p>
        </div>
        <div className='mk-meta'>
          <span>{MARKS.length} marks</span>
          {MARK_FAMILIES.map((family) => (
            <span key={family.id}>
              {family.label} {familyCount(family.id)}
            </span>
          ))}
        </div>
      </header>

      <nav className='mk-toc' aria-label='Contents'>
        <a href={`#${METHOD_ID}`} onClick={(e) => onContents(e, METHOD_ID)}>
          <span>Method</span>
          <small>Six tests</small>
        </a>
        {MARKS.map((mark, i) => (
          <a key={mark.id} href={`#${mark.id}`} onClick={(e) => onContents(e, mark.id)}>
            <span>{mark.name}</span>
            <small>{pad2(i + 1)}</small>
          </a>
        ))}
        <a href={`#${PRESENTATION_ID}`} onClick={(e) => onContents(e, PRESENTATION_ID)}>
          <span>Presentation</span>
          <small>Nine together</small>
        </a>
      </nav>

      <section
        className={cn('mk-sec', active === METHOD_ID && 'is-active')}
        data-id={METHOD_ID}
        aria-labelledby='mk-method'
        aria-current={active === METHOD_ID ? 'true' : undefined}
      >
        <div className='mk-div'>
          <small>
            <span>Section 1</span>
            <span>{MARK_TESTS.length} tests</span>
          </small>
          <div>
            <h2 id='mk-method'>Method</h2>
            <p className='mk-thesis'>{METHOD_LEAD}</p>
          </div>
        </div>
        <div className='mk-rows'>
          {MARK_TESTS.map((test, i) => (
            <article key={test.id} className='mk-row'>
              <div className='mk-n'>
                <b>{pad2(i + 1)}</b>
              </div>
              <div className='mk-body'>
                <h3>{test.name}</h3>
                <p>{test.text}</p>
              </div>
            </article>
          ))}
        </div>
        <div className='mk-families'>
          {MARK_FAMILIES.map((family) => (
            <div key={family.id} className='mk-family'>
              <b>{family.label}</b>
              <p>{family.principle}</p>
            </div>
          ))}
        </div>
      </section>

      {MARKS.map((mark, i) => {
        const files = art[mark.id];
        if (!files) return null;
        return <MarkSheet key={mark.id} mark={mark} n={pad2(i + 1)} art={files} active={active === mark.id} />;
      })}

      <section
        className={cn('mk-sec', active === PRESENTATION_ID && 'is-active')}
        data-id={PRESENTATION_ID}
        aria-labelledby='mk-presentation'
        aria-current={active === PRESENTATION_ID ? 'true' : undefined}
      >
        <div className='mk-div'>
          <small>
            <span>Section 3</span>
            <span>{MARKS.length} marks</span>
          </small>
          <div>
            <h2 id='mk-presentation'>Presentation</h2>
            <p className='mk-thesis'>{PRESENTATION_LEAD}</p>
          </div>
        </div>
        {(['paper', 'ink'] as const).map((ground) => (
          <figure key={ground} className={cn('mk-field', ground === 'paper' ? 'is-paper' : 'is-ink')}>
            <div className='mk-field-row'>
              {MARKS.map((mark, i) => {
                const files = art[mark.id];
                if (!files) return null;
                return (
                  <a key={mark.id} className='mk-field-item' href={`#${mark.id}`} onClick={(e) => onContents(e, mark.id)}>
                    <Art svg={files.clean} size={96} />
                    <small>
                      {pad2(i + 1)} {mark.name}
                    </small>
                  </a>
                );
              })}
            </div>
            <figcaption>{ground === 'paper' ? 'Positive' : 'Reversed'}, the nine at 96px</figcaption>
          </figure>
        ))}
        <div className='mk-pair mk-ref'>
          <figure className='mk-plate is-paper'>
            <ReferenceArt width={256} />
            <figcaption>{REFERENCE_MARK.name}, positive</figcaption>
          </figure>
          <figure className='mk-plate is-ink'>
            <ReferenceArt width={256} />
            <figcaption>{REFERENCE_MARK.name}, reversed</figcaption>
          </figure>
        </div>
        <p className='mk-ref-note'>{REFERENCE_CAPTION}</p>
      </section>
    </div>
  );
}

export type MarksViewerProps = {
  /** the two SVG files of every mark, by id, read on the server */
  art: Readonly<Record<string, MarkArt>>;
};

/**
 * The mark explorations on the viewer shell: the list holds Method, the
 * nine marks by name and Presentation; the book presents each mark inside
 * the 1280px flow sheet; the grid shows every mark as a tile drawn from
 * its own file (marks.css masks the shell's rows with the SVGs). Flow
 * keys, so Space and the arrows scroll; digits 1 to 9 pick a mark. The
 * hash names the active section.
 */
export default function MarksViewer({ art }: MarksViewerProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const jumpRef = useRef<(id: string) => void>(() => {});
  const activeOut = useRef(METHOD_ID);

  return (
    <ViewerShell
      id='marks'
      title={MARKS_TITLE}
      mark='pt'
      count={`${MARKS.length} marks`}
      sections={SECTIONS}
      modes={MARKS_MODES}
      thumb='row'
      surfaces='site'
      keys='flow'
      noun='mark'
      onSelect={(id) => {
        /* re-clicking the active row brings its section back to the read line */
        if (id === activeOut.current) jumpRef.current(id);
      }}
    >
      <Sheet variant='flow' width={1280} scrollRef={sheetRef}>
        <MarksBook art={art} sheetRef={sheetRef} jumpRef={jumpRef} activeOut={activeOut} />
      </Sheet>
    </ViewerShell>
  );
}
