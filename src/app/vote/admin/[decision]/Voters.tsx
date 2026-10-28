'use client';

import { Icon } from '@/components/viewer/icons';
import { domainLabel } from '@/lib/vote/config';
import type { AdminVoter } from '@/lib/vote/types';

import type { Change } from '../useAdminPanel';

/** A time as 2026-10-27 14:03 in UTC, the same on the server and in every browser. */
function utcStamp(time: string | null): string {
  if (!time) return '';
  const date = new Date(time);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 16).replace('T', ' ');
}

function lastActive(voter: AdminVoter): number {
  const value = new Date(voter.lastVoteAt ?? voter.createdAt).getTime();
  return Number.isNaN(value) ? 0 : value;
}

function Yes({ on }: { on: boolean }) {
  return on ? (
    <span className='vt-yes'>
      <Icon name='check' size={14} />
      <span className='vt-sr'>Yes</span>
    </span>
  ) : (
    <span className='vt-sr'>No</span>
  );
}

/**
 * The decision's voters: everyone on its access list and everyone who
 * voted in it, with their devices and who shares one. Exclude is global:
 * an excluded voter counts in no decision.
 */
export default function Voters({ voters, busy, change }: { voters: AdminVoter[]; busy: boolean; change: Change }) {
  const rows = [...voters].sort((a, b) => lastActive(b) - lastActive(a) || a.email.localeCompare(b.email));
  return (
    <section className='vt-sec' aria-labelledby='vt-voters-h'>
      <h2 id='vt-voters-h' className='vt-h2'>
        Voters
      </h2>
      <div className='vt-scroll pt-scroll-x'>
        <table className='vt-table' data-testid='admin-voters'>
          <thead>
            <tr>
              <th scope='col'>Email</th>
              <th scope='col'>Group</th>
              <th scope='col'>Access</th>
              <th scope='col' className='is-num'>
                Votes
              </th>
              <th scope='col'>Complete</th>
              <th scope='col' className='is-num'>
                Likes
              </th>
              <th scope='col' className='is-num'>
                Devices
              </th>
              <th scope='col'>Shares a device with</th>
              <th scope='col'>Last vote, UTC</th>
              <th scope='col'>
                <span className='vt-sr'>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((voter) => (
              <tr key={voter.voterId} className={voter.excluded ? 'is-excluded' : undefined} data-testid={`admin-voter-${voter.voterId}`}>
                <td className='vt-td-email'>{voter.email}</td>
                <td>{domainLabel(voter.domain)}</td>
                <td>
                  <Yes on={voter.access} />
                </td>
                <td className='is-num'>{voter.votes}</td>
                <td>
                  <Yes on={voter.complete} />
                </td>
                <td className='is-num'>{voter.likes.length}</td>
                <td className='is-num' title={voter.devices.join('\n')}>
                  {voter.devices.length}
                </td>
                <td className={voter.sharesDeviceWith.length > 0 ? 'vt-shared' : undefined}>{voter.sharesDeviceWith.join(', ')}</td>
                <td className='vt-td-time'>{utcStamp(voter.lastVoteAt)}</td>
                <td className='vt-td-tools'>
                  <button
                    type='button'
                    className={voter.excluded ? 'pt-ib vt-chip is-on' : 'pt-ib vt-chip'}
                    aria-pressed={voter.excluded}
                    onClick={() => void change('/api/vote/admin/voter', { voterId: voter.voterId, excluded: !voter.excluded })}
                    disabled={busy}
                    data-testid={`admin-voter-exclude-${voter.voterId}`}
                  >
                    Exclude
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
