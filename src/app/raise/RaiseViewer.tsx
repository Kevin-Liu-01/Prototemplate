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
import type { ShellMode } from '@/lib/shell-data';

import type { RaiseIndex, RaiseViewRound, RaiseViewRow } from './model';
import { SECTION, SECTION_LABEL, stateWord } from './sections';
import { CutFigure, CutFrame, OtherCuts } from './RaiseMedia';

import '../graphics/graphics.css';
import './raise.css';

const TITLE = PAGE_NAMES.raise.name;
const MODES: readonly ShellMode[] = ['book'];
const LEAD =
  'The media of the General Translation funding announcement. The finals come first in posting order, then the cuts they replaced, the rounds that made them and the method.';

/** The section leads under each divider. */
const LEADS = {
  finals: 'Every deliverable once, with the cut that shipped in the frame and its other cuts folded under it.',
  history: 'The cuts the finals replaced: round 10 of the translation demo, the earlier posters, walls and films, and the drafts before the launch films. None of them is in the finals.',
  rounds: 'The rounds of work in date order. Each page gives the account of how Kevin directed the round, the files it showed and what carried forward.',
  method: 'The working rules the film, still and page lanes settled on.',
} as const;

/** A deliverable: its title, place and note, the frame with its cuts, and the folded cuts. */
function DeliverableRow({ row, active }: { row: RaiseViewRow; active: boolean }) {
  return (
    <article id={row.id} className={cn('gx-row', active && 'is-active')} data-id={row.id} aria-current={active ? 'true' : undefined}>
      <div className='gx-n'>
        <b>{row.n}</b>
      </div>
      <div className='gx-body'>
        <h3>{row.title}</h3>
        <p className='ra-place'>
          {row.place}
          {row.note ? ` · ${row.note}` : null}
          {row.link ? (
            <>
              {' '}
              <Link href={row.link.href}>{row.link.label}</Link>
            </>
          ) : null}
        </p>
        <CutFigure title={row.title} cuts={row.main} />
        <OtherCuts title={row.title} cuts={row.others} />
      </div>
    </article>
  );
}

/** A round: its title and lead, four of its files, and its date, part and counts, linked to its page. */
function RoundRow({ round, active }: { round: RaiseViewRound; active: boolean }) {
  const href = `/raise/${round.slug}`;
  return (
    <article id={round.id} className={cn('gx-row ra-round', active && 'is-active')} data-id={round.id} aria-current={active ? 'true' : undefined}>
      <div className='gx-n'>
        <b>{round.n}</b>
      </div>
      <div className='gx-body'>
        <h3>
          <Link href={href}>{round.title}</Link>
        </h3>
        {round.lead ? <p>{round.lead}</p> : null}
        {round.thumbs.length ? (
          <div className='ra-strip'>
            {round.thumbs.map((cut) =>
              cut.kind === 'still' ? (
                <Link key={cut.key} className='gx-frame ra-frame' href={href} aria-label={`${round.title}: ${cut.label}`} tabIndex={-1}>
                  <img alt='' decoding='async' loading='lazy' src={cut.image} />
                </Link>
              ) : (
                <CutFrame key={cut.key} cut={cut} name={`${round.title}, ${cut.label}`} />
              )
            )}
          </div>
        ) : null}
        <p className='gx-line'>
          {round.tag} · {round.day} · {round.part} · {round.shown} shown
          {round.more ? `, ${round.more} more` : ''}
          {round.state !== 'done' ? ` · ${stateWord(round.state)}` : ''}
        </p>
      </div>
    </article>
  );
}

type Part = { key: keyof typeof SECTION; first: string; run: readonly { n: string }[] };

type RaiseBookProps = {
  index: RaiseIndex;
  sheetRef: RefObject<HTMLDivElement | null>;
  jumpRef: RefObject<(id: string) => void>;
  activeOut: RefObject<string>;
  updated: PageUpdated;
};

/**
 * The index read top to bottom inside the flow sheet: the head with the
 * counts and a contents list, then the finals, the history, the rounds and
 * the method under their dividers as ruled rows in the graphics book's row
 * grammar. The shared read line marks the row under it in the list, and a
 * selection from anywhere else jumps the sheet to its row.
 */
