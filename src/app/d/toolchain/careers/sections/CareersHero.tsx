'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../../sections/reveal';
import { ASHBY_JOB_BOARD, type Position } from '../lib';

/**
 * The old careers hero, re-clothed: the same headline and mission line the
 * landing page runs, set on the ruled column, with the job board itself as
 * the hero's dark artifact — the live posting record, key by key, instead of
 * a badge. The "We're hiring!" pill becomes the record's own status line.
 * Below, the old page's social-proof band in the shell's lettered trust row —
 * the same six customers the old LogosGrid ships.
 */

const CUSTOMERS: readonly { name: string; mark: string }[] = [
  { name: 'Cursor', mark: 'is-cursor' },
  { name: 'Ramp', mark: 'is-ramp' },
  { name: 'Mintlify', mark: 'is-mintlify' },
  { name: 'Profound', mark: 'is-profound' },
  { name: 'Partiful', mark: 'is-partiful' },
  { name: 'ClickHouse', mark: 'is-clickhouse' },
];

/** The board renders at most this many records; the ledger below carries the rest. */
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
    <section className='tc-sec' id='top' ref={root}>
      <div className='crs-hero'>
        <div className='crs-hero-copy'>
          <h1 data-reveal>
            Bring the world&rsquo;s best products to the <em>whole world</em>
          </h1>
          <p data-reveal>
            Join us on our mission to build a full internationalization stack,
            by developers, for developers.
          </p>
          <div className='crs-hero-acts' data-reveal>
            <a className='tc-btn tc-btn-solid' href='#positions'>
              Explore open roles
            </a>
            <a className='tc-btn tc-btn-line' href='mailto:careers@generaltranslation.com'>
              Get in touch
            </a>
          </div>
        </div>

        {/* The nested frame around the one dark surface: the posting record,
            straight off the same board the old page reads. */}
        <div className='crs-frame' data-reveal>
          <div className='crs-board'>
            <div className='crs-board-bar'>
              <span>
                posting-api/job-board/<b>{ASHBY_JOB_BOARD}</b>
              </span>
              <span>refreshed hourly</span>
            </div>

            {shown.length > 0 ? (
              shown.map((position) => (
                <dl className='crs-rec' key={position.id}>
                  <div>
                    <dt>role</dt>
                    <dd>{position.title}</dd>
                  </div>
                  <div>
                    <dt>team</dt>
                    <dd>{position.team}</dd>
                  </div>
                  <div>
                    <dt>location</dt>
                    <dd>{position.location}</dd>
                  </div>
                  <div>
                    <dt>type</dt>
                    <dd>{position.type}</dd>
                  </div>
                  <div>
                    <dt>status</dt>
                    <dd>listed</dd>
                  </div>
                </dl>
              ))
            ) : (
              <p className='crs-board-empty'>
                No open roles at the moment. Check back soon or reach out to us
                directly.
              </p>
            )}

            {rest > 0 ? (
              <p className='crs-board-more'>
                + {rest} more &mdash; see the ledger below
              </p>
            ) : null}

            <div className='crs-board-foot'>
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
              <span>careers@generaltranslation.com</span>
            </div>
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
