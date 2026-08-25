'use client';

import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';
import type { FormEvent } from 'react';

import GlyphRain from './GlyphRain';
import { useQuietReveal } from './reveal';
import {
  CURSOR_QUOTE,
  ENTERPRISE_CONTACT_HEADING,
  ENTERPRISE_PILLARS,
  LIVE_ENTERPRISE_CONTACT,
  LIVE_PRIVACY,
  LIVE_TERMS,
} from './enterprise-contact-data';

/**
 * The enterprise contact desk — the sheet behind the enterprise page's
 * "Talk to Sales". Same ink band, same rain, same hairline instruments as
 * the enterprise bay, but laid out the way the live page lays it out: the
 * pitch and the four commitments hold the left column, the form holds the
 * right, and the Cursor quote closes the intro on the record.
 *
 * Field for field this is the live enterprise form (ContactForm.tsx driven
 * by EnterpriseContactForm.tsx): the same labels, placeholders, terms line
 * and "Continue" act. The one honest difference: nothing is sent from
 * here. Submitting surfaces the notice and names the form that does send.
 */

type FormState = {
  name: string;
  email: string;
  companyName: string;
  message: string;
};

const EMPTY: FormState = { name: '', email: '', companyName: '', message: '' };

export default function EnterpriseContactDesk() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  const pathname = usePathname();
  const base = pathname?.match(/^\/d\/[^/]+/)?.[0] ?? '/d/singularity';

  const [form, setForm] = useState<FormState>(EMPTY);
  const [noticed, setNoticed] = useState(false);

  const set = (key: keyof FormState) => (value: string) =>
    setForm((state) => ({ ...state, [key]: value }));

  /* The live form lights its act once every required field is filled; the
     study keeps the tell, since it costs nothing and reads true. */
  const ready = Object.values(form).every((value) => value.trim() !== '');

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    /* A design study never fakes a success state: submitting surfaces the
       honest notice and points at the live form. */
    event.preventDefault();
    setNoticed(true);
  }

  return (
    <section
      aria-label='Enterprise contact'
      className='tc-band sge-bay sgec-bay'
      id='form'
      ref={root}
    >
      <GlyphRain className='sge-bay-rain' />
      <div className='sge-bay-in sgec-in'>
        <div className='sgec-desk'>
          <div className='sgec-intro'>
            <h2 data-reveal>{ENTERPRISE_CONTACT_HEADING}</h2>

            <div className='sgec-pillars'>
              {ENTERPRISE_PILLARS.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <p className='sgec-pillar' data-reveal key={pillar.title}>
                    <Icon
                      aria-hidden
                      className='sgec-pillar-glyph'
                      color='currentColor'
                      size={15}
                      strokeWidth={1.75}
                    />
                    <b>{pillar.title}</b> <span>{pillar.body}</span>
                  </p>
                );
              })}
            </div>

            <figure className='sgec-quote' data-reveal>
              <blockquote>
                <p>{CURSOR_QUOTE.message}</p>
              </blockquote>
              <figcaption>
                <b>{CURSOR_QUOTE.user}</b>
                <span>{CURSOR_QUOTE.role}</span>
                <a
                  href={CURSOR_QUOTE.href}
                  rel='noreferrer noopener'
                  target='_blank'
                >
                  On the record <span aria-hidden>&#8599;</span>
                </a>
              </figcaption>
            </figure>
          </div>

          <div className='sgec-formcol'>
            <form className='sge-form' data-reveal onSubmit={onSubmit}>
              <div className='sge-row'>
                <label className='sge-fieldbox'>
                  <span>Full Name</span>
                  <input
                    autoComplete='name'
                    name='name'
                    onChange={(event) => set('name')(event.target.value)}
                    placeholder='Your name'
                    required
                    type='text'
                    value={form.name}
                  />
                </label>
                <label className='sge-fieldbox'>
                  <span>Company Email</span>
                  <input
                    autoComplete='email'
                    name='email'
                    onChange={(event) => set('email')(event.target.value)}
                    placeholder='you@yourcompany.com'
                    required
                    type='email'
                    value={form.email}
                  />
                </label>
              </div>

              <label className='sge-fieldbox'>
                <span>Company Name</span>
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
                <span>How can we help?</span>
                <textarea
                  name='message'
                  onChange={(event) => set('message')(event.target.value)}
                  placeholder='Tell us how we can help with localization, including timeline and requirements.'
                  required
                  rows={6}
                  value={form.message}
                />
              </label>

              {noticed ? (
                <p className='sgec-notice' role='status'>
                  Nothing was sent &mdash; this design study isn&rsquo;t wired
                  to the contact API. The live form at{' '}
                  <a
                    href={LIVE_ENTERPRISE_CONTACT}
                    rel='noreferrer noopener'
                    target='_blank'
                  >
                    generaltranslation.com/enterprise/contact
                  </a>{' '}
                  reaches the team.
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
                  Continue
                </button>
              </div>
            </form>

            <p className='sgec-aside' data-reveal>
              Y Combinator founder?{' '}
              <a href={`${base}/enterprise/contact/yc`}>Claim your YC deal</a>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
