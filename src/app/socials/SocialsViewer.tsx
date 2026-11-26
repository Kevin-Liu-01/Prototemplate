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
import { PAGE_NAMES } from '@/lib/page-names';
import type { PageUpdated } from '@/lib/page-updated';
import { rangeText } from '@/lib/shell-data';
import type { ShellMode, ShellSection } from '@/lib/shell-data';
import { SOCIAL_BLOCKS, SOCIAL_MEDIA_COUNT, SOCIAL_ROW_COUNT } from '@/lib/socials';
import type { SocialRow } from '@/lib/socials';

import { SocialFigure } from './SocialFigure';

import './socials.css';

const TITLE = PAGE_NAMES.socials.name;
const MODES: readonly ShellMode[] = ['book'];
const LEAD =
  'General Translation’s posts on X and LinkedIn: the skills that own the rules, what earns attention, the media in this repository and the metadata each post carries.';
const NOTE =
  'The rules live in the skills, and this page shows them in one place. A media row switches in place between its cuts (X at 16:9, LinkedIn at 4:5); a still opens at full size, and a film plays in place.';

const SKILL_COUNT = SOCIAL_BLOCKS.find((block) => block.id === 'skills')?.rows.length ?? 0;

/** The sections as the shell sees them, nested under Knowledge > Socials in the list. */
const SECTIONS: readonly ShellSection[] = SOCIAL_BLOCKS.map((block) => ({
  id: block.id,
  label: block.label,
  under: 'socials',
  items: block.rows.map((row) => ({ id: row.id, n: row.n, title: row.title, short: row.short, desc: row.body, inPlace: true as const })),
}));

/** A row's link: an internal page through the router, an outside address in a new tab. */
function RowLink({ link }: { link: NonNullable<SocialRow['link']> }) {
  if (link.href.startsWith('/')) {
    return (
      <Link className='sx-link' href={link.href} prefetch={false}>
        {link.label}
      </Link>
    );
  }
  return (
    <a className='sx-link' href={link.href} target='_blank' rel='noreferrer'>
      {link.label}
    </a>
  );
}

type SocialsBookProps = {
  /** the flow sheet's scroll region */
  sheetRef: RefObject<HTMLDivElement | null>;
  /** receives the row jump, for a re-click on the active row in the list */
  jumpRef: RefObject<(id: string) => void>;
  /** the active row, read by the shell's onSelect outside this component */
  activeOut: RefObject<string>;
  /** the head's Updated row: the /socials entry in src/lib/updated.ts */
  updated: PageUpdated;
};

/**
 * The page read top to bottom inside the flow sheet: a head with the
 * counts, a contents list, then every part under a divider as ruled rows.
 * A row is a skill, a practice, a picture or film with its cuts, or a
 * standard with its facts. The reading state is the shared read line.
 */
function SocialsBook({ sheetRef, jumpRef, activeOut, updated }: SocialsBookProps) {
  const { active, ready, select } = usePtShell();
  activeOut.current = active;

  const { jump, onContents } = useReadLine({ rootRef: sheetRef, selector: '.sx-row', active, select, ready, smooth: true });
  jumpRef.current = jump;

  return (
    <div className='sx-book pt-book-col'>
      <BookHead
        title={TITLE}
        lead={LEAD}
        note={NOTE}
        updated={updated}
        facts={[
          { icon: 'skill', key: 'Skills', value: SKILL_COUNT },
          { icon: 'photo', key: 'Media', value: SOCIAL_MEDIA_COUNT },
          { icon: 'index', key: 'Rows', value: SOCIAL_ROW_COUNT },
        ]}
        contents={
          <nav className='pt-book-toc' aria-label='Contents'>
            {SOCIAL_BLOCKS.map((block) => {
              const first = block.rows[0];
              if (!first) return null;
              return (
                <a key={block.id} href={`#${first.id}`} onClick={(e) => onContents(e, first.id)}>
                  <span>{block.label}</span>
                  <small>{rangeText(block.rows)}</small>
                </a>
              );
            })}
          </nav>
        }
      />

      {SOCIAL_BLOCKS.map((block, i) => (
        <section key={block.id} className='pt-book-part sx-cat' aria-labelledby={`sx-${block.id}`}>
          <div className='pt-book-sec'>
            <small>
              <span>Section {i + 1}</span>
              <span>Rows {rangeText(block.rows)}</span>
            </small>
            <div>
              <h2 id={`sx-${block.id}`}>{block.label}</h2>
              <p>{block.lead}</p>
            </div>
          </div>
          {block.rows.map((row) => (
            <article
              key={row.id}
              id={row.id}
              className={cn('sx-row', row.id === active && 'is-active')}
              data-id={row.id}
              aria-current={row.id === active ? 'true' : undefined}
            >
              <div className='sx-n'>
                <b>{row.n}</b>
              </div>
              <div className='sx-body'>
                <h3>{row.title}</h3>
                <p>{row.body}</p>
                {row.specs ? (
                  <dl className='sx-specs'>
                    {row.specs.map((spec) => (
                      <div key={spec.key}>
                        <dt>{spec.key}</dt>
                        <dd>{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                {row.variants?.length ? <SocialFigure title={row.title} variants={row.variants} /> : null}
                {row.path || row.link ? (
                  <p className='sx-line'>
                    {row.path ? <code>{row.path}</code> : null}
                    {row.link ? <RowLink link={row.link} /> : null}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      ))}
    </div>
  );
}

type SocialsViewerProps = {
  /** the /socials entry in src/lib/updated.ts, from the server page */
  updated: PageUpdated;
};

/**
 * The socials page on the viewer shell: the skills, the practices, the
 * media and the standards nested under Knowledge > Socials in the list,
 * one row each, and the whole page as ruled rows inside the flow sheet.
 * Flow keys, so Space and the arrows scroll; the hash names the row in view.
 */
export default function SocialsViewer({ updated }: SocialsViewerProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const jumpRef = useRef<(id: string) => void>(() => {});
  const activeOut = useRef(SOCIAL_BLOCKS[0]?.rows[0]?.id ?? '');

  return (
    <ViewerShell
      id='socials'
      title={TITLE}
      mark='pt'
      count={`${SOCIAL_ROW_COUNT} rows`}
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
        <SocialsBook sheetRef={sheetRef} jumpRef={jumpRef} activeOut={activeOut} updated={updated} />
      </Sheet>
    </ViewerShell>
  );
}
