'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import type { FormEvent, RefObject } from 'react';

import { Icon } from '@/components/viewer/icons';
import { useLayoutWork } from '@/lib/use-layout-work';
import { useMountEffect } from '@/lib/use-mount-effect';
import type { VoteLogo, VoteState } from '@/lib/vote/types';

import { voteApi } from './api';
import Mark from './Mark';
import type { Boot } from './types';
import Unavailable from './Unavailable';
import { useHydrated } from './useHydrated';

type Step = 'email' | 'matchup' | 'likes' | 'done';
type Side = 'left' | 'right';

/** The step a state shows: the email form, the matchups, the likes, then done. */
function stepOf(state: VoteState): Step {
  if (!state.voter) return 'email';
  if (state.pair) return 'matchup';
  if (state.needsLikes) return 'likes';
  return 'done';
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Every logo file is fetched once, when a state first names it, so the
   next pair is in the cache before it is shown. */
const preloaded = new Set<string>();

function preload(logos: readonly VoteLogo[]) {
  for (const { src } of logos) {
    if (preloaded.has(src)) continue;
    preloaded.add(src);
    const image = new Image();
    image.decoding = 'async';
    image.src = src;
  }
}

/** The pieces every step reads from the ballot. */
type StepProps = {
  state: VoteState;
  headRef: RefObject<HTMLHeadingElement | null>;
  /** a new state from the API */
  onState: (next: VoteState) => void;
  /** reads the state again, after a 409 or a lost session */
  onRefresh: () => Promise<void>;
  onError: (message: string | null) => void;
};

type VoteAppProps = { boot: Boot<VoteState>; title: string };

/**
 * /vote: email, then one matchup at a time, then every logo the voter
 * likes, then done. The server paints the voter's current step, and each
 * answer from the API is the next state, so the screen never guesses.
 */
export default function VoteApp({ boot, title }: VoteAppProps) {
  if (boot.kind !== 'ready') return <Unavailable title={title} kind={boot.kind} />;
  return <Ballot initial={boot.data} title={title} />;
}

function Ballot({ initial, title }: { initial: VoteState; title: string }) {
  const [state, setState] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const headRef = useRef<HTMLHeadingElement>(null);
  const shownStep = useRef<Step>(stepOf(initial));
  const step = stepOf(state);

  useMountEffect(() => {
    preload(initial.logos);
  });

  /* a new step takes focus to its heading, so a screen reader starts there */
  useLayoutWork(
    () => {
      if (shownStep.current === step) return;
      shownStep.current = step;
      headRef.current?.focus();
    },
    { dependencies: [step] }
  );

  function apply(next: VoteState) {
    preload(next.logos);
    setState(next);
  }

  async function refresh() {
    const result = await voteApi<VoteState>('/api/vote/state');
    if (result.ok) apply(result.data);
    else setError(result.error);
  }

  async function switchEmail() {
    if (leaving) return;
    setLeaving(true);
    setError(null);
    const result = await voteApi<VoteState>('/api/vote/signout', {});
    setLeaving(false);
    if (result.ok) apply(result.data);
    else setError(result.error);
  }

  const props: StepProps = { state, headRef, onState: apply, onRefresh: refresh, onError: setError };

  return (
    <main className={step === 'email' ? 'vt-col is-narrow' : 'vt-col'} data-step={step} data-testid='vote-app'>
      {step === 'email' ? <EmailStep {...props} title={title} /> : null}
      {step === 'matchup' ? <MatchupStep {...props} /> : null}
      {step === 'likes' ? <LikesStep {...props} /> : null}
      {step === 'done' ? <DoneStep {...props} /> : null}
      <p className='vt-error' role='status' aria-live='polite' data-testid='vote-error'>
        {error}
      </p>
      {state.voter ? (
        <p className='vt-who'>
          <span className='vt-who-email'>{state.voter.email}</span>
          <button
            type='button'
            className='pt-ib vt-chip'
            onClick={() => void switchEmail()}
            disabled={leaving}
            data-testid='vote-switch'
          >
            Switch Email
          </button>
        </p>
      ) : null}
    </main>
  );
}

function EmailStep({ headRef, onState, onError, title }: StepProps & { title: string }) {
  const [sending, setSending] = useState(false);
  const ready = useHydrated();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const email = String(new FormData(event.currentTarget).get('email') ?? '').trim();
    if (!EMAIL.test(email)) {
      onError('Enter a valid email address.');
      return;
    }
    setSending(true);
    onError(null);
    const result = await voteApi<VoteState>('/api/vote/session', { email });
    setSending(false);
    if (result.ok) onState(result.data);
    else onError(result.error);
  }

  return (
    <>
      <header className='vt-head'>
        <h1 ref={headRef} tabIndex={-1} className='vt-title'>
          {title}
        </h1>
      </header>
      <form className='vt-form' method='post' onSubmit={(event) => void submit(event)} noValidate data-testid='vote-email-form'>
        <label className='vt-sr' htmlFor='vt-email'>
          Email
        </label>
        <input
          id='vt-email'
          className='vt-input'
          name='email'
          type='email'
          inputMode='email'
          autoComplete='email'
          autoCapitalize='none'
          spellCheck={false}
          placeholder='Email'
          required
          data-testid='vote-email'
        />
        <button type='submit' className='vt-btn' disabled={!ready || sending} data-ready={ready} data-testid='vote-start'>
          Start
        </button>
      </form>
    </>
  );
}

