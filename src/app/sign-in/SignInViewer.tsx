'use client';

import type { FormEvent } from 'react';
import { useRef, useState } from 'react';

import { Lock } from '@/components/viewer/Lock';
import { Sheet } from '@/components/viewer/Sheet';
import { ViewerShell } from '@/components/viewer/ViewerShell';
import { PAGE_NAMES } from '@/lib/page-names';
import type { ShellMode } from '@/lib/shell-data';

import '@/components/viewer/BookView.css';
import './sign-in.css';

/** What the page opens on: the key field, the sign-out button, or the line that says nothing opens yet. */
export type SignInState = 'out' | 'in' | 'off';

type SignInViewerProps = { state: SignInState; next: string };

const MODES: readonly ShellMode[] = ['book'];

/** The one line each refusal of POST /api/auth/key prints. */
const REFUSAL: Readonly<Record<number, string>> = {
  401: 'That key is wrong.',
  429: 'Too many wrong keys. Try again in ten minutes.',
  503: 'Locked pages cannot be unlocked yet.',
};

/**
 * The sign-in page in the book page's head: the title with the lock, then
 * the access key field and its button where a lead would sit. A right key
 * opens `next` as a document, since a locked area can be a route handler
 * the router cannot render; a wrong one prints one line under the field.
 */
export default function SignInViewer({ state, next }: SignInViewerProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const key = new FormData(event.currentTarget).get('key');
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/auth/key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      if (response.ok) {
        window.location.assign(next);
        return;
      }
      setError(REFUSAL[response.status] ?? 'Sign-in did not answer. Try again.');
    } catch {
      setError('Sign-in did not answer. Try again.');
    }
    setBusy(false);
  };

  const signOut = async () => {
    setBusy(true);
    try {
      await fetch('/api/auth/key', { method: 'DELETE' });
    } finally {
      window.location.reload();
    }
  };

  return (
    <ViewerShell
      id='sign-in'
      title={PAGE_NAMES.signIn.name}
      mark='pt'
      count=''
      sections={[]}
      active=''
      modes={MODES}
      thumb='row'
      surfaces='site'
      keys='flow'
    >
      <Sheet variant='flow' scrollRef={sheetRef}>
        <div className='pt-book-col'>
          <header className='pt-book-head'>
            <div className='pt-book-mast'>
              <h1>
                {PAGE_NAMES.signIn.name}
                <Lock open={state === 'in'} title />
              </h1>
              {state === 'out' ? (
                <form className='pt-signin' onSubmit={signIn}>
                  <div className='pt-signin-row'>
                    <input
                      className='pt-signin-key'
                      type='password'
                      name='key'
                      autoComplete='off'
                      aria-label='Access key'
                      placeholder='Access key'
                      required
                      autoFocus
                      aria-invalid={error ? true : undefined}
                      aria-describedby={error ? 'pt-signin-error' : undefined}
                    />
                    <button type='submit' className='pt-ib is-text pt-signin-go' disabled={busy} aria-busy={busy || undefined}>
                      Sign In
                    </button>
                  </div>
                  {error ? (
                    <p id='pt-signin-error' className='pt-signin-error' role='alert'>
                      {error}
                    </p>
                  ) : null}
                </form>
              ) : state === 'in' ? (
                <div className='pt-signin'>
                  <div className='pt-signin-row'>
                    <button type='button' className='pt-ib is-text pt-signin-go' onClick={signOut} disabled={busy}>
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <p className='pt-signin pt-signin-error'>{REFUSAL[503]}</p>
              )}
            </div>
          </header>
        </div>
      </Sheet>
    </ViewerShell>
  );
}
