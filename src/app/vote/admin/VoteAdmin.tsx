'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import type { ChangeEvent, FormEvent, KeyboardEvent } from 'react';

import { Icon } from '@/components/viewer/icons';
import { domainLabel, MAX_LOGO_BYTES } from '@/lib/vote/config';
import type { AdminData, AdminLogo, AdminVoter } from '@/lib/vote/types';

import { voteApi } from '../api';
import Mark from '../Mark';
import type { Boot } from '../types';
import Unavailable from '../Unavailable';
import { useHydrated } from '../useHydrated';

type AdminBoot = Boot<AdminData> | { kind: 'signed-out' };
type VoteAdminProps = { boot: AdminBoot; title: string };

/** One admin change, posted to its endpoint; the panel reads itself again after it. */
type Change = (path: string, body: FormData | object) => Promise<boolean>;

const UPLOAD_REFUSED = 'Attach an SVG or PNG file of 1 MB or less.';

/**
 * /vote/admin: the key form, then the logos (rename, order, hide, add and
 * re-upload), the voters (devices, shared devices, exclusion), the
 * head-to-head matrix and the CSV export. Every change posts to its API
 * route and then reads the whole panel again.
 */
export default function VoteAdmin({ boot, title }: VoteAdminProps) {
  if (boot.kind === 'off' || boot.kind === 'error') return <Unavailable title={title} kind={boot.kind} />;
  return <Admin initial={boot.kind === 'ready' ? boot.data : null} title={title} />;
}

function Admin({ initial, title }: { initial: AdminData | null; title: string }) {
  const [data, setData] = useState<AdminData | null>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reload(): Promise<void> {
    const result = await voteApi<AdminData>('/api/vote/admin/data');
    if (result.ok) setData(result.data);
    else if (result.status === 401 || result.status === 403) setData(null);
    else setError(result.error);
  }

  const change: Change = async (path, body) => {
    setBusy(true);
    setError(null);
    const result = await voteApi<object>(path, body);
    if (result.ok) await reload();
    else if (result.status === 401 || result.status === 403) setData(null);
    else setError(result.error);
    setBusy(false);
    return result.ok;
  };

  async function signIn(key: string) {
    setBusy(true);
    setError(null);
    const result = await voteApi<object>('/api/vote/admin/login', { key });
    if (result.ok) await reload();
    else setError(result.error);
    setBusy(false);
  }

  async function signOut() {
    setBusy(true);
    await voteApi<object>('/api/vote/admin/logout', {});
    setBusy(false);
    setError(null);
    setData(null);
  }

  if (!data) {
    return <KeyForm title={title} busy={busy} error={error} onSignIn={signIn} />;
  }

  return (
    <main className='vt-col is-wide' data-testid='vote-admin'>
      <header className='vt-head vt-head-row'>
        <div className='vt-head'>
          <h1 className='vt-title'>{title}</h1>
          <p className='vt-lead'>
            {data.totals.logos} logos, {data.totals.voters} voters, {data.totals.votes} votes
          </p>
        </div>
        <div className='vt-tools'>
          <Link href='/vote/results' className='pt-ib vt-chip' data-testid='admin-results'>
            Results
          </Link>
          <a href='/api/vote/admin/export.csv' className='pt-ib vt-chip' download data-testid='admin-export'>
            Export CSV
          </a>
          <button type='button' className='pt-ib vt-chip' onClick={() => void signOut()} disabled={busy} data-testid='admin-signout'>
            Sign Out
          </button>
        </div>
      </header>
      <p className='vt-error is-float' role='status' aria-live='polite' data-testid='admin-error'>
        {error}
      </p>
      <Logos logos={data.logos} busy={busy} change={change} onError={setError} />
      <Voters voters={data.voters} busy={busy} change={change} />
      <Matrix data={data} />
    </main>
  );
}

function KeyForm({ title, busy, error, onSignIn }: { title: string; busy: boolean; error: string | null; onSignIn: (key: string) => Promise<void> }) {
  const ready = useHydrated();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const key = String(new FormData(event.currentTarget).get('key') ?? '');
    if (key) void onSignIn(key);
  }

  return (
    <main className='vt-col is-narrow' data-testid='admin-signin'>
      <header className='vt-head'>
        <h1 className='vt-title'>{title}</h1>
      </header>
      <form className='vt-form' method='post' onSubmit={submit}>
        <label className='vt-sr' htmlFor='vt-key'>
          Key
        </label>
        <input
          id='vt-key'
          className='vt-input'
          name='key'
          type='password'
          autoComplete='current-password'
          placeholder='Key'
          required
          data-testid='admin-key'
        />
        <button type='submit' className='vt-btn' disabled={!ready || busy} data-ready={ready} data-testid='admin-signin-submit'>
          Sign In
        </button>
      </form>
      <p className='vt-error' role='status' aria-live='polite' data-testid='admin-error'>
        {error}
      </p>
    </main>
  );
}

