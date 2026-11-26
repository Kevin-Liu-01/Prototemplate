'use client';

import Link from 'next/link';
import type { RefObject } from 'react';
import { Fragment, useMemo, useRef } from 'react';

import { BookHead } from '@/components/viewer/BookView';
import { Sheet } from '@/components/viewer/Sheet';
import { usePtShell } from '@/components/viewer/shell-context';
import { useReadLine } from '@/components/viewer/useReadLine';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { cn } from '@/lib/cn';
import { byline } from '@/lib/credit';
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
  'Every illustration of the blog, one section per post with the newest first: its cover, then its figures in order. The docs series’ contact sheets and grounds close the page.';
const NOTE =
  'Each image is one row. The row switches in place between the versions the image ships in: dark and light, the social card cut from a cover, and a clip’s GIF, video and still. The frame opens the file at full size.';

/** The meta line under a row: the post's section, the ground, the size of the first version, the number of versions. */
function metaText(entry: Entry): string {
  const parts: string[] = [];
  if (entry.part) parts.push(entry.part);
  if (entry.ground) parts.push(backgroundLabel(entry.ground));
  const first = entry.variants[0];
  if (first?.w && first?.h) parts.push(`${first.w}×${first.h}`);
  if (entry.variants.length > 1) parts.push(`${entry.variants.length} versions`);
  if (entry.markNote) parts.push(entry.markNote);
  return parts.join(' · ');
}

/** The sections as the shell sees them, nested under Knowledge > Graphics in the list. */
function shellSections(blocks: readonly Block[]): readonly ShellSection[] {
  return blocks.map((block) => ({
    id: block.id,
    label: block.label,
    short: block.short,
    under: 'graphics',
    items: block.entries.map((entry) => ({ id: entry.id, n: entry.n, title: entry.title, desc: entry.why, shot: entry.shot, inPlace: true as const })),
  }));
}

/**
 * A part of a post that has parts (the docs series): the part's number and
 * image range in the gutter, its name and the line on what its images show
 * and how they were made. The row above draws the rule.
 */
function PartDivider({ block, part }: { block: Block; part: string | undefined }) {
  const index = block.parts?.findIndex((p) => p.name === part) ?? -1;
  const info = block.parts?.[index];
  if (!info) return null;
  const rows = block.entries.filter((entry) => entry.part === part);
  return (
    <div className='gx-part'>
      <small>
        <span>Part {index + 1}</span>
        <span>Images {rangeText(rows)}</span>
      </small>
      <div>
        <h3>{info.name}</h3>
        <p>{info.lead}</p>
      </div>
    </div>
  );
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
        skill='gt-graphics'
        title={TITLE}
        lead={LEAD}
        note={
          <>
            <p>{NOTE}</p>
            <p>{byline()}</p>
          </>
        }
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
          {block.entries.map((entry, j) => (
            <Fragment key={entry.id}>
              {block.parts && entry.part !== block.entries[j - 1]?.part ? <PartDivider block={block} part={entry.part} /> : null}
            <article
              id={entry.id}
              className={cn('gx-row', entry.id === active && 'is-active')}
              data-id={entry.id}
              data-previous-mark={entry.markNote ? '' : undefined}
              aria-current={entry.id === active ? 'true' : undefined}
            >
              <div className='gx-n'>
                <b>{entry.n}</b>
              </div>
              <div className='gx-body'>
                {block.parts ? <h4>{entry.title}</h4> : <h3>{entry.title}</h3>}
                <p>{entry.why}</p>
                <VariantFigure entry={entry} />
                <p className='gx-line'>{metaText(entry)}</p>
              </div>
            </article>
            </Fragment>
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
 * The graphics on the viewer shell: one section per post, then the sheets
 * and the grounds, nested under Knowledge > Graphics in the list with one
 * row per image; the whole set as ruled rows with figures inside the
 * 1280px flow sheet, and every image as a captured thumbnail in the grid. Flow keys, so Space and the arrows
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
