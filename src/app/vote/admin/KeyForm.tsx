'use client';

import type { FormEvent } from 'react';

import { useHydrated } from '../useHydrated';

type KeyFormProps = { title: string; busy: boolean; error: string | null; onSignIn: (key: string) => Promise<void> };

/** The admin's sign-in: one key field. The button waits for hydration, so the key never posts as a plain form. */
export default function KeyForm({ title, busy, error, onSignIn }: KeyFormProps) {
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
