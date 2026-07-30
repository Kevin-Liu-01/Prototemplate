'use client';

import { ArrowUpRight } from 'lucide-react';
import { useRef } from 'react';

import { useQuietReveal } from './reveal';

/**
 * M17 — Pricing, the LEDGER way. A price is a number in a column, so the
 * module leads with the full published rate table as a real ruled table —
 * workflow in the label gutter, rate right-aligned, GT-library variant in a
 * third column. These are the only rates that may appear anywhere. The two
 * plans follow; nothing on this module moves on its own.
 */

type Rate = { workflow: string; rate: string; gtLibs?: string };

const RATES: readonly Rate[] = [
  { workflow: 'Build time', rate: '$10 / 10k input tokens', gtLibs: '$20' },
  { workflow: 'Runtime', rate: '$1 / 10k input tokens' },
  { workflow: 'Development', rate: '$1 / 10k input tokens', gtLibs: '$4' },
  { workflow: 'Google Slides layout processing', rate: '$0.50 / 10k input tokens' },
  { workflow: 'Project context surcharge', rate: '+$0.10 / 10k tokens per 500 tokens of context' },
  { workflow: 'Locadex', rate: '$5 / LCU' },
  { workflow: 'Credits', rate: '$1 = 1,000,000 credits' },
];

export default function Pricing() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='pricing' ref={root}>
      <div className='tc-head'>
        <h2 data-reveal>Start at $0. Pay per token.</h2>
        <p data-reveal>The price of a translation is knowable before you run it.</p>
      </div>

      {/* The published rate ledger. Selected row treatment is reserved for the
          rate a reader is most likely pricing first: build time. */}
      <div className='df-rates' data-reveal>
        <div className='df-rates-head' aria-hidden>
          <span>Workflow</span>
          <span>Rate</span>
          <span>GT libraries</span>
        </div>
        {RATES.map((row, i) => (
          <div className={i === 0 ? 'df-rate is-lead' : 'df-rate'} key={row.workflow}>
            <span className='df-rate-name'>{row.workflow}</span>
            <span className='df-rate-value'>{row.rate}</span>
            <span className='df-rate-gt'>{row.gtLibs ?? '—'}</span>
          </div>
        ))}
        <div className='df-rates-foot'>
          <span>A Usage Limit is a hard cap. It blocks billing even with auto-reload on.</span>
          <span>
            <code>npx gt translate --dry-run</code> prints what would be translated and bills 0
            tokens.
          </span>
        </div>
      </div>

      <div className='tc-plans'>
        <div className='tc-plan' data-reveal>
          <h3>Starter</h3>
          <div className='tc-plan-price'>
            $0<small>per month</small>
          </div>
          <p>
            Unlimited users, projects and languages. Editor, GitHub integration and Locadex
            included. Minimum top-up $10.
          </p>
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
          <p>
            Forward-deployed engineers, custom workflows for any format or framework, shared
            context across projects.
          </p>
          <ul className='tc-list'>
            <li>SSO, RBAC, webhooks, custom SLA</li>
            <li>SOC 2 Type II, GDPR, ISO 27001</li>
            <li>Support from the engineers who build it</li>
          </ul>
          <a className='tc-btn tc-btn-line' href='#top'>
            Contact us
          </a>
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
