'use client';

import { useRef, useState } from 'react';
import type { ComponentType, FormEvent } from 'react';

import { SiDiscord, SiGithub, SiX } from '@icons-pack/react-simple-icons';
import { CircleDot, Mail } from 'lucide-react';

import { useQuietReveal } from '../../sections/reveal';

/**
 * The split: the live site's contact form on one side, its published channels
 * as a ledger on the other, and beneath both the wire — the request the form
 * assembles and the gauntlet /api/contact/route.ts runs it through. The form
 * is honest about being a design study: it validates, it assembles, and it
 * says plainly that nothing is sent from here.
 *
 * Sources (landing app, verbatim):
 * - fields/placeholders/terms: components/pages/ContactForm.tsx + contact/ContactPage.tsx
 * - gate rules and limits:     app/api/contact/route.ts
 * - rejection copy:            ContactForm.tsx translateContactError()
 * - channels:                  packages/ui NewFooter.tsx (GitHub, X, LinkedIn, Discord),
 *                              docs-footer-actions.tsx (report an issue, ask a question),
 *                              careers page mailto (careers@generaltranslation.com)
 */

type FormState = {
  name: string;
  email: string;
  companyName: string;
  message: string;
};

const EMPTY: FormState = { name: '', email: '', companyName: '', message: '' };

type IconProps = { className?: string; color?: string; size?: number; strokeWidth?: number; 'aria-hidden'?: boolean };

/** Neither icon set still ships a LinkedIn mark, so the glyph is inlined —
    the standard "in" path, drawn in currentColor like its siblings. */
function LinkedInMark({ className, size = 15 }: IconProps) {
  return (
    <svg
      aria-hidden
      className={className}
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='currentColor'
    >
      <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z' />
    </svg>
  );
}

type Channel = {
  name: string;
  desc: string;
  addr: string;
  href: string;
  icon: ComponentType<IconProps>;
};

type ChannelGroup = { title: string; rows: readonly Channel[] };

/** Every row is a channel the current site links; none are invented here. */
const CHANNELS: readonly ChannelGroup[] = [
  {
    title: 'community',
    rows: [
      {
        name: 'GitHub',
        desc: 'Open source libraries',
        addr: 'github.com/generaltranslation/gt',
        href: 'https://github.com/generaltranslation/gt',
        icon: SiGithub,
      },
      {
        name: 'Issues',
        desc: 'Report an issue on GitHub',
        addr: 'generaltranslation/gt/issues/new',
        href: 'https://github.com/generaltranslation/gt/issues/new',
        icon: CircleDot,
      },
      {
        name: 'Discord',
        desc: 'Join our developer community',
        addr: 'generaltranslation.com/discord',
        href: 'https://generaltranslation.com/discord',
        icon: SiDiscord,
      },
    ],
  },
  {
    title: 'social',
    rows: [
      {
        name: 'X',
        desc: '@generaltxn',
        addr: 'x.com/generaltxn',
        href: 'https://x.com/generaltxn',
        icon: SiX,
      },
      {
        name: 'LinkedIn',
        desc: 'company/generaltranslation',
        addr: 'linkedin.com/company/generaltranslation',
        href: 'https://www.linkedin.com/company/generaltranslation',
        icon: LinkedInMark,
      },
    ],
  },
  {
    title: 'company',
    rows: [
      {
        name: 'Careers',
        desc: 'Join our growing team',
        addr: 'careers@generaltranslation.com',
        href: 'mailto:careers@generaltranslation.com',
        icon: Mail,
      },
    ],
  },
];

/** The gates, in the order route.ts runs them, with its real limits. */
const GATES: readonly { gate: string; rule: string; res: string }[] = [
  {
    gate: 'rate',
    rule: '5 requests per 60 s per IP',
    res: '429 · “Too many requests. Please try again later.”',
  },
  {
    gate: 'fields',
    rule: 'all four required — name ≤ 200, company ≤ 500, message ≤ 5000 chars',
    res: '400 · “Please fill in all required fields.”',
  },
  {
    gate: 'email',
    rule: 'syntax, placeholder-domain check, then a live MX lookup — A/AAAA fallback, 3 s cap, ambiguity passes',
    res: '400 · “Please provide a valid email address.”',
  },
  {
    gate: 'send',
    rule: 'relayed through Resend to the team’s inbox',
    res: '200 · { "ok": true }',
  },
];

/** One JSON body line of the live request preview. */
function BodyLine({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <span className='tcc-req-line'>
      {'  '}
      <span className='tcc-req-key'>&quot;{k}&quot;</span>
      {': '}
      <span className={v === '' ? 'tcc-req-val is-empty' : 'tcc-req-val'}>{JSON.stringify(v)}</span>
      {last ? '' : ','}
    </span>
  );
}

