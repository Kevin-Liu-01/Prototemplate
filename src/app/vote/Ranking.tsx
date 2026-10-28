'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import { domainLabel, PROVISIONAL_GAMES } from '@/lib/vote/config';
import type { DecisionKind, ResultRow, Results } from '@/lib/vote/types';

import { decisionPath, voteApi } from './api';
import Face, { plateClass } from './Face';
import { useReread } from './useReread';

type RankingProps = {
  initial: Results;
  /** when the server read `initial` */
  at: number;
  id: string;
  /** the admin reads the results too, and gets a way back to the decision's panel */
  admin: boolean;
  /** a voter on an open decision gets a way to change their votes */
  change?: boolean;
};

/**
 * A decision's results: every option ranked by Elo, with its record and,
 * when the decision has likes, how many of the voters who saw it liked it.
 * The chips replay the vote for one voter group. A row with fewer than
 * PROVISIONAL_GAMES games is dimmed. Shown on /vote/[decision]/results and,
 * once the decision is closed, on /vote/[decision] itself.
 */
export default function Ranking({ initial, at, id, admin, change = false }: RankingProps) {
  const router = useRouter();
  const [results, setResults] = useState(initial);
  /* the newest unfiltered read: the groups and the All count come from it, so the chips stay put while one is picked */
  const [base, setBase] = useState(initial);
  const [domain, setDomain] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef(0);
  const { decision } = base;
  const groups = base.domains;

  /* a page the router replays reads the ranking again, unfiltered */
  useReread(at, () => void pick(null, true));

  async function pick(next: string | null, again = false) {
    if (next === domain && !again) return;
    const call = ++latest.current;
    setDomain(next);
    setLoading(true);
    setError(null);
    const path = decisionPath(id, next ? `results?domain=${encodeURIComponent(next)}` : 'results');
    const result = await voteApi<Results>(path);
    if (call !== latest.current) return;
    setLoading(false);
    if (result.ok) {
      setResults(result.data);
      if (!next) setBase(result.data);
    } else if (result.status === 401 || (result.status === 403 && !next)) router.replace(`/vote/${id}`);
    else setError(result.error);
  }

  const chips: readonly { domain: string | null; label: string; voters: number }[] = [
    { domain: null, label: 'All', voters: base.voters },
    ...groups.map((group) => ({ domain: group.domain, label: domainLabel(group.domain), voters: group.voters })),
  ];

  return (
    <main className='vt-col' data-testid='vote-results'>
      <header className='vt-head'>
        <h1 className='vt-title'>{decision.title}</h1>
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
              <th scope='col'>Option</th>
              <th scope='col' className='is-num'>
                Elo
              </th>
              <th scope='col' className='is-num'>
                W-L
              </th>
              {decision.likes ? (
                <th scope='col' className='is-num'>
                  Liked by
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {results.rows.map((row, index) => (
              <tr key={row.key} className={row.games < PROVISIONAL_GAMES ? 'is-provisional' : undefined} data-testid={`results-row-${row.key}`}>
                <td className='is-num vt-rank-n'>{index + 1}</td>
                <td>
                  <Named kind={decision.kind} row={row} />
                </td>
                <td className='is-num'>{Math.round(row.elo)}</td>
                <td className='is-num'>
                  {row.wins}-{row.losses}
                </td>
                {decision.likes ? (
                  <td className='is-num'>
                    {row.likedBy} of {row.seenBy}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className='vt-error' role='status' aria-live='polite'>
        {error}
      </p>
      <p className='vt-who'>
        {change ? (
          <Link href={`/vote/${id}/votes`} className='pt-ib vt-chip' data-testid='results-change'>
            Change Votes
          </Link>
        ) : null}
        <Link href='/vote' className='pt-ib vt-chip' data-testid='results-all'>
          All Votes
        </Link>
        {admin ? (
          <Link href={`/vote/admin/${id}`} className='pt-ib vt-chip' data-testid='results-admin'>
            Admin
          </Link>
        ) : null}
      </p>
    </main>
  );
}

/** An option in a table: its plate and name, or for a text option its name and text. */
export function Named({ kind, row }: { kind: DecisionKind; row: Pick<ResultRow, 'name' | 'text' | 'src'> }) {
  if (kind === 'text') {
    return (
      <span className='vt-named is-text'>
        <span className='vt-name'>{row.name}</span>
        {row.text ? <span className='vt-cell-text'>{row.text}</span> : null}
      </span>
    );
  }
  return (
    <span className='vt-named'>
      <span className={plateClass(kind, 'is-static', 'is-sm')}>
        <Face kind={kind} option={row} />
      </span>
      <span className='vt-name'>{row.name}</span>
    </span>
  );
}
