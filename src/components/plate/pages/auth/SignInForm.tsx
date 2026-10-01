'use client';

import { useCallback, useRef, useState, type ReactNode } from 'react';
import { SiGithub, SiGoogle } from '@icons-pack/react-simple-icons';
import { CheckCircleIcon, KeyIcon } from '@heroicons/react/16/solid';

import { T, useGT } from '@/components/plate/shims/gt-next';
import { Button } from '@/components/plate/ui/button';
import { Input } from '@/components/plate/ui/input';
import { Label } from '@/components/plate/ui/label';
import {
  signInMagicLink,
  signInSocial,
  signInSso,
} from '@/components/plate/lib/actions';
import { useFlow } from '@/components/plate/gallery/flow';
import { AUTH_ERROR_CODE } from '@/components/plate/lib/authErrorCodes';

// The website the legal links point at. The dashboard reads it from its
// environment; the port has one site.
const homepageUrl = 'https://generaltranslation.com';

/**
 * The dashboard's sign-in form (src/components/signin/sign-in-form.tsx) on
 * the gallery's stubs: the magic link, SSO and social calls resolve after
 * the stub latency with the button in its pending face, then Continue
 * moves the gallery to the verify-request state. The Cloudflare Turnstile
 * widget is a static plate of its height, so the form loads no script and
 * makes no network call.
 */
