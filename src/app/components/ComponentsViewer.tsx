'use client';

import Link from 'next/link';
import { memo, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { CSSProperties, RefObject } from 'react';

import { PlateNearContext, useReducedMotion } from '@/components/docs/demos/hooks';
import { BookHead } from '@/components/viewer/BookView';
import { Sheet } from '@/components/viewer/Sheet';
import { usePtShell } from '@/components/viewer/shell-context';
import { useReadLine } from '@/components/viewer/useReadLine';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { cn } from '@/lib/cn';
import { reserveAt } from '@/lib/component-library-model';
import type { LibraryBlock, LibraryEntry, LibraryPlate } from '@/lib/component-library-model';
import { PAGE_NAMES } from '@/lib/page-names';
import type { PageUpdated } from '@/lib/page-updated';
import { scrollRoot } from '@/lib/scroll-root';
import { REPO_URL } from '@/lib/seo/site';
import { rangeText } from '@/lib/shell-data';
import type { ShellItem, ShellMode, ShellSection } from '@/lib/shell-data';
import { useLayoutWork } from '@/lib/use-layout-work';

import { lazyPlate, serverPlate } from './plates';
import { usePlateWindow } from './usePlateWindow';

import './components.css';

const TITLE = PAGE_NAMES.components.name;
const MODES: readonly ShellMode[] = ['book'];
const UNDOCUMENTED = 'undocumented';

/** The viewport's width, which picks each row's reserve; null on the server and while the page hydrates. */
function onResize(change: () => void): () => void {
  window.addEventListener('resize', change);
  return () => window.removeEventListener('resize', change);
}

function readWidth(): number {
  return window.innerWidth;
}

function noWidth(): null {
  return null;
}

/** The repository page of a file or a folder. */
function sourceHref(path: string): string {
  return `${REPO_URL}/${/\.\w+$/.test(path) ? 'blob' : 'tree'}/main/${path}`;
}

function shellItem(entry: LibraryEntry): ShellItem {
  return {
    id: entry.id,
    n: entry.n,
    title: entry.name,
    desc: entry.desc ?? `${entry.code} in ${entry.path}`,
    inPlace: true,
  };
}

/** The groups as the shell sees them, nested under Knowledge > Components in the list. */
function shellSections(blocks: readonly LibraryBlock[]): readonly ShellSection[] {
  return blocks.map((block) => ({ id: `cl-${block.id}`, label: block.label, under: 'components', items: block.entries.map(shellItem) }));
}

/** A plate as its docs section mounts it, with the MDX's props: a lazy plate from the registry, or the client plate of one with a server half. */
function LivePlate({ plate }: { plate: LibraryPlate }) {
  const Plate = plate.kind === 'server' ? serverPlate(plate.module) : lazyPlate(plate.module, plate.name);
  return <Plate {...plate.props} />;
}

type SlotProps = {
  entry: LibraryEntry;
  plate: LibraryPlate;
  live: boolean;
  kept: number | undefined;
  /** the viewport's width, or null until the page has hydrated */
  width: number | null;
};

/** The elements a plate rendered into its slot, without the lazy module's blank fallback. */
function plateNodes(slot: HTMLElement): HTMLElement[] {
  return Array.from(slot.querySelectorAll<HTMLElement>(':scope > :not([aria-hidden="true"])'));
}

/** The height of what the plate rendered, whatever height the slot holds. */
function plateHeight(slot: HTMLElement): number {
  return plateNodes(slot).reduce((sum, node) => sum + node.getBoundingClientRect().height, 0);
}

/** True once every frame in the slot holds its own page, loaded (a frame starts on a blank document that reads as loaded). */
function framesLoaded(slot: HTMLElement): boolean {
  return Array.from(slot.querySelectorAll('iframe')).every((frame) => {
    const doc = frame.contentDocument;
    return !doc || (doc.URL !== 'about:blank' && doc.readyState === 'complete');
  });
}

/** How long a drawn plate's height holds still, with its frames loaded, before the slot lets go of it. */
const SETTLE_MS = 600;
/** The longest the slot holds a drawn plate to the height it reserved. */
const HOLD_MAX_MS = 10_000;

/**
 * Where a mounted plate's slot is: holding the plate to the height it
 * reserved while the plate settles (`hold`), keeping that height as a
 * floor under a plate that settled shorter (`floor`), or sized by the
 * plate (`free`).
 */
type Phase = 'hold' | 'floor' | 'free';

/**
 * The plate's place in its row. Until the plate has drawn, the slot holds
 * a height: the one it measured when its plate last unmounted, or the
 * plate's measured height at the reader's width (reserveAt), under reduced
 * motion from the still table where the plate has one, which the server's
 * render approximates with the heights at 1440 and 390 until the page
 * hydrates. It has drawn once something other than the lazy module's
 * blank fallback is in it. While the plate settles (its frames load, a
 * figure posts its height, a readout fills in) the slot keeps exactly that
 * height and clips what passes it, until the plate's own height has held
 * still for SETTLE_MS, or for HOLD_MAX_MS at most. A plate that settles
 * shorter keeps the height as a floor until it grows into it or the row
 * leaves the sheet's view, so no row shrinks in view; out of view a change
 * moves nothing the reader sees, and above the view the plate window holds
 * the reader's place. The slot mounts its plate only near the reader, so
 * the plate arms at once (PlateNearContext).
 */
function PlateSlot({ entry, plate, live, kept, width }: SlotProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [held, setHeld] = useState(0);
  const [phase, setPhase] = useState<Phase>('hold');

  useLayoutWork(
    () => {
      const el = ref.current;
      setReady(false);
      setPhase('hold');
      if (!live || !el) return;
      setHeld(el.getBoundingClientRect().height);
      const check = () => setReady(plateNodes(el).length > 0);
      check();
      const observer = new MutationObserver(check);
      observer.observe(el, { childList: true });
      return () => observer.disconnect();
    },
    { dependencies: [live] }
  );

  const drawn = live && ready;

  /* hold: the plate settles inside the reserved height */
  useLayoutWork(
    () => {
      const el = ref.current;
      if (!drawn || phase !== 'hold' || !el) return;
      let timer = 0;
      const settle = () => setPhase(plateHeight(el) >= held - 1 ? 'free' : 'floor');
      const arm = () => {
        window.clearTimeout(timer);
        if (framesLoaded(el)) timer = window.setTimeout(settle, SETTLE_MS);
      };
      const sizes = new ResizeObserver(arm);
      const watch = () => {
        sizes.disconnect();
        plateNodes(el).forEach((node) => sizes.observe(node));
        arm();
      };
      const nodes = new MutationObserver(watch);
      nodes.observe(el, { childList: true });
      /* a frame's load does not bubble; the capture phase sees it */
      el.addEventListener('load', arm, true);
      watch();
      const cap = window.setTimeout(settle, HOLD_MAX_MS);
      return () => {
        sizes.disconnect();
        nodes.disconnect();
        el.removeEventListener('load', arm, true);
        window.clearTimeout(timer);
        window.clearTimeout(cap);
      };
    },
    { dependencies: [drawn, phase, held] }
  );

  /* floor: it goes once the plate is as tall as it, or once the row is out of view */
  useLayoutWork(
    () => {
      const el = ref.current;
      if (!drawn || phase !== 'floor' || !el) return;
      const release = () => setPhase('free');
      const sizes = new ResizeObserver(() => {
        if (plateHeight(el) >= held - 1) release();
      });
      plateNodes(el).forEach((node) => sizes.observe(node));
      const view = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => !entry.isIntersecting)) release();
        },
        { root: scrollRoot(el) }
      );
      view.observe(el);
      return () => {
        sizes.disconnect();
        view.disconnect();
      };
    },
    { dependencies: [drawn, phase, held] }
  );

  const still = useReducedMotion();
  const points = (still ? entry.reserveStill : undefined) ?? entry.reserve ?? [];
  const style: CSSProperties | undefined = drawn
    ? phase === 'hold'
      ? { height: held, overflow: 'clip' }
      : phase === 'floor'
        ? { minHeight: held }
        : undefined
    : kept !== undefined
      ? { height: kept }
      : width !== null
        ? { height: reserveAt(points, width) }
        : { '--cl-h': `${reserveAt(points, 1440)}px`, '--cl-h-sm': `${reserveAt(points, 390)}px` };
  return (
    <div className={cn('cl-live', drawn && 'is-drawn')} data-plate={entry.id} ref={ref} style={style}>
      {live ? (
        <PlateNearContext.Provider value>
          <LivePlate plate={plate} />
        </PlateNearContext.Provider>
      ) : null}
    </div>
  );
}

