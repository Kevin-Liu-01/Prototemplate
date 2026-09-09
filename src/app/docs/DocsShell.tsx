'use client';

import { useGSAP } from '@gsap/react';
import type { RefObject } from 'react';
import { useMemo, useRef, useState } from 'react';

import { BookHead } from '@/components/viewer/BookView';
import { ListRow } from '@/components/viewer/ListRow';
import { Sheet } from '@/components/viewer/Sheet';
import { usePtShell } from '@/components/viewer/shell-context';
import type { SubRenderer } from '@/components/viewer/Sidebar';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { cn } from '@/lib/cn';
import type { ShellMode, ShellSection } from '@/lib/shell-data';
import { useMountEffect } from '@/lib/use-mount-effect';

import type { DocPage } from './model';
import { docHref, docWindowTitle, slugFromPath } from './model';

import '../prototemplate.css';
import './docs.css';

const DOCS_TITLE = 'Docs';
const DOCS_MODES: readonly ShellMode[] = ['book', 'grid'];
const BOOK_TITLE = 'Prototemplate docs';
const BOOK_LEAD =
  'The repository documents, read in the browser and top to bottom: the readme with the build log, the brand and design canons, the architecture map, the ship loop, and the library index. The list on the left follows the section in view; pick a document or a heading to jump to it.';
const BOOK_DATE = 'September 2026';

/**
 * The read line. A block that crosses the top tenth of the sheet is the one
 * being read; among several, the lowest on the page wins, so the heading
 * whose section has scrolled under the line is the active one.
 */
const SPY_MARGIN = '0px 0px -90% 0px';

/** How long the spy waits for a programmatic scroll before it reads the page again. */
const SETTLE_MS = 1500;

/** The landing re-checks its block this often, this many times, while the sheet's height settles. */
const LAND_EVERY_MS = 250;
const LAND_TRIES = 12;

/** A landed block sits within this many pixels of the read line (its scroll margin is 20px). */
const LAND_SLACK = 26;

/**
 * Where a selection came from, set before the shell's select() runs so the
 * active effect knows what to do with the URL and the scroll. `select` is
 * the list, the keys, the grid, a link in the sheet; `spy` is the
 * IntersectionObserver following the reader; `history` is Back or Forward.
 * The shell's own hash read on mount sets nothing.
 */
type SelectSource = 'select' | 'spy' | 'history';

