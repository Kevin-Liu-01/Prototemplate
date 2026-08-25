'use client';

import type { ReactNode } from 'react';
import { useRef } from 'react';

import { CircleCheck } from 'lucide-react';

import { useQuietReveal } from '../sections/reveal';

/**
 * "One codebase. Every language." — the live page's benefit section. The
 * heading, the paragraph and all four benefits are verbatim from YcPage.tsx,
 * including the emphasis the live page puts on the two numbers. The glyph
 * rain that runs beside them there belongs to the ink band on this page, so
 * the benefits are filed here as a ruled ledger instead.
 */

type Benefit = { id: string; body: ReactNode };

const BENEFITS: readonly Benefit[] = [
  {
    id: 'credits',
    body: (
      <>
        <b>$5,000</b> in credits for <b>12 months</b>
      </>
    ),
  },
  { id: 'slack', body: 'Dedicated Slack channel with the founders and engineers.' },
  {
    id: 'use-case',
    body: 'Feature your company as a use case on the General Translation website (optional).',
  },
  {
    id: 'ceo',
    body: 'Direct access to the CEO’s phone number on WhatsApp or text.',
  },
];

export default function YcDeal() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='deal' ref={root}>
      <div className='cp-head' data-reveal>
        <span className='cp-kicker'>The deal</span>
        <h2>One codebase. Every language.</h2>
        <p>
          General Translation gives startups one developer-first platform to localize apps,
          docs, and websites without slowing down the release cycle. Internationalize code,
          translate content, and review changes in the same workflow your team already uses.
        </p>
      </div>

      <ul className='cpy-benefits'>
        {BENEFITS.map((benefit, i) => (
          <li className='cpy-benefit' data-reveal key={benefit.id}>
            <span className='cpy-benefit-file'>
              TERM&middot;{String(i + 1).padStart(2, '0')}
            </span>
            <CircleCheck
              aria-hidden
              className='cpy-benefit-glyph'
              color='currentColor'
              size={16}
              strokeWidth={1.75}
            />
            <p>{benefit.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
