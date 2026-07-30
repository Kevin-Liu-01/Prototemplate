'use client';

import { useRef } from 'react';

import { useQuietReveal } from './reveal';

/**
 * M16 — one quote, unedited, from a named person. Nothing else. The band sits
 * on the beige second sheet so even the quiet depth carries a surface.
 */
export default function Proof() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec is-proof' id='proof' ref={root}>
      <div className='ap-proof'>
        <blockquote data-reveal>
          Every once in awhile, I see a snippet of code that makes me a bit emotional. Now is one of
          those moments. Internationalization went from &ldquo;$%!# this&rdquo; to &ldquo;trivial&rdquo;.
        </blockquote>
        <p className='ap-proof-who' data-reveal>
          <b>Theo</b>
          <span>CEO, T3Chat</span>
        </p>
        <p className='ap-proof-second' data-reveal>
          &ldquo;insane engineering prowess&rdquo; — <b>Guillermo Rauch</b>, CEO, Vercel
        </p>
      </div>
    </section>
  );
}