type RowProps = {
  entry: LibraryEntry;
  active: boolean;
  live: boolean;
  kept: number | undefined;
  width: number | null;
};

/** One component: its name and export, its live plate, then its file and its docs section. */
const Row = memo(function Row({ entry, active, live, kept, width }: RowProps) {
  const { docs, plate } = entry;
  return (
    <article id={entry.id} className={cn('cl-row', active && 'is-active')} data-id={entry.id} aria-current={active ? 'true' : undefined}>
      <div className='cl-n'>
        <b>{entry.n}</b>
      </div>
      <div className='cl-body'>
        <div className='cl-name'>
          <h3>{entry.name}</h3>
          {entry.code === entry.name ? null : <code>{entry.code}</code>}
        </div>
        {entry.desc ? <p>{entry.desc}</p> : null}
        {plate ? <PlateSlot entry={entry} plate={plate} live={live} kept={kept} width={width} /> : null}
        <p className='cl-line'>
          <a href={sourceHref(entry.path)}>{entry.path}</a>
          {docs ? (
            <>
              <span aria-hidden='true'> · </span>
              <Link href={docs.href} prefetch={false}>
                {docs.title}
              </Link>
            </>
          ) : null}
        </p>
      </div>
    </article>
  );
});

type ComponentsBookProps = {
  blocks: readonly LibraryBlock[];
  sheetRef: RefObject<HTMLDivElement | null>;
  jumpRef: RefObject<(id: string) => void>;
  activeOut: RefObject<string>;
  updated: PageUpdated;
};

