'use client';

import { useRef } from 'react';

import PrismaticField from '@/components/shared/PrismaticField';

import { useQuietReveal } from '../../../sections/reveal';

/**
 * The worked example: one project's month, itemized at the published rates.
 * VOLUMES ARE ILLUSTRATIVE — the panel says so in its own title bar — but
 * every rate is real and every amount is the printed arithmetic:
 *
 *   18,000  × $20/10k   = $36.00   (build, GT libraries)
 *   42,000  × $10/10k   = $42.00   (build, MDX docs)
 *   60,000  × +$0.20/10k = $1.20   (1,000 pinned context tokens = 2 × $0.10)
 *   250,000 × $1/10k    = $25.00   (runtime)
 *   30,000  × $4/10k    = $12.00   (dev previews, GT libraries)
 *   1.4 LCU × $5        = $7.00    (the docs' own run-summary example)
 *   dry-run             = $0.00
 *   ───────────────────── $123.20  = 123,200,000 credits
 *
 * acme/web and PR #218 are the page family's standing fixtures. Under the
 * statement, the four caps that bound the number: Usage Limit (a hard cap
 * that blocks billing even with auto-reload on), auto-reload, alerts at 80%
 * and 100%, and the credit buckets.
 */

type Line = {
  label: string;
  calc: string;
  amount: string;
};

const LINES: readonly Line[] = [
  { label: 'npx gt translate · GT libraries', calc: '18,000 input tokens × $20 / 10k', amount: '$36.00' },
  { label: 'npx gt translate · docs (MDX)', calc: '42,000 input tokens × $10 / 10k', amount: '$42.00' },
  { label: 'project context · 1,000 tokens pinned', calc: '60,000 tokens × +$0.20 / 10k', amount: '$1.20' },
  { label: 'tx() · user content at runtime', calc: '250,000 input tokens × $1 / 10k', amount: '$25.00' },
  { label: 'dev previews · gtx-dev-… key', calc: '30,000 input tokens × $4 / 10k', amount: '$12.00' },
  { label: 'locadex · PR #218', calc: '1.4 LCU × $5', amount: '$7.00' },
  { label: 'gt translate --dry-run · CI', calc: '0 tokens billed', amount: '$0.00' },
];

type Cap = {
  name: string;
  copy: string;
  value: string;
};

const CAPS: readonly Cap[] = [
  {
    name: 'Usage Limit',
    copy: 'A hard cap. When spend reaches it, billing stops — even with auto-reload on.',
    value: 'usage limit · yours to set',
  },
  {
    name: 'Auto-reload',
    copy: 'Minimum Balance and Reload to keep a balance you choose. The limit still wins.',
    value: 'minimum balance → reload to',
  },
  {
    name: 'Alerts',
    copy: 'Billing alerts fire at 80% and 100% of the limit — before anything stops.',
    value: 'alert at 80% · 100%',
  },
  {
    name: 'Credits',
    copy: '$1 = 1,000,000 credits, in three buckets — Purchased, Granted, Included. Starter tops up from $10.',
    value: '$1 = 1,000,000 credits',
  },
];

export default function MonthBand() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-band up-band' id='month' ref={root}>
      <PrismaticField className='tc-band-field' preset='1' speed={0.4} params={{ exposureScale: 2600 }} />

      <div className='tc-band-in'>
        <div className='tc-band-top'>
          <div>
            <h2 data-reveal>One month, itemized.</h2>
            <p className='tc-band-sub' data-reveal>
              A production app, its docs, and one agent PR &mdash; illustrative volumes at the
              published rates. Every line is quantity times rate, printed so you can check it;
              nothing else is on the bill.
            </p>
          </div>

          <div className='up-invoice' data-reveal>
            <div className='up-invoice-bar'>
              <span>usage &mdash; acme/web · one month</span>
              <span>illustrative volumes</span>
            </div>
            <div className='up-invoice-body'>
              {LINES.map((line) => (
                <div className='up-line' key={line.label}>
                  <b>{line.label}</b>
                  <em>{line.amount}</em>
                  <span>{line.calc}</span>
                </div>
              ))}
              <div className='up-total'>
                <b>total</b>
                <em>$123.20</em>
                <span>= 123,200,000 credits · $1 = 1,000,000</span>
              </div>
            </div>
          </div>
        </div>

        <div className='tc-band-grid up-caps'>
          {CAPS.map((cap) => (
            <div data-reveal key={cap.name}>
              <h3>{cap.name}</h3>
              <p>{cap.copy}</p>
              <span className='up-cap-val'>{cap.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
