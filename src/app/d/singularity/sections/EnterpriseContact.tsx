'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { usePathname } from 'next/navigation';
import { useRef, useState } from 'react';

import { LIVE_ENTERPRISE_CONTACT } from './enterprise-contact-data';
import GlyphRain from './GlyphRain';
import { useQuietReveal } from '@/app/d/toolchain/sections/reveal';
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

/**
 * The contact bay — the section the hero's CTA lands on. A full-bleed ink
 * band: the pitch and the three enterprise commitments up top, then the
 * ruled contact sheet — the form written into the sheet's margin while the
 * glyph rain condenses into the word "language" in script after script on
 * the paper beside it (the glyph-field engine, panel-scale). Focusing any
 * field quiets the rain. The form carries the live enterprise form's
 * fields, but this study has no contact API: a submit sends nothing and
 * says so, with a link to the live form.
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
  const [noticed, setNoticed] = useState(false);

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

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNoticed(true);
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
            style={{ '--tc-ink': '#ffffff' }}
            aria-hidden
          />
          <div className='sge-grid'>
            <div className='sge-formcol'>
              <form className='sge-form' onSubmit={onSubmit}>
                {noticed ? (
                  <p className='sge-notice' role='status'>
                    Nothing was sent. This design study is not connected to the contact API;
                    the live form at{' '}
                    <a href={LIVE_ENTERPRISE_CONTACT} rel='noreferrer noopener' target='_blank'>
                      generaltranslation.com/enterprise/contact
                    </a>{' '}
                    reaches the team.
                  </p>
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
                  <button className='sge-submit' type='submit'>
                    Continue
                  </button>
                </div>
              </form>
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
