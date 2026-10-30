'use client';

import Link from 'next/link';
import type { RefObject } from 'react';
import { useMemo, useRef } from 'react';

import { BookHead } from '@/components/viewer/BookView';
import { Sheet } from '@/components/viewer/Sheet';
import { usePtShell } from '@/components/viewer/shell-context';
import { useReadLine } from '@/components/viewer/useReadLine';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { cn } from '@/lib/cn';
import { backgroundLabel } from '@/lib/graphics-model';
import type { Block, Entry } from '@/lib/graphics-model';
import { PAGE_NAMES } from '@/lib/page-names';
import type { PageUpdated } from '@/lib/page-updated';
import { rangeText } from '@/lib/shell-data';
import type { ShellMode, ShellSection } from '@/lib/shell-data';

import { VariantFigure } from './VariantFigure';

import './graphics.css';

const TITLE = PAGE_NAMES.graphics.name;
const MODES: readonly ShellMode[] = ['book', 'grid'];
const LEAD =
  'Every illustration of the blog: the docs series by the area of the post it sits in, its covers, contact sheets and glyphfield grounds, then the other posts.';
const NOTE =
  'Each image is one row. The row switches in place between the versions the image ships in: dark and light, the social card cut from a cover, and a clip’s GIF, video and still. The frame opens the file at full size.';

/**
 * The sidebar names of the areas whose labels are post titles, keyed by
 * block id (src/lib/graphics.ts POSTS): a sentence would run past two
 * lines in the 208px list. The label stays the grid caption and the
 * divider's title.
 */
const SIDEBAR_AREA: Readonly<Record<string, string>> = {
  'rewriting-our-docs': 'Rewriting our docs',
  'daniel-white': 'Daniel White',
  'fuma-nama': 'Fuma Nama',
};


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
    short: SIDEBAR_AREA[block.id],
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
  /** the number of posts the set illustrates, for the head's Posts fact */
  posts: number;
  /** the head's Updated row: the /graphics entry in src/lib/updated.ts */
  updated: PageUpdated;
};

/**
 * The set read top to bottom inside the flow sheet: a head with the counts,
 * a contents list, then every section under a divider as ruled rows, one
 * per image with its figure. The reading state is the shared read line
 * (useReadLine): the row under the line is selected through the shell, and
 * a selection from anywhere else scrolls the sheet to the row.
 */
function GraphicsBook({ blocks, sheetRef, jumpRef, activeOut, posts, updated }: GraphicsBookProps) {
  const { active, ready, select } = usePtShell();
  activeOut.current = active;

  const { jump, onContents } = useReadLine({ rootRef: sheetRef, selector: '.gx-row', active, select, ready, smooth: true });
  jumpRef.current = jump;

  const total = useMemo(() => blocks.reduce((n, block) => n + block.entries.length, 0), [blocks]);

  return (
    <div className='gx-book pt-book-col'>
      <BookHead
        title={TITLE}
        lead={LEAD}
        note={NOTE}
        updated={updated}
        facts={[
          { icon: 'photo', key: 'Images', value: total },
          { icon: 'index', key: 'Sections', value: blocks.length },
          { icon: 'post', key: 'Posts', value: <Link href='/blog'>{posts}</Link> },
        ]}
        contents={
          <nav className='gx-toc pt-book-toc' aria-label='Contents'>
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
        <section key={block.id} className='pt-book-part gx-cat' aria-labelledby={`gx-${block.id}`}>
          <div className='gx-sec pt-book-sec'>
            <small>
              <span>Section {i + 1}</span>
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

type GraphicsViewerProps = {
  blocks: readonly Block[];
  /** the number of posts the set illustrates, from the server page */
  posts: number;
  /** the /graphics entry in src/lib/updated.ts, from the server page */
  updated: PageUpdated;
};

/**
 * The graphics on the viewer shell: one section per area of the post, the
 * covers, the sheets, the grounds and the other posts, nested under
 * Knowledge > Graphics in the list with one row per image; the whole set
 * as ruled rows with figures inside the 1280px flow sheet, and every image
 * as a captured thumbnail in the grid. Flow keys, so Space and the arrows
 * scroll; the sidebar filter matches names and descriptions. The hash
 * names the row in view.
 */
export default function GraphicsViewer({ blocks, posts, updated }: GraphicsViewerProps) {
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
      <Sheet variant='flow' scrollRef={sheetRef}>
        <GraphicsBook
          blocks={blocks}
          sheetRef={sheetRef}
          jumpRef={jumpRef}
          activeOut={activeOut}
          posts={posts}
          updated={updated}
        />
      </Sheet>
    </ViewerShell>
  );
}
