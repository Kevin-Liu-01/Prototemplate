'use client';

import Link from 'next/link';
import type { RefObject } from 'react';
import { useRef } from 'react';

import { BookHead } from '@/components/viewer/BookView';
import { gtText } from '@/components/viewer/GtWord';
import { Sheet } from '@/components/viewer/Sheet';
import { usePtShell } from '@/components/viewer/shell-context';
import { useReadLine } from '@/components/viewer/useReadLine';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { cn } from '@/lib/cn';
import { PAGE_NAMES } from '@/lib/page-names';
import type { PageUpdated } from '@/lib/page-updated';
import { rangeText } from '@/lib/shell-data';
import type { ShellMode } from '@/lib/shell-data';
import { SKILLS, skillHref } from '@/lib/skills';

import { BLOCKS, SECTIONS, capitalized, countWord, describe, installLine } from './model';

import './skills.css';

const SKILLS_TITLE = PAGE_NAMES.skills.name;
const SKILLS_MODES: readonly ShellMode[] = ['book', 'grid'];
const SKILL_COUNT = countWord(SKILLS.length);
const BOOK_LEAD = `${capitalized(SKILL_COUNT)} skills record how General Translation work is done. Each one is a SKILL.md that Claude Code, Codex and other agents load, and one command installs it in any project.`;

/** The note under the head's rule: the command, what it writes, and where the full skills live. */
const BOOK_NOTE = (
  <p>
    From a Prototemplate checkout, <code>{installLine()}</code> links all {SKILL_COUNT} into a project&rsquo;s{' '}
    <code>.claude/skills</code> and <code>.agents/skills</code>. Name slugs to install fewer, add <code>--copy</code> to vendor the folders, and <code>--dry-run</code>{' '}
    to see each step first. Each skill&rsquo;s page holds its full SKILL.md, its supporting files and its own install
    line.
  </p>
);

type SkillsBookProps = {
  /** the flow sheet's scroll region */
  sheetRef: RefObject<HTMLDivElement | null>;
  /** receives the row jump, for a re-click on the active skill in the list */
  jumpRef: RefObject<(id: string) => void>;
  /** the active skill, read by the shell's onSelect outside this component */
  activeOut: RefObject<string>;
  /** the head's Updated row: the /skills entry in src/lib/updated.ts */
  updated: PageUpdated;
};

/**
 * The skills read top to bottom inside the flow sheet: a head with the
 * counts and the install command, a contents list of the areas, then every
 * area under a divider as ruled rows, one per skill: the number, the title,
 * the slug and what the skill is for. The reading state is the shared
 * read line (useReadLine): the row under the line is selected through the
 * shell (the list and the hash follow), and a selection from anywhere else
 * scrolls the sheet to the row. A deep link lands without motion; the spy
 * never selects at the head, so the first skill stays marked there.
 */
function SkillsBook({ sheetRef, jumpRef, activeOut, updated }: SkillsBookProps) {
  const { active, ready, select } = usePtShell();
  activeOut.current = active;

  const { jump, onContents } = useReadLine({ rootRef: sheetRef, selector: '.sk-row', active, select, ready, smooth: true });
  jumpRef.current = jump;

  return (
    <div className='sk-book pt-book-col'>
      <BookHead
        title={SKILLS_TITLE}
        lead={BOOK_LEAD}
        note={BOOK_NOTE}
        updated={updated}
        facts={[{ icon: 'skill', key: 'Skills', value: `${SKILLS.length} in ${BLOCKS.length} areas` }]}
        install={installLine()}
        contents={
          <nav className='sk-toc pt-book-toc' aria-label='Contents'>
            {BLOCKS.map((block) => {
              const first = block.rows[0];
              if (!first) return null;
              return (
                <a key={block.area} href={`#${first.skill.id}`} onClick={(e) => onContents(e, first.skill.id)}>
                  <span>{block.label}</span>
                  <small>{rangeText(block.rows)}</small>
                </a>
              );
            })}
          </nav>
        }
      />

      {BLOCKS.map((block) => (
        <section key={block.area} className='pt-book-part sk-cat' aria-labelledby={`sk-${block.area}`}>
          <div className='sk-sec pt-book-sec'>
            <small>
              <span>Section {block.ordinal}</span>
              <span>Skills {rangeText(block.rows)}</span>
            </small>
            <h2 id={`sk-${block.area}`}>{block.label}</h2>
          </div>
          {block.rows.map(({ skill, n }) => {
            const { summary, use } = describe(skill.description);
            return (
              /* the row is the link to the skill's page; the spy reads its data-id. Prefetch is
                 off, so the rows that scroll into view fetch nothing (it also turns off Link's
                 hover prefetch); the sidebar's skill rows prefetch on intent */
              <Link
                key={skill.id}
                className={cn('sk-row', skill.id === active && 'is-active')}
                href={skillHref(skill.id)}
                prefetch={false}
                data-id={skill.id}
                aria-current={skill.id === active ? 'true' : undefined}
              >
                <div className='sk-n'>
                  <b>{n}</b>
                </div>
                <div className='sk-body'>
                  <div className='sk-name'>
                    <h3>{skill.title}</h3>
                    <code>{skill.id}</code>
                  </div>
                  {/* what the skill is and when to use it, from the SKILL.md description; the standalone word GT renders as the mark */}
                  <p>{gtText(use ? `${summary} ${use}` : summary)}</p>
                </div>
              </Link>
            );
          })}
        </section>
      ))}
    </div>
  );
}

export type SkillsViewerProps = {
  /** the /skills entry in src/lib/updated.ts, from the server page */
  updated: PageUpdated;
};

/**
 * The skills on the viewer shell: the whole set as one numbered run under
 * Knowledge > Skills in the list, every area as ruled rows inside the
 * 1280px flow sheet, each row a link to the skill's own page
 * (/skills/<slug>), and every skill as a text tile in the grid (skills.css
 * lays the shell's rows out as tiles there). Flow keys, so Space and the
 * arrows scroll; the sidebar filter matches titles, areas and
 * descriptions. The hash names the row in view; a row in the list opens
 * the page.
 */
export default function SkillsViewer({ updated }: SkillsViewerProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const jumpRef = useRef<(id: string) => void>(() => {});
  const activeOut = useRef(SKILLS[0]?.id ?? '');

  return (
    <ViewerShell
      id='skills'
      title={SKILLS_TITLE}
      mark='pt'
      count={`${SKILLS.length} skills`}
      sections={SECTIONS}
      modes={SKILLS_MODES}
      thumb='row'
      surfaces='site'
      keys='flow'
      noun='skill'
      onSelect={(id) => {
        /* re-clicking the active skill brings its row back to the read line */
        if (id === activeOut.current) jumpRef.current(id);
      }}
    >
      <Sheet variant='flow' scrollRef={sheetRef}>
        <SkillsBook sheetRef={sheetRef} jumpRef={jumpRef} activeOut={activeOut} updated={updated} />
      </Sheet>
    </ViewerShell>
  );
}