/* ---------- logos ---------- */

function byOrder(a: AdminLogo, b: AdminLogo): number {
  return a.order - b.order || a.key.localeCompare(b.key);
}

function Logos({ logos, busy, change, onError }: { logos: AdminLogo[]; busy: boolean; change: Change; onError: (message: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const target = useRef<AdminLogo | null>(null);

  function replace(logo: AdminLogo) {
    target.current = logo;
    fileRef.current?.click();
  }

  function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    const logo = target.current;
    event.currentTarget.value = '';
    target.current = null;
    if (!file || !logo) return;
    if (file.size > MAX_LOGO_BYTES) {
      onError(UPLOAD_REFUSED);
      return;
    }
    const form = new FormData();
    form.set('key', logo.key);
    form.set('name', logo.name);
    form.set('order', String(logo.order));
    form.set('replace', '1');
    form.set('file', file);
    void change('/api/vote/admin/logo', form);
  }

  return (
    <section className='vt-sec' aria-labelledby='vt-logos-h'>
      <h2 id='vt-logos-h' className='vt-h2'>
        Logos
      </h2>
      <div className='vt-scroll pt-scroll-x'>
        <table className='vt-table' data-testid='admin-logos'>
          <thead>
            <tr>
              <th scope='col'>Logo</th>
              <th scope='col'>Key</th>
              <th scope='col'>Name</th>
              <th scope='col'>Order</th>
              <th scope='col' className='is-num'>
                Elo
              </th>
              <th scope='col' className='is-num'>
                Games
              </th>
              <th scope='col'>
                <span className='vt-sr'>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {[...logos].sort(byOrder).map((logo) => (
              <LogoRow
                key={`${logo.key}:${logo.name}:${logo.order}`}
                logo={logo}
                busy={busy}
                change={change}
                onReplace={replace}
              />
            ))}
          </tbody>
        </table>
      </div>
      <input
        ref={fileRef}
        className='vt-sr'
        type='file'
        accept='.svg,.png,image/svg+xml,image/png'
        tabIndex={-1}
        aria-hidden='true'
        onChange={onFile}
      />
      <UploadForm busy={busy} change={change} onError={onError} />
    </section>
  );
}

function LogoRow({ logo, busy, change, onReplace }: { logo: AdminLogo; busy: boolean; change: Change; onReplace: (logo: AdminLogo) => void }) {
  const [name, setName] = useState(logo.name);
  const [order, setOrder] = useState(String(logo.order));

  function saveName() {
    const next = name.trim();
    if (next && next !== logo.name) void change('/api/vote/admin/logo/meta', { key: logo.key, name: next });
    else setName(logo.name);
  }

  function saveOrder() {
    const next = Number(order);
    if (order.trim() !== '' && Number.isFinite(next) && next !== logo.order) void change('/api/vote/admin/logo/meta', { key: logo.key, order: next });
    else setOrder(String(logo.order));
  }

  return (
    <tr className={logo.hidden ? 'is-hidden' : undefined} data-testid={`admin-logo-${logo.key}`}>
      <td className='vt-td-plate'>
        <span className='vt-plate is-static is-sm'>
          <Mark src={logo.src} />
        </span>
      </td>
      <td>
        <code>{logo.key}</code>
      </td>
      <td>
        <input
          className='vt-input is-dense'
          aria-label={`Name of ${logo.key}`}
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          onBlur={saveName}
          onKeyDown={blurOnEnter}
          autoComplete='off'
          data-testid={`admin-logo-name-${logo.key}`}
        />
      </td>
      <td>
        <input
          className='vt-input is-dense is-order'
          aria-label={`Order of ${logo.key}`}
          type='number'
          inputMode='numeric'
          value={order}
          onChange={(event) => setOrder(event.currentTarget.value)}
          onBlur={saveOrder}
          onKeyDown={blurOnEnter}
          data-testid={`admin-logo-order-${logo.key}`}
        />
      </td>
      <td className='is-num'>{Math.round(logo.elo)}</td>
      <td className='is-num'>{logo.games}</td>
      <td className='vt-td-tools'>
        <button
          type='button'
          className='pt-ib vt-chip'
          onClick={() => void change('/api/vote/admin/logo/meta', { key: logo.key, hidden: !logo.hidden })}
          disabled={busy}
          data-testid={`admin-logo-hide-${logo.key}`}
        >
          {logo.hidden ? 'Show' : 'Hide'}
        </button>
        <button
          type='button'
          className='pt-ib vt-chip'
          onClick={() => onReplace(logo)}
          disabled={busy}
          data-testid={`admin-logo-replace-${logo.key}`}
        >
          Replace
        </button>
      </td>
    </tr>
  );
}

/** Enter in a row's field saves it, through the blur. */
function blurOnEnter(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key === 'Enter') event.currentTarget.blur();
}

