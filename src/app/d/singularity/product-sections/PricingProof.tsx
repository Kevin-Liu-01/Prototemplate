'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../sections/reveal';

/**
 * The proof, filed as a testimony plate the way the dossier files them:
 * a machined rule-label, the sworn words in display type, the attribution
 * below. Theo's real quote, verbatim from the current site's testimonial
 * section — no carousel, no avatars, one attributed statement.
 */
export default function PricingProof() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' ref={root}>
      <figure className='sgx-quote sgx-close' data-reveal>
        <div className='sgx-rule'>
          <span>On the record</span>
          <i>T3Chat</i>
        </div>
        <blockquote cite='https://x.com/theo/status/2008302190168019187'>
          <p>Every once in awhile, I see a snippet of code that makes me a bit emotional.</p>
          <p>
            Now is one of those moments. Internationalization went from &ldquo;$%!# this&rdquo; to
            &ldquo;trivial&rdquo;.
          </p>
        </blockquote>
        <figcaption>
          <b>Theo</b>
          <span>CEO, T3Chat</span>
          <a href='https://x.com/theo/status/2008302190168019187'>x.com/theo</a>
        </figcaption>
      </figure>
    </section>
  );
}
