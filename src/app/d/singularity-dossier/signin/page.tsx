import SignInAside from './SignInAside';

import '../../singularity/styles.css';
import '../styles.css';
import './signin.css';

export const metadata = {
  title: 'Sign In — Dossier — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/* Monochrome provider marks, inline so the prototype carries no icon
   dependency. */
function GitHubMark() {
  return (
    <svg viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
      <path d='M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.09-.73.09-.73 1.2.09 1.83 1.24 1.83 1.24 1.07 1.83 2.8 1.3 3.49 1 .1-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.49 5.92.43.38.82 1.11.82 2.24l-.01 3.32c0 .32.21.7.83.57A12 12 0 0 0 12 .3' />
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'>
      <path d='M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.7 2.21-5.6 2.21-4.47 0-7.96-3.6-7.96-8.06s3.49-8.06 7.96-8.06c2.41 0 4.17.95 5.47 2.17l2.55-2.55C18.75 2.38 16.06 1 12.48 1 6.42 1 1.32 5.93 1.32 12s5.1 11 11.16 11c3.27 0 5.74-1.07 7.67-3.08 1.98-1.98 2.6-4.77 2.6-7.02 0-.7-.05-1.34-.16-1.87z' />
    </svg>
  );
}

function KeyMark() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d='M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z' />
      <circle cx='16.5' cy='7.5' r='.5' fill='currentColor' />
    </svg>
  );
}

function ShieldMark() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d='M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3z' />
      <path d='m9 12 2 2 4-4' />
    </svg>
  );
}

function LanguagesMark() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
      style={{ width: 16, height: 16 }}
    >
      <path d='m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6' />
    </svg>
  );
}

function ChevronMark() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
      style={{ width: 14, height: 14 }}
    >
      <path d='m6 9 6 6 6-6' />
    </svg>
  );
}

/**
 * Sign in — the dashboard's sign-in ported into the Dossier: the
 * Profound-style split with the mark and form on the left; the halftone
 * globe stands over the glyph rain on the right. The form is a prototype
 * with inert authentication controls and production-shaped layout.
 */
export default function SingularityDossierSignInPage() {
  return (
    <>
      <div className='singularity-root sgd-root sgs-page' id='top'>
        <div className='sgs-split'>
          <section className='sgs-col'>
            <div className='sgs-block'>
              <a
                href='/d/singularity-dossier'
                className='sgs-logo'
                aria-label='General Translation'
              >
                <img
                  className='is-light'
                  src='/brand/no-bg-gt-logo-light.png'
                  alt=''
                />
                <img
                  className='is-dark'
                  src='/brand/no-bg-gt-logo-dark.png'
                  alt=''
                />
              </a>
            </div>

            <div className='sgs-mid'>
              <div className='sgs-block sgs-form'>
                <div>
                  <h1>What&apos;s your email?</h1>
                  <p className='sgs-sub'>
                    We&apos;ll sign you in or create an account.
                  </p>
                </div>

                <div className='sgs-stack'>
                  <input
                    className='sgs-input'
                    type='text'
                    inputMode='email'
                    autoComplete='email'
                    autoCapitalize='none'
                    autoCorrect='off'
                    spellCheck={false}
                    placeholder='you@yourcompany.com'
                    aria-label='Email'
                  />
                  <button type='button' className='sgs-btn is-solid' disabled>
                    Continue
                  </button>
                </div>

                <div className='sgs-or'>or</div>

                <div className='sgs-stack is-providers'>
                  <button type='button' className='sgs-btn is-line sgs-provider' disabled>
                    <GitHubMark />
                    Continue with GitHub
                  </button>
                  <button type='button' className='sgs-btn is-line sgs-provider' disabled>
                    <GoogleMark />
                    Continue with Google
                  </button>
                  <button type='button' className='sgs-btn is-line sgs-provider'>
                    <KeyMark />
                    Continue with SSO
                  </button>
                </div>

                <div
                  aria-live='polite'
                  className='sgs-captcha'
                  role='status'
                >
                  <ShieldMark />
                  <span className='sgs-captcha-copy'>
                    <strong>Checking browser security</strong>
                    <small>Protected by Cloudflare Turnstile</small>
                  </span>
                </div>

                <p className='sgs-terms'>
                  By signing in, you agree to our{' '}
                  <a
                    href='/d/singularity-dossier/legal/terms'
                  >
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a
                    href='/d/singularity-dossier/legal/privacy-policy'
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
              </div>
            </div>

          </section>

          <SignInAside />
        </div>

        <footer className='sgs-footer'>
          <div className='sgs-footer-links'>
            <a href='/d/singularity-dossier/contact'>Contact</a>
            <a href='/d/singularity-dossier/legal/terms'>
              Terms of Service
            </a>
            <a href='/d/singularity-dossier/legal/privacy-policy'>
              Privacy
            </a>
          </div>
          <div className='sgs-footer-meta'>
            {/* the language selector is a visual stub — the prototype has
                no locale machinery */}
            <button type='button' className='sgs-lang'>
              <LanguagesMark />
              English (US)
              <ChevronMark />
            </button>
            <p>
              © {new Date().getFullYear()} General Translation, Inc. All
              rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
