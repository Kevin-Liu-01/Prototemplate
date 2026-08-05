'use client';

import { useRef } from 'react';

import { useQuietReveal } from './reveal';

/* REAL QUOTES ONLY — every statement below is verbatim from its named,
   public source. Never swap in an invented quote, customer, or metric.
   - Theo: x.com/theo/status/2008302190168019187
   - Andrew Milich: x.com/milichab/status/2010496967848370412
   - Guillermo Rauch: attributed quote in the landing content inventory. */

const CUSTOMERS: readonly { name: string; mark: string }[] = [
  { name: 'Cursor', mark: 'is-cursor' },
  { name: 'Ramp', mark: 'is-ramp' },
  { name: 'Mintlify', mark: 'is-mintlify' },
  { name: 'Profound', mark: 'is-profound' },
  { name: 'Partiful', mark: 'is-partiful' },
  { name: 'ClickHouse', mark: 'is-clickhouse' },
];

/**
 * The record — the trusted-by band and the real statements, set as filed
 * exhibits: hairline rule carrying the exhibit letter, the quote in the
 * display face, a plain attribution. One long statement, two short ones.
 */
export default function EnterpriseTestimony() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='record' ref={root}>
      <div className='tc-trust' data-reveal>
        <p className='tc-trust-lead'>Trusted by the world&rsquo;s best companies</p>
        <div className='tc-trust-row'>
          {CUSTOMERS.map((customer) => (
            <span className='tc-trust-cell' key={customer.name}>
              <b className={`tc-wm ${customer.mark}`}>{customer.name}</b>
            </span>
          ))}
        </div>
      </div>

      <div className='sge-record'>
        <header className='sge-record-head'>
          <span className='sge-kicker'>The record</span>
          <h2 data-reveal>On the record.</h2>
        </header>

        <figure className='sge-plate' data-reveal>
          <div className='sge-plate-rule'>
            <span>Exhibit A</span>
            <i>via X</i>
          </div>
          <blockquote>
            <p>
              Every once in awhile, I see a snippet of code that makes me a bit emotional. Now is
              one of those moments. Internationalization went from &lsquo;$%!# this&rsquo; to
              &lsquo;trivial&rsquo;.
            </p>
          </blockquote>
          <figcaption>
            <b>Theo</b>
            <span>CEO, T3Chat</span>
          </figcaption>
        </figure>

        <div className='sge-plates-duo'>
          <figure className='sge-plate' data-reveal>
            <div className='sge-plate-rule'>
              <span>Exhibit B</span>
              <i>via X</i>
            </div>
            <blockquote>
              <p>General Translation is an incredible product, we are users at @cursor_ai</p>
            </blockquote>
            <figcaption>
              <b>Andrew Milich</b>
              <span>Head of Engineering, Cursor</span>
            </figcaption>
          </figure>

          <figure className='sge-plate' data-reveal>
            <div className='sge-plate-rule'>
              <span>Exhibit C</span>
              <i>attributed</i>
            </div>
            <blockquote>
              <p>insane engineering prowess</p>
            </blockquote>
            <figcaption>
              <b>Guillermo Rauch</b>
              <span>CEO, Vercel</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