/**
 * The set read top to bottom inside the flow sheet: the head with the
 * counts, a contents list of the groups, then every group under a divider
 * as ruled rows, each documented row with its plate running live. The
 * reading state is the shared read line (useReadLine); which plates run is
 * the plate window (usePlateWindow).
 */
function ComponentsBook({ blocks, sheetRef, jumpRef, activeOut, updated }: ComponentsBookProps) {
  const { active, ready, select } = usePtShell();
  activeOut.current = active;

  const { jump, onContents } = useReadLine({ rootRef: sheetRef, selector: '.cl-row', active, select, ready, smooth: true });
  jumpRef.current = jump;
  const { live, kept } = usePlateWindow(sheetRef);
  const width = useSyncExternalStore(onResize, readWidth, noWidth);

  const documented = blocks.filter((block) => block.id !== UNDOCUMENTED);
  const docsCount = documented.reduce((n, block) => n + block.entries.length, 0);
  const undocCount = blocks.find((block) => block.id === UNDOCUMENTED)?.entries.length ?? 0;

  return (
    <div className='cl-book pt-book-col'>
      <BookHead
        title={TITLE}
        lead={`Prototemplate keeps ${docsCount + undocCount} components. The docs document ${docsCount} of them in the ${documented.length} groups of their Components section, and ${undocCount} have no docs page yet.`}
        updated={updated}
        facts={[
          { icon: 'cube', key: 'Components', value: docsCount + undocCount },
          { icon: 'index', key: 'Groups', value: <Link href='/docs/components'>{documented.length}</Link> },
          { icon: 'document', key: 'Not in the docs', value: undocCount },
        ]}
        contents={
          <nav className='cl-toc pt-book-toc' aria-label='Contents'>
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
        }
      />

      {blocks.map((block, i) => (
        <section key={block.id} className='pt-book-part cl-cat' aria-labelledby={`cl-${block.id}`}>
          <div className='cl-sec pt-book-sec'>
            <small>
              <span>Section {i + 1}</span>
              <span>{block.entries.length === 1 ? '1 component' : `${block.entries.length} components`}</span>
            </small>
            <h2 id={`cl-${block.id}`}>{block.label}</h2>
          </div>
          {block.entries.map((entry) => (
            <Row
              key={entry.id}
              entry={entry}
              active={entry.id === active}
              live={live.has(entry.id)}
              kept={kept.get(entry.id)}
              width={width}
            />
          ))}
        </section>
      ))}
    </div>
  );
}

type ComponentsViewerProps = {
  blocks: readonly LibraryBlock[];
  /** the /components entry in src/lib/updated.ts, from the server page */
  updated: PageUpdated;
};

/**
 * The component library on the viewer shell: one section per group of the
 * docs Components section, then the components no docs page covers yet,
 * nested under Knowledge > Components in the list; the set as ruled rows
 * inside the flow sheet, each documented component as the live plate its
 * docs section mounts. Flow keys, so Space and the arrows scroll; the hash
 * names the row in view.
 */
export default function ComponentsViewer({ blocks, updated }: ComponentsViewerProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const jumpRef = useRef<(id: string) => void>(() => {});
  const activeOut = useRef(blocks[0]?.entries[0]?.id ?? '');
  const sections = useMemo(() => shellSections(blocks), [blocks]);
  const total = blocks.reduce((n, block) => n + block.entries.length, 0);

  return (
    <ViewerShell
      id='components'
      title={TITLE}
      mark='pt'
      count={`${total} components`}
      sections={sections}
      modes={MODES}
      thumb='row'
      surfaces='site'
      keys='flow'
      noun='component'
      onSelect={(id) => {
        /* re-clicking the active component brings its row back to the read line */
        if (id === activeOut.current) jumpRef.current(id);
      }}
    >
      <Sheet variant='flow' scrollRef={sheetRef}>
        <ComponentsBook blocks={blocks} sheetRef={sheetRef} jumpRef={jumpRef} activeOut={activeOut} updated={updated} />
      </Sheet>
    </ViewerShell>
  );
}
