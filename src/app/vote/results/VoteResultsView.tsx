'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { domainLabel, PROVISIONAL_GAMES } from '@/lib/vote/config';
import type { Results } from '@/lib/vote/types';

import { voteApi } from '../api';
import Mark from '../Mark';
import type { Boot } from '../types';
import Unavailable from '../Unavailable';

type VoteResultsViewProps = { boot: Boot<Results>; title: string };

/**
 * /vote/results: every logo ranked by Elo, with its record and how many of
 * the voters who saw it liked it. The chips replay the vote for one voter
 * group. A row with fewer than PROVISIONAL_GAMES games is dimmed.
 */
export default function VoteResultsView({ boot, title }: VoteResultsViewProps) {
  if (boot.kind !== 'ready') return <Unavailable title={title} kind={boot.kind} />;
  return <Ranking initial={boot.data} title={title} />;
}

function Ranking({ initial, title }: { initial: Results; title: string }) {
  const router = useRouter();
  const [results, setResults] = useState(initial);
  const [domain, setDomain] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef(0);
  /* the groups come from the unfiltered read, so the chips stay put while one is picked */
  const groups = initial.domains;

  async function pick(next: string | null) {
    if (next === domain) return;
    const call = ++latest.current;
    setDomain(next);
    setLoading(true);
    setError(null);
    const result = await voteApi<Results>(next ? `/api/vote/results?domain=${encodeURIComponent(next)}` : '/api/vote/results');
    if (call !== latest.current) return;
    setLoading(false);
    if (result.ok) setResults(result.data);
    else if (result.status === 401 || (result.status === 403 && !next)) router.replace('/vote');
    else setError(result.error);
  }

  const chips: readonly { domain: string | null; label: string; voters: number }[] = [
    { domain: null, label: 'All', voters: initial.voters },
    ...groups.map((group) => ({ domain: group.domain, label: domainLabel(group.domain), voters: group.voters })),
  ];

  return (
    <main className='vt-col' data-testid='vote-results'>
      <header className='vt-head'>
        <h1 className='vt-title'>{title}</h1>
        <p className='vt-lead'>
          {results.voters} {results.voters === 1 ? 'voter' : 'voters'}, {results.votes} {results.votes === 1 ? 'vote' : 'votes'}
        </p>
      </header>
      {groups.length > 1 ? (
        <div className='vt-chips' role='group' aria-label='Voter group'>
          {chips.map((chip) => (
            <button
              type='button'
              key={chip.domain ?? 'all'}
              className={chip.domain === domain ? 'pt-ib vt-chip is-on' : 'pt-ib vt-chip'}
              aria-pressed={chip.domain === domain}
              onClick={() => void pick(chip.domain)}
              data-testid={`results-group-${chip.domain ?? 'all'}`}
            >
              {chip.label}
              <span className='vt-chip-n'>{chip.voters}</span>
            </button>
          ))}
        </div>
      ) : null}
      <div className='vt-scroll pt-scroll-x'>
        <table className='vt-table vt-rank' aria-busy={loading} data-testid='results-table'>
          <thead>
            <tr>
              <th scope='col' className='is-num'>
                <span className='vt-sr'>Rank</span>
              </th>
              <th scope='col'>Logo</th>
              <th scope='col' className='is-num'>
                Elo
              </th>
              <th scope='col' className='is-num'>
                W-L
              </th>
              <th scope='col' className='is-num'>
                Liked by
              </th>
            </tr>
          </thead>
          <tbody>
            {results.rows.map((row, index) => (
              <tr key={row.key} className={row.games < PROVISIONAL_GAMES ? 'is-provisional' : undefined} data-testid={`results-row-${row.key}`}>
                <td className='is-num vt-rank-n'>{index + 1}</td>
                <td>
                  <span className='vt-named'>
                    <span className='vt-plate is-static is-sm'>
                      <Mark src={row.src} />
                    </span>
                    <span className='vt-name'>{row.name}</span>
                  </span>
                </td>
                <td className='is-num'>{Math.round(row.elo)}</td>
                <td className='is-num'>
                  {row.wins}-{row.losses}
                </td>
                <td className='is-num'>
                  {row.likedBy} of {row.seenBy}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className='vt-error' role='status' aria-live='polite'>
        {error}
      </p>
    </main>
  );
}
