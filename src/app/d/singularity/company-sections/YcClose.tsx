'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../sections/reveal';

/**
 * "Go global before Demo Day." — the live page's close, heading and copy
 * verbatim from YcPage.tsx. There it sits beside the spinning edge globe;
 * here the sheet closes quietly and hands the page to the claim record on
 * the ink band below, which is where its button already pointed.
 */
export default function YcClose() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' ref={root}>
      <div className='cpc-close cpy-close'>
        <h2 data-reveal>
          Go global before <span>Demo Day.</span>
        </h2>
        <p data-reveal>
          Start free, connect your stack, and add languages without adding a localization
          backlog.
        </p>
        <div className='cpc-close-acts' data-reveal>
          <a className='tc-btn tc-btn-solid' href='#claim-your-yc-deal'>
            Claim YC Deal
          </a>
        </div>
      </div>
    </section>
  );
}
