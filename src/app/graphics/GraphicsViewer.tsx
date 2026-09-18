'use client';

import { useGSAP } from '@gsap/react';
import type { MouseEvent, RefObject } from 'react';
import { useMemo, useRef } from 'react';

import { Sheet } from '@/components/viewer/Sheet';
import { usePtShell } from '@/components/viewer/shell-context';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { cn } from '@/lib/cn';
import { backgroundLabel } from '@/lib/graphics-model';
import type { Block, Entry } from '@/lib/graphics-model';
import type { ShellMode, ShellSection } from '@/lib/shell-data';
import { useMountEffect } from '@/lib/use-mount-effect';

import { VariantFigure } from './VariantFigure';

import './graphics.css';

const TITLE = 'Graphics';
const MODES: readonly ShellMode[] = ['book', 'grid'];
const LEAD =
  'Every illustration of the series, read top to bottom by the area of the post it sits in, then the covers, the contact sheets, the glyphfield grounds and the figures of the two earlier posts. Each image is one row with every version it ships in (dark and light, the social card cut from a cover, a clip’s GIF, video and still) switched in place, and the frame opens the file at full size. The list on the left follows the row in view; the grid shows the set as thumbnails.';

/** The read line: the lowest row crossing the top tenth of the sheet is the one being read. */
const SPY_MARGIN = '0px 0px -90% 0px';
/** How long the spy waits for a programmatic scroll to reach its row before it reads the page again. */
const SETTLE_MS = 1200;

function cssEscape(value: string): string {
  return typeof CSS !== 'undefined' && 'escape' in CSS ? CSS.escape(value) : value;
}

function scrollBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

function rangeText(entries: readonly Entry[]): string {
  const first = entries[0];
  const last = entries[entries.length - 1];
  if (!first || !last) return '';
  return entries.length > 1 ? `${first.n} to ${last.n}` : first.n;
}

/** The meta line under a row: the ground, the size of the first version, the number of versions. */
function metaText(entry: Entry): string {
  const parts: string[] = [];
  if (entry.ground) parts.push(backgroundLabel(entry.ground));
  const first = entry.variants[0];
  if (first?.w && first?.h) parts.push(`${first.w}×${first.h}`);
  if (entry.variants.length > 1) parts.push(`${entry.variants.length} versions`);
  return parts.join(' · ');
}

/** The sections as the shell sees them, nested under Knowledge > Graphics in the list. */
function shellSections(blocks: readonly Block[]): readonly ShellSection[] {
  return blocks.map((block) => ({
    id: block.id,
    label: block.label,
    under: 'graphics',
    items: block.entries.map((entry) => ({ id: entry.id, n: entry.n, title: entry.title, desc: entry.why, shot: entry.shot, inPlace: true as const })),
  }));
}

type GraphicsBookProps = {
  blocks: readonly Block[];
  /** the flow sheet's scroll region */
  sheetRef: RefObject<HTMLDivElement | null>;
  /** receives the row jump, for a re-click on the active image in the list */
  jumpRef: RefObject<(id: string) => void>;
  /** the active image, read by the shell's onSelect outside this component */
  activeOut: RefObject<string>;
};

/**
 * The set read top to bottom inside the flow sheet: a head with the counts,
 * a contents list, then every section under a divider as ruled rows, one
 * per image with its figure. Owns the reading state the way the skills
 * book does: an IntersectionObserver marks the row under the read line and
 * selects it through the shell; a selection from anywhere else scrolls the
 * sheet to the row and mutes the spy until it arrives.
 */
