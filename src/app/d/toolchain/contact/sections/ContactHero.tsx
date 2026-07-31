'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../../sections/reveal';

/**
 * The old page's opening, re-set on the ruled column: its title ("Get in
 * touch"), and its two feature blurbs — technical support and general
 * inquiries — as a pair of ruled cells instead of icon bullets. Copy is
 * verbatim from ContactPage.tsx on the landing app.
 */
export default function ContactHero() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='contact-hero' ref={root}>
      <div className='tcc-hero'>
        <h1 data-reveal>
          Get in <em>touch</em>.
        </h1>
        <p data-reveal>
          Send a message through the form &mdash; the same one the live site runs &mdash; or reach
          the team directly on any channel in the ledger.
        </p>
      </div>

      <div className='tc-row is-even'>
        <div className='tc-cell tcc-kind' data-reveal>
          <h3>Technical support.</h3>
          <p>Need help with integration or troubleshooting? Reach out to our team.</p>
        </div>
        <div className='tc-cell tcc-kind' data-reveal>
          <h3>General inquiries.</h3>
          <p>Have a question about General Translation? We&rsquo;re here to help.</p>
        </div>
      </div>
    </section>
  );
}
