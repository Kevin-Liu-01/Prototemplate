'use client';

import { usePathname } from 'next/navigation';
import { useRef } from 'react';

import { useQuietReveal } from '../sections/reveal';

/** Quiet close: the number, the cap, and the door back to the plans. */
export default function UsageClose() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  /* /d/<final>/usage/pricing → /d/<final>/pricing */
  const pathname = usePathname() ?? '';
  const base = pathname.split('/').slice(0, 3).join('/');
  const plansHref = base ? `${base}/pricing` : '#top';

  return (
    <section className='tc-sec' id='cta' ref={root}>
      <div className='sgx-close'>
        <h2 data-reveal>
          Start at <em className='sgx-em'>$0</em>. Cap it anywhere.
        </h2>
        <p data-reveal>
          Top up from $10 when you ship &mdash; credits, not seats. Enterprise takes the same
          meters at volume pricing, with the engineers who build it on the other end.
        </p>
        <div className='sgx-acts' data-reveal>
          <a className='tc-btn tc-btn-solid' href='#top'>
            Get started
          </a>
          <a className='tc-btn tc-btn-line' href={plansHref}>
            Compare plans
          </a>
        </div>
      </div>
    </section>
  );
}
