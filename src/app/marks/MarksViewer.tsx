'use client';

import { useGSAP } from '@gsap/react';
import type { CSSProperties, MouseEvent, RefObject } from 'react';
import { useRef } from 'react';

import { gtText } from '@/components/viewer/GtWord';
import { Sheet } from '@/components/viewer/Sheet';
import { usePtShell } from '@/components/viewer/shell-context';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { cn } from '@/lib/cn';
import {
  MARK_FACES,
  MARK_FAMILIES,
  MARK_RULES,
  MARK_SIZES,
  MARKS,
  markFamily,
  REFERENCE_MARK,
  WORDMARK_SIZES,
} from '@/lib/marks';
import type { Mark, MarkArt } from '@/lib/marks';
import type { ShellMode, ShellSection } from '@/lib/shell-data';
import { pad2 } from '@/lib/shell-data';
import { useMountEffect } from '@/lib/use-mount-effect';

import './marks.css';

const MARKS_TITLE = 'Marks';
const BOOK_TITLE = 'The speed set';
const MARKS_MODES: readonly ShellMode[] = ['book', 'grid'];

const REGISTER_ID = 'register';
const PRESENTATION_ID = 'presentation';

const BOOK_LEAD =
  'Marks for General Translation in one register, taken from a race-type reference: wide letters, a forward slant, one horizontal cut through the letters, and speed bars that lead into the first letter. Every mark is black and white, one color, and takes the ink of whatever it sits on. Seven marks follow in that register, from the bar monogram to its ASCII rendering, then Two-way and Globe G, the two survivors of the earlier round, kept for comparison. Each mark is shown positive and reversed at a run of heights, the monograms also as an app icon and a favicon, and every file is linked. The current mark closes the page as the reference.';

const REGISTER_LEAD =
  'The speed set follows one register, taken from a race-type reference. The rules below name it, and a mark that keeps them belongs to the set. The two picture marks at the end of the page predate the register and stay for comparison.';

const PRESENTATION_LEAD =
  'The nine marks together at one height, positive and reversed, so the set reads as a set and the two survivors can be compared with it. The current doubled-line mark follows as the reference.';

const REFERENCE_CAPTION =
  'The current mark, the doubled-line GT monogram. It is the reference the marks are measured against, and it is not a candidate.';

/** The name shown beside the favicon in the tab mock; the product name, not a claim. */
const TAB_TITLE = 'General Translation';

/** The share of the app icon tile the mark fills; 0.64 leaves the platform's own safe area clear. */
const APP_ICON_SHARE = 0.64;
const APP_ICON_PX = 128;
const APP_MARK_PX = Math.round(APP_ICON_PX * APP_ICON_SHARE);

/**
 * The flow sheet's reading column at the 1440 viewport with the sidebar
 * open, the view the captures show: 1440 less the 208px sidebar
 * (tokens.css), the sheet's 28px pads, the mat's 1px borders and the
 * sheet's 56px side padding (Sheet.css). On a wider stage the column grows
 * to 1168 and the plates gain room; a mark sized for this column never
 * clips there, and marks.css clamps every instance on a narrower one.
 */
const COLUMN_W = 1440 - 208 - 2 * 28 - 2 - 2 * 56;

/** A plate's border and side padding (marks.css: .mk-plate, .mk-strip, .mk-field). */
const PLATE_SIDE = 1 + 32;

/** The inner width of a full-width plate, and of one plate of a side-by-side pair (a 16px gap between them). */
const PLATE_INNER = COLUMN_W - 2 * PLATE_SIDE;
const HALF_INNER = (COLUMN_W - 16) / 2 - 2 * PLATE_SIDE;

/** The height a mark is shown at on its plates, in CSS pixels; a mark too wide for it takes the plate's full width instead. */
const HERO_PX = 224;

/** The height every mark is shown at on the presentation field. */
const FIELD_PX = 64;

