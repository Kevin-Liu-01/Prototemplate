'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';

import { voteApi } from './api';
import { useHydrated } from './useHydrated';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type EmailFormProps = {
  /** the session is set; `data` is what POST /api/vote/session answered */
  onSession: (data: unknown) => Promise<void> | void;
  onError: (message: string | null) => void;
};

/**
 * The email form of /vote and of a decision's page. The server checks the
 * address against every decision's access list before it writes anything,
 * and the button waits for hydration, so a press before then never sends
 * the field anywhere.
 */
export default function EmailForm({ onSession, onError }: EmailFormProps) {
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
    const result = await voteApi<unknown>('/api/vote/session', { email });
    if (result.ok) await onSession(result.data);
    else onError(result.error);
    setSending(false);
  }

  return (
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
  );
}
