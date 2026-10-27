'use client';

import Link from 'next/link';
import { memo, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode, RefObject } from 'react';

import { PlateNearContext } from '@/components/docs/demos/hooks';
import { BookHead } from '@/components/viewer/BookView';
import { Sheet } from '@/components/viewer/Sheet';
import { usePtShell } from '@/components/viewer/shell-context';
import { useReadLine } from '@/components/viewer/useReadLine';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { cn } from '@/lib/cn';
import type { LibraryBlock, LibraryEntry, LibraryPlate } from '@/lib/component-library-model';
import { PAGE_NAMES } from '@/lib/page-names';
import type { PageUpdated } from '@/lib/page-updated';
import { REPO_URL } from '@/lib/seo/site';
import { rangeText } from '@/lib/shell-data';
import type { ShellItem, ShellMode, ShellSection } from '@/lib/shell-data';
import { useLayoutWork } from '@/lib/use-layout-work';

import { lazyPlate } from './plates';
import { usePlateWindow } from './usePlateWindow';

import './components.css';

const TITLE = PAGE_NAMES.components.name;
const MODES: readonly ShellMode[] = ['book'];
const UNDOCUMENTED = 'undocumented';

/** The plates with a server half, rendered by the server page, by entry id. */
export type ServerPlates = Readonly<Record<string, ReactNode>>;

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

/** A plate as its docs section mounts it: a lazy plate from the registry with the MDX's props, or the server half the page rendered. */
function LivePlate({ plate, server }: { plate: LibraryPlate; server: ReactNode }) {
  if (plate.kind === 'server') return server;
  const Plate = lazyPlate(plate.module, plate.name);
  return <Plate {...plate.props} />;
}

type SlotProps = { entry: LibraryEntry; plate: LibraryPlate; live: boolean; kept: number | undefined; server: ReactNode };

/** How long a slot holds its reserved height for a plate that has drawn but not yet grown into it. */
const HOLD_MS = 6000;

/** The elements a plate rendered into its slot, without the lazy module's blank fallback. */
function plateNodes(slot: HTMLElement): HTMLElement[] {
  return Array.from(slot.querySelectorAll<HTMLElement>(':scope > :not([aria-hidden="true"])'));
}

/**
 * The plate's place in its row. Until the plate has drawn, the slot holds
 * a height: the one it measured when its plate last unmounted, or the
 * plate's measured height from the server. It has drawn once something
 * other than the lazy module's blank fallback is in it. A plate that
 * draws in steps (a frame that loads a page, a figure that posts its
 * height) keeps that height as a floor until it grows into it, or for
 * HOLD_MS, so its row never shrinks and grows again in view. The slot
 * mounts its plate only near the reader, so the plate arms at once
 * (PlateNearContext).
 */
function PlateSlot({ entry, plate, live, kept, server }: SlotProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [floor, setFloor] = useState<number | null>(null);

  useLayoutWork(
    () => {
      const el = ref.current;
      if (!live || !el) {
        setReady(false);
        setFloor(null);
        return;
      }
      setFloor(el.getBoundingClientRect().height);
      const check = () => setReady(plateNodes(el).length > 0);
      check();
      const observer = new MutationObserver(check);
      observer.observe(el, { childList: true });
      return () => observer.disconnect();
    },
    { dependencies: [live] }
  );

  const drawn = live && ready;

  /* the floor goes once the plate is as tall as the slot it was given */
  useLayoutWork(
    () => {
      const el = ref.current;
      if (!drawn || floor === null || !el) return;
      const nodes = plateNodes(el);
      const release = () => setFloor(null);
      const sizes = new ResizeObserver(() => {
        if (nodes.reduce((sum, node) => sum + node.getBoundingClientRect().height, 0) >= floor - 1) release();
      });
      nodes.forEach((node) => sizes.observe(node));
      const timer = window.setTimeout(release, HOLD_MS);
      return () => {
        sizes.disconnect();
        window.clearTimeout(timer);
      };
    },
    { dependencies: [drawn, floor] }
  );

  const [wide, narrow] = entry.reserve ?? [];
  const style: CSSProperties | undefined = drawn
    ? floor === null
      ? undefined
      : { minHeight: floor }
    : kept !== undefined
      ? { height: kept }
      : { '--cl-h': `${wide}px`, '--cl-h-sm': `${narrow}px` };
  return (
    <div className={cn('cl-live', drawn && 'is-drawn')} data-plate={entry.id} ref={ref} style={style}>
      {live ? (
        <PlateNearContext.Provider value>
          <LivePlate plate={plate} server={server} />
        </PlateNearContext.Provider>
      ) : null}
    </div>
  );
}

type RowProps = { entry: LibraryEntry; active: boolean; live: boolean; kept: number | undefined; server: ReactNode };

/** One component: its name and export, its live plate, then its file and its docs section. */
const Row = memo(function Row({ entry, active, live, kept, server }: RowProps) {
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
        {plate ? <PlateSlot entry={entry} plate={plate} live={live} kept={kept} server={server} /> : null}
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
  server: ServerPlates;
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
function ComponentsBook({ blocks, server, sheetRef, jumpRef, activeOut, updated }: ComponentsBookProps) {
  const { active, ready, select } = usePtShell();
  activeOut.current = active;

  const { jump, onContents } = useReadLine({ rootRef: sheetRef, selector: '.cl-row', active, select, ready, smooth: true });
  jumpRef.current = jump;
  const { live, kept } = usePlateWindow(sheetRef);

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
              server={server[entry.id]}
            />
          ))}
        </section>
      ))}
    </div>
  );
}

type ComponentsViewerProps = {
  blocks: readonly LibraryBlock[];
  /** the plates with a server half, rendered by the server page */
  server: ServerPlates;
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
export default function ComponentsViewer({ blocks, server, updated }: ComponentsViewerProps) {
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
        <ComponentsBook blocks={blocks} server={server} sheetRef={sheetRef} jumpRef={jumpRef} activeOut={activeOut} updated={updated} />
      </Sheet>
    </ViewerShell>
  );
}
