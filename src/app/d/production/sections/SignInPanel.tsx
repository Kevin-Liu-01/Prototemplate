'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useRef, useState, type FormEvent } from 'react';

import { SiGithub, SiGoogle } from '@icons-pack/react-simple-icons';
import { KeyRound, ShieldCheck } from 'lucide-react';

import './signin.css';

/**
 * The sign-in panel, field for field.
 *
 * Reproduces apps/dashboard/src/components/signin/sign-in-form.tsx: the
 * heading pair, the single email field, Continue, the "or" rule, the three
 * provider rows in their shipped order (GitHub, Google, SSO), the captcha
 * slot below every option, and the legal line. The SSO view — its own
 * heading, its own field, Continue with SSO, Back — is the same component
 * state the real form switches into, so it is reachable here too.
 *
 * The one honest difference, kept the way ContactBay keeps it: there is no
 * auth behind this study. Nothing submits, no magic link is sent, no
 * provider redirect fires. Every control surfaces the notice instead of
 * faking a success state.
 */

const SIGNIN_URL = 'https://dashboard.generaltranslation.com/signin';

export default function SignInPanel() {
  const pathname = usePathname();
  const base = pathname?.match(/^\/d\/[^/]+/)?.[0] ?? '/d/production';

  const [email, setEmail] = useState('');
  const [ssoEmail, setSsoEmail] = useState('');
  const [showSsoForm, setShowSsoForm] = useState(false);
  const [noticed, setNoticed] = useState(false);

  /* The real form lands the caret in the email field on arrival — once, and
     with preventScroll so an embedded page never jumps. Same ref callback
     here, minus the defaultEmail selection range the cookie path feeds. */
  const positionedCaret = useRef(false);
  const emailInputRef = useCallback((input: HTMLInputElement | null) => {
    if (!input || positionedCaret.current) return;
    positionedCaret.current = true;
    input.focus({ preventScroll: true });
  }, []);

  /* The real handlers call authClient; a control never fakes a success
     state, so every path lands on the notice instead. */
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNoticed(true);
  }

  const notice = noticed ? (
    <p className='psi-notice' role='status'>
      Nothing was sent &mdash; this control has no auth behind it. The live
      sign-in at{' '}
      <a href={SIGNIN_URL} rel='noreferrer noopener' target='_blank'>
        dashboard.generaltranslation.com/signin
      </a>{' '}
      mails the magic link and runs the provider redirects.
    </p>
  ) : null;

  return (
    <div className='psi-panel'>
      <div>
        {showSsoForm ? (
          <>
            <h1 className='psi-h1'>Enter your company email</h1>
            <p className='psi-sub'>We&apos;ll sign you in or create an account.</p>
          </>
        ) : (
          <>
            <h1 className='psi-h1'>What&apos;s your email?</h1>
            <p className='psi-sub'>We&apos;ll sign you in or create an account.</p>
          </>
        )}
      </div>

      {showSsoForm ? (
        <form className='psi-form' onSubmit={onSubmit}>
          <label className='psi-sr' htmlFor='signin-sso-email'>
            Company email
          </label>
          <input
            autoCapitalize='none'
            autoComplete='email'
            autoCorrect='off'
            autoFocus
            className='psi-field'
            id='signin-sso-email'
            inputMode='email'
            onChange={(e) => setSsoEmail(e.target.value)}
            placeholder='you@yourcompany.com'
            required
            spellCheck={false}
            type='text'
            value={ssoEmail}
          />
          <button className='psi-btn is-solid' type='submit'>
            Continue with SSO
          </button>
          <button
            type='button'
            className='psi-btn is-ghost'
            onClick={() => setShowSsoForm(false)}
          >
            Back
          </button>
          {notice}
        </form>
      ) : (
        <>
          <form className='psi-form' onSubmit={onSubmit}>
            <label className='psi-sr' htmlFor='signin-email'>
              Email
            </label>
            <input
              autoCapitalize='none'
              autoComplete='email'
              autoCorrect='off'
              className='psi-field'
              id='signin-email'
              inputMode='email'
              onChange={(e) => setEmail(e.target.value)}
              placeholder='you@yourcompany.com'
              ref={emailInputRef}
              required
              spellCheck={false}
              type='text'
              value={email}
            />
            <button className='psi-btn is-solid' type='submit'>
              Continue
            </button>
          </form>

          <div className='psi-or'>
            <span aria-hidden className='psi-rule' />
            <span>or</span>
            <span aria-hidden className='psi-rule' />
          </div>

          <div className='psi-socials'>
            <button
              type='button'
              className='psi-btn is-outline'
              onClick={() => setNoticed(true)}
            >
              <SiGithub
                aria-hidden
                className='psi-btn-glyph'
                color='currentColor'
                size={16}
              />
              Continue with GitHub
            </button>
            <button
              type='button'
              className='psi-btn is-outline'
              onClick={() => setNoticed(true)}
            >
              <SiGoogle
                aria-hidden
                className='psi-btn-glyph'
                color='currentColor'
                size={16}
              />
              Continue with Google
            </button>
            <button
              type='button'
              className='psi-btn is-outline'
              onClick={() => {
                setSsoEmail((current) => current || email);
                setShowSsoForm(true);
              }}
            >
              <KeyRound
                aria-hidden
                className='psi-btn-glyph'
                color='currentColor'
                size={16}
              />
              Continue with SSO
            </button>
          </div>

          {notice}
        </>
      )}

      {/* The captcha gate sits below every sign-in option on the real page —
          one Cloudflare Turnstile widget in flexible sizing, gating the magic
          link, both providers and SSO alike. A third-party challenge can't be
          reproduced, and faking one would be worse than naming it, so the
          slot states what mounts here. */}
      <div aria-live='polite' className='psi-slot' role='status'>
        <ShieldCheck aria-hidden color='currentColor' />
        <span>
          Cloudflare Turnstile gates every option above on the live page. This
          control has no captcha and no auth.
        </span>
      </div>

      <p className='psi-legal'>
        By signing in, you agree to our{' '}
        <a
          href={`${base}/legal/terms`}
          rel='noopener noreferrer'
          target='_blank'
        >
          Terms of Service
        </a>{' '}
        and{' '}
        <a
          href={`${base}/legal/privacy-policy`}
          rel='noopener noreferrer'
          target='_blank'
        >
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}