function UploadForm({ busy, change, onError }: { busy: boolean; change: Change; onError: (message: string) => void }) {
  const ready = useHydrated();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const file = fields.get('file');
    if (!(file instanceof File) || file.size === 0 || file.size > MAX_LOGO_BYTES) {
      onError(UPLOAD_REFUSED);
      return;
    }
    for (const optional of ['key', 'order']) {
      if (String(fields.get(optional) ?? '').trim() === '') fields.delete(optional);
    }
    if (await change('/api/vote/admin/logo', fields)) form.reset();
  }

  return (
    <form className='vt-upload' method='post' encType='multipart/form-data' onSubmit={(event) => void submit(event)} data-testid='admin-upload'>
      <input className='vt-input is-dense' name='name' aria-label='Name' placeholder='Name' required autoComplete='off' />
      <input
        className='vt-input is-dense'
        name='key'
        aria-label='Key'
        placeholder='Key'
        pattern='[a-z0-9\-]{1,40}'
        autoComplete='off'
        autoCapitalize='none'
        spellCheck={false}
      />
      <input className='vt-input is-dense is-order' name='order' aria-label='Order' placeholder='Order' type='number' inputMode='numeric' />
      <input className='vt-file' name='file' aria-label='File' type='file' accept='.svg,.png,image/svg+xml,image/png' required />
      <button type='submit' className='vt-btn' disabled={!ready || busy} data-ready={ready} data-testid='admin-upload-submit'>
        Upload
      </button>
    </form>
  );
}

/* ---------- voters ---------- */

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

function Voters({ voters, busy, change }: { voters: AdminVoter[]; busy: boolean; change: Change }) {
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
                <td className='is-num'>{voter.votes}</td>
                <td>
                  {voter.complete ? (
                    <span className='vt-yes'>
                      <Icon name='check' size={14} />
                      <span className='vt-sr'>Yes</span>
                    </span>
                  ) : (
                    <span className='vt-sr'>No</span>
                  )}
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
                    className='pt-ib vt-chip'
                    onClick={() => void change('/api/vote/admin/voter', { voterId: voter.voterId, excluded: !voter.excluded })}
                    disabled={busy}
                    data-testid={`admin-voter-exclude-${voter.voterId}`}
                  >
                    {voter.excluded ? 'Include' : 'Exclude'}
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

/* ---------- head to head ---------- */

function Matrix({ data }: { data: AdminData }) {
  const byKey = new Map(data.logos.map((logo) => [logo.key, logo]));
  const { keys, wins } = data.matrix;
  const nameOf = (key: string) => byKey.get(key)?.name ?? key;
  const srcOf = (key: string) => byKey.get(key)?.src ?? '';

  return (
    <section className='vt-sec' aria-labelledby='vt-matrix-h'>
      <h2 id='vt-matrix-h' className='vt-h2'>
        Head to head
      </h2>
      <div className='vt-scroll pt-scroll-x'>
        <table className='vt-matrix' data-testid='admin-matrix'>
          <caption className='vt-sr'>Wins of each row&apos;s logo over each column&apos;s logo</caption>
          <thead>
            <tr>
              <td />
              {keys.map((key) => (
                <th key={key} scope='col' title={nameOf(key)}>
                  <span className='vt-plate is-static is-xs'>
                    <Mark src={srcOf(key)} />
                  </span>
                  <span className='vt-sr'>{nameOf(key)}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {keys.map((row, i) => (
              <tr key={row}>
                <th scope='row'>
                  <span className='vt-named'>
                    <span className='vt-plate is-static is-xs'>
                      <Mark src={srcOf(row)} />
                    </span>
                    <span className='vt-name'>{nameOf(row)}</span>
                  </span>
                </th>
                {keys.map((col, j) => {
                  const n = wins[i]?.[j] ?? 0;
                  if (i === j) return <td key={col} className='is-self' />;
                  return (
                    <td key={col} className={n === 0 ? 'is-zero' : undefined} title={`${nameOf(row)} over ${nameOf(col)}: ${n}`}>
                      {n}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
