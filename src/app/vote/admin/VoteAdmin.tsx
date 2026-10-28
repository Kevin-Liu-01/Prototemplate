'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FormEvent } from 'react';

import { isDecisionId, keyFromName, KINDS, RESERVED_IDS } from '@/lib/vote/decisions';
import type { AdminDecisionRow, AdminList, DecisionKind } from '@/lib/vote/types';

import type { Boot } from '../types';
import Unavailable from '../Unavailable';
import { useHydrated } from '../useHydrated';
import KeyForm from './KeyForm';
import { KIND_LABEL, STATUS_LABEL } from './labels';
import { useAdminPanel } from './useAdminPanel';
import type { Change } from './useAdminPanel';

type AdminBoot = Boot<AdminList> | { kind: 'signed-out' };
type VoteAdminProps = { boot: AdminBoot; title: string };

/**
 * /vote/admin: the key form, then every decision with its status, kind and
 * counts, and the form that starts a new one. A decision's own panel is
 * /vote/admin/[decision].
 */
export default function VoteAdmin({ boot, title }: VoteAdminProps) {
  if (boot.kind === 'off' || boot.kind === 'error') return <Unavailable title={title} kind={boot.kind} />;
  return <Admin initial={boot.kind === 'ready' ? boot.data : null} at={boot.kind === 'ready' ? boot.at : 0} title={title} />;
}

function Admin({ initial, at, title }: { initial: AdminList | null; at: number; title: string }) {
  const panel = useAdminPanel<AdminList>('/api/vote/admin/decisions', initial, at);
  const { data, busy, error } = panel;

  if (!data) return <KeyForm title={title} busy={busy} error={error} onSignIn={panel.signIn} />;

  return (
    <main className='vt-col is-wide' data-testid='vote-admin'>
      <header className='vt-head vt-head-row'>
        <h1 className='vt-title'>{title}</h1>
        <div className='vt-tools'>
          <button type='button' className='pt-ib vt-chip' onClick={() => void panel.signOut()} disabled={busy} data-testid='admin-signout'>
            Sign Out
          </button>
        </div>
      </header>
      <p className='vt-error is-float' role='status' aria-live='polite' data-testid='admin-error'>
        {error}
      </p>
      <Decisions rows={data.decisions} />
      <NewDecision taken={new Set(data.decisions.map((row) => row.id))} busy={busy} change={panel.change} onError={panel.setError} />
    </main>
  );
}