function MatchupStep({ state, headRef, onState, onRefresh, onError }: StepProps) {
  const [chosen, setChosen] = useState<Side | null>(null);
  const busy = useRef(false);
  const pair = state.pair;
  const { done, total } = state.progress;

  async function choose(side: Side) {
    if (!pair || busy.current) return;
    busy.current = true;
    setChosen(side);
    onError(null);
    const { left, right } = pair;
    const result = await voteApi<VoteState>('/api/vote/vote', {
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

  /* 1 or ArrowLeft picks the left logo, 2 or ArrowRight the right one */
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
      <header className='vt-head'>
        <h1 ref={headRef} tabIndex={-1} className='vt-title'>
          Pick the logo you prefer
        </h1>
      </header>
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
            className={chosen === side ? 'vt-plate is-chosen' : 'vt-plate'}
            aria-label={side === 'left' ? 'Left logo' : 'Right logo'}
            aria-keyshortcuts={side === 'left' ? '1 ArrowLeft' : '2 ArrowRight'}
            aria-disabled={chosen !== null}
            onClick={() => void choose(side)}
            data-testid={`vote-${side}`}
          >
            <Mark src={pair[side].src} />
            <kbd className='vt-key' aria-hidden='true'>
              {index + 1}
            </kbd>
          </button>
        ))}
      </div>
    </>
  );
}

function LikesStep({ state, headRef, onState, onRefresh, onError }: StepProps) {
  const active = new Set(state.logos.map((logo) => logo.key));
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
    const result = await voteApi<VoteState>('/api/vote/likes', { liked: [...picked].filter((key) => active.has(key)) });
    setSaving(false);
    if (result.ok) onState(result.data);
    else if (result.status === 409 || result.status === 401) await onRefresh();
    else onError(result.error);
  }

  return (
    <>
      <header className='vt-head'>
        <h1 ref={headRef} tabIndex={-1} className='vt-title'>
          Pick every logo you like
        </h1>
      </header>
      <div className='vt-grid' role='group' aria-label='Logos'>
        {state.logos.map((logo, index) => (
          <button
            type='button'
            key={logo.key}
            className='vt-plate'
            aria-pressed={picked.has(logo.key)}
            aria-label={`Logo ${index + 1}`}
            onClick={() => toggle(logo.key)}
            data-testid={`vote-like-${index + 1}`}
          >
            <Mark src={logo.src} />
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

function DoneStep({ state, headRef }: StepProps) {
  return (
    <>
      <header className='vt-head'>
        <h1 ref={headRef} tabIndex={-1} className='vt-title'>
          Your votes are in
        </h1>
      </header>
      {state.complete ? (
        <div className='vt-actions'>
          <Link href='/vote/results' className='vt-btn' data-testid='vote-results-link'>
            See Results
          </Link>
        </div>
      ) : null}
    </>
  );
}
