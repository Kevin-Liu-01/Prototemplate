'use client';

import Link from 'next/link';

import type { AdminData } from '@/lib/vote/types';

import { adminPath } from '../../api';
import type { Boot } from '../../types';
import Unavailable from '../../Unavailable';
import KeyForm from '../KeyForm';
import { STATUS_LABEL } from '../labels';
import { useAdminPanel } from '../useAdminPanel';
import Matrix from './Matrix';
import Options from './Options';
import Settings from './Settings';
import Voters from './Voters';

type DecisionAdminProps = { boot: Boot<AdminData> | { kind: 'signed-out' }; id: string; title: string };

/**
 * /vote/admin/[decision]: the key form, then one decision's settings, its
 * options (bulk add, rename, order, hide, a new file), its voters, the
 * head-to-head matrix and the CSV export. Every change posts to its API
 * route and then reads the whole panel again.
 */
export default function DecisionAdmin({ boot, id, title }: DecisionAdminProps) {
  if (boot.kind === 'off' || boot.kind === 'error') return <Unavailable title={title} kind={boot.kind} />;
  return <Panel initial={boot.kind === 'ready' ? boot.data : null} at={boot.kind === 'ready' ? boot.at : 0} id={id} title={title} />;
}

function Panel({ initial, at, id, title }: { initial: AdminData | null; at: number; id: string; title: string }) {
  const panel = useAdminPanel<AdminData>(adminPath(id, 'data'), initial, at);
  const { data, busy, error } = panel;

  if (!data) return <KeyForm title={title} busy={busy} error={error} onSignIn={panel.signIn} />;

  const { decision, totals } = data;
  return (
    <main className='vt-col is-wide' data-testid='vote-admin-decision'>
      <header className='vt-head vt-head-row'>
        <div className='vt-head'>
          <h1 className='vt-title'>{decision.title}</h1>
          <p className='vt-lead'>
            {STATUS_LABEL[decision.status]}, {totals.active} {totals.active === 1 ? 'option' : 'options'}, {totals.voters}{' '}
            {totals.voters === 1 ? 'voter' : 'voters'}, {totals.votes} {totals.votes === 1 ? 'vote' : 'votes'}
          </p>
        </div>
        <div className='vt-tools'>
          <Link href='/vote/admin' className='pt-ib vt-chip' data-testid='admin-all'>
            All Decisions
          </Link>
          <Link href={`/vote/${id}/results`} className='pt-ib vt-chip' data-testid='admin-results'>
            Results
          </Link>
          <Link href={`/vote/${id}`} className='pt-ib vt-chip' data-testid='admin-ballot'>
            Ballot
          </Link>
          <a href={adminPath(id, 'export.csv')} className='pt-ib vt-chip' download data-testid='admin-export'>
            Export CSV
          </a>
          <button type='button' className='pt-ib vt-chip' onClick={() => void panel.signOut()} disabled={busy} data-testid='admin-signout'>
            Sign Out
          </button>
        </div>
      </header>
      <p className='vt-error is-float' role='status' aria-live='polite' data-testid='admin-error'>
        {error}
      </p>
      <Settings key={JSON.stringify(decision)} decision={decision} busy={busy} change={panel.change} onError={panel.setError} />
      <Options decision={decision} options={data.options} busy={busy} change={panel.change} reload={panel.reload} onError={panel.setError} />
      <Voters voters={data.voters} busy={busy} change={panel.change} />
      <Matrix data={data} />
    </main>
  );
}
