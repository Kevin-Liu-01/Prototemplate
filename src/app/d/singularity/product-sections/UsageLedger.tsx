'use client';

import { usePathname } from 'next/navigation';
import { useRef } from 'react';

import { useQuietReveal } from '../sections/reveal';

/**
 * The whole rate card as a ruled audit ledger — every published rate, one
 * unit each — followed by its mirror: the rows that stay at zero. The zero
 * table is the honest half of usage pricing (dry runs, unchanged content,
 * branch inheritance, local Intl formatting, seats), drawn in the same
 * grammar so the $0.00 column reads as a rate, not a footnote.
 */

type Rate = {
  meter: string;
  what: string;
  rate: string;
};

const RATES: readonly Rate[] = [
  {
    meter: 'build time · files',
    what: 'MD, MDX, JSON, YAML, HTML, TS/JS through npx gt translate',
    rate: '$10.00 / 10k input tokens',
  },
  {
    meter: 'build time · GT libraries',
    what: '<T> components and strings from gt-next, gt-react & co.',
    rate: '$20.00 / 10k input tokens',
  },
  {
    meter: 'runtime',
    what: 'tx() — user and backend content, translated on demand',
    rate: '$1.00 / 10k input tokens',
  },
  {
    meter: 'development · files',
    what: 'dev-key (gtx-dev-) previews of file formats',
    rate: '$1.00 / 10k input tokens',
  },
  {
    meter: 'development · GT libraries',
    what: 'hot-reload previews of <T> content while you edit',
    rate: '$4.00 / 10k input tokens',
  },
  {
    meter: 'google slides · layout',
    what: 'per-slide layout processing — carries no context surcharge',
    rate: '$0.50 / 10k input tokens',
  },
  {
    meter: 'project context',
    what: 'surcharge per 500 tokens of pinned context on a call',
    rate: '+$0.10 / 10k input tokens',
  },
  {
    meter: 'locadex',
    what: 'agent runs — lines changed, files touched, codebase size',
    rate: '$5.00 / LCU',
  },
];

const ZEROS: readonly Rate[] = [
  {
    meter: '--dry-run · gt validate',
    what: 'checks every entry and calls no API — 0 tokens billed',
    rate: '$0.00',
  },
  {
    meter: 'unchanged content',
    what: 're-runs translate only changed source and preserve local edits; --force is the opt-in that re-bills',
    rate: '$0.00',
  },
  {
    meter: 'branch inheritance',
    what: 'feature branches inherit main — shared content is never translated twice (Cloud, paid plans)',
    rate: '$0.00',
  },
  {
    meter: '<Num> <Currency> <DateTime>',
    what: 'formatted locally with Intl — the value never leaves the client',
    rate: '$0.00',
  },
  {
    meter: 'users · projects · languages',
    what: 'unlimited on Starter — the gate is a payment method, not a feature list',
    rate: '$0.00',
  },
];

function LedgerRows({ rows }: { rows: readonly Rate[] }) {
  return (
    <>
      {rows.map((row) => (
        <div className='sgx-lr' key={row.meter}>
          <b>{row.meter}</b>
          <span>{row.what}</span>
          <em>{row.rate}</em>
        </div>
      ))}
    </>
  );
}

export default function UsageLedger() {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  /* /d/<final>/usage/pricing → /d/<final>/pricing */
  const pathname = usePathname() ?? '';
  const base = pathname.split('/').slice(0, 3).join('/');
  const plansHref = base ? `${base}/pricing` : '#top';

  return (
    <section className='tc-sec' id='rates' ref={root}>
      <div className='sgx-head'>
        <span className='sgx-kicker' data-reveal>
          Every meter
        </span>
        <h2 data-reveal>The rate card, whole.</h2>
        <p data-reveal>
          The unit is input tokens &mdash; what you send, not words and not seats. These are the
          published rates the dashboard meters against; $1 buys 1,000,000 credits, so every line
          below is also a credit count.
        </p>
      </div>

      <div className='sgx-body'>
        <div className='sgx-rl' data-reveal>
          <div className='sgx-ledger'>
            <div className='sgx-lr is-head'>
              <b>meter</b>
              <span>what counts</span>
              <em>rate</em>
            </div>
            <LedgerRows rows={RATES} />
          </div>
        </div>

        <p className='sgx-note' data-reveal>
          Live table and per-project totals ship in the dashboard. Enterprise runs the same meters
          at volume pricing.
        </p>

        <h3 className='sgx-zero-cap' data-reveal>
          The rows that stay at zero
        </h3>
        <div className='sgx-rl' data-reveal>
          <div className='sgx-ledger'>
            <LedgerRows rows={ZEROS} />
          </div>
        </div>

        <a className='sgx-link' href={plansHref} data-reveal>
          Plans and what each includes
        </a>
      </div>
    </section>
  );
}
