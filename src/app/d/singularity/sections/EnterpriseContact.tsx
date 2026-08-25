'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';

import GlyphRain from './GlyphRain';
import { useQuietReveal } from './reveal';
import { createGlyphField, SCRIPTS, type GlyphFieldHandle } from '@/lib/glyph-field';

gsap.registerPlugin(useGSAP);

/* The three deployment pillars, verbatim from the live enterprise page.
   Each cell closes on a mono file line restating the pillar in the
   sheet's own ledger voice — drawn from the pillar's own words. */
const FEATURES: readonly { title: string; line: string; foot: string }[] = [
  {
    title: 'Enterprise platform',
    line: 'Share translation context, glossaries, and custom prompts across every project and content source in your company.',
    foot: 'context · glossaries · prompts',
  },
  {
    title: 'Customized workflows',
    line: 'Reliable, scalable translation workflows across any file format or framework.',
    foot: 'any format · any framework',
  },
  {
    title: 'Forward-deployed setup',
    line: 'Dedicated hours with forward-deployed engineers to bring localization to production.',
    foot: 'dedicated hours · to production',
  },
] as const;

const COMPLIANCE = [
  'SOC 2 Type II',
  'GDPR',
  'ISO 27001',
  'SSO / SAML',
  'RBAC',
  'Custom SLA',
] as const;

/* The contact API's stable error codes (apps/landing/src/lib/contactErrorCodes.ts)
   mapped to the same lines the production form shows. */
const ERROR_LINES: Readonly<Record<string, string>> = {
  rate_limited: 'Too many requests. Please try again later.',
  missing_fields: 'Please fill in all required fields.',
  invalid_email: 'Please provide a valid email address.',
  enterprise_email_rejected: 'Please use a company email address.',
};

const GENERIC_ERROR = 'Something went wrong. Please try again later.';

type SubmitState = 'idle' | 'sending' | 'sent';

/**
 * The contact bay — the section the hero's CTA lands on. A full-bleed ink
 * band: the pitch and the three enterprise commitments up top, then the
 * ruled contact sheet — the form written into the sheet's margin while the
 * glyph rain condenses into the word "language" in script after script on
 * the paper beside it (the glyph-field engine, panel-scale). Focusing any
 * field quiets the rain. The form is the old landing's real enterprise
 * form: same fields, same endpoint, same error codes — success only when
 * the API says so.
 */
type Props = {
  /** Path of the full contact desk, appended to the concept base. Only the
      finals that carry /enterprise/contact pass it; everywhere else the
      band closes on the form as it always has. Styled by
      enterprise-contact.css, which those routes' pages import. */
  deskPath?: string;
};

