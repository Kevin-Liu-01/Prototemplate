/**
 * calendar-rings: the hero.
 * The disk with the claim at its center, then the plinth: a stepped base
 * of three registers. The top step carries the sub with the wordmark
 * inline, the two calls to action and the install command. The second
 * step is the key to the instrument: one cell per ring from the center
 * out, its count as a bar-and-dot numeral and what the ring reads. The
 * third step is the base rule. Each step draws its top and sides; the step
 * below closes it.
 */
import { GtMark } from '@/components/viewer/GtMark';

import { DISK_KEY, HREFS } from '../data';
import { Disk } from '../diagrams/Disk';
import { Numeral } from '../diagrams/Numeral';
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
          <ol className='cr-step is-2 cr-key' aria-label='How to read the disk'>
            {DISK_KEY.map((row) => (
              <li key={row.ring} className='cr-key-cell'>
                <span className='cr-key-mark' aria-hidden='true'>
                  {row.n > 0 ? <Numeral n={row.n} size={11} /> : <span className='cr-key-hub' />}
                </span>
                <span className='cr-key-ring'>{row.ring}</span>
                <span className='cr-key-what'>{row.what}</span>
              </li>
            ))}
          </ol>
          <div className='cr-step is-3' aria-hidden='true' />
        </div>
      </div>
    </section>
  );
}
