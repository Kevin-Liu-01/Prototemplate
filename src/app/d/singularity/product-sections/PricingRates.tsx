'use client';

import { usePathname } from 'next/navigation';
import { useRef } from 'react';

import { useQuietReveal } from '../sections/reveal';

/** The published rate card, verbatim — quoted per 10,000 input tokens except
 *  where the unit says otherwise. Nothing here is estimated. */
const RATES: readonly { workflow: string; detail: string; rate: string }[] = [
  { workflow: 'build time', detail: 'production translations', rate: '$10' },
  { workflow: 'build time', detail: 'GT-format files', rate: '$20' },
  { workflow: 'development', detail: 'dev previews', rate: '$1' },
  { workflow: 'development', detail: 'GT-format files', rate: '$4' },
  { workflow: 'runtime', detail: 'content unknown at build time', rate: '$1' },
  { workflow: 'Google Slides', detail: 'layout processing', rate: '$0.50' },
  { workflow: 'project context', detail: 'per 500 tokens of context', rate: '+$0.10' },
  { workflow: 'Locadex agent', detail: 'per compute unit', rate: '$5 / LCU' },
];

/** Credit mechanics and the spend controls, from the same published page. */
const CREDITS: readonly { k: string; v: string }[] = [
  { k: '$1', v: '1,000,000 credits' },
  { k: 'minimum top-up', v: '$10' },
  { k: 'credit buckets', v: 'Purchased · Granted · Included' },
  { k: 'auto-reload', v: 'Minimum Balance · Reload to' },
  { k: 'Usage Limit', v: 'hard cap — blocks billing' },
  { k: 'billing alerts', v: '80% · 100%' },
];

/**
 * The usage-pricing teaser: the published rate card on the page's dark
 * artifact panel, the credit mechanics as a ruled ledger beside it, and one
 * link to the full usage page — resolved against whichever final this
 * section is mounted in.
 */
export default function PricingRates() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  /* /d/<final>/pricing → /d/<final>/usage/pricing */
  const pathname = usePathname() ?? '';
  const base = pathname.split('/').slice(0, 3).join('/');
  const usageHref = base ? `${base}/usage/pricing` : '#usage';

  return (
    <section className='tc-sec' id='usage' ref={root}>
      <div className='sgx-head'>
        <span className='sgx-kicker' data-reveal>
          The rate card
        </span>
        <h2 data-reveal>Usage pricing, published.</h2>
        <p data-reveal>
          Rates are quoted per 10,000 input tokens, itemized as base + context, and capped by a
          Usage Limit — the price of a translation is knowable before you run it.
        </p>
      </div>

      <div className='sgx-body'>
        <div className='sgx-usage'>
          <div className='sgx-panel' data-reveal>
            <div className='sgx-panel-bar'>
              <span>rates — published</span>
              <span>per 10k input tokens</span>
            </div>
            <div className='sgx-rates-body'>
              {RATES.map((row) => (
                <div className='sgx-rate' key={`${row.workflow}-${row.detail}`}>
                  <span className='sgx-rate-w'>{row.workflow}</span>
                  <span>{row.detail}</span>
                  <b>{row.rate}</b>
                </div>
              ))}
            </div>
          </div>

          <div className='sgx-col' data-reveal>
            <div className='sgx-rule'>
              <span>Credits &amp; controls</span>
              <i>every plan</i>
            </div>
            <div className='sgx-ledger'>
              {CREDITS.map((row) => (
                <div className='sgx-lr' key={row.k}>
                  <span>
                    {row.k} — <b>{row.v}</b>
                  </span>
                </div>
              ))}
            </div>
            <a className='sgx-link' href={usageHref}>
              Full usage pricing
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
