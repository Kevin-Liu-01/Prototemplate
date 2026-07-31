'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../../../sections/reveal';

/** Quiet close: the number, the cap, and the door back to the plans. */
export default function UsageCTA() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='cta' ref={root}>
      <div className='up-cta'>
        <h2 data-reveal>
          Start at <em>$0</em>. Cap it anywhere.
        </h2>
        <p data-reveal>
          Top up from $10 when you ship &mdash; credits, not seats. Enterprise takes the same meters
          at volume pricing, with the engineers who build it on the other end.
        </p>
        <div className='up-cta-acts' data-reveal>
          <a className='tc-btn tc-btn-solid' href='#top'>
            Get started
          </a>
          <a className='tc-btn tc-btn-line' href='/d/toolchain/pricing'>
            Compare plans
          </a>
        </div>
      </div>
    </section>
  );
}