function Decisions({ rows }: { rows: AdminDecisionRow[] }) {
  if (rows.length === 0) return null;
  return (
    <section className='vt-sec' aria-label='Decisions'>
      <div className='vt-scroll pt-scroll-x'>
        <table className='vt-table' data-testid='admin-decisions'>
          <thead>
            <tr>
              <th scope='col'>Title</th>
              <th scope='col'>ID</th>
              <th scope='col'>Status</th>
              <th scope='col'>Kind</th>
              <th scope='col' className='is-num'>
                Options
              </th>
              <th scope='col' className='is-num'>
                Voters
              </th>
              <th scope='col' className='is-num'>
                Votes
              </th>
              <th scope='col'>
                <span className='vt-sr'>Links</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={row.status === 'archived' ? 'is-hidden' : undefined} data-testid={`admin-decision-${row.id}`}>
                <td>
                  <Link href={`/vote/admin/${row.id}`} className='vt-link' data-testid={`admin-decision-open-${row.id}`}>
                    {row.title}
                  </Link>
                </td>
                <td>
                  <code>{row.id}</code>
                </td>
                <td>
                  <span className={row.status === 'open' ? 'vt-status is-open' : 'vt-status'}>{STATUS_LABEL[row.status]}</span>
                </td>
                <td>{KIND_LABEL[row.kind]}</td>
                <td className='is-num'>{row.active === row.options ? row.options : `${row.active} of ${row.options}`}</td>
                <td className='is-num'>{row.voters}</td>
                <td className='is-num'>{row.votes}</td>
                <td className='vt-td-tools'>
                  <Link href={`/vote/${row.id}/results`} className='pt-ib vt-chip' data-testid={`admin-decision-results-${row.id}`}>
                    Results
                  </Link>
                  <Link href={`/vote/${row.id}`} className='pt-ib vt-chip' data-testid={`admin-decision-ballot-${row.id}`}>
                    Ballot
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

type NewDecisionProps = { taken: ReadonlySet<string>; busy: boolean; change: Change; onError: (message: string | null) => void };

/** A new decision: its title, an id taken from the title until it is edited, its kind and its question. It starts as a draft. */
function NewDecision({ taken, busy, change, onError }: NewDecisionProps) {
  const router = useRouter();
  const ready = useHydrated();
  const [title, setTitle] = useState('');
  const [id, setId] = useState('');
  const [edited, setEdited] = useState(false);
  const [kind, setKind] = useState<DecisionKind>('mark');
  const [question, setQuestion] = useState('');
  const shownId = edited ? id : keyFromName(title);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = title.trim();
    if (!name) {
      onError('A decision needs a title.');
      return;
    }
    if (!isDecisionId(shownId)) {
      onError(`An id uses a to z, 0 to 9 and hyphens, at most 40, and is not ${RESERVED_IDS.join(', ')}.`);
      return;
    }
    if (taken.has(shownId)) {
      onError('A decision with that id exists.');
      return;
    }
    const result = await change<{ id?: unknown; decision?: { id?: unknown } }>('/api/vote/admin/decisions', {
      title: name,
      id: shownId,
      kind,
      question: question.trim(),
    });
    if (!result.ok) return;
    const made = typeof result.data.id === 'string' ? result.data.id : typeof result.data.decision?.id === 'string' ? result.data.decision.id : shownId;
    router.push(`/vote/admin/${made}`);
  }

  return (
    <section className='vt-sec' aria-labelledby='vt-new-h'>
      <h2 id='vt-new-h' className='vt-h2'>
        New decision
      </h2>
      <form className='vt-fields' method='post' onSubmit={(event) => void submit(event)} noValidate data-testid='admin-new'>
        <label className='vt-field'>
          <span className='vt-label'>Title</span>
          <input
            className='vt-input is-dense'
            name='title'
            value={title}
            onChange={(event) => setTitle(event.currentTarget.value)}
            autoComplete='off'
            required
            data-testid='admin-new-title'
          />
        </label>
        <label className='vt-field'>
          <span className='vt-label'>ID</span>
          <input
            className='vt-input is-dense'
            name='id'
            value={shownId}
            onChange={(event) => {
              setEdited(true);
              setId(event.currentTarget.value.toLowerCase());
            }}
            pattern='[a-z0-9\-]{1,40}'
            autoComplete='off'
            autoCapitalize='none'
            spellCheck={false}
            data-testid='admin-new-id'
          />
        </label>
        <div className='vt-field'>
          <span className='vt-label' id='vt-new-kind'>
            Kind
          </span>
          <div className='vt-seg' role='group' aria-labelledby='vt-new-kind'>
            {KINDS.map((value) => (
              <button
                type='button'
                key={value}
                className={value === kind ? 'pt-ib vt-chip is-on' : 'pt-ib vt-chip'}
                aria-pressed={value === kind}
                onClick={() => setKind(value)}
                data-testid={`admin-new-kind-${value}`}
              >
                {KIND_LABEL[value]}
              </button>
            ))}
          </div>
        </div>
        <label className='vt-field is-wide'>
          <span className='vt-label'>Question</span>
          <input
            className='vt-input is-dense'
            name='question'
            value={question}
            onChange={(event) => setQuestion(event.currentTarget.value)}
            autoComplete='off'
            data-testid='admin-new-question'
          />
        </label>
        <div className='vt-field is-wide'>
          <button type='submit' className='vt-btn is-dense' disabled={!ready || busy} data-ready={ready} data-testid='admin-new-submit'>
            Create
          </button>
        </div>
      </form>
    </section>
  );
}
