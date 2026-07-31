'use client';

import { useRef } from 'react';

import { useQuietReveal } from '../../sections/reveal';
import { ASHBY_JOB_BOARD, type Position } from '../lib';

/**
 * The old page's position cards, mutated into the direction's own furniture:
 * a ruled openings ledger. One hairline per row, mono column heads, the role
 * in the display face — every row is the whole link, exactly like the old
 * cards, pointing at the same Ashby posting. The empty state is the old
 * page's sentence, word for word, set in the ledger instead of a dashed box.
 */

type Props = {
  positions: readonly Position[];
};

export default function OpeningsLedger({ positions }: Props) {
  const root = useRef<HTMLElement>(null);
  useQuietReveal(root);

  return (
    <section className='tc-sec crs-openings' id='positions' ref={root}>
      <div className='tc-head'>
        <h2 data-reveal>Open roles</h2>
        <p data-reveal>
          Join our team and help shape the future of global software.
        </p>
      </div>

      <div className='crs-ledger'>
        <div className='crs-lrow is-head'>
          <span>role</span>
          <span className='crs-lcol'>team</span>
          <span className='crs-lcol'>location</span>
          <span className='crs-lcol'>type</span>
          <span className='crs-lapply' aria-hidden='true' />
        </div>

        {positions.length > 0 ? (
          positions.map((position) => (
            <a
              className='crs-lrow'
              data-reveal
              href={position.url}
              key={position.id}
              rel='noopener noreferrer'
              target='_blank'
            >
              <span className='crs-lrole'>
                {position.title}
                <span className='crs-lsub'>
                  {position.team} &middot; {position.location} &middot;{' '}
                  {position.type}
                </span>
              </span>
              <span className='crs-lcol'>{position.team}</span>
              <span className='crs-lcol'>{position.location}</span>
              <span className='crs-lcol'>{position.type}</span>
              <span className='crs-lapply'>Apply &#8599;</span>
            </a>
          ))
        ) : (
          <div className='crs-lempty' data-reveal>
            <p>
              No open roles at the moment. Check back soon or reach out to us
              directly.
            </p>
          </div>
        )}

        <div className='crs-lsrc'>
          <span>source &mdash; jobs.ashbyhq.com/{ASHBY_JOB_BOARD}</span>
          <span>refreshed hourly</span>
        </div>
      </div>
    </section>
  );
}
