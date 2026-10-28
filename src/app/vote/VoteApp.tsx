'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';

import { Icon } from '@/components/viewer/icons';
import { useLayoutWork } from '@/lib/use-layout-work';
import { useMountEffect } from '@/lib/use-mount-effect';
import type { DecisionHead, VoteOption, VoteState } from '@/lib/vote/types';

import { decisionPath, voteApi } from './api';
import EmailForm from './EmailForm';
import Face, { plateClass } from './Face';
import type { Boot } from './types';
import Unavailable from './Unavailable';
import { useReread } from './useReread';
import Who from './Who';

type Step = 'email' | 'matchup' | 'likes' | 'done' | 'closed';
type Side = 'left' | 'right';

/**
 * The step a state shows: the email form, the matchups, the likes, then
 * done. A decision that is not open takes no votes: closed for a voter, and
 * draft or archived for the admin, who may open it but not vote in it.
 */
function stepOf(state: VoteState | null): Step {
  if (!state) return 'email';
  if (state.decision.status !== 'open') return 'closed';
  if (state.pair) return 'matchup';
  if (state.needsLikes) return 'likes';
  return 'done';
}

/* Every option file is fetched once, when a state first names it, so the
   next pair is in the cache before it is shown. A text option has none. */
const preloaded = new Set<string>();

function preload(options: readonly VoteOption[]) {
  for (const { src } of options) {
    if (!src || preloaded.has(src)) continue;
    preloaded.add(src);
    const image = new Image();
    image.decoding = 'async';
    image.src = src;
  }
}

/** The pieces every step reads from the ballot. */
type StepProps = {
  id: string;
  state: VoteState;
  headRef: RefObject<HTMLElement | null>;
  /** a new state from the API */
  onState: (next: VoteState) => void;
  /** reads the state again, after a 409, a lost session or a replayed page */
  onRefresh: () => Promise<void>;
  onError: (message: string | null) => void;
};

type VoteAppProps = {
  /** null data: no session yet, so the email form */
  boot: Boot<VoteState | null>;
  id: string;
  /** the page's name, shown over the email form before the decision is known */
  title: string;
};

/**
 * /vote/[decision]: one matchup at a time, then every option the voter
 * likes, then done. The server paints the voter's current step, and each
 * answer from the API is the next state, so the screen never guesses.
 * Without a session the page asks for the email first; the decision's
 * title shows only once the API has let this voter in. Each server read
 * starts the ballot over (its key), and a read the router replays is read
 * again from the API.
 */
export default function VoteApp({ boot, id, title }: VoteAppProps) {
  if (boot.kind !== 'ready') return <Unavailable title={title} kind={boot.kind} />;
  return <Ballot key={boot.at} initial={boot.data} at={boot.at} id={id} title={title} />;
}

function Ballot({ initial, at, id, title }: { initial: VoteState | null; at: number; id: string; title: string }) {
  const router = useRouter();
  const [state, setState] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const headRef = useRef<HTMLElement>(null);
  const step = stepOf(state);
  const shownStep = useRef<Step>(step);

  useMountEffect(() => {
    if (initial) preload(initial.options);
  });
  useReread(at, () => void refresh());

  /* a new step takes focus to its head, so a screen reader starts there */
  useLayoutWork(
    () => {
      if (shownStep.current === step) return;
      shownStep.current = step;
      headRef.current?.focus();
    },
    { dependencies: [step] }
  );

  function apply(next: VoteState) {
    preload(next.options);
    setState(next);
  }

  /* a closed decision shows its ranking, which the server paints; a decision this voter may not open sends them to the hub */
  async function refresh() {
    const result = await voteApi<VoteState>(decisionPath(id, 'state'));
    if (result.ok && result.data.decision.status === 'closed' && result.data.results) router.refresh();
    else if (result.ok) apply(result.data);
    else if (result.status === 401) setState(null);
    else if (result.status === 404) router.replace('/vote');
    else setError(result.error);
  }

  async function switchEmail() {
    if (leaving) return;
    setLeaving(true);
    setError(null);
    const result = await voteApi<unknown>('/api/vote/signout', {});
    setLeaving(false);
    if (result.ok) setState(null);
    else setError(result.error);
  }

  const frame = (inner: ReactNode) => (
    <main className={step === 'email' ? 'vt-col is-narrow' : 'vt-col'} data-step={step} data-testid='vote-app'>
      {inner}
      <p className='vt-error' role='status' aria-live='polite' data-testid='vote-error'>
        {error}
      </p>
      {state ? (
        <Who email={state.voter.email} leaving={leaving} onSwitch={() => void switchEmail()}>
          <Link href='/vote' className='pt-ib vt-chip' data-testid='vote-all'>
            All Votes
          </Link>
        </Who>
      ) : null}
    </main>
  );

  if (!state) {
    return frame(
      <>
        <header ref={headRef} tabIndex={-1} className='vt-head'>
          <h1 className='vt-title'>{title}</h1>
        </header>
        <EmailForm onSession={refresh} onError={setError} />
      </>
    );
  }

  const props: StepProps = { id, state, headRef, onState: apply, onRefresh: refresh, onError: setError };
  return frame(
    <>
      {step === 'matchup' ? <MatchupStep {...props} /> : null}
      {step === 'likes' ? <LikesStep {...props} /> : null}
      {step === 'done' ? <EndStep {...props} line='Your votes are in.' /> : null}
      {step === 'closed' ? <EndStep {...props} line='Voting is closed.' /> : null}
    </>
  );
}

