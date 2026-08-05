'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../sections/reveal';
import { ASHBY_JOB_BOARD, type Position } from './careers';

/**
 * The old page's position cards, filed as the audit ledger: one hairline per
 * row, the role in the display face, team, location and type in their own
 * columns — every row is the whole link, exactly like the old cards,
 * pointing at the same Ashby posting. The empty state is the old page's
 * sentence, word for word, set in the ledger instead of a dashed box.
 */

type Props = {
  positions: readonly Position[];
};

export default function OpeningsLedger({ positions }: Props) {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec' id='positions' ref={root}>
      <header className='cp-head' data-reveal>
        <span className='cp-kicker'>The ledger</span>
        <h2>Open roles</h2>
        <p>Join our team and help shape the future of global software.</p>
      </header>

      <div className='cpc-table' role='table'>
        <div className='cpc-tr is-head' role='row'>
          <span role='columnheader'>Role</span>
          <span className='cpc-tcol' role='columnheader'>
            Team
          </span>
          <span className='cpc-tcol' role='columnheader'>
            Location
          </span>
          <span className='cpc-tcol' role='columnheader'>
            Type
          </span>
          <span className='cpc-tapply' aria-hidden='true' />
        </div>

        {positions.length > 0 ? (
          positions.map((position) => (
            <a
              className='cpc-tr'
              data-reveal
              href={position.url}
              key={position.id}
              rel='noopener noreferrer'
              role='row'
              target='_blank'
            >
              <span className='cpc-trole' role='cell'>
                {position.title}
                <span className='cpc-tsub'>
                  {position.team} &middot; {position.location} &middot; {position.type}
                </span>
              </span>
              <span className='cpc-tcol' role='cell'>
                {position.team}
              </span>
              <span className='cpc-tcol' role='cell'>
                {position.location}
              </span>
              <span className='cpc-tcol' role='cell'>
                {position.type}
              </span>
              <span className='cpc-tapply' role='cell'>
                Apply &#8599;
              </span>
            </a>
          ))
        ) : (
          <div className='cpc-tempty' data-reveal>
            <p>No open roles at the moment. Check back soon or reach out to us directly.</p>
          </div>
        )}

        <div className='cpc-tsrc'>
          <span>source &mdash; jobs.ashbyhq.com/{ASHBY_JOB_BOARD}</span>
          <span>refreshed hourly</span>
        </div>
      </div>
    </section>
  );
}
