'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../sections/reveal';
import { LEGAL_DOCS } from './legal-docs';

/**
 * The legal index's masthead. "Legal Resources" and the line under it are the
 * whole copy deck of the page being replaced
 * (apps/landing/src/app/[locale]/(home)/legal/page.tsx); the old page also
 * printed the document count, which becomes this index's colophon alongside
 * the real span of last-updated dates.
 */
export default function LegalMasthead() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' ref={root}>
      <div className='cp-hero'>
        <span className='cp-kicker' data-reveal>
          The library
        </span>
        <h1 data-reveal>Legal Resources</h1>
        <p data-reveal>
          Policies, terms, and data processing information for General Translation.
        </p>
        <div className='cp-colophon' data-reveal>
          <span>{LEGAL_DOCS.length} published documents</span>
        </div>
      </div>
    </section>
  );
}