/** The decision's title, then the question or the step's one line under it. */
function Head({ decision, headRef, line }: { decision: DecisionHead; headRef: RefObject<HTMLElement | null>; line: string }) {
  return (
    <header ref={headRef} tabIndex={-1} className='vt-head'>
      <h1 className='vt-title'>{decision.title}</h1>
      {line ? <p className='vt-lead'>{line}</p> : null}
    </header>
  );
}

function MatchupStep({ id, state, headRef, onState, onRefresh, onError }: StepProps) {
  const [chosen, setChosen] = useState<Side | null>(null);
  const busy = useRef(false);
  const pair = state.pair;
  const kind = state.decision.kind;
  const { done, total } = state.progress;

  async function choose(side: Side) {
    if (!pair || busy.current) return;
    busy.current = true;
    setChosen(side);
    onError(null);
    const { left, right } = pair;
    const result = await voteApi<VoteState>(decisionPath(id, 'vote'), {
      left: left.key,
      right: right.key,
      winner: side === 'left' ? left.key : right.key,
    });
    busy.current = false;
    setChosen(null);
    if (result.ok) onState(result.data);
    else if (result.status === 409 || result.status === 401) await onRefresh();
    else onError(result.error);
  }

  /* 1 or ArrowLeft picks the left option, 2 or ArrowRight the right one */
  useLayoutWork(
    () => {
      const onKey = (event: KeyboardEvent) => {
        if (event.defaultPrevented || event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
        const target = event.target;
        if (target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
        const side: Side | null =
          event.key === '1' || event.key === 'ArrowLeft' ? 'left' : event.key === '2' || event.key === 'ArrowRight' ? 'right' : null;
        if (!side) return;
        event.preventDefault();
        void choose(side);
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    },
    { dependencies: [pair] }
  );

  if (!pair) return null;
  const sides: readonly Side[] = ['left', 'right'];

  return (
    <>
      <Head decision={state.decision} headRef={headRef} line={state.decision.question} />
      <div
        className='vt-progress'
        role='progressbar'
        aria-label='Matchups'
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        aria-valuetext={`${done} of ${total}`}
        data-testid='vote-progress'
      >
        <span className='vt-progress-track'>
          <span className='vt-progress-fill' style={{ '--vt-p': total > 0 ? Math.min(1, done / total) : 0 }} />
        </span>
        <span className='vt-progress-count'>
          {done} / {total}
        </span>
      </div>
      <div className={chosen ? 'vt-pair is-busy' : 'vt-pair'} aria-busy={chosen !== null}>
        {sides.map((side, index) => (
          <button
            type='button'
            key={side}
            className={plateClass(kind, chosen === side && 'is-chosen')}
            aria-label={kind === 'text' ? undefined : side === 'left' ? 'Left option' : 'Right option'}
            aria-keyshortcuts={side === 'left' ? '1 ArrowLeft' : '2 ArrowRight'}
            aria-disabled={chosen !== null}
            onClick={() => void choose(side)}
            data-testid={`vote-${side}`}
          >
            <Face kind={kind} option={pair[side]} />
            <kbd className='vt-key' aria-hidden='true'>
              {index + 1}
            </kbd>
          </button>
        ))}
      </div>
    </>
  );
}

function LikesStep({ id, state, headRef, onState, onRefresh, onError }: StepProps) {
  const kind = state.decision.kind;
  const active = new Set(state.options.map((option) => option.key));
  const [picked, setPicked] = useState<ReadonlySet<string>>(() => new Set(state.likes.filter((key) => active.has(key))));
  const [saving, setSaving] = useState(false);

  function toggle(key: string) {
    setPicked((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function submit() {
    if (saving || picked.size === 0) return;
    setSaving(true);
    onError(null);
    const result = await voteApi<VoteState>(decisionPath(id, 'likes'), { liked: [...picked].filter((key) => active.has(key)) });
    setSaving(false);
    if (result.ok) onState(result.data);
    else if (result.status === 409 || result.status === 401) await onRefresh();
    else onError(result.error);
  }

  return (
    <>
      <Head decision={state.decision} headRef={headRef} line='Pick every one you like.' />
      <div className={kind === 'text' ? 'vt-grid is-text' : 'vt-grid'} role='group' aria-label='Options'>
        {state.options.map((option, index) => (
          <button
            type='button'
            key={option.key}
            className={plateClass(kind)}
            aria-pressed={picked.has(option.key)}
            aria-label={kind === 'text' ? undefined : `Option ${index + 1}`}
            onClick={() => toggle(option.key)}
            data-testid={`vote-like-${index + 1}`}
          >
            <Face kind={kind} option={option} />
            <span className='vt-check' aria-hidden='true'>
              <Icon name='check' size={14} />
            </span>
          </button>
        ))}
      </div>
      <div className='vt-actions'>
        <button
          type='button'
          className='vt-btn'
          disabled={saving || picked.size === 0}
          onClick={() => void submit()}
          data-testid='vote-likes-submit'
        >
          Submit
        </button>
      </div>
    </>
  );
}

function EndStep({ id, state, headRef, line }: StepProps & { line: string }) {
  return (
    <>
      <Head decision={state.decision} headRef={headRef} line={line} />
      {state.results ? (
        <div className='vt-actions'>
          <Link href={`/vote/${id}/results`} className='vt-btn' data-testid='vote-results-link'>
            See Results
          </Link>
        </div>
      ) : null}
    </>
  );
}
