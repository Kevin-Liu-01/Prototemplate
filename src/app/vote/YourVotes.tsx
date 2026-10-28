'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { Icon } from '@/components/viewer/icons';
import { useLayoutWork } from '@/lib/use-layout-work';
import type { DecisionKind, MyVote, MyVotes, VoteOption, VoteState } from '@/lib/vote/types';

import { decisionPath, voteApi } from './api';
import EmailForm from './EmailForm';
import Face, { plateClass } from './Face';
import type { Boot } from './types';
import Unavailable from './Unavailable';
import { useReread } from './useReread';

type Side = 'left' | 'right';

const SIDES: readonly Side[] = ['left', 'right'];

/* a matchup by its two options, which no change moves */
function pairOf(row: MyVote): string {
  return `${row.left.key}|${row.right.key}`;
}

type YourVotesProps = {
  /** null data: no session yet, so the email form */
  boot: Boot<MyVotes | null>;
  id: string;
  /** the page's name, shown over the email form before the decision is known */
  title: string;
};

/**
 * /vote/[decision]/votes: every matchup the voter voted on, the pick that
 * counts pressed, and their likes. While the decision is open a tap on the
 * other option changes the vote at once and puts it back if the API
 * refuses; the likes save once their set changes. A closed decision shows
 * them read-only. Without a session the page asks for the email first.
 */
export default function YourVotes({ boot, id, title }: YourVotesProps) {
  if (boot.kind !== 'ready') return <Unavailable title={title} kind={boot.kind} />;
  return <Votes key={boot.at} initial={boot.data} at={boot.at} id={id} title={title} />;
}

function Votes({ initial, at, id, title }: { initial: MyVotes | null; at: number; id: string; title: string }) {
  const router = useRouter();
  const [mine, setMine] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const signedIn = mine !== null;
  const shown = useRef(signedIn);

  /* signing in takes focus to the heading, so a screen reader starts there */
  useLayoutWork(
    () => {
      if (shown.current === signedIn) return;
      shown.current = signedIn;
      headRef.current?.focus();
    },
    { dependencies: [signedIn] }
  );

  /* a page the router replays (Back, Forward) reads the votes again */
  useReread(at, () => void reload());

  /* a decision this voter may not open sends them to the hub */
  async function reload() {
    const result = await voteApi<MyVotes>(decisionPath(id, 'mine'));
    if (result.ok) setMine(result.data);
    else if (result.status === 401) setMine(null);
    else if (result.status === 404) router.replace('/vote');
    else setError(result.error);
  }

  /**
   * A refused change or save: the sentence, then the page that matches the
   * answer. Any other failure reads the votes again: a 409 means the page
   * is stale, and a dropped connection or a 5xx may have been written.
   */
  function refused(result: { status: number; error: string }) {
    setError(result.error);
    if (result.status === 401) setMine(null);
    else if (result.status === 404) router.replace('/vote');
    else void reload();
  }

  /* the email form holds a line for its sentence, as the ballot's does; the votes float theirs, so the list never moves */
  const errorLine = (
    <p className={mine ? 'vt-error is-float' : 'vt-error'} role='status' aria-live='polite' data-testid='mine-error'>
      {error}
    </p>
  );

  if (!mine) {
    return (
      <main className='vt-col is-narrow' data-testid='vote-mine'>
        <header className='vt-head'>
          <h1 ref={headRef} tabIndex={-1} className='vt-title'>
            {title}
          </h1>
        </header>
        <EmailForm onSession={reload} onError={setError} />
        {errorLine}
      </main>
    );
  }

  return (
    <main className='vt-col' data-testid='vote-mine'>
      <header className='vt-head'>
        <h1 ref={headRef} tabIndex={-1} className='vt-title'>
          {mine.decision.title}
        </h1>
        {mine.open ? null : <p className='vt-lead'>Voting is closed.</p>}
      </header>
      <Matchups
        id={id}
        mine={mine}
        onRows={(change) => setMine((current) => (current ? { ...current, rows: change(current.rows) } : current))}
        onError={setError}
        onRefused={refused}
      />
      {mine.likes ? (
        <Likes
          id={id}
          mine={mine}
          saved={mine.likes}
          onSaved={(likes) => setMine((current) => (current ? { ...current, likes } : current))}
          onError={setError}
          onRefused={refused}
        />
      ) : null}
      <p className='vt-who'>
        {mine.results ? (
          <Link href={`/vote/${id}/results`} className='pt-ib vt-chip' data-testid='mine-results'>
            See Results
          </Link>
        ) : null}
        <Link href='/vote' className='pt-ib vt-chip' data-testid='mine-all'>
          All Votes
        </Link>
      </p>
      {errorLine}
    </main>
  );
}

type SectionProps = {
  id: string;
  mine: MyVotes;
  onError: (message: string | null) => void;
  onRefused: (result: { status: number; error: string }) => void;
};

