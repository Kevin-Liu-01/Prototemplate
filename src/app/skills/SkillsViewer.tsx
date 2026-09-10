'use client';

import { useGSAP } from '@gsap/react';
import Link from 'next/link';
import type { MouseEvent, RefObject } from 'react';
import { useRef } from 'react';

import { gtText } from '@/components/viewer/GtWord';
import { Sheet } from '@/components/viewer/Sheet';
import { usePtShell } from '@/components/viewer/shell-context';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { cn } from '@/lib/cn';
import type { ShellMode } from '@/lib/shell-data';
import { SKILLS, skillHref } from '@/lib/skills';
import { useMountEffect } from '@/lib/use-mount-effect';

import { BLOCKS, SECTIONS } from './model';
import type { Numbered } from './model';

import './skills.css';

const SKILLS_TITLE = 'Skills';
const SKILLS_MODES: readonly ShellMode[] = ['book', 'grid'];
const BOOK_LEAD =
  'The working skills behind the design lab and the product. Each is a SKILL.md an agent loads for one kind of task, published here by name and description: the engineering and productivity skills from the wiki, and the General Translation repository skills as a third group. Every skill has its own page with the full SKILL.md; the list on the left follows the row in view, and a row opens the page.';

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
};

/**
 * The skills read top to bottom inside the flow sheet: a head with the
 * counts, a contents list, then every category under a divider as ruled
 * rows, one per skill. Owns the reading state: an IntersectionObserver on
 * the sheet marks the row under the read line and selects it through the
 * shell (the list and the hash follow); a selection from anywhere else
 * scrolls the sheet to the row and mutes the spy until the row arrives, so
 * the rows the scroll passes are never selected. A deep link lands without
 * motion; the spy never selects at the head, so the first skill stays
 * marked there.
 */
function SkillsBook({ sheetRef, jumpRef, activeOut }: SkillsBookProps) {
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
    <div className='sk-book'>
      <header className='sk-head'>
        <div>
          <h1>{SKILLS_TITLE}</h1>
          <p>{BOOK_LEAD}</p>
        </div>
        <div className='sk-meta'>
          <span>{SKILLS.length} skills</span>
          {BLOCKS.map((block) => (
            <span key={block.category}>
              {block.label} {block.rows.length}
            </span>
          ))}
        </div>
      </header>

      <nav className='sk-toc' aria-label='Contents'>
        {BLOCKS.map((block) => {
          const first = block.rows[0];
          if (!first) return null;
          return (
            <a key={block.category} href={`#${first.skill.id}`} onClick={(e) => onContents(e, first.skill.id)}>
              <span>{block.label}</span>
              <small>{rangeText(block.rows)}</small>
            </a>
          );
        })}
      </nav>

      {BLOCKS.map((block) => (
        <section key={block.category} className='sk-cat' aria-labelledby={`sk-${block.category}`}>
          <div className='sk-sec'>
            <small>
              <span>Section {block.ordinal}</span>
              <span>Skills {rangeText(block.rows)}</span>
            </small>
            <h2 id={`sk-${block.category}`}>{block.label}</h2>
          </div>
          {block.rows.map(({ skill, n }) => (
            /* the row is the link to the skill's page; the spy reads its data-id. Prefetch is
               off: two hundred rows must not fetch every page that scrolls into view; the hover
               prefetch stays, so a click is as quick */
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
                <h3>{skill.name}</h3>
                {/* the description is the SKILL.md frontmatter verbatim; the standalone word GT renders as the mark */}
                <p>{gtText(skill.description)}</p>
              </div>
            </Link>
          ))}
        </section>
      ))}
    </div>
  );
}

/**
 * The skills on the viewer shell: three sections in the list (Engineering,
 * Productivity, General Translation) nested under Knowledge > Skills with
 * one row per skill, the whole set as ruled rows inside the 1280px flow
 * sheet, each row a link to the skill's own page (/skills/<slug>), and
 * every skill as a text tile in the grid (skills.css lays the shell's rows
 * out as tiles there). Flow keys, so Space and the arrows scroll; the
 * sidebar filter matches names and descriptions. The hash names the row in
 * view; a row in the list opens the page.
 */
export default function SkillsViewer() {
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
      <Sheet variant='flow' width={1280} scrollRef={sheetRef}>
        <SkillsBook sheetRef={sheetRef} jumpRef={jumpRef} activeOut={activeOut} />
      </Sheet>
    </ViewerShell>
  );
}
