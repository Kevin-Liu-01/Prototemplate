'use client';

import type { ReactNode } from 'react';
import { useRef } from 'react';

import { useQuietReveal } from '../sections/reveal';

type FaqRow = { id: string; q: ReactNode; a: ReactNode };

/** Every answer restates the published docs and rate card — no folklore. */
const FAQ: readonly FaqRow[] = [
  {
    id: 'seats',
    q: 'Is pricing per seat?',
    a: 'No. Starter includes unlimited users, projects, and languages. You pay for the translation work you run — published per-token rates and metered agent runs — not for the people who run it.',
  },
  {
    id: 'starter-gaps',
    q: 'What does the $0 plan leave out?',
    a: 'Very little. Every SDK, the CLI, the dashboard and editor, GitHub integration, and Locadex are all on Starter — the gate is a payment method, not a feature list. The exceptions: annotations and version branching, plus the Enterprise governance list — SSO, webhooks, custom workflows, compliance reports, custom SLA.',
  },
  {
    id: 'runaway',
    q: 'Can costs run away?',
    a: (
      <>
        No. A Usage Limit is a hard cap that blocks billing even with auto-reload on, and billing
        alerts fire at 80% and 100%. Run{' '}
        <code className='tc-chip'>npx gt translate --dry-run</code> first and the estimate is
        itemized before anything is billed.
      </>
    ),
  },
  {
    id: 'lcu',
    q: 'What is an LCU?',
    a: 'A Locadex Compute Unit — the metered unit for agent runs, billed at $5 per LCU. Its inputs are the resources a run uses end to end: lines changed, files touched, and codebase size. Every run ends with an itemized summary.',
  },
  {
    id: 'credits',
    q: 'How do credits work?',
    a: '$1 buys 1,000,000 credits and the minimum top-up is $10. Credits sit in three buckets — Purchased, Granted, and Included — and auto-reload keeps a Minimum Balance topped back up to your Reload-to amount, always under the Usage Limit.',
  },
  {
    id: 'adopt-t',
    q: (
      <>
        Do I have to adopt <code className='tc-chip'>&lt;T&gt;</code> to start?
      </>
    ),
    a: (
      <>
        No. The CLI detects <code className='tc-chip'>i18next</code>,{' '}
        <code className='tc-chip'>next-intl</code>, and{' '}
        <code className='tc-chip'>react-i18next</code> from package.json and translates your
        existing files in place — same keys, same ICU syntax, same nesting. gt-next and gt-react
        are the upgrade path, not the price of entry.
      </>
    ),
  },
  {
    id: 'three-rates',
    q: 'Why three different rates?',
    a: 'They are three different workflows. Build-time translations are pre-generated for production at $10 per 10k input tokens; development previews regenerate as you type at $1; runtime translation covers content you cannot know at build time at $1. GT-format files carry extra metadata and price at $20 and $4.',
  },
  {
    id: 'context-cost',
    q: 'What does project context cost?',
    a: 'A transparent surcharge: +$0.10 per 10k input tokens for every 500 tokens of project context, itemized on the estimate as base + context — you can see exactly what you are buying.',
  },
];

/**
 * The FAQ as a ruled ledger: question in display type on the left column,
 * answer in the muted step on the right, one hairline per row, edge to
 * edge. No accordions — the still frame carries the whole argument.
 */
export default function PricingFaq() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='faq' ref={root}>
      <div className='sgx-head'>
        <span className='sgx-kicker' data-reveal>
          Questions
        </span>
        <h2 data-reveal>Questions with published answers.</h2>
        <p data-reveal>Everything below restates the docs and the rate card, not a sales page.</p>
      </div>

      <div className='sgx-body'>
        <dl className='sgx-faq'>
          {FAQ.map((row) => (
            <div className='sgx-faq-row' data-reveal key={row.id}>
              <dt>{row.q}</dt>
              <dd>{row.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
