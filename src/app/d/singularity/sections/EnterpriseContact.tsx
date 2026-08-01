'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

import GlyphRain from './GlyphRain';
import { createGlyphField, type GlyphFieldHandle } from './contact/glyphField';

gsap.registerPlugin(useGSAP);

const COMPLIANCE = [
  'SOC 2 Type II',
  'GDPR',
  'ISO 27001',
  'SSO / SAML',
  'RBAC',
  'Custom SLA',
] as const;

/**
 * The contact bay — the section the hero's CTAs land on. A full-bleed ink
 * band directly under the gate: ambient glyphs rain through the dark, and
 * the left column carries the glyph-rain fork's condensation field — the
 * swarm printing "language" in script after script — above the engineer
 * pitch. The right column is a plain hairline form; the compliance row
 * closes the band with the enterprise facts as quiet mono chips.
 */
export default function EnterpriseContact() {
  const root = useRef<HTMLElement>(null);
  const wordRef = useRef<HTMLCanvasElement>(null);

  useGSAP(
    () => {
      const wordCanvas = wordRef.current;
      let field: GlyphFieldHandle | null = null;
      if (wordCanvas) {
        field = createGlyphField({
          canvas: wordCanvas,
          displayFamily:
            getComputedStyle(wordCanvas).getPropertyValue('--tc-disp').trim() || undefined,
        });
      }

      gsap.from('[data-sgc-in]', {
        y: 16,
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power2.out',
      });

      return () => {
        field?.destroy();
      };
    },
    { scope: root }
  );

  return (
    <section className='tc-band sgc' id='contact' ref={root}>
      <GlyphRain className='sgc-rain' />
      <div className='sgc-in'>
        <div className='sgc-head'>
          {/* the condensation field leads the column: the swarm prints
              "language" in script after script, ink pinned white */}
          <div className='sgc-view' data-sgc-in>
            <canvas
              className='sgc-view-canvas'
              ref={wordRef}
              style={{ ['--tc-ink' as never]: '#ffffff' }}
              aria-hidden
            />
          </div>
          <h2 data-sgc-in>Bring your product to every market.</h2>
          <p data-sgc-in>
            Talk to an engineer — not a sales deck. We&rsquo;ll walk your stack, your locales, and
            your review process, and leave you with a working plan.
          </p>
          <ul className='sgc-points' data-sgc-in>
            <li>Forward-deployed engineers on your integration</li>
            <li>Custom workflows for any format or framework</li>
            <li>Security review and procurement, handled</li>
          </ul>
          {/* PLACEHOLDER QUOTE — swap for Andrew Milich's real words before
              this copy ships anywhere */}
          <figure className='sgc-quote' data-sgc-in>
            <blockquote>
              <p>
                We shipped our whole product in new languages faster than any launch I&rsquo;ve
                run — the review workflow is the part nobody else gets right.
              </p>
            </blockquote>
            <figcaption>
              <b>Andrew Milich</b>
              <span>Notion</span>
            </figcaption>
          </figure>
        </div>

        <form className='sgc-form' data-sgc-in onSubmit={(e) => e.preventDefault()}>
          <div className='sgc-row'>
            <label className='sgc-field'>
              <span>Name</span>
              <input name='name' type='text' autoComplete='name' placeholder='Ada Lovelace' />
            </label>
            <label className='sgc-field'>
              <span>Work email</span>
              <input
                name='email'
                type='email'
                autoComplete='email'
                placeholder='ada@company.com'
              />
            </label>
          </div>
          <label className='sgc-field'>
            <span>Company</span>
            <input name='company' type='text' autoComplete='organization' placeholder='Company' />
          </label>
          <label className='sgc-field'>
            <span>What are you localizing?</span>
            <textarea
              name='about'
              rows={4}
              placeholder='Your app, your docs, the locales you need, the stack you run.'
            />
          </label>
          <button className='sgc-submit' type='submit'>
            Request a demo
          </button>
        </form>
      </div>

      <div className='sgc-compliance' aria-label='Compliance and enterprise controls'>
        {COMPLIANCE.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </section>
  );
}