export default function SignInForm({
  callbackUrl,
  defaultEmail,
  initialError,
  onlyShowSSO,
  header,
  oauthQuery,
}: {
  callbackUrl: string;
  defaultEmail?: string;
  initialError?: string;
  onlyShowSSO?: boolean;
  header?: ReactNode;
  oauthQuery?: string;
}) {
  const [email, setEmail] = useState(defaultEmail ?? '');
  const [error, setError] = useState(onlyShowSSO ? '' : (initialError ?? ''));
  const [showSsoForm, setShowSsoForm] = useState(onlyShowSSO ?? false);
  const [ssoEmail, setSsoEmail] = useState(defaultEmail ?? '');
  const [ssoError, setSsoError] = useState(
    onlyShowSSO ? (initialError ?? '') : ''
  );
  const [submitting, setSubmitting] = useState(false);
  const [ssoSubmitting, setSsoSubmitting] = useState(false);
  const [signingInWith, setSigningInWith] = useState<
    'github' | 'google' | null
  >(null);
  const positionedEmailCaretRef = useRef(false);
  const flow = useFlow();
  const gt = useGT();
  const errorCallbackURL =
    oauthQuery === undefined
      ? '/signin'
      : `/signin/oauth?${new URLSearchParams({ oauth_query: oauthQuery })}`;

  // The dashboard renders Cloudflare's Turnstile here, below every sign-in
  // option, so it reads as a single gate over all of them; its token gates
  // every action until the widget issues one. The gallery's stand-in is a
  // plate of the flexible widget's height (65px) in its resting face. It
  // issues no token, so nothing in the port waits on it.
  const captchaWidget = (
    <div
      aria-hidden='true'
      data-testid='turnstile-plate'
      className='border-border bg-background flex h-[65px] w-full max-w-full items-center gap-3 rounded-md border px-4'
    >
      <CheckCircleIcon className='text-status-success size-5 shrink-0' />
      <span className='text-foreground text-sm'>
        <T>Success!</T>
      </span>
    </div>
  );

  // The auth API returns a stable error `code`; we own the translated message
  // here (this component has the user's locale via gt-next). Unknown codes fall
  // back to a generic translated string.
  function translateAuthError(
    error: { code?: string; status?: number } | null | undefined,
    fallback: string,
    rateLimitMessage?: string
  ): string {
    // better-auth's rate limiter returns a bare 429 with a message but no
    // `code`, so it has to be matched on status.
    if (error?.status === 429) {
      return (
        rateLimitMessage ??
        gt('Too many attempts. Please wait a minute and try again.')
      );
    }
    switch (error?.code) {
      case AUTH_ERROR_CODE.consumerEmail:
        return gt(
          'Magic links require a work email. Please continue with Google or GitHub instead.'
        );
      case AUTH_ERROR_CODE.sanctionedEmail:
        return gt('We are not able to support your email.');
      case AUTH_ERROR_CODE.ssoRequired:
        return gt(
          'This domain requires SSO sign-in. Please continue with your identity provider.'
        );
      // Codes from better-auth's captcha (Turnstile) plugin.
      case 'VERIFICATION_FAILED':
      case 'MISSING_RESPONSE':
        return gt('Could not verify that you are human. Please try again.');
      default:
        return fallback;
    }
  }

  const emailInputRef = useCallback(
    (input: HTMLInputElement | null) => {
      if (!input || positionedEmailCaretRef.current || onlyShowSSO) {
        return;
      }

      positionedEmailCaretRef.current = true;
      input.focus({ preventScroll: true });

      if (!defaultEmail) return;

      const end = defaultEmail.length;
      input.setSelectionRange(end, end);
    },
    [defaultEmail, onlyShowSSO]
  );

  async function handleEmailSubmit() {
    if (!email) return;
    setError('');
    setSubmitting(true);
    try {
      const result = await signInMagicLink({
        email,
        // Magic-link verification decodes the callback before redirecting.
        callbackURL: encodeURI(callbackUrl),
        ...(oauthQuery === undefined
          ? {}
          : { metadata: { oauth_query: oauthQuery } }),
      });
      if (result.error) {
        setError(
          translateAuthError(
            result.error,
            gt('Failed to send magic link'),
            gt(
              'You requested a link recently. Please wait a minute before requesting another, or check your inbox for the earlier email.'
            )
          )
        );
        return;
      }
      // The dashboard pushes /auth/verify-request; the gallery shows that
      // state.
      flow.go('verify-request');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSsoSubmit() {
    if (!ssoEmail) return;
    setSsoError('');
    setSsoSubmitting(true);
    try {
      const result = await signInSso({
        email: ssoEmail,
        callbackURL: callbackUrl,
        errorCallbackURL,
      });
      if (result.error) {
        setSsoError(
          translateAuthError(result.error, gt('Failed to start SSO sign-in'))
        );
      }
      // The dashboard leaves for the identity provider here; the gallery
      // has no provider to go to, so the form returns to rest.
    } finally {
      setSsoSubmitting(false);
    }
  }

  // The dashboard hands the browser to GitHub or Google and never returns
  // to this form, so it leaves the button pending. The gallery's stub
  // resolves in place, and the button returns to rest with it.
  async function handleSocialSignIn(provider: 'github' | 'google') {
    setSigningInWith(provider);
    try {
      await signInSocial({
        provider,
        callbackURL: callbackUrl,
        errorCallbackURL,
      });
    } finally {
      setSigningInWith(null);
    }
  }

  return (
    <div className='space-y-[clamp(9px,4.67svh_-_18px,24px)]'>
      {/* The extra 16px makes the seam to the first field 40px, the
          onboarding steps' gap, so the sign-in's first control lands on
          the same line as theirs. */}
      <div className='pb-4'>
        {showSsoForm ? (
          <T>
            <h1 className='typo-page-heading'>Enter your company email</h1>
            <p className='typo-lede mt-4'>
              We&apos;ll sign you in or create an account.
            </p>
          </T>
        ) : (
          (header ?? (
            <T>
              <h1 className='typo-page-heading'>What&apos;s your email?</h1>
              <p className='typo-lede mt-4'>
                We&apos;ll sign you in or create an account.
              </p>
            </T>
          ))
        )}
      </div>

      {showSsoForm ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSsoSubmit();
          }}
          className='space-y-[clamp(8px,1.4svh,12px)]'
        >
          <div className='flex flex-col gap-2.5'>
            <Label htmlFor='signin-sso-email'>
              <T>Company email</T>
            </Label>
            <Input
              id='signin-sso-email'
              type='text'
              inputMode='email'
              autoComplete='email'
              autoCapitalize='none'
              autoCorrect='off'
              spellCheck={false}
              placeholder='you@yourcompany.com'
              value={ssoEmail}
              onChange={(e) => setSsoEmail(e.target.value)}
              required
              autoFocus
              className='placeholder:text-muted-foreground/60 h-11 text-base md:text-[clamp(13.5px,1.9svh,15px)]'
            />
          </div>
          <Button type='submit' className='h-11 w-full' loading={ssoSubmitting}>
            <T>Continue with SSO</T>
          </Button>
          {ssoError && <p className='text-destructive text-sm'>{ssoError}</p>}
          {!onlyShowSSO && (
            <Button
              type='button'
              variant='ghost'
              className='h-11 w-full'
              onClick={() => {
                setSsoError('');
                setShowSsoForm(false);
              }}
            >
              <T>Back</T>
            </Button>
          )}
        </form>
      ) : (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleEmailSubmit();
            }}
            className='space-y-[clamp(8px,1.4svh,12px)]'
          >
            <div className='flex flex-col gap-2.5'>
              <Label htmlFor='signin-email'>
                <T>Email</T>
              </Label>
              <Input
                id='signin-email'
                ref={emailInputRef}
                type='text'
                inputMode='email'
                autoComplete='email'
                autoCapitalize='none'
                autoCorrect='off'
                spellCheck={false}
                placeholder='you@yourcompany.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className='placeholder:text-muted-foreground/60 h-11 text-base md:text-[clamp(13.5px,1.9svh,15px)]'
              />
            </div>
            <Button type='submit' className='h-11 w-full' loading={submitting}>
              <T>Continue</T>
            </Button>
            {error && <p className='text-destructive text-sm'>{error}</p>}
          </form>

          {/* Hairlines as borders: the frame allows no background fill
              beyond inputs and primary buttons. */}
          <div className='flex items-center gap-3'>
            <span
              aria-hidden='true'
              className='border-border flex-1 border-t'
            />
            <span className='text-muted-foreground text-xs'>
              <T>or</T>
            </span>
            <span
              aria-hidden='true'
              className='border-border flex-1 border-t'
            />
          </div>

          <div className='grid gap-[clamp(7px,1.2svh,10px)]'>
            <Button
              type='button'
              variant='outline'
              className='h-11 w-full justify-start bg-transparent px-4 font-normal dark:bg-transparent'
              loading={signingInWith === 'github'}
              disabled={signingInWith !== null}
              onClick={() => void handleSocialSignIn('github')}
            >
              <SiGithub className='mr-2.5 h-4 w-4' />
              <T>Continue with GitHub</T>
            </Button>
            <Button
              type='button'
              variant='outline'
              className='h-11 w-full justify-start bg-transparent px-4 font-normal dark:bg-transparent'
              loading={signingInWith === 'google'}
              disabled={signingInWith !== null}
              onClick={() => void handleSocialSignIn('google')}
            >
              <SiGoogle className='mr-2.5 h-4 w-4' />
              <T>Continue with Google</T>
            </Button>
            <Button
              type='button'
              variant='outline'
              className='h-11 w-full justify-start bg-transparent px-4 font-normal dark:bg-transparent'
              disabled={signingInWith !== null}
              onClick={() => {
                setSsoEmail((currentEmail) => currentEmail || email);
                setSsoError('');
                setShowSsoForm(true);
              }}
            >
              <KeyIcon className='mr-2.5 h-4 w-4' />
              <T>Continue with SSO</T>
            </Button>
          </div>
        </>
      )}

      {captchaWidget}

      <T>
        <p className='text-muted-foreground text-center text-xs'>
          By signing in, you agree to our{' '}
          <a
            href={`${homepageUrl}/legal/terms`}
            target='_blank'
            rel='noopener noreferrer'
            className='underline underline-offset-4 max-md:inline-flex max-md:min-h-11 max-md:items-center'
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href={`${homepageUrl}/legal/privacy-policy`}
            target='_blank'
            rel='noopener noreferrer'
            className='underline underline-offset-4 max-md:inline-flex max-md:min-h-11 max-md:items-center'
          >
            Privacy Policy
          </a>
          .
        </p>
      </T>
    </div>
  );
}
