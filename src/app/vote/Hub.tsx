'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';

import { Icon } from '@/components/viewer/icons';
import { useLayoutWork } from '@/lib/use-layout-work';
import type { HubRow, HubState } from '@/lib/vote/types';

import { voteApi } from './api';
import EmailForm from './EmailForm';
import type { Boot } from './types';
import Unavailable from './Unavailable';
import { useReread } from './useReread';
import Who from './Who';

const SIGNED_OUT: HubState = { voter: null, decisions: [] };

function isHub(value: unknown): value is HubState {
  return typeof value === 'object' && value !== null && Array.isArray((value as { decisions?: unknown }).decisions);
}

/** A row's progress: the new options since the voter finished, Done, or the matchups so far. */
function progressOf(row: HubRow): string {
  if (row.fresh > 0) return `${row.fresh} new`;
  if (row.complete) return 'Done';
  return `${row.progress.done} / ${row.progress.total}`;
}

type HubProps = { boot: Boot<HubState>; title: string };

/**
 * /vote: the email form, then every decision this voter can see, open and
 * closed, each with its progress. The server paints the right one first.
 */
export default function Hub({ boot, title }: HubProps) {
  if (boot.kind !== 'ready') return <Unavailable title={title} kind={boot.kind} />;
  return <HubView initial={boot.data} at={boot.at} title={title} />;
}

function HubView({ initial, at, title }: { initial: HubState; at: number; title: string }) {
  const [hub, setHub] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const headRef = useRef<HTMLHeadingElement>(null);
  const signedIn = hub.voter !== null;
  const shown = useRef(signedIn);

  /* signing in or out takes focus to the heading, so a screen reader starts there */
  useLayoutWork(
    () => {
      if (shown.current === signedIn) return;
      shown.current = signedIn;
      headRef.current?.focus();
    },
    { dependencies: [signedIn] }
  );

  /* a page the router replays (Back, Forward) reads the hub again, so progress and new counts are current */
  useReread(at, () => void reload());

  async function reload() {
    const result = await voteApi<HubState>('/api/vote/hub');
    if (result.ok) setHub(result.data);
    else setError(result.error);
  }

  async function onSession(data: unknown) {
    if (isHub(data) && data.voter) setHub(data);
    else await reload();
  }

  async function switchEmail() {
    if (leaving) return;
    setLeaving(true);
    setError(null);
    const result = await voteApi<unknown>('/api/vote/signout', {});
    setLeaving(false);
    if (result.ok) setHub(SIGNED_OUT);
    else setError(result.error);
  }

  return (
    <main className={signedIn ? 'vt-col' : 'vt-col is-narrow'} data-testid='vote-hub'>
      <header className='vt-head'>
        <h1 ref={headRef} tabIndex={-1} className='vt-title'>
          {title}
        </h1>
      </header>
      {hub.voter ? <Decisions rows={hub.decisions} /> : <EmailForm onSession={onSession} onError={setError} />}
      <p className='vt-error' role='status' aria-live='polite' data-testid='vote-error'>
        {error}
      </p>
      {hub.voter ? <Who email={hub.voter.email} leaving={leaving} onSwitch={() => void switchEmail()} /> : null}
    </main>
  );
}

function Decisions({ rows }: { rows: HubRow[] }) {
  if (rows.length === 0) {
    return (
      <p className='vt-lead' data-testid='vote-hub-empty'>
        No vote is open to this email.
      </p>
    );
  }
  return (
    <ul className='vt-list' data-testid='vote-hub-list'>
      {rows.map((row) => (
        <li key={row.id}>
          <Link href={`/vote/${row.id}`} className='vt-row' data-testid={`vote-hub-${row.id}`}>
            <span className='vt-row-title'>{row.title}</span>
            <span className={row.status === 'open' ? 'vt-status is-open' : 'vt-status'}>{row.status === 'open' ? 'Open' : 'Closed'}</span>
            <span className={row.fresh > 0 ? 'vt-row-progress is-new' : 'vt-row-progress'}>{progressOf(row)}</span>
            <span className='vt-row-go' aria-hidden='true'>
              <Icon name='next' size={16} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