function readHash(): string {
  const raw = window.location.hash.slice(1);
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function here(): string {
  return `${window.location.pathname}${window.location.hash}`;
}

function urlFor(slug: string, heading: string | null): string {
  return heading ? `${docHref(slug)}#${encodeURIComponent(heading)}` : docHref(slug);
}

function writeUrl(url: string, push: boolean): void {
  try {
    if (push) window.history.pushState(null, '', url);
    else window.history.replaceState(null, '', url);
  } catch {
    // a sandboxed document: the shell state still moves, the address does not
  }
}

function scrollBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

function cssEscape(value: string): string {
  return typeof CSS !== 'undefined' && 'escape' in CSS ? CSS.escape(value) : value;
}

/** The six documents as the shell's one section. */
function docsSections(docs: readonly DocPage[]): readonly ShellSection[] {
  return [
    {
      id: 'documents',
      label: 'Documents',
      items: docs.map((doc) => ({
        id: doc.slug,
        n: doc.n,
        title: doc.title,
        href: doc.href,
        desc: doc.blurb,
        shot: doc.shot,
        /* the surfaces.ts id, for the preview layer and the sidebar's site map pairing */
        surface: `docs-${doc.slug}`,
      })),
    },
  ];
}

type DocsBookProps = {
  docs: readonly DocPage[];
  activeHeading: string | null;
  onHeading: (id: string | null) => void;
  /** the flow sheet's scroll region */
  sheetRef: RefObject<HTMLDivElement | null>;
  source: RefObject<SelectSource | null>;
  /** receives the jump function so the sidebar's heading rows can call it */
  jumpRef: RefObject<(id: string) => void>;
  /** receives the document jump, for a re-click on the current document in the list */
  docJumpRef: RefObject<(slug: string) => void>;
  /** the active document, read by the shell's onSelect outside this component */
  activeOut: RefObject<string>;
};

/**
 * The canon read top to bottom inside the flow sheet: a head, a contents
 * list, then every document under a divider as numbered rows, one per h2,
 * with the readme carrying the build log as its last rows. Owns the
 * reading state: an IntersectionObserver on the sheet marks the document
 * and heading under the read line (the list follows, the URL follows), a
 * selection from anywhere else scrolls the sheet, links to documents and
 * anchors inside the sheet are answered in place, Back and Forward are
 * honored, and the window title names the document. The URL is always the
 * document's own route, `/docs/design#2-the-line-law`, so a copied link
 * lands on the same place.
 */
function DocsBook({ docs, activeHeading, onHeading, sheetRef, source, jumpRef, docJumpRef, activeOut }: DocsBookProps) {
  const { active, index, select } = usePtShell();
  activeOut.current = active;

  /* the listeners registered on mount read the latest values through refs;
     the assignments run every render so none of them sees a stale closure */
  const activeRef = useRef(active);
  activeRef.current = active;
  const headingRef = useRef(activeHeading);
  headingRef.current = activeHeading;
  const selectRef = useRef(select);
  selectRef.current = select;
  const onHeadingRef = useRef(onHeading);
  onHeadingRef.current = onHeading;

  /** the active id the effect last saw; null before the first run */
  const lastActive = useRef<string | null>(null);
  /** the URL the current history entry holds, put back after the shell's hash write */
  const url = useRef('');
  /** the URL a popstate delivered, restored once the document is selected */
  const popped = useRef<string | null>(null);
  /** a heading named with a selection, scrolled to once the document is active */
  const pendingHeading = useRef<string | null>(null);
  /** the block a programmatic scroll is heading for; the spy waits for it */
  const settling = useRef<Element | null>(null);
  const settleTimer = useRef(0);
  const landTimer = useRef(0);

  const sectionTotal = useMemo(() => docs.reduce((n, doc) => n + doc.sections.length, 0), [docs]);

  const hasDoc = (slug: string | null): slug is string => slug !== null && docs.some((doc) => doc.slug === slug);

  const blockFor = (slug: string, heading: string | null): HTMLElement | null => {
    const root = sheetRef.current;
    if (!root) return null;
    const selector = heading
      ? `[data-heading="${cssEscape(heading)}"]`
      : `.ptd-sec[data-doc="${cssEscape(slug)}"]`;
    return root.querySelector<HTMLElement>(selector);
  };

  /**
   * A programmatic scroll. The spy is muted until the block it lands on
   * reaches the read line (or the scroll ends, or 1500ms pass), so the
   * documents and headings the scroll passes through are never selected.
   */
  const scrollTo = (el: Element | null, behavior: ScrollBehavior) => {
    if (!el) return;
    settling.current = el.closest('[data-doc]') ?? el;
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      settling.current = null;
    }, SETTLE_MS);
    el.scrollIntoView({ block: 'start', behavior });
  };

  /**
   * Scroll to a heading row or to any element with that id inside the
   * sheet (a library entry, `#horizon-field`). A row in another document
   * selects that document first. False when nothing carries the id.
   */
  const jumpTo = (id: string, behavior: ScrollBehavior): boolean => {
    const root = sheetRef.current;
    if (!root) return false;
    const row = root.querySelector<HTMLElement>(`[data-heading="${cssEscape(id)}"]`);
    const el = row ?? document.getElementById(id);
    if (!el || !root.contains(el)) return false;
    const owner = row?.dataset.doc;
    if (owner && owner !== activeRef.current) {
      pendingHeading.current = id;
      source.current = 'select';
      selectRef.current(owner);
      return true;
    }
    scrollTo(el, behavior);
    if (row) onHeadingRef.current(id);
    url.current = urlFor(activeRef.current, id);
    writeUrl(url.current, false);
    return true;
  };

  jumpRef.current = (id: string) => {
    jumpTo(id, scrollBehavior());
  };

  docJumpRef.current = (slug: string) => {
    scrollTo(blockFor(slug, null), scrollBehavior());
    /* the shell wrote `#<slug>` over the current entry: put the document's own address back */
    writeUrl(url.current || urlFor(slug, null), false);
  };

  /**
   * The landing on a direct /docs/<slug> visit, with or without a heading
   * in the hash. This runs from a layout effect, before the parent Sheet's
   * ref is attached, so the block is looked up on every check rather than
   * once. The sheet's height also keeps growing after mount (docs.css, the
   * code panels and the thumbs land), so one scrollIntoView lands short:
   * the block is re-checked on the next frame, when the fonts are ready, and
   * every 250ms for three seconds, and scrolled again whenever its top has
   * drifted off the read line; a scroll of the reader's own ends the
   * retries.
   */
  const landOn = (slug: string, heading: string | null) => {
    let tries = 0;
    let lastSet = -1;
    let named = false;
    const check = () => {
      window.clearTimeout(landTimer.current);
      tries += 1;
      const root = sheetRef.current;
      const row = blockFor(slug, heading);
      const el = row ?? (heading ? document.getElementById(heading) : null);
      if (!root || !el || !root.contains(el)) {
        if (tries < LAND_TRIES) landTimer.current = window.setTimeout(check, LAND_EVERY_MS);
        return;
      }
      if (lastSet >= 0 && Math.abs(root.scrollTop - lastSet) > 1 && tries > 2) return;
      const offset = el.getBoundingClientRect().top - root.getBoundingClientRect().top;
      if (Math.abs(offset) > LAND_SLACK) {
        scrollTo(el, 'auto');
        lastSet = root.scrollTop;
      } else if (lastSet < 0) {
        lastSet = root.scrollTop;
      }
      if (heading && row && !named) {
        named = true;
        onHeadingRef.current(heading);
      }
      if (tries < LAND_TRIES) landTimer.current = window.setTimeout(check, LAND_EVERY_MS);
    };
    requestAnimationFrame(check);
    document.fonts.ready.then(check).catch(() => {});
  };

  /* the spy: the block under the read line names the document and the heading */
  useMountEffect(() => {
    const root = sheetRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;
    const blocks = Array.from(root.querySelectorAll<HTMLElement>('[data-doc]'));
    const order = new Map<Element, number>(blocks.map((el, i) => [el, i]));
    const visible = new Set<Element>();
    /** the lowest block on the page that crosses the read line */
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
      const doc = best.dataset.doc;
      if (!doc) return;
      const heading = best.dataset.heading ?? null;
      const docChanged = doc !== activeRef.current;
      const headingChanged = heading !== headingRef.current;
      if (!docChanged && !headingChanged) return;
      if (headingChanged) onHeadingRef.current(heading);
      if (docChanged) {
        /* the active effect writes the URL once the document is selected */
        source.current = 'spy';
        selectRef.current(doc);
        return;
      }
      url.current = urlFor(doc, heading);
      writeUrl(url.current, false);
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
    blocks.forEach((el) => observer.observe(el));
    /* a programmatic scroll that ends short of its block still gets read */
    const onScrollEnd = () => {
      if (!settling.current) return;
      settling.current = null;
      window.clearTimeout(settleTimer.current);
      const best = lowest();
      if (best) apply(best);
    };
    root.addEventListener('scrollend', onScrollEnd);
    return () => {
      observer.disconnect();
      root.removeEventListener('scrollend', onScrollEnd);
      window.clearTimeout(settleTimer.current);
      window.clearTimeout(landTimer.current);
    };
  });

  /* links inside the sheet that name a document or an anchor are answered in place */
  useMountEffect(() => {
    const root = sheetRef.current;
    if (!root) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const target = e.target instanceof Element ? e.target : null;
      const anchor = target?.closest('a[href]');
      if (!anchor) return;
      const href = anchor.getAttribute('href') ?? '';
      const [path, fragment = ''] = href.split('#');
      const heading = fragment ? decodeURIComponent(fragment) : null;
      if (href.startsWith('#')) {
        if (heading && jumpTo(heading, scrollBehavior())) e.preventDefault();
        return;
      }
      const slug = slugFromPath(path ?? '');
      if (!hasDoc(slug)) return;
      e.preventDefault();
      if (slug === activeRef.current) {
        if (heading) jumpTo(heading, scrollBehavior());
        else scrollTo(blockFor(slug, null), scrollBehavior());
        return;
      }
      pendingHeading.current = heading;
      source.current = 'select';
      selectRef.current(slug);
    };
    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  });

  /* Back and Forward: the path names the document, the hash the heading */
  useMountEffect(() => {
    const onPop = () => {
      const slug = slugFromPath(window.location.pathname);
      if (!hasDoc(slug)) return;
      const hash = readHash();
      const heading = hash && hash !== slug ? hash : null;
      if (slug !== activeRef.current) {
        popped.current = here();
        pendingHeading.current = heading;
        source.current = 'history';
        selectRef.current(slug);
        return;
      }
      url.current = here();
      if (heading) {
        scrollTo(blockFor(slug, heading) ?? document.getElementById(heading), 'auto');
        if (blockFor(slug, heading)) onHeadingRef.current(heading);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  });

  /* the one dependency effect: the active document changed. On mount the
     entry URL decides the scroll; after that the source decides the URL. */
  useGSAP(
    () => {
      const previous = lastActive.current;
      lastActive.current = active;
      const src = source.current;
      source.current = null;
      const doc = docs.find((d) => d.slug === active);
      if (!doc) return;
      document.title = docWindowTitle(doc.slug, doc.title);

      if (previous === null) {
        url.current = here();
        const hash = readHash();
        const heading = hash && hash !== active ? hash : null;
        if (index > 0 || heading) landOn(active, heading);
        return;
      }
      if (previous === active) return;

      if (src === 'spy') {
        url.current = urlFor(active, headingRef.current);
        writeUrl(url.current, false);
        return;
      }

      const heading = pendingHeading.current;
      pendingHeading.current = null;
      onHeadingRef.current(heading);
      scrollTo(blockFor(active, heading), src === 'history' ? 'auto' : scrollBehavior());

      if (src === 'history') {
        url.current = popped.current ?? urlFor(active, heading);
        popped.current = null;
        writeUrl(url.current, false);
        return;
      }
      const next = urlFor(active, heading);
      if (src === 'select') {
        /* the shell wrote `#<slug>` over the current entry: put that entry back, then add one */
        writeUrl(url.current, false);
        writeUrl(next, true);
      } else {
        /* the shell read a document from the hash on mount: name the route in place */
        writeUrl(next, false);
      }
      url.current = next;
    },
    { dependencies: [active] }
  );

  return (
    <div className='ptd-book'>
      <BookHead
        title={BOOK_TITLE}
        lead={BOOK_LEAD}
        meta={[
          { key: 'Documents', value: String(docs.length) },
          { key: 'Sections', value: String(sectionTotal) },
          { key: 'Updated', value: BOOK_DATE },
        ]}
      />

      <nav className='ptd-toc' aria-label='Contents'>
        {docs.map((doc) => (
          <a key={doc.slug} href={doc.href} aria-current={doc.slug === active ? 'true' : undefined}>
            <span>{doc.title}</span>
            <small>{doc.n}</small>
          </a>
        ))}
      </nav>

      {docs.map((doc) => (
        <section
          key={doc.slug}
          className={cn('ptd-doc', doc.slug === active && 'is-active')}
          aria-labelledby={`ptd-${doc.slug}`}
        >
          <div className='ptd-sec' data-doc={doc.slug}>
            <small>
              <span>Document {doc.n}</span>
              <span>{doc.file}</span>
            </small>
            <h2 id={`ptd-${doc.slug}`}>{doc.title}</h2>
          </div>
          {doc.lead ? (
            <div className='ptd-row ptd-lead' data-doc={doc.slug}>
              <div className='ptd-pn' aria-hidden='true' />
              <div className='ptd-body pt-root'>{doc.lead}</div>
            </div>
          ) : null}
          {doc.sections.map((section) => (
            <div
              key={section.id}
              id={section.kind === 'craft' ? section.id : undefined}
              className={cn(
                'ptd-row',
                doc.slug === active && section.id === activeHeading && 'is-active'
              )}
              data-doc={doc.slug}
              data-heading={section.id}
            >
              <div className='ptd-pn'>
                <b>{section.n}</b>
              </div>
              <div className={cn('ptd-body pt-root', section.kind === 'craft' && 'pt-post ptd-craft')}>
                {section.body}
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

export type DocsShellProps = {
  /** the document the route names: `readme` on /docs, the slug on /docs/[slug] */
  active: string;
  /** from buildDocs() on the server */
  docs: readonly DocPage[];
};

/**
 * The docs on the viewer shell: six documents under Documents in the site
 * map, the headings of the active document as rows under it, the canon as
 * a book inside the 1280px flow sheet, and the six captures as a grid. Flow
 * keys, so Space and the arrows scroll. A direct /docs/<slug> lands on that
 * document and stays there while the sheet settles.
 */
export default function DocsShell({ active, docs }: DocsShellProps) {
  const [activeHeading, setActiveHeading] = useState<string | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const source = useRef<SelectSource | null>(null);
  const jumpRef = useRef<(id: string) => void>(() => {});
  const docJumpRef = useRef<(slug: string) => void>(() => {});
  const activeOut = useRef(active);
  const sections = useMemo(() => docsSections(docs), [docs]);

  const renderSub: SubRenderer = (item, isActive) => {
    if (!isActive) return null;
    const doc = docs.find((d) => d.slug === item.id);
    if (!doc || doc.sections.length === 0) return null;
    return doc.sections.map((section) => (
      <ListRow
        key={section.id}
        item={{ id: section.id, n: section.n, title: section.title }}
        active={section.id === activeHeading}
        onSelect={(id) => jumpRef.current(id)}
      />
    ));
  };

  return (
    <ViewerShell
      id='docs'
      title={DOCS_TITLE}
      mark='pt'
      count={`${docs.length} documents`}
      sections={sections}
      active={active}
      modes={DOCS_MODES}
      thumb='shot'
      surfaces='site'
      keys='flow'
      noun='document'
      renderSub={renderSub}
      onSelect={(id) => {
        /* re-clicking the current document jumps to it; any other selection
           nobody claimed came from the list, the keys or the grid */
        if (id === activeOut.current) docJumpRef.current(id);
        else source.current ??= 'select';
      }}
    >
      <Sheet variant='flow' width={1280} scrollRef={sheetRef}>
        <DocsBook
          docs={docs}
          activeHeading={activeHeading}
          onHeading={setActiveHeading}
          sheetRef={sheetRef}
          source={source}
          jumpRef={jumpRef}
          docJumpRef={docJumpRef}
          activeOut={activeOut}
        />
      </Sheet>
    </ViewerShell>
  );
}
