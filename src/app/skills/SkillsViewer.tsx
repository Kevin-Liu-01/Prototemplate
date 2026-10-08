'use client';

import { useGSAP } from '@gsap/react';
import Link from 'next/link';
import type { MouseEvent, RefObject } from 'react';
import { useRef } from 'react';

import { BadgeWords } from '@/components/viewer/BadgeCycle';
import { BookHead } from '@/components/viewer/BookView';
import { gtText } from '@/components/viewer/GtWord';
import { Sheet } from '@/components/viewer/Sheet';
import { usePtShell } from '@/components/viewer/shell-context';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { cn } from '@/lib/cn';
import { PAGE_NAMES } from '@/lib/page-names';
import type { PageUpdated } from '@/lib/page-updated';
import type { ShellMode } from '@/lib/shell-data';
import { SKILLS, skillHref } from '@/lib/skills';
import { useMountEffect } from '@/lib/use-mount-effect';

import { BLOCKS, SECTIONS, capitalized, countWord, describe, installLine } from './model';
import type { Numbered } from './model';

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

/**
 * The read line. A row that crosses the top tenth of the sheet is the one
 * being read; among several, the lowest on the page wins, so the row whose
 * top has just passed under the line is the active one.
 */
const SPY_MARGIN = '0px 0px -90% 0px';

/** How long the spy waits for a programmatic scroll to reach its row before it reads the page again. */
const SETTLE_MS = 1200;

function rangeText(rows: readonly Numbered[]): string {
  const first = rows[0];
  const last = rows[rows.length - 1];
  if (!first || !last) return '';
  return last.pos > first.pos ? `${first.n} to ${last.n}` : first.n;
}

function cssEscape(value: string): string {
  return typeof CSS !== 'undefined' && 'escape' in CSS ? CSS.escape(value) : value;
}

function scrollBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

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
 * the slug and what the skill is for. Owns the reading state: an IntersectionObserver on
 * the sheet marks the row under the read line and selects it through the
 * shell (the list and the hash follow); a selection from anywhere else
 * scrolls the sheet to the row and mutes the spy until the row arrives, so
 * the rows the scroll passes are never selected. A deep link lands without
 * motion; the spy never selects at the head, so the first skill stays
 * marked there.
 */
function SkillsBook({ sheetRef, jumpRef, activeOut, updated }: SkillsBookProps) {
  const { active, ready, select } = usePtShell();
  activeOut.current = active;

  /* the observer reads the latest values through refs; the assignments run
     every render so the mount-time listener never sees a stale closure */
  const activeRef = useRef(active);
  activeRef.current = active;
  const selectRef = useRef(select);
  selectRef.current = select;

  /** the active id the effect last saw; null before the first run */
  const lastActive = useRef<string | null>(null);
  /** true once the shell has applied the hash: from here on a change scrolls with motion */
  const landed = useRef(false);
  /** the id the spy just selected, so the effect leaves the reader's scroll alone */
  const fromScroll = useRef<string | null>(null);
  /** the row a programmatic scroll is heading for; the spy waits for it */
  const settling = useRef<Element | null>(null);
  const settleTimer = useRef(0);

  const rowFor = (id: string): HTMLElement | null =>
    sheetRef.current?.querySelector<HTMLElement>(`.sk-row[data-id="${cssEscape(id)}"]`) ?? null;

  /* a programmatic scroll: the spy is muted until the row reaches the read
     line, the scroll ends, or the settle time passes */
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

  /* the spy: the lowest row crossing the read line names the active skill */
  useMountEffect(() => {
    const root = sheetRef.current;
    if (!root || typeof IntersectionObserver === 'undefined') return;
    const rows = Array.from(root.querySelectorAll<HTMLElement>('.sk-row'));
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
    const apply = (best: HTMLElement) => {
      const id = best.dataset.id;
      if (!id || id === activeRef.current) return;
      fromScroll.current = id;
      selectRef.current(id);
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
    rows.forEach((el) => observer.observe(el));
    /* a scroll that ends short of its row (the last rows cannot reach the
       line) keeps the selected row active; the spy reads again from here */
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

  /* the one dependency effect: the active skill changed from outside the
     book, so bring its row to the read line. The first run is the mount at
     the head; the landing on a deep link is a cut, every later change moves;
     a change the spy caused is left alone. */
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
    <div className='sk-book pt-book-col'>
      <BookHead
        title={SKILLS_TITLE}
        badge={<BadgeWords words={SKILLS.map((skill) => skill.id)} />}
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