function GraphicsBook({ blocks, sheetRef, jumpRef, activeOut }: GraphicsBookProps) {
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

  const total = useMemo(() => blocks.reduce((n, block) => n + block.entries.length, 0), [blocks]);

  const rowFor = (id: string): HTMLElement | null =>
    sheetRef.current?.querySelector<HTMLElement>(`.gx-row[data-id="${cssEscape(id)}"]`) ?? null;

  const scrollTo = (id: string, behavior: ScrollBehavior) => {
    const row = rowFor(id);
    if (!row) return;
    settling.current = row;
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      settling.current = null;
    }, SETTLE_MS);
    row.scrollIntoView({ block: 'start', behavior });
  };

  jumpRef.current = (id: string) => scrollTo(id, scrollBehavior());

  useMountEffect(() => {
    const root = sheetRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;
    const rows = Array.from(root.querySelectorAll<HTMLElement>('.gx-row'));
    const order = new Map<Element, number>(rows.map((el, i) => [el, i]));
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
        const id = best.dataset.id;
        if (!id || id === activeRef.current) return;
        fromScroll.current = id;
        selectRef.current(id);
      },
      { root, rootMargin: SPY_MARGIN, threshold: 0 }
    );
    rows.forEach((el) => observer.observe(el));
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

  return (
    <div className='gx-book'>
      <header className='gx-head'>
        <div>
          <h1>{TITLE}</h1>
          <p>{LEAD}</p>
        </div>
        <div className='gx-meta'>
          <span>{total} images</span>
          {blocks.map((block) => (
            <span key={block.id}>
              {block.label} {block.entries.length}
            </span>
          ))}
        </div>
      </header>

      <nav className='gx-toc' aria-label='Contents'>
        {blocks.map((block) => {
          const first = block.entries[0];
          if (!first) return null;
          return (
            <a key={block.id} href={`#${first.id}`} onClick={(e) => onContents(e, first.id)}>
              <span>{block.label}</span>
              <small>{rangeText(block.entries)}</small>
            </a>
          );
        })}
      </nav>

      {blocks.map((block) => (
        <section key={block.id} className='gx-cat' aria-labelledby={`gx-${block.id}`}>
          <div className='gx-sec'>
            <small>
              <span>{block.eyebrow}</span>
              <span>Images {rangeText(block.entries)}</span>
            </small>
            <div>
              <h2 id={`gx-${block.id}`}>{block.label}</h2>
              <p>{block.lead}</p>
            </div>
          </div>
          {block.entries.map((entry) => (
            <article
              key={entry.id}
              id={entry.id}
              className={cn('gx-row', entry.id === active && 'is-active')}
              data-id={entry.id}
              aria-current={entry.id === active ? 'true' : undefined}
            >
              <div className='gx-n'>
                <b>{entry.n}</b>
              </div>
              <div className='gx-body'>
                <h3>{entry.title}</h3>
                <p>{entry.why}</p>
                <VariantFigure entry={entry} />
                <p className='gx-line'>{metaText(entry)}</p>
              </div>
            </article>
          ))}
        </section>
      ))}
    </div>
  );
}

type GraphicsViewerProps = { blocks: readonly Block[] };

/**
 * The graphics on the viewer shell: one section per area of the post, the
 * covers, the sheets, the grounds and the two earlier posts, nested under
 * Knowledge > Graphics in the list with one row per image; the whole set
 * as ruled rows with figures inside the 1280px flow sheet, and every image
 * as a captured thumbnail in the grid. Flow keys, so Space and the arrows
 * scroll; the sidebar filter matches names and descriptions. The hash
 * names the row in view.
 */
export default function GraphicsViewer({ blocks }: GraphicsViewerProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const jumpRef = useRef<(id: string) => void>(() => {});
  const activeOut = useRef(blocks[0]?.entries[0]?.id ?? '');
  const sections = useMemo(() => shellSections(blocks), [blocks]);
  const total = blocks.reduce((n, block) => n + block.entries.length, 0);

  return (
    <ViewerShell
      id='graphics'
      title={TITLE}
      mark='pt'
      count={`${total} images`}
      sections={sections}
      modes={MODES}
      thumb='shot'
      surfaces='site'
      keys='flow'
      noun='image'
      onSelect={(id) => {
        /* re-clicking the active image brings its row back to the read line */
        if (id === activeOut.current) jumpRef.current(id);
      }}
    >
      <Sheet variant='flow' width={1280} scrollRef={sheetRef}>
        <GraphicsBook blocks={blocks} sheetRef={sheetRef} jumpRef={jumpRef} activeOut={activeOut} />
      </Sheet>
    </ViewerShell>
  );
}