export default function ContactBody() {
  const root = useRef<HTMLDivElement>(null);
  useQuietReveal(root);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [noticed, setNoticed] = useState(false);

  const set = (key: keyof FormState) => (value: string) => setForm((s) => ({ ...s, [key]: value }));

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    // A design study never fakes a success state: submitting only surfaces
    // the honest notice and points at the wire trace + the live form.
    e.preventDefault();
    setNoticed(true);
  }

  return (
    <div ref={root}>
      {/* ---------------- the split: form | channels ---------------- */}
      <section className='tc-sec' id='form'>
        <div className='tc-row is-lead'>
          <div className='tc-cell is-framed' data-reveal>
            <div className='tc-card tcc-form-card'>
              <span className='tcc-tag'>
                the form &mdash; every field the live site asks for, all required
              </span>

              <form className='tcc-form' onSubmit={onSubmit}>
                <div className='tcc-pair'>
                  <div className='tcc-field'>
                    <label htmlFor='tcc-name'>Full Name</label>
                    <input
                      id='tcc-name'
                      name='name'
                      type='text'
                      required
                      autoComplete='name'
                      placeholder='Your name'
                      value={form.name}
                      onChange={(e) => set('name')(e.target.value)}
                    />
                  </div>
                  <div className='tcc-field'>
                    <label htmlFor='tcc-email'>Email</label>
                    <input
                      id='tcc-email'
                      name='email'
                      type='email'
                      required
                      autoComplete='email'
                      placeholder='you@example.com'
                      value={form.email}
                      onChange={(e) => set('email')(e.target.value)}
                    />
                  </div>
                </div>

                <div className='tcc-field'>
                  <label htmlFor='tcc-company'>Company Name</label>
                  <input
                    id='tcc-company'
                    name='companyName'
                    type='text'
                    required
                    autoComplete='organization'
                    placeholder='Your company'
                    value={form.companyName}
                    onChange={(e) => set('companyName')(e.target.value)}
                  />
                </div>

                <div className='tcc-field'>
                  <label htmlFor='tcc-message'>How can we help?</label>
                  <textarea
                    id='tcc-message'
                    name='message'
                    rows={6}
                    required
                    placeholder='Tell us what you need help with.'
                    value={form.message}
                    onChange={(e) => set('message')(e.target.value)}
                  />
                </div>

                {noticed && (
                  <p className='tcc-notice' role='status'>
                    Nothing was sent &mdash; this design study isn&rsquo;t wired to the API. The
                    live form at{' '}
                    <a href='https://generaltranslation.com/contact'>
                      generaltranslation.com/contact
                    </a>{' '}
                    runs the trace below.
                  </p>
                )}

                <div className='tcc-acts'>
                  <p className='tcc-terms'>
                    By submitting you agree to the{' '}
                    <a
                      href='https://generaltranslation.com/legal/terms'
                      target='_blank'
                      rel='noreferrer noopener'
                    >
                      Terms of Service
                    </a>{' '}
                    and acknowledge the{' '}
                    <a
                      href='https://generaltranslation.com/legal/privacy-policy'
                      target='_blank'
                      rel='noreferrer noopener'
                    >
                      Privacy Policy
                    </a>
                    .
                  </p>
                  <button className='tc-btn tc-btn-solid' type='submit'>
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className='tc-cell is-framed' data-reveal>
            <div className='tc-card tcc-chan-card'>
              <span className='tcc-tag'>direct channels</span>
              <h3>Or skip the form.</h3>
              <p>Every channel the current site publishes, in one ledger.</p>

              <div className='tcc-chan-ledger'>
                {CHANNELS.map((group) => (
                  <div className='tcc-chan-group' key={group.title}>
                    <span className='tcc-chan-title'>{group.title}</span>
                    {group.rows.map((row) => {
                      const Icon = row.icon;
                      const external = !row.href.startsWith('mailto:');
                      return (
                        <a
                          className='tcc-chan'
                          key={row.name}
                          href={row.href}
                          {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                        >
                          <Icon aria-hidden className='tcc-chan-glyph' color='currentColor' size={15} strokeWidth={1.75} />
                          <span className='tcc-chan-id'>
                            <b>{row.name}</b>
                            <span>{row.desc}</span>
                          </span>
                          <code className='tcc-chan-addr'>
                            {row.addr}
                            {external && <span aria-hidden> &#8599;</span>}
                          </code>
                        </a>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- the wire: request + gates ---------------- */}
      <section className='tc-sec' id='wire'>
        <div className='tc-head'>
          <h2 data-reveal>What happens to a message.</h2>
          <p data-reveal>
            On the live site, submitting runs this exact trace &mdash; one endpoint, three gates,
            and the copy each rejection shows. Type in the form above and watch the request
            assemble.
          </p>
        </div>

        <div className='tcc-wire-body'>
          <div className='tcc-panel' data-reveal>
            <div className='tcc-panel-bar'>
              <span>request &mdash; assembled from the form above</span>
              <span className='tcc-panel-note'>preview only &middot; nothing is sent</span>
            </div>

            <pre className='tcc-req'>
              <span className='tcc-req-line'>
                <span className='tcc-req-m'>POST</span> /api/contact?type=general
              </span>
              <span className='tcc-req-line is-dim'>host: generaltranslation.com</span>
              <span className='tcc-req-line is-dim'>content-type: application/json</span>
              <span className='tcc-req-line'>&nbsp;</span>
              <span className='tcc-req-line'>{'{'}</span>
              <BodyLine k='name' v={form.name} />
              <BodyLine k='email' v={form.email} />
              <BodyLine k='companyName' v={form.companyName} />
              <BodyLine k='message' v={form.message} last />
              <span className='tcc-req-line'>{'}'}</span>
            </pre>

            <div className='tcc-gates'>
              <div className='tcc-gate is-head' aria-hidden='true'>
                <span>gate</span>
                <span>rule</span>
                <span>response</span>
              </div>
              {GATES.map((row) => (
                <div className='tcc-gate' key={row.gate}>
                  <span className='tcc-gate-name'>{row.gate}</span>
                  <span className='tcc-gate-rule'>{row.rule}</span>
                  <span className='tcc-gate-res'>{row.res}</span>
                </div>
              ))}
              <p className='tcc-gate-foot'>
                on 200 the live form swaps in place: &ldquo;Message received &mdash; thank you for
                reaching out. We&rsquo;ll be in touch soon.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
