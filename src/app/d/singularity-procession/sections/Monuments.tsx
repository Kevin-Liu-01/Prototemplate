'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../../singularity/sections/reveal';

/* PLACEHOLDER QUOTES AND FIGURES — every line and number below is invented
   scaffolding for the layout. Swap for real customer words and rollout
   numbers before this ships. */

const MONUMENTS = [
  {
    mark: 'is-cursor',
    brand: 'Cursor',
    line: 'Fourteen languages on every merge — the docs ship themselves.',
    measure: '14 locales · first release in 11 days',
  },
  {
    mark: 'is-ramp',
    brand: 'Ramp',
    line: 'Finance-grade review, passed without a single exception.',
    measure: '9 locales · zero compliance findings',
  },
  {
    mark: 'is-partiful',
    brand: 'Partiful',
    line: 'Sixteen markets, run end to end by two engineers.',
    measure: '16 locales · 2 engineers',
  },
  {
    mark: 'is-clickhouse',
    brand: 'ClickHouse',
    line: 'Docs and console on every release train. No string freeze, ever.',
    measure: '11 locales · every release',
  },
] as const;

/**
 * The procession: customers pass one at a time in the dark, each a
 * monument — the wordmark at architectural scale, one sentence, one
 * measured line. Scroll brings each into place with the family's one
 * quiet entrance.
 */
export default function Monuments() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-band sgp-monuments' aria-label='The procession of customers' ref={root}>
      <div className='sgp-monuments-in'>
        {MONUMENTS.map((m, i) => (
          <article className='sgp-monument' data-reveal key={m.brand}>
            <span className='sgp-monument-n'>{String(i + 1).padStart(2, '0')}</span>
            <i className={`sgp-wm ${m.mark}`} aria-hidden />
            <span className='sr-only'>{m.brand}</span>
            <p>{m.line}</p>
            <span className='sgp-monument-measure'>{m.measure}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