/** A mark whose viewBox is wider than this is laid out full width: its plates stack instead of pairing. */
const WIDE = 1.5;

/** The heights a wordmark can be shown at, smallest first; a wordmark takes the largest three that fit its plate. */
const LADDER: readonly number[] = [16, 24, 32, ...WORDMARK_SIZES];

/**
 * The read line. A section that crosses the top tenth of the sheet is the
 * one being read; among several, the lowest on the page wins, so the
 * section whose top has just passed under the line is the active one.
 */
const SPY_MARGIN = '0px 0px -90% 0px';

/** How long the spy waits for a programmatic scroll to reach its section before it reads the page again. */
const SETTLE_MS = 1200;

/** The route's list: the register, the nine marks by name, Presentation. The marks alone are paged, so digits 1 to 9 pick a mark. */
const SECTIONS: readonly ShellSection[] = [
  {
    id: REGISTER_ID,
    label: 'Register',
    paged: false,
    items: [{ id: REGISTER_ID, n: '', title: 'The register', desc: 'The rules the speed set follows.' }],
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
        desc: 'The set at one height, positive and reversed, and the current mark for reference.',
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

/** How a mark sits on a plate: at a height in CSS pixels, or across the plate's full width with the height following. */
type PlateFit = number | 'full';

/** At `max` height when that width fits the plate's inner width, else across the plate's full width. */
function fitPlate(aspect: number, inner: number, max: number): PlateFit {
  return max * aspect <= inner ? max : 'full';
}

/** The caption's size for a fit: the height, or the full width. */
function fitLabel(fit: PlateFit): string {
  return fit === 'full' ? 'full width' : `${fit}px`;
}

/**
 * The run of heights a mark is shown at: a monogram takes the 16 to 128px
 * row; a wordmark takes the largest three of the ladder whose width fits
 * its plate, which is 48, 96 and 144 for every wordmark but the widest.
 */
function sizesFor(mark: Mark, aspect: number, inner: number): readonly number[] {
  if (mark.kind === 'monogram') return MARK_SIZES;
  return LADDER.filter((height) => height * aspect <= inner).slice(-WORDMARK_SIZES.length);
}

type ArtProps = {
  /** the SVG file's markup, read on the server */
  svg: string;
  /** the rendered height in CSS pixels, the width following the file's aspect; or the plate's full width, the height following */
  height: PlateFit;
  /** the file's viewBox aspect, width over height */
  aspect: number;
  className?: string;
};

/**
 * One inlined SVG. The file is rendered as markup so its root keeps its own
 * attributes (the construction overlays set their stroke on the root); the
 * wrapper is sized by height and the file's aspect (marks.css reads the
 * two custom properties and clamps the width to the plate), and the
 * plate's color reaches it as currentColor.
 */
function Art({ svg, height, aspect, className }: ArtProps) {
  const style = {
    '--mk-w': height === 'full' ? '100%' : `${Math.round(height * aspect)}px`,
    '--mk-aspect': String(aspect),
  } as CSSProperties;
  return (
    <span className={cn('mk-svg', className)} style={style} aria-hidden='true' dangerouslySetInnerHTML={{ __html: svg }} />
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

const GROUNDS = ['paper', 'ink'] as const;
type Ground = (typeof GROUNDS)[number];

const groundClass = (ground: Ground) => (ground === 'paper' ? 'is-paper' : 'is-ink');
const groundName = (ground: Ground) => (ground === 'paper' ? 'Positive' : 'Reversed');

type MarkSheetProps = {
  mark: Mark;
  n: string;
  art: MarkArt;
  active: boolean;
};

/**
 * One mark, presented the way a logo reel presents a logo: the mark large,
 * positive and reversed; a run of heights on both grounds; for a monogram
 * the app icon and the favicon in a tab, and for the two picture marks the
 * clean mark beside its construction; then the thesis, the construction,
 * the use note and the files as ruled rows. Every instance is sized by
 * height and the file's own aspect, so a wide mark (every speed mark) lays
 * its plates out full width, one above the other, and a square mark keeps
 * them side by side. The notes arrive as strings from marks.ts, so they
 * pass through gtText: the standalone word GT renders as the mark, as
 * everywhere in the site's copy.
 */
function MarkSheet({ mark, n, art, active }: MarkSheetProps) {
  const family = markFamily(mark);
  const headingId = `mk-${mark.id}`;
  const wide = art.aspect > WIDE;
  const inner = wide ? PLATE_INNER : HALF_INNER;
  const hero = fitPlate(art.aspect, inner, HERO_PX);
  const sizes = sizesFor(mark, art.aspect, inner);
  const sizeRange = `${sizes[0]} to ${sizes[sizes.length - 1]}px`;
  const monogram = mark.kind === 'monogram';
  /* the app icon: the mark fitted to the tile's safe area, so a wide monogram is set by width */
  const appHeight = art.aspect >= 1 ? APP_MARK_PX / art.aspect : APP_MARK_PX;
  const files = [mark.file, mark.constructionFile, mark.textFile].filter((file): file is string => Boolean(file));
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
          <span>{mark.kind === 'monogram' ? 'Monogram' : 'Wordmark'}</span>
        </small>
        <div>
          <h2 id={headingId}>{mark.name}</h2>
          <p className='mk-thesis'>{gtText(family.principle)}</p>
        </div>
      </div>

      <div className={cn('mk-pair', wide && 'is-stack')}>
        {GROUNDS.map((ground) => (
          <figure key={ground} className={cn('mk-plate', groundClass(ground))}>
            <Art svg={art.clean} height={hero} aspect={art.aspect} />
            <figcaption>
              {groundName(ground)}, {fitLabel(hero)}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className={cn('mk-pair', wide && 'is-stack')}>
        {GROUNDS.map((ground) => (
          <figure key={ground} className={cn('mk-strip', groundClass(ground))}>
            <div className='mk-strip-row'>
              {sizes.map((size) => (
                <span key={size} className='mk-size'>
                  <Art svg={art.clean} height={size} aspect={art.aspect} />
                  <small>{size}</small>
                </span>
              ))}
            </div>
            <figcaption>
              {groundName(ground)}, {sizeRange}
            </figcaption>
          </figure>
        ))}
      </div>

      {(monogram || art.construction) && (
        <div className={cn('mk-apps', art.construction && 'has-build')}>
          {monogram && (
            <>
              <figure className='mk-app'>
                <span className='mk-app-tile'>
                  <Art svg={art.clean} height={appHeight} aspect={art.aspect} />
                </span>
                <figcaption>App icon, {APP_ICON_PX}px</figcaption>
              </figure>
              <figure className='mk-fav'>
                <span className='mk-tab'>
                  <Art svg={art.clean} height={16} aspect={art.aspect} />
                  <span className='mk-tab-title'>{TAB_TITLE}</span>
                </span>
                <figcaption>Favicon, 16px</figcaption>
              </figure>
            </>
          )}
          {art.construction && (
            <>
              <figure className='mk-plate is-paper is-build'>
                <Art svg={art.clean} height={192} aspect={art.aspect} />
                <figcaption>Clean</figcaption>
              </figure>
              <figure className='mk-plate is-paper is-build'>
                <Art svg={art.construction} height={192} aspect={art.aspect} />
                <figcaption>Construction</figcaption>
              </figure>
            </>
          )}
        </div>
      )}

      <dl className='mk-notes'>
        <div className='mk-note'>
          <dt>Thesis</dt>
          <dd>{gtText(mark.thesis)}</dd>
        </div>
        <div className='mk-note'>
          <dt>Construction</dt>
          <dd>{gtText(mark.construction)}</dd>
        </div>
        <div className='mk-note'>
          <dt>In use</dt>
          <dd>{gtText(mark.use)}</dd>
        </div>
        <div className='mk-note'>
          <dt>Files</dt>
          <dd>
            {files.map((file, i) => (
              <span key={file}>
                {i > 0 && <span className='mk-sep'>and</span>}
                <a href={file}>{file}</a>
              </span>
            ))}
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
 * The book: a head, a contents list, the register, one section per mark
 * and the Presentation, top to bottom inside the flow sheet. Owns the
 * reading state the way the skills book does: an IntersectionObserver on
 * the sheet marks the section under the read line and selects it through
 * the shell (the list and the hash follow); a selection from anywhere else
 * scrolls the sheet to the section and mutes the spy until it arrives. A
 * deep link lands without motion; the spy never selects at the head, so
 * the register stays marked there.
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
        <a href={`#${REGISTER_ID}`} onClick={(e) => onContents(e, REGISTER_ID)}>
          <span>The register</span>
          <small>{MARK_RULES.length} rules</small>
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
        className={cn('mk-sec', active === REGISTER_ID && 'is-active')}
        data-id={REGISTER_ID}
        aria-labelledby='mk-register'
        aria-current={active === REGISTER_ID ? 'true' : undefined}
      >
        <div className='mk-div'>
          <small>
            <span>Section 1</span>
            <span>{MARK_RULES.length} rules</span>
          </small>
          <div>
            <h2 id='mk-register'>The register</h2>
            <p className='mk-thesis'>{REGISTER_LEAD}</p>
          </div>
        </div>
        <div className='mk-rows'>
          {MARK_RULES.map((rule, i) => (
            <article key={rule.id} className='mk-row'>
              <div className='mk-n'>
                <b>{pad2(i + 1)}</b>
              </div>
              <div className='mk-body'>
                <h3>{rule.name}</h3>
                <p>{gtText(rule.text)}</p>
              </div>
            </article>
          ))}
        </div>
        <div className='mk-families'>
          {MARK_FAMILIES.map((family) => (
            <div key={family.id} className='mk-family'>
              <b>
                {family.label} {familyCount(family.id)}
              </b>
              <p>{gtText(family.principle)}</p>
            </div>
          ))}
        </div>
        <p className='mk-faces'>{MARK_FACES}</p>
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
        {GROUNDS.map((ground) => (
          <figure key={ground} className={cn('mk-field', groundClass(ground))}>
            <div className='mk-field-row'>
              {MARKS.map((mark, i) => {
                const files = art[mark.id];
                if (!files) return null;
                const fit = fitPlate(files.aspect, PLATE_INNER, FIELD_PX);
                return (
                  <a
                    key={mark.id}
                    className={cn('mk-field-item', fit === 'full' && 'is-full')}
                    href={`#${mark.id}`}
                    onClick={(e) => onContents(e, mark.id)}
                  >
                    <Art svg={files.clean} height={fit} aspect={files.aspect} />
                    <small>
                      {pad2(i + 1)} {mark.name}
                    </small>
                  </a>
                );
              })}
            </div>
            <figcaption>
              {groundName(ground)}, the nine at {FIELD_PX}px, the widest across the field
            </figcaption>
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
        <p className='mk-ref-note'>{gtText(REFERENCE_CAPTION)}</p>
      </section>
    </div>
  );
}

export type MarksViewerProps = {
  /** every mark's files and viewBox aspect, by id, read on the server */
  art: Readonly<Record<string, MarkArt>>;
};

/**
 * The marks on the viewer shell: the list holds the register, the nine
 * marks by name and Presentation; the book presents each mark inside the
 * 1280px flow sheet; the grid shows every mark as a tile drawn from its
 * own file (marks.css masks the shell's rows with the SVGs). Flow keys,
 * so Space and the arrows scroll; digits 1 to 9 pick a mark. The hash
 * names the active section.
 */
export default function MarksViewer({ art }: MarksViewerProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const jumpRef = useRef<(id: string) => void>(() => {});
  const activeOut = useRef(REGISTER_ID);

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