/** One plate per option of a matchup or the likes: a pressed toggle, inert while read-only or saving. */
function Plate({
  kind,
  option,
  pressed,
  inert,
  label,
  onPick,
  testId,
}: {
  kind: DecisionKind;
  option: VoteOption;
  pressed: boolean;
  inert: boolean;
  label: string | undefined;
  onPick: () => void;
  testId: string;
}) {
  return (
    <button
      type='button'
      className={plateClass(kind)}
      aria-pressed={pressed}
      aria-disabled={inert}
      aria-label={kind === 'text' ? undefined : label}
      onClick={inert ? undefined : onPick}
      data-testid={testId}
    >
      <Face kind={kind} option={option} />
      <span className='vt-check' aria-hidden='true'>
        <Icon name='check' size={14} />
      </span>
    </button>
  );
}

function Matchups({ id, mine, onRows, onError, onRefused }: SectionProps & { onRows: (change: (rows: MyVote[]) => MyVote[]) => void }) {
  const kind = mine.decision.kind;
  const busy = useRef(new Set<string>());
  const [saving, setSaving] = useState<ReadonlySet<string>>(new Set());

  function mark(pair: string, on: boolean) {
    if (on) busy.current.add(pair);
    else busy.current.delete(pair);
    setSaving(new Set(busy.current));
  }

  /* each row keeps its place, so the list never moves while a change saves */
  const put = (pair: string, row: MyVote) => onRows((rows) => rows.map((current) => (pairOf(current) === pair ? row : current)));

  async function pick(row: MyVote, side: Side) {
    const pair = pairOf(row);
    const winner = row[side].key;
    if (!mine.open || row.winner === winner || busy.current.has(pair)) return;
    mark(pair, true);
    onError(null);
    put(pair, { ...row, winner });
    const result = await voteApi<MyVote>(decisionPath(id, 'change'), { left: row.left.key, right: row.right.key, winner });
    mark(pair, false);
    if (result.ok) put(pair, result.data);
    else {
      put(pair, row);
      onRefused(result);
    }
  }

  if (mine.rows.length === 0) {
    return (
      <p className='vt-lead' data-testid='mine-empty'>
        No votes yet.
      </p>
    );
  }
  return (
    <div className={kind === 'text' ? 'vt-matches is-text' : 'vt-matches'} data-testid='mine-rows'>
      {mine.rows.map((row, index) => {
        const pair = pairOf(row);
        return (
          <div key={pair} className='vt-match' role='group' aria-label={`Matchup ${index + 1}`} aria-busy={saving.has(pair)} data-testid={`mine-row-${index + 1}`}>
            {SIDES.map((side) => (
              <Plate
                key={side}
                kind={kind}
                option={row[side]}
                pressed={row.winner === row[side].key}
                inert={!mine.open || saving.has(pair)}
                label={side === 'left' ? 'Left option' : 'Right option'}
                onPick={() => void pick(row, side)}
                testId={`mine-row-${index + 1}-${side}`}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}

/* the section stays mounted through a save, and Save is only ever aria-disabled, so focus stays on it */
function Likes({ id, mine, saved, onSaved, onError, onRefused }: SectionProps & { saved: string[]; onSaved: (likes: string[]) => void }) {
  const kind = mine.decision.kind;
  /* null: no edits, so the picks follow the saved likes, as a reread brings them */
  const [edits, setEdits] = useState<ReadonlySet<string> | null>(null);
  const [saving, setSaving] = useState(false);
  const picked = edits ?? new Set(saved);
  const changed = picked.size !== saved.length || saved.some((key) => !picked.has(key));
  const idle = saving || !changed || picked.size === 0;

  function toggle(key: string) {
    const next = new Set(picked);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setEdits(next);
  }

  async function save() {
    if (!mine.open || idle) return;
    setSaving(true);
    onError(null);
    const result = await voteApi<VoteState>(decisionPath(id, 'likes'), { liked: [...picked] });
    setSaving(false);
    if (result.ok) {
      onSaved(result.data.likes);
      setEdits(null);
    } else onRefused(result);
  }

  return (
    <section className='vt-sec' aria-labelledby='vt-likes-h'>
      <h2 id='vt-likes-h' className='vt-h2'>
        Likes
      </h2>
      <div className={kind === 'text' ? 'vt-grid is-text' : 'vt-grid'} role='group' aria-labelledby='vt-likes-h' aria-busy={saving}>
        {mine.options.map((option, index) => (
          <Plate
            key={option.key}
            kind={kind}
            option={option}
            pressed={picked.has(option.key)}
            inert={!mine.open || saving}
            label={`Option ${index + 1}`}
            onPick={() => toggle(option.key)}
            testId={`mine-like-${index + 1}`}
          />
        ))}
      </div>
      {mine.open ? (
        <div className='vt-actions'>
          <button
            type='button'
            className='vt-btn'
            aria-disabled={idle}
            onClick={() => void save()}
            data-testid='mine-likes-save'
          >
            Save
          </button>
        </div>
      ) : null}
    </section>
  );
}
