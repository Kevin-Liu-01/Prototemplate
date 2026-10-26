'use client';

import Link from 'next/link';
import type { RefObject } from 'react';
import { useMemo, useRef } from 'react';

import { BookHead } from '@/components/viewer/BookView';
import { Sheet } from '@/components/viewer/Sheet';
import { usePtShell } from '@/components/viewer/shell-context';
import { ThumbShot } from '@/components/viewer/ThumbShot';
import { useReadLine } from '@/components/viewer/useReadLine';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { cn } from '@/lib/cn';
import type { LibraryBlock, LibraryEntry } from '@/lib/component-library-model';
import { PAGE_NAMES } from '@/lib/page-names';
import type { PageUpdated } from '@/lib/page-updated';
import { REPO_URL } from '@/lib/seo/site';
import { rangeText } from '@/lib/shell-data';
import type { ShellItem, ShellMode, ShellSection } from '@/lib/shell-data';

import './components.css';

const TITLE = PAGE_NAMES.components.name;
const MODES: readonly ShellMode[] = ['book', 'grid'];
const UNDOCUMENTED = 'undocumented';
/** A preview taller than 4:3 shows its top at 4:3, so a long plate (the globe rounds, the page gallery) does not fill the screen. */
const TALLEST = 4 / 3;

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
    shot: entry.shot ? { light: entry.shot.light, dark: entry.shot.dark } : undefined,
    inPlace: true,
  };
}

/** The groups as the shell sees them, nested under Knowledge > Components in the list. */
function shellSections(blocks: readonly LibraryBlock[]): readonly ShellSection[] {
  return blocks.map((block) => ({ id: `cl-${block.id}`, label: block.label, under: 'components', items: block.entries.map(shellItem) }));
}

type RowProps = { entry: LibraryEntry; active: boolean };

/** One component: its name and export, the captured plate linked to its docs section, then its file and its docs page. */
function Row({ entry, active }: RowProps) {
  const { shot, docs } = entry;
  return (
    <article
      id={entry.id}
      className={cn('cl-row', active && 'is-active')}
      data-id={entry.id}
      aria-current={active ? 'true' : undefined}
    >
      <div className='cl-n'>
        <b>{entry.n}</b>
      </div>
      <div className='cl-body'>
        <div className='cl-name'>
          <h3>{entry.name}</h3>
          {entry.code === entry.name ? null : <code>{entry.code}</code>}
        </div>
        {entry.desc ? <p>{entry.desc}</p> : null}
        {shot && docs ? (
          <Link
            className='cl-frame'
            href={docs.href}
            prefetch={false}
            aria-label={`${entry.name} on ${docs.title}`}
            style={{ aspectRatio: String(Math.max(shot.w / shot.h, TALLEST)), maxWidth: shot.w }}
          >
            <ThumbShot item={shellItem(entry)} />
          </Link>
        ) : null}
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
}

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
 * as ruled rows. The reading state is the shared read line (useReadLine).
 */
function ComponentsBook({ blocks, sheetRef, jumpRef, activeOut, updated }: ComponentsBookProps) {
  const { active, ready, select } = usePtShell();
  activeOut.current = active;

  const { jump, onContents } = useReadLine({ rootRef: sheetRef, selector: '.cl-row', active, select, ready, smooth: true });
  jumpRef.current = jump;

  const documented = blocks.filter((block) => block.id !== UNDOCUMENTED);
  const docsCount = documented.reduce((n, block) => n + block.entries.length, 0);
  const undocCount = blocks.find((block) => block.id === UNDOCUMENTED)?.entries.length ?? 0;

  return (
    <div className='cl-book pt-book-col'>
      <BookHead
        title={TITLE}
        lead={`Prototemplate keeps ${docsCount + undocCount} components. The docs document ${docsCount} of them in the ${documented.length} groups of their Components section, and ${undocCount} have no docs page yet.`}
        note={
          <p>
            Each preview is the component&rsquo;s plate on its docs page, captured in both themes. A preview links to its docs section, where the component runs
            live with its controls.
          </p>
        }
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
              <span>Components {rangeText(block.entries)}</span>
            </small>
            <h2 id={`cl-${block.id}`}>{block.label}</h2>
          </div>
          {block.entries.map((entry) => (
            <Row key={entry.id} entry={entry} active={entry.id === active} />
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
 * inside the flow sheet, and every captured plate in the grid. Flow keys,
 * so Space and the arrows scroll; the hash names the row in view.
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
      thumb='shot'
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