function RaiseBook({ index, sheetRef, jumpRef, activeOut, updated }: RaiseBookProps) {
  const { finals, history, rounds, method, span } = index;
  const { active, select } = usePtShell();
  activeOut.current = active;
  const { jump, onContents } = useReadLine({ rootRef: sheetRef, selector: '.gx-row', active, select });
  jumpRef.current = jump;

  const parts: Part[] = [
    { key: 'finals', first: finals[0]?.id ?? '', run: finals },
    { key: 'history', first: history[0]?.id ?? '', run: history },
    { key: 'rounds', first: rounds[0]?.id ?? '', run: rounds },
    { key: 'method', first: method.id, run: [method] },
  ];
  const cuts = finals.reduce((n, row) => n + row.main.length + row.others.length, 0);

  const divider = (part: Part, i: number) => (
    <div className='gx-sec pt-book-sec'>
      <small>
        <span>Section {i + 1}</span>
        <span>{rangeText(part.run)}</span>
      </small>
      <div>
        <h2 id={`ra-${part.key}`}>{SECTION_LABEL[part.key]}</h2>
        <p>{LEADS[part.key]}</p>
      </div>
    </div>
  );

  return (
    <div className='gx-book ra-book pt-book-col'>
      <BookHead
        skill='gt-films'
        title={TITLE}
        lead={LEAD}
        updated={updated}
        facts={[
          { icon: 'done', key: 'Finals', value: `${finals.length} deliverables, ${cuts} cuts` },
          { icon: 'queue-list', key: 'Rounds', value: rounds.length },
          { icon: 'duration', key: 'Dates', value: span ? `${span.from} to ${span.to}` : 'None' },
        ]}
        contents={
          <nav className='gx-toc pt-book-toc' aria-label='Contents'>
            {parts.map((part) =>
              part.first ? (
                <a key={part.key} href={`#${part.first}`} onClick={(e) => onContents(e, part.first)}>
                  <span>{SECTION_LABEL[part.key]}</span>
                  <small>{rangeText(part.run)}</small>
                </a>
              ) : null
            )}
          </nav>
        }
      />

      {parts.map((part, i) => {
        if (!part.first) return null;
        return (
          <section key={part.key} className='pt-book-part gx-cat' aria-labelledby={`ra-${part.key}`} data-section={SECTION[part.key]}>
            {divider(part, i)}
            {part.key === 'finals' || part.key === 'history'
              ? (part.key === 'finals' ? finals : history).map((row) => <DeliverableRow key={row.id} row={row} active={row.id === active} />)
              : null}
            {part.key === 'rounds' ? rounds.map((round) => <RoundRow key={round.id} round={round} active={round.id === active} />) : null}
            {part.key === 'method' ? (
              <article id={method.id} className={cn('gx-row', method.id === active && 'is-active')} data-id={method.id}>
                <div className='gx-n'>
                  <b>{method.n}</b>
                </div>
                <div className='gx-body'>
                  <h3>
                    <Link href='/raise/method'>{method.title}</Link>
                  </h3>
                  <p>{method.lead}</p>
                  <p className='gx-line'>{method.subjects.join(' · ')}</p>
                </div>
              </article>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

type RaiseViewerProps = { index: RaiseIndex; updated: PageUpdated };

/**
 * /raise on the viewer shell, in the format of /motion: the finals, the
 * history, the rounds and the method nested under Knowledge > Raise in the
 * list, the page as ruled rows inside the flow sheet. Flow keys, so Space
 * and the arrows scroll. A round's row in the list opens its page; the spy
 * only selects, so scrolling past a round never navigates.
 */
export default function RaiseViewer({ index, updated }: RaiseViewerProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const jumpRef = useRef<(id: string) => void>(() => {});
  const activeOut = useRef(index.finals[0]?.id ?? '');
  return (
    <ViewerShell
      id='raise'
      title={TITLE}
      mark='pt'
      count={`${index.finals.length} finals`}
      sections={index.sections}
      modes={MODES}
      thumb='row'
      surfaces='site'
      keys='flow'
      noun='piece'
      onSelect={(id) => {
        if (id === activeOut.current) jumpRef.current(id);
      }}
    >
      <Sheet variant='flow' scrollRef={sheetRef}>
        <RaiseBook index={index} sheetRef={sheetRef} jumpRef={jumpRef} activeOut={activeOut} updated={updated} />
      </Sheet>
    </ViewerShell>
  );
}
