'use client';

import { useRef } from 'react';

import BarDot from '../components/BarDot';
import Fig from '../components/Fig';
import { useQuietReveal } from '../components/motion';
import { Panel, Register } from '../components/Panel';
import { CUSTOMERS, REVIEW_ROWS, leaf } from '../data';

/**
 * Leaf five: the review. The upper register is the trust strip, the six
 * customer marks in the ink under one shipped sentence, the sentence's
 * count printed in bar and dot at its head. The lower register is the
 * review workspace at full width: source beside translation in one
 * mounted editor, revision state carried by type and stamps, never by
 * color, the four real rows with their bar text and footer labels.
 */
const LEAF = leaf('review');

export default function TrustPanel() {
  const root = useRef<HTMLDivElement>(null);
  useQuietReveal(root);

  return (
    <div ref={root}>
      <Panel index={LEAF.n} fold={LEAF.fold} sign={LEAF.sign} id={LEAF.id}>
        <Register className='is-head'>
          <h2 className='sfc-h2' data-reveal>
            The review workspace
          </h2>
          <p className='sfc-lead' data-reveal>
            Source beside translation in one editor. A change is a struck line and a stamp, so the
            state of every string reads in the type.
          </p>
        </Register>

        <Register className='is-trust'>
          <div className='sfc-trust-lead' data-reveal>
            <BarDot n={30} layout='row' scale={0.9} label='Thirty in bar and dot numerals' />
            <p>Cursor, Ramp and Profound ship in over thirty languages</p>
          </div>
          <ul className='sfc-trust' data-reveal>
            {CUSTOMERS.map((customer) => (
              <li key={customer.name}>
                <a href={customer.href} rel='noreferrer' target='_blank' aria-label={customer.name}>
                  <span className={`sfc-wm is-${customer.file}`} aria-hidden='true' />
                </a>
              </li>
            ))}
          </ul>
        </Register>

        <Register className='is-workspace'>
          <div className='sfc-review' data-reveal>
            <div className='sfc-review-bar'>
              <span>workspace · es-419</span>
              <Fig n={4} scale={0.8}>
                4 strings
              </Fig>
            </div>
            <div className='sfc-review-cols'>
              <span>source · en</span>
              <span>translation · es</span>
            </div>
            <ul className='sfc-review-rows'>
              {REVIEW_ROWS.map((row, i) => (
                <li className='sfc-review-row' key={row.source}>
                  <span className='sfc-review-src' lang='en'>
                    <BarDot n={i + 1} layout='row' scale={0.7} />
                    <span>{row.source}</span>
                  </span>
                  <span className='sfc-review-tr' lang='es'>
                    {row.previous ? <s className='sfc-review-prev'>{row.previous}</s> : null}
                    <span>{row.translation}</span>
                    <b className={`sfc-stamp is-${row.state}`}>{row.state === 'approved' ? 'approved' : 'edited'}</b>
                  </span>
                </li>
              ))}
            </ul>
            <div className='sfc-review-foot'>
              <span>⌘K search</span>
              <span>history</span>
              <span>download</span>
              <span>agent · locadex</span>
            </div>
          </div>
        </Register>
      </Panel>
    </div>
  );
}
