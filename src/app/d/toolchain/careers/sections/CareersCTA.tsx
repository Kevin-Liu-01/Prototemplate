'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../../sections/reveal';

/**
 * The old page's general-application card, as the direction's quiet close:
 * the same question, the same sentence, the same single door — a mailto to
 * careers@generaltranslation.com. The address itself is printed in mono
 * under the button; the channel is the content.
 */
export default function CareersCTA() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' ref={root}>
      <div className='crs-cta'>
        <h2 data-reveal>
          Don&rsquo;t see a role that <em>fits</em>?
        </h2>
        <p data-reveal>
          We&rsquo;re always looking for talented people. Send us your resume
          and tell us how you&rsquo;d like to contribute.
        </p>
        <div className='crs-cta-acts' data-reveal>
          <a className='tc-btn tc-btn-solid' href='mailto:careers@generaltranslation.com'>
            Get in touch
          </a>
        </div>
        <p className='crs-cta-mail' data-reveal>
          careers@generaltranslation.com
        </p>
      </div>
    </section>
  );
}
