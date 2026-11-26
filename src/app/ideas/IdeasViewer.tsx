'use client';

import Link from 'next/link';
import type { RefObject } from 'react';
import { useRef } from 'react';

import { BookHead } from '@/components/viewer/BookView';
import { Sheet } from '@/components/viewer/Sheet';
import { usePtShell } from '@/components/viewer/shell-context';
import { useReadLine } from '@/components/viewer/useReadLine';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { cn } from '@/lib/cn';
import { IDEA_GROUPS, IDEA_MADE_COUNT, IDEA_ROW_COUNT, IDEA_SOURCE_COUNT } from '@/lib/ideas';
import type { IdeaLink, IdeaRow } from '@/lib/ideas';
import { PAGE_NAMES } from '@/lib/page-names';
import type { PageUpdated } from '@/lib/page-updated';
import { rangeText } from '@/lib/shell-data';
import type { ShellMode, ShellSection } from '@/lib/shell-data';

import { IdeaFigure, IdeaPictures } from './IdeaFigure';

import './ideas.css';

const TITLE = PAGE_NAMES.ideas.name;
const MODES: readonly ShellMode[] = ['book'];
const LEAD =
  'What each General Translation surface took its ideas from: the references first, then the versions made from them, with the one Kevin chose or shipped marked.';
const NOTE =
  'Each section is one surface. A reference names the outside work and links to it; a version switches in place between its captures, and a capture opens at full size.';

/** The sections as the shell sees them, nested under Knowledge > Ideas in the list. */
const SECTIONS: readonly ShellSection[] = IDEA_GROUPS.map((group) => ({
  id: group.id,
  label: group.label,
  under: 'ideas',
  items: group.rows.map((row) => ({ id: row.id, n: row.n, title: row.title, short: row.short, desc: row.body, inPlace: true as const })),
}));

/** A row's link: an internal page through the router, an outside address in a new tab. */
function RowLink({ link }: { link: IdeaLink }) {
  if (link.href.startsWith('/')) {
    return (
      <Link className='ix-link' href={link.href} prefetch={false}>
        {link.label}
      </Link>
    );
  }
  return (
    <a className='ix-link' href={link.href} target='_blank' rel='noreferrer'>
      {link.label}
    </a>
  );
}

/** The meta line: the row's path and its links, when it has any. */
function RowLine({ row }: { row: IdeaRow }) {
  if (!row.path && !row.links?.length) return null;
  return (
    <p className='ix-line'>
      {row.path ? <code>{row.path}</code> : null}
      {row.links?.map((link) => (
        <RowLink key={link.href} link={link} />
      ))}
    </p>
  );
}

type IdeasBookProps = {
  /** the flow sheet's scroll region */
  sheetRef: RefObject<HTMLDivElement | null>;
  /** receives the row jump, for a re-click on the active row in the list */
  jumpRef: RefObject<(id: string) => void>;
  /** the active row, read by the shell's onSelect outside this component */
  activeOut: RefObject<string>;
  /** the head's Updated row: the /ideas entry in src/lib/updated.ts */
  updated: PageUpdated;
};

/**
 * The page read top to bottom inside the flow sheet: a head with the
 * counts, a contents list, then one section per surface as ruled rows,
 * its references before its versions. The reading state is the shared
 * read line.
 */
function IdeasBook({ sheetRef, jumpRef, activeOut, updated }: IdeasBookProps) {
  const { active, ready, select } = usePtShell();
  activeOut.current = active;

  const { jump, onContents } = useReadLine({ rootRef: sheetRef, selector: '.ix-row', active, select, ready, smooth: true });
  jumpRef.current = jump;

  return (
    <div className='ix-book pt-book-col'>
      <BookHead
        title={TITLE}
        lead={LEAD}
        note={NOTE}
        updated={updated}
        facts={[
          { icon: 'folder', key: 'Surfaces', value: IDEA_GROUPS.length },
          { icon: 'sparkles', key: 'References', value: IDEA_SOURCE_COUNT },
          { icon: 'photo', key: 'Versions', value: IDEA_MADE_COUNT },
        ]}
        contents={
          <nav className='pt-book-toc' aria-label='Contents'>
            {IDEA_GROUPS.map((group) => {
              const first = group.rows[0];
              if (!first) return null;
              return (
                <a key={group.id} href={`#${first.id}`} onClick={(e) => onContents(e, first.id)}>
                  <span>{group.label}</span>
                  <small>{rangeText(group.rows)}</small>
                </a>
              );
            })}
          </nav>
        }
      />

      {IDEA_GROUPS.map((group, i) => (
        <section key={group.id} className='pt-book-part ix-cat' aria-labelledby={`ix-${group.id}`}>
          <div className='pt-book-sec'>
            <small>
              <span>Section {i + 1}</span>
              <span>Rows {rangeText(group.rows)}</span>
            </small>
            <div>
              <h2 id={`ix-${group.id}`}>{group.label}</h2>
              <p>{group.lead}</p>
            </div>
          </div>
          {group.rows.map((row) => (
            <article
              key={row.id}
              id={row.id}
              className={cn('ix-row', row.id === active && 'is-active')}
              data-id={row.id}
              aria-current={row.id === active ? 'true' : undefined}
            >
              <div className='ix-n'>
                <b>{row.n}</b>
              </div>
              <div className='ix-body'>
                <h3>
                  {row.title}
                  {row.pick ? <span className='ix-pick'>{row.pick}</span> : null}
                </h3>
                <p>{row.body}</p>
                {row.pictures?.length ? <IdeaPictures pictures={row.pictures} credit={row.credit} /> : null}
                {row.cuts?.length ? <IdeaFigure title={row.title} cuts={row.cuts} /> : null}
                <RowLine row={row} />
              </div>
            </article>
          ))}
        </section>
      ))}
    </div>
  );
}

type IdeasViewerProps = {
  /** the /ideas entry in src/lib/updated.ts, from the server page */
  updated: PageUpdated;
};

/**
 * The ideas page on the viewer shell: one section per surface nested
 * under Knowledge > Ideas in the list, one row per reference or version,
 * and the whole page as ruled rows inside the flow sheet. Flow keys, so
 * Space and the arrows scroll; the hash names the row in view.
 */
export default function IdeasViewer({ updated }: IdeasViewerProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const jumpRef = useRef<(id: string) => void>(() => {});
  const activeOut = useRef(IDEA_GROUPS[0]?.rows[0]?.id ?? '');

  return (
    <ViewerShell
      id='ideas'
      title={TITLE}
      mark='pt'
      count={`${IDEA_ROW_COUNT} rows`}
      sections={SECTIONS}
      modes={MODES}
      thumb='row'
      surfaces='site'
      keys='flow'
      noun='row'
      onSelect={(id) => {
        /* re-clicking the active row brings it back to the read line */
        if (id === activeOut.current) jumpRef.current(id);
      }}
    >
      <Sheet variant='flow' scrollRef={sheetRef}>
        <IdeasBook sheetRef={sheetRef} jumpRef={jumpRef} activeOut={activeOut} updated={updated} />
      </Sheet>
    </ViewerShell>
  );
}
