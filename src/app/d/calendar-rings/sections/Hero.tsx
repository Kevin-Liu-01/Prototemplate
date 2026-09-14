/**
 * calendar-rings: the hero.
 * The disk with the claim at its center, then the plinth: a stepped base
 * of three registers, the top step carrying the sub with the wordmark
 * inline, the two calls to action and the install command. Each step
 * draws its top and sides; the step below closes it.
 */
import { GtMark } from '@/components/viewer/GtMark';

import { HREFS } from '../data';
import { Disk } from '../diagrams/Disk';
import { Claim } from './Claim';
import { CopyCommand } from './CopyCommand';

export function Hero() {
  return (
    <section className='cr-hero' id='top'>
      <div className='cr-col'>
        <Disk crown='General Translation'>
          <Claim />
        </Disk>
        <div className='cr-plinth'>
          <div className='cr-step is-1'>
            <p className='cr-sub'>
              <span className='cr-wordmark'>
                <GtMark width={25} height={16} />
                <span>General Translation</span>
              </span>{' '}
              builds full-stack infrastructure for localizing apps, docs, and websites
            </p>
            <div className='cr-acts'>
              <a className='cr-btn is-solid' href={HREFS.getStarted}>
                Get Started
              </a>
              <a className='cr-btn is-line' href={HREFS.docs} rel='noreferrer' target='_blank'>
                Docs
              </a>
              <CopyCommand />
            </div>
          </div>
          <div className='cr-step is-2' aria-hidden='true' />
          <div className='cr-step is-3' aria-hidden='true' />
        </div>
      </div>
    </section>
  );
}
