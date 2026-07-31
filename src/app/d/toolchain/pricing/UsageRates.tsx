'use client';

import { ArrowUpRight } from 'lucide-react';
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
 * artifact panel, the credit mechanics as a light ledger beside it, and one
 * link to the full usage page.
 */
export default function UsageRates() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='usage' ref={root}>
      <div className='tc-head'>
        <h2 data-reveal>Usage pricing, published.</h2>
        <p data-reveal>
          Rates are quoted per 10,000 input tokens, itemized as base + context, and capped by a
          Usage Limit — the price of a translation is knowable before you run it.
        </p>
      </div>

      <div className='tcp-usage'>
        <div className='tc-code tcp-rates' data-reveal>
          <div className='tc-code-bar'>
            <span>rates — published</span>
            <span>per 10k input tokens</span>
          </div>
          <div className='tcp-rates-body'>
            {RATES.map((row) => (
              <div className='tcp-rate' key={`${row.workflow}-${row.detail}`}>
                <span className='tcp-rate-w'>{row.workflow}</span>
                <span className='tcp-rate-d'>{row.detail}</span>
                <b>{row.rate}</b>
              </div>
            ))}
          </div>
        </div>

        <div className='tcp-usage-side' data-reveal>
          <div className='tcp-led'>
            <div className='tcp-led-head'>
              <span>credits &amp; controls</span>
              <span>every plan</span>
            </div>
            {CREDITS.map((row) => (
              <div className='tcp-lrow' key={row.k}>
                <span>{row.k}</span>
                <b>{row.v}</b>
              </div>
            ))}
          </div>
          <a className='tcp-usage-link' href='/d/toolchain/usage/pricing'>
            Full usage pricing
            <ArrowUpRight className='tc-ico-arrow' aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}
