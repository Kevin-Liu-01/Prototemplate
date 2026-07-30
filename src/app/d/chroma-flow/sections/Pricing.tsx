'use client';

import { ArrowUpRight } from 'lucide-react';
import { useRef } from 'react';

import { useQuietReveal } from './reveal';

/* The published rates — M17's closed set, verbatim; no other number may
   appear here. The ledger is the section's artifact: the price of a
   translation, knowable before you run it. */
const RATES: readonly { flow: string; rate: string; variant?: string }[] = [
  { flow: 'build time', rate: '$10 / 10k input tokens', variant: 'GT libraries $20' },
  { flow: 'runtime', rate: '$1 / 10k input tokens' },
  { flow: 'development', rate: '$1 / 10k input tokens', variant: 'GT libraries $4' },
  { flow: 'project context', rate: '+$0.10 / 10k tokens', variant: 'per 500 tokens of context' },
  { flow: 'Locadex', rate: '$5 / LCU' },
];

/** Two plans, the published rate ledger, and a link to the real comparison. */
export default function Pricing() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='pricing' ref={root}>
      <div className='tc-head'>
        <h2 data-reveal>Start at $0. Pay per token.</h2>
        <p data-reveal>The price of a translation is knowable before you run it.</p>
      </div>

      <div className='tc-plans'>
        <div className='tc-plan' data-reveal>
          <h3>Starter</h3>
          <div className='tc-plan-price'>
            $0<small>to start</small>
          </div>
          <p>Start free and upgrade when you ship. Everything you need to localize a real product.</p>
          <ul className='tc-list'>
            <li>Every SDK and the translation CLI</li>
            <li>Dashboard, glossaries, and the editor</li>
            <li>Locadex agent runs on your repo</li>
          </ul>
          <a className='tc-btn tc-btn-solid' href='#top'>
            Get started
          </a>
        </div>

        <div className='tc-plan' data-reveal>
          <h3>Enterprise</h3>
          <div className='tc-plan-price'>
            Custom<small>annual</small>
          </div>
          <p>Talk to an engineer about implementation, volume, and your security review.</p>
          <ul className='tc-list'>
            <li>Volume pricing across projects</li>
            <li>SOC 2 Type II, GDPR, ISO 27001</li>
            <li>Support from the engineers who build it</li>
          </ul>
          <a className='tc-btn tc-btn-line' href='#top'>
            Contact us
          </a>
        </div>
      </div>

      {/* The published rate ledger — the section's toned artifact surface,
          flush to both side rules, dark-shell grammar: no radius, no inset. */}
      <div className='cf-rates' data-reveal>
        <div className='cf-rates-head'>
          <span>Published rates</span>
          <span className='cf-rates-credits'>$1 = 1,000,000 credits</span>
        </div>
        {RATES.map((row) => (
          <div className='cf-rates-row' key={row.flow}>
            <span className='cf-rates-flow'>{row.flow}</span>
            <b>{row.rate}</b>
            <span className='cf-rates-variant'>{row.variant ?? ''}</span>
          </div>
        ))}
        <div className='cf-rates-note'>
          npx gt translate --dry-run prints what would be translated and bills 0 tokens.
        </div>
      </div>

      <div className='tc-compare' data-reveal>
        <a href='#top'>
          Compare plans and usage pricing
          <ArrowUpRight className='tc-ico-arrow' aria-hidden />
        </a>
      </div>
    </section>
  );
}
