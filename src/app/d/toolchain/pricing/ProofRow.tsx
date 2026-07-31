'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../sections/reveal';

/**
 * The proof row: Theo's real quote, verbatim from the current site's
 * testimonial section, set against the brand's doubled thread. No carousel,
 * no avatars grid — one attributed sentence pair.
 */
export default function ProofRow() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' ref={root}>
      <figure className='tcp-quote' data-reveal>
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
