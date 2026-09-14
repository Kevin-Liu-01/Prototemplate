import { GtMark } from '@/components/viewer/GtMark';

import { CUSTOMERS, LINKS } from '../data';
import CopyCommand from './CopyCommand';
import EveryWord from './EveryWord';
import { Block, Course, Relief } from './Wall';
import Wordmark from './Wordmark';

/**
 * textile-block: the hero course and the trust course.
 *
 * One wide course of the wall. The claim is cast into a single monumental
 * smooth block, eight modules wide and five high; the rest of the course is
 * perforated blocks, and the light behind them is the Bayer field showing
 * through the cruciform holes. Below it, the trust course: one lead line
 * across the wall and six customer marks, each cast into its own block.
 */
export default function Hero() {
  return (
    <>
      <Course className='is-hero' label='The claim'>
        <Block className='tb-claim' span={{ c: 8, r: 5, cMd: 8, rMd: 5, cSm: 6, rSm: 7 }}>
          <div aria-hidden='true' className='tb-crown'>
            <GtMark height={30} width={47} />
          </div>
          <h1>
            Your product speaks
            <br />
            every <EveryWord />.
          </h1>
          <p className='tb-sub'>
            <span className='tb-wordmark'>
              <GtMark height={16} width={25} />
              <span>General Translation</span>
            </span>{' '}
            builds full-stack infrastructure for localizing apps, docs, and websites.
          </p>
          <div className='tb-acts'>
            <a className='tb-btn tb-btn-solid' href={LINKS.getStarted}>
              Get Started
            </a>
            <a className='tb-btn tb-btn-line' href={LINKS.docs} rel='noreferrer' target='_blank'>
              Docs
            </a>
          </div>
          <CopyCommand />
        </Block>
        <Relief light='hero' motif='perf' span={{ c: 4, r: 5, cMd: 8, rMd: 1, cSm: 6, rSm: 1 }} />
      </Course>

      <Course className='is-trust' label='Customers'>
        <Block className='tb-trust-lead' span={{ c: 12, r: 1, cMd: 8, cSm: 6 }}>
          <p>Trusted by the world&rsquo;s best companies</p>
        </Block>
        {CUSTOMERS.map((customer) => (
          <Block className='tb-trust-cell' key={customer.id} span={{ c: 2, r: 1, cMd: 2, cSm: 3 }}>
            <Wordmark customer={customer} />
          </Block>
        ))}
        {/* eight columns hold four marks a row; the second row closes with relief */}
        <Relief className='tb-md-only' motif='cross' span={{ c: 4, r: 1 }} />
      </Course>
    </>
  );
}
