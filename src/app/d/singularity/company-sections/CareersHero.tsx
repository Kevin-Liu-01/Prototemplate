'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../sections/reveal';
import { ASHBY_JOB_BOARD, type Position } from './careers';

/**
 * The old careers hero, sworn in: the same headline and mission line the
 * landing page runs, set beside the job board itself — the live posting
 * record as a dark docket, each role filed the way the dossier files its
 * controls. The "We're hiring!" pill becomes the docket's own status line.
 * Below, the old page's social-proof band as the shell's trust row — the
 * same six customers the old LogosGrid ships.
 */

const CUSTOMERS: readonly { name: string; mark: string }[] = [
  { name: 'Cursor', mark: 'is-cursor' },
  { name: 'Ramp', mark: 'is-ramp' },
  { name: 'Mintlify', mark: 'is-mintlify' },
  { name: 'Profound', mark: 'is-profound' },
  { name: 'Partiful', mark: 'is-partiful' },
  { name: 'ClickHouse', mark: 'is-clickhouse' },
];

/** The docket renders at most this many records; the ledger below carries the rest. */
const BOARD_MAX = 3;

type Props = {
  positions: readonly Position[];
};

export default function CareersHero({ positions }: Props) {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  const shown = positions.slice(0, BOARD_MAX);
  const rest = positions.length - shown.length;

  return (
    <section className='tc-sec' ref={root}>
      <div className='cpc-hero'>
        <div className='cpc-hero-copy'>
          <span className='cp-kicker' data-reveal>
            Careers
          </span>
          <h1 data-reveal>Bring the world&rsquo;s best products to the whole world</h1>
          <p data-reveal>
            Join us on our mission to build a full internationalization stack, by developers,
            for developers.
          </p>
          <div className='cpc-hero-acts' data-reveal>
            <a className='tc-btn tc-btn-solid' href='#positions'>
              Explore open roles
            </a>
            <a className='tc-btn tc-btn-line' href='mailto:careers@generaltranslation.com'>
              Get in touch
            </a>
          </div>
        </div>

        {/* the docket: the same board the old page reads, filed dark */}
        <div className='cpc-docket' data-reveal>
          <div className='cpc-docket-bar'>
            <span>
              posting-api/job-board/<b>{ASHBY_JOB_BOARD}</b>
            </span>
            <span>refreshed hourly</span>
          </div>

          <div className='cpc-docket-body'>
            {shown.length > 0 ? (
              shown.map((position, i) => (
                <article className='cpc-rec' key={position.id}>
                  <span className='cpc-rec-file'>ROLE&middot;{String(i + 1).padStart(2, '0')}</span>
                  <h3>{position.title}</h3>
                  <p>
                    {position.team} &middot; {position.location} &middot; {position.type}
                  </p>
                </article>
              ))
            ) : (
              <p className='cpc-docket-empty'>
                No open roles at the moment. Check back soon or reach out to us directly.
              </p>
            )}
            {rest > 0 ? (
              <p className='cpc-docket-more'>+ {rest} more &mdash; see the ledger below</p>
            ) : null}
          </div>

          <div className='cpc-docket-foot'>
            {positions.length > 0 ? (
              <span>
                <b>We&rsquo;re hiring</b> &middot; {positions.length} open{' '}
                {positions.length === 1 ? 'role' : 'roles'}
              </span>
            ) : (
              <span>
                <b>Write to us</b>
              </span>
            )}
            <span className='cpc-docket-mail'>careers@generaltranslation.com</span>
          </div>
        </div>
      </div>

      <div className='tc-trust'>
        <p className='tc-trust-lead' data-reveal>
          Used by the world&rsquo;s best companies
        </p>
        <div className='tc-trust-row'>
          {CUSTOMERS.map((customer) => (
            <span className='tc-trust-cell' key={customer.name}>
              <b className={`tc-wm ${customer.mark}`}>{customer.name}</b>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
