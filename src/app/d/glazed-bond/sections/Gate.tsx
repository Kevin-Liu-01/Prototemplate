import { GtMark } from '@/components/viewer/GtMark';

import BondWall from '../components/Bond';
import CopyButton from '../components/CopyButton';
import GateClaim from '../components/GateClaim';
import GlazeField from '../components/GlazeField';
import { Parapet, RosetteBand } from '../components/Rosette';
import Wordmark from '../components/Wordmark';
import { URLS } from '../data';

/**
 * The gate: two battered towers with stepped parapets flank a central
 * wall; the wall is lower than the towers, its opening is a corbelled arch
 * whose crown steps inward in five courses, and the rosette band runs
 * across towers and wall at one height. Inside the opening: the crown
 * cartouche, the claim, the sub with the wordmark inline, the two acts and
 * the copyable command, over the dithered sun disc.
 */
export default function Gate() {
  return (
    <section className='gb-gate' id='top' aria-labelledby='gb-claim'>
      {/* the container: the grid inside reads its tower widths from this box */}
      <div className='gb-gate-in'>
      <div className='gb-tower is-left' aria-hidden='true'>
        <Parapet />
        <div className='gb-tower-wall'>
          <BondWall />
        </div>
      </div>

      <div className='gb-arch-wall'>
        <div className='gb-spandrel' aria-hidden='true'>
          <BondWall />
        </div>
        <Parapet className='is-low' />
        <div className='gb-spandrel-gap' aria-hidden='true' />
        <div className='gb-opening'>
          <GlazeField kind='sun' className='gb-sky' />
          <div className='gb-claim-stack'>
            <div className='gb-crown'>
              <GtMark width={25} height={16} />
              <span className='gb-crown-word'>General Translation</span>
            </div>

            <GateClaim />

            <p className='gb-sub'>
              <Wordmark /> builds full-stack infrastructure for localizing apps, docs, and
              websites.
            </p>

            <div className='gb-acts'>
              <a className='gb-btn is-solid' href={URLS.getStarted}>
                Get Started
              </a>
              <a className='gb-btn is-line' href={URLS.docs}>
                Docs
              </a>
            </div>

            <CopyButton text='npx gt@latest' className='gb-command'>
              <code>
                <span aria-hidden='true'>$ </span>npx gt@latest
              </code>
            </CopyButton>
          </div>
        </div>
      </div>

      <div className='gb-tower is-right' aria-hidden='true'>
        <Parapet />
        <div className='gb-tower-wall'>
          <BondWall />
        </div>
      </div>

      <div className='gb-gate-band' aria-hidden='true'>
        <RosetteBand />
      </div>
      </div>
    </section>
  );
}
