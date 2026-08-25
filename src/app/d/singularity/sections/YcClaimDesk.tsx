'use client';

import { useRef, useState } from 'react';
import type { FormEvent } from 'react';

import GlyphRain from './GlyphRain';
import { useQuietReveal } from './reveal';
import {
  LIVE_PRIVACY,
  LIVE_TERMS,
  LIVE_YC_CONTACT,
  YC_ASSURANCES,
  YC_CONTACT_HEADING,
  YC_VERIFY,
} from './enterprise-contact-data';

/**
 * The YC claim desk — the enterprise contact sheet's second face. Same ink
 * band and same instruments, but the live /enterprise/contact/yc form: the
 * founder's email, the YC verification link that proves eligibility before
 * a human ever sees the request, the company name, and what the company
 * does. Labels, placeholders, assurances and the "Claim Deal" act are
 * verbatim from YcContactForm.tsx.
 *
 * The study never verifies anything and never sends: submitting surfaces
 * the notice and names the live form that does.
 */

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

export default function YcClaimDesk() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [noticed, setNoticed] = useState(false);

  const set = (key: keyof FormState) => (value: string) =>
    setForm((state) => ({ ...state, [key]: value }));

  const ready = Object.values(form).every((value) => value.trim() !== '');

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    /* No claim is checked and nothing is sent — the notice says so. */
    event.preventDefault();
    setNoticed(true);
  }

  return (
    <section
      aria-label='Claim your YC deal'
      className='tc-band sge-bay sgec-bay'
      id='form'
      ref={root}
    >
      <GlyphRain className='sge-bay-rain' />
      <div className='sge-bay-in sgec-in'>
        <div className='sgec-desk'>
          <div className='sgec-intro'>
            {/* the dek stands once, on the masthead above */}
            <h2 data-reveal>{YC_CONTACT_HEADING}</h2>

            <div className='sgec-pillars is-plain'>
              {YC_ASSURANCES.map((assurance) => {
                const Icon = assurance.icon;
                return (
                  <p className='sgec-pillar' data-reveal key={assurance.body}>
                    <Icon
                      aria-hidden
                      className='sgec-pillar-glyph'
                      color='currentColor'
                      size={15}
                      strokeWidth={1.75}
                    />
                    <span>{assurance.body}</span>
                  </p>
                );
              })}
            </div>
          </div>

          <div className='sgec-formcol'>
            <form className='sge-form' data-reveal onSubmit={onSubmit}>
              <label className='sge-fieldbox'>
                <span>Email</span>
                <input
                  autoComplete='email'
                  name='email'
                  onChange={(event) => set('email')(event.target.value)}
                  placeholder='you@company.com'
                  required
                  type='email'
                  value={form.email}
                />
              </label>

              {/* the note is a sibling, not a child: a link inside a label
                  would fight the label for the click */}
              <div className='sgec-fieldgroup'>
                <label className='sge-fieldbox'>
                  <span>YC verification link</span>
                  <input
                    inputMode='url'
                    name='verificationUrl'
                    onChange={(event) =>
                      set('verificationUrl')(event.target.value)
                    }
                    placeholder='https://www.ycombinator.com/verify/...'
                    required
                    type='url'
                    value={form.verificationUrl}
                  />
                </label>
                <a
                  className='sgec-fieldnote'
                  href={YC_VERIFY}
                  rel='noreferrer noopener'
                  target='_blank'
                >
                  Get Your YC Verification Link <span aria-hidden>&#8599;</span>
                </a>
              </div>

              <label className='sge-fieldbox'>
                <span>Company name</span>
                <input
                  autoComplete='organization'
                  name='companyName'
                  onChange={(event) => set('companyName')(event.target.value)}
                  placeholder='Your company'
                  required
                  type='text'
                  value={form.companyName}
                />
              </label>

              <label className='sge-fieldbox'>
                <span>What does your company do?</span>
                <textarea
                  name='companyDescription'
                  onChange={(event) =>
                    set('companyDescription')(event.target.value)
                  }
                  placeholder='Tell us what you are building and who it is for.'
                  required
                  rows={5}
                  value={form.companyDescription}
                />
              </label>

              {noticed ? (
                <p className='sgec-notice' role='status'>
                  Nothing was verified and nothing was sent &mdash; this design
                  study isn&rsquo;t wired to the contact API. The live form at{' '}
                  <a
                    href={LIVE_YC_CONTACT}
                    rel='noreferrer noopener'
                    target='_blank'
                  >
                    generaltranslation.com/enterprise/contact/yc
                  </a>{' '}
                  checks the claim and reaches the team.
                </p>
              ) : null}

              <div className='sge-form-foot'>
                <p className='sge-terms'>
                  By submitting you agree to the{' '}
                  <a href={LIVE_TERMS} rel='noreferrer noopener' target='_blank'>
                    Terms of Service
                  </a>{' '}
                  and acknowledge the{' '}
                  <a
                    href={LIVE_PRIVACY}
                    rel='noreferrer noopener'
                    target='_blank'
                  >
                    Privacy Policy
                  </a>
                  .
                </p>
                <button
                  className={ready ? 'sge-submit is-ready' : 'sge-submit'}
                  type='submit'
                >
                  Claim Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
