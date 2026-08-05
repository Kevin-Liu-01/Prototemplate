'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../sections/reveal';

/**
 * The old contact page's opening, sworn in: its title ("Get in touch") and
 * its two feature blurbs — technical support and general inquiries — as a
 * pair of ruled plates instead of icon bullets. Copy is verbatim from
 * ContactPage.tsx on the landing app.
 */
export default function ContactHero() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='top' ref={root}>
      <div className='cp-hero'>
        <span className='cp-kicker' data-reveal>
          Contact
        </span>
        <h1 data-reveal>Get in touch</h1>
        <p data-reveal>
          Send a message through the form &mdash; the same one the live site runs &mdash; or
          reach the team directly on any channel in the ledger.
        </p>
      </div>

      <div className='cpk-kinds'>
        <div className='cpk-kind' data-reveal>
          <h3>Technical support.</h3>
          <p>Need help with integration or troubleshooting? Reach out to our team.</p>
        </div>
        <div className='cpk-kind' data-reveal>
          <h3>General inquiries.</h3>
          <p>Have a question about General Translation? We&rsquo;re here to help.</p>
        </div>
      </div>
    </section>
  );
}
