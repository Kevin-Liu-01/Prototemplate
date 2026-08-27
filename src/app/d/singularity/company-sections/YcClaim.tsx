'use client';

import { usePathname } from 'next/navigation';

import type { ComponentType, FormEvent } from 'react';
import { useRef, useState } from 'react';

import { BadgeCheck, MessageSquareText, ShieldCheck } from 'lucide-react';

import GlyphRain from '../sections/GlyphRain';
import { useQuietReveal } from '../sections/reveal';

/**
 * The claim record — YcContactForm.tsx (embedded) landed on this direction's
 * ink band, the same place the contact bay lands. Heading, blurb, the three
 * assurances, every field label and placeholder, the terms line and the
 * button label are verbatim from the live component.
 *
 * The live form POSTs to /api/contact?type=yc, which checks the founder
 * verification link with YC before the request reaches the team. This study
 * has no such endpoint and never fakes one: submitting assembles the record
 * and surfaces an honest notice pointing at the live page.
 */

type IconProps = {
  className?: string;
  color?: string;
  size?: number;
  strokeWidth?: number;
  'aria-hidden'?: boolean;
};

type FormState = {
  email: string;
  verificationUrl: string;
  companyName: string;
  companyDescription: string;
};

const EMPTY: FormState = {
  email: '',
  verificationUrl: '',
  companyName: '',
  companyDescription: '',
};

const ASSURANCES: readonly { id: string; body: string; icon: ComponentType<IconProps> }[] = [
  {
    id: 'verify',
    body: 'Your YC verification link confirms eligibility before the request reaches our team.',
    icon: ShieldCheck,
  },
  {
    id: 'onboarding',
    body: 'Tell us what you are building so we can prepare the right onboarding path.',
    icon: MessageSquareText,
  },
  {
    id: 'review',
    body: 'Verified claims go directly to the team for review and activation.',
    icon: BadgeCheck,
  },
];

export default function YcClaim() {
  const pathname = usePathname();
  const base = pathname?.match(/^\/d\/[^/]+/)?.[0] ?? '/d/singularity';
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [noticed, setNoticed] = useState(false);

  const set = (key: keyof FormState) => (value: string) =>
    setForm((s) => ({ ...s, [key]: value }));

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNoticed(true);
  }

  return (
    <section
      aria-label='Claim your YC deal'
      className='tc-band cp-band cpy-claim'
      id='claim-your-yc-deal'
      ref={root}
    >
      <GlyphRain className='cpk-rain' />
      <div className='cp-band-in cpk-in'>
        <div className='cpk-chan cpy-claim-copy'>
          <h2 data-reveal>Claim your YC deal</h2>
          <p data-reveal>
            Verify your YC founder status to claim $5,000 in General Translation credits for
            12 months.
          </p>

          <div className='cpy-assure'>
            {ASSURANCES.map((row) => {
              const Icon = row.icon;
              return (
                <div className='cpy-assure-row' data-reveal key={row.id}>
                  <Icon
                    aria-hidden
                    className='cpy-assure-glyph'
                    color='currentColor'
                    size={17}
                    strokeWidth={1.75}
                  />
                  <p>{row.body}</p>
                </div>
              );
            })}
          </div>
        </div>

        <form className='cpk-form' data-reveal onSubmit={onSubmit}>
          <label className='cpk-field'>
            <span>Email</span>
            <input
              autoComplete='email'
              name='email'
              onChange={(e) => set('email')(e.target.value)}
              placeholder='you@company.com'
              required
              type='email'
              value={form.email}
            />
          </label>

          <label className='cpk-field'>
            <span>YC verification link</span>
            <input
              inputMode='url'
              name='verificationUrl'
              onChange={(e) => set('verificationUrl')(e.target.value)}
              placeholder='https://www.ycombinator.com/verify/...'
              required
              type='url'
              value={form.verificationUrl}
            />
          </label>
          <a
            className='cpy-verify-link'
            href='https://www.ycombinator.com/verify'
            rel='noreferrer noopener'
            target='_blank'
          >
            Get Your YC Verification Link
          </a>

          <label className='cpk-field'>
            <span>Company name</span>
            <input
              autoComplete='organization'
              name='companyName'
              onChange={(e) => set('companyName')(e.target.value)}
              placeholder='Your company'
              required
              type='text'
              value={form.companyName}
            />
          </label>

          <label className='cpk-field'>
            <span>What does your company do?</span>
            <textarea
              name='companyDescription'
              onChange={(e) => set('companyDescription')(e.target.value)}
              placeholder='Tell us what you are building and who it is for.'
              required
              rows={5}
              value={form.companyDescription}
            />
          </label>

          {noticed ? (
            <p className='cpk-notice' role='status'>
              Nothing was sent &mdash; this design study has no verification endpoint, and
              the live /yc route is switched off upstream today. Reach the team at{' '}
              <a
                href='https://generaltranslation.com/contact'
                rel='noreferrer noopener'
                target='_blank'
              >
                generaltranslation.com/contact
              </a>
              .
            </p>
          ) : null}

          <p className='cpk-terms'>
            By submitting you agree to the{' '}
            <a
              href={`${base}/legal/terms`}
              rel='noreferrer noopener'
              target='_blank'
            >
              Terms of Service
            </a>{' '}
            and acknowledge the{' '}
            <a
              href={`${base}/legal/privacy-policy`}
              rel='noreferrer noopener'
              target='_blank'
            >
              Privacy Policy
            </a>
            .
          </p>
          <button className='cpk-submit' type='submit'>
            Claim Deal
          </button>
        </form>
      </div>
    </section>
  );
}