export default function EnterpriseContact({ deskPath }: Props) {
  const root = useRef<HTMLElement>(null);
  const fieldRef = useRef<HTMLCanvasElement>(null);
  const pathname = usePathname();
  const base = pathname?.match(/^\/d\/[^/]+/)?.[0] ?? '/d/singularity';
  const [scriptIndex, setScriptIndex] = useState(0);
  const [submit, setSubmit] = useState<SubmitState>('idle');
  const [error, setError] = useState<string | null>(null);

  useQuietReveal(root);

  useGSAP(
    () => {
      const canvas = fieldRef.current;
      let field: GlyphFieldHandle | null = null;
      if (canvas) {
        field = createGlyphField({
          canvas,
          displayFamily:
            getComputedStyle(canvas).getPropertyValue('--tc-disp').trim() || undefined,
          onScript: (index) => setScriptIndex(index),
        });
      }
      return () => {
        field?.destroy();
      };
    },
    { scope: root }
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = {
      name: String(data.get('name') ?? ''),
      email: String(data.get('email') ?? ''),
      companyName: String(data.get('companyName') ?? ''),
      message: String(data.get('message') ?? ''),
    };
    setSubmit('sending');
    setError(null);
    try {
      const res = await fetch('/api/contact?type=enterprise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { code?: string };
        setError((body.code !== undefined && ERROR_LINES[body.code]) || GENERIC_ERROR);
        setSubmit('idle');
        return;
      }
      /* The form unmounts on success, so it cannot be resubmitted. */
      setSubmit('sent');
    } catch {
      setError(GENERIC_ERROR);
      setSubmit('idle');
    }
  }

  const script = SCRIPTS[scriptIndex] ?? SCRIPTS[0];

  return (
    <section className='tc-band sge-bay' id='contact' ref={root}>
      <GlyphRain className='sge-bay-rain' />
      <div className='sge-bay-in'>
        <div className='sge-head'>
          <h2 data-reveal>Talk to our team about enterprise deployment.</h2>
          <p data-reveal>
            Talk to an engineer — not a sales deck. We&rsquo;ll walk your stack, your locales, and
            your review process, and leave you with a working plan.
          </p>
        </div>

        {/* the three deployment pillars as artifact cells on the band */}
        <div className='sge-feats' data-reveal>
          {FEATURES.map((feature) => (
            <article className='sge-feat' key={feature.title}>
              <h3>{feature.title}</h3>
              <p>{feature.line}</p>
              <span className='sge-feat-foot'>{feature.foot}</span>
            </article>
          ))}
        </div>

        {/* The contact sheet. The glyph-field engine owns the whole sheet's
            canvas: its clearing keeps the rain off the form column, and the
            word condenses on the ruled paper beside it. */}
        <div className='sge-body' data-reveal>
          <canvas
            className='sge-field'
            ref={fieldRef}
            style={{ ['--tc-ink' as never]: '#ffffff' }}
            aria-hidden
          />
          <div className='sge-grid'>
            <div className='sge-formcol'>
              {submit === 'sent' ? (
                <div className='sge-received' role='status'>
                  <h3>Message received</h3>
                  <p>Thank you for reaching out. We&rsquo;ll be in touch soon.</p>
                </div>
              ) : (
                <form className='sge-form' onSubmit={onSubmit}>
                  {error !== null ? (
                    <div className='sge-error' role='alert'>
                      {error}
                    </div>
                  ) : null}
                  <div className='sge-row'>
                    <label className='sge-fieldbox'>
                      <span>Full Name</span>
                      <input name='name' type='text' autoComplete='name' required placeholder='Your name' />
                    </label>
                    <label className='sge-fieldbox'>
                      <span>Company Email</span>
                      <input
                        name='email'
                        type='email'
                        autoComplete='email'
                        required
                        placeholder='you@yourcompany.com'
                      />
                    </label>
                  </div>
                  <label className='sge-fieldbox'>
                    <span>Company Name</span>
                    <input
                      name='companyName'
                      type='text'
                      autoComplete='organization'
                      required
                      placeholder='Your company'
                    />
                  </label>
                  <label className='sge-fieldbox'>
                    <span>How can we help?</span>
                    <textarea
                      name='message'
                      rows={5}
                      required
                      placeholder='Tell us how we can help with localization, including timeline and requirements.'
                    />
                  </label>
                  <div className='sge-form-foot'>
                    <p className='sge-terms'>
                      By submitting you agree to the{' '}
                      <a
                        href='https://generaltranslation.com/legal/terms'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        Terms of Service
                      </a>{' '}
                      and acknowledge the{' '}
                      <a
                        href='https://generaltranslation.com/legal/privacy-policy'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        Privacy Policy
                      </a>
                      .
                    </p>
                    <button className='sge-submit' type='submit' disabled={submit === 'sending'}>
                      {submit === 'sending' ? 'Sending…' : 'Continue'}
                    </button>
                  </div>
                </form>
              )}
              {deskPath !== undefined ? (
                <p className='sgec-aside'>
                  Need the full sheet?{' '}
                  <a href={`${base}${deskPath}`}>Open the enterprise contact desk</a>.
                </p>
              ) : null}
            </div>
            {/* the engine's paper: the rain, the condensed word, its caliper */}
            <div className='sge-rainzone' aria-hidden>
              {script !== undefined ? (
                <span className='sge-readout'>
                  {script.script} · {script.word}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className='sge-compliance' aria-label='Compliance and enterprise controls'>
        {COMPLIANCE.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </section>
  );
}
