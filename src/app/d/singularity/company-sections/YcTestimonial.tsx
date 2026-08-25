'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../sections/reveal';

/**
 * The one statement the live YC page carries: CursorTestimonial.tsx, word
 * for word, with its real attribution and its real source — Lee Robinson's
 * LinkedIn post about Cursor's new docs. It is also one of the two quotes
 * the enterprise CONTENT LAW admits, so nothing new is entered on the
 * record here.
 *
 * The live component prints leerob's GitHub avatar beside the name. This
 * repo configures no remote image host and this direction sets its record
 * in type alone, so the attribution stands without the portrait.
 */

const SOURCE_HREF =
  'https://www.linkedin.com/posts/leeerob_just-shipped-new-docs-for-cursor-been-hacking-activity-7374285675900297216-veY1/';

export default function YcTestimonial() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' ref={root}>
      <div className='cpy-quote-wrap'>
        <figure className='cpy-plate' data-reveal>
          <div className='cpy-plate-rule'>
            <span>On the record</span>
            <i>via LinkedIn</i>
          </div>
          <blockquote>
            <p>
              Kudos to General Translation for helping with the localization efforts (great
              team)
            </p>
          </blockquote>
          <figcaption>
            <b>Lee Robinson</b>
            <span>VP of Developer Experience, Cursor</span>
            <a href={SOURCE_HREF} rel='noreferrer noopener' target='_blank'>
              linkedin.com/in/leeerob <span aria-hidden>&#8599;</span>
            </a>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
