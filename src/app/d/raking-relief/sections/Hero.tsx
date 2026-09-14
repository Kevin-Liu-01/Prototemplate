import { GtMark } from '@/components/viewer/GtMark';

import CopyCommand from './CopyCommand';
import { BarDot, NicheStrip, RosetteBand } from './Ornament';
import ReliefClaim from './ReliefClaim';
import { HeroWall } from './ReliefField';
import { CUSTOMERS, INSTALL_COMMAND, LINKS, TRUST_LEAD } from './content';

/**
 * The first carved course. A rosette band, the wall under raking light
 * (the dithered canvas), the raised panel with the claim in inscriptional
 * capitals and its cast shadow, the sub with the wordmark inline, the two
 * acts and the install command, a second rosette band, then the six
 * customer cartouches sunk into the wall.
 */
export default function Hero() {
  return (
    <section className='rr-course rr-hero' id='top'>
      <RosetteBand id='rr-ros-a' />

      <div className='rr-hero-stage'>
        <HeroWall />
        <div className='rr-raised rr-hero-panel'>
          <div className='rr-face rr-hero-face'>
            <BarDot n={1} />
            <h1 className='rr-claim'>
              <ReliefClaim />
            </h1>
            <p className='rr-hero-sub'>
              <span className='rr-wm'>
                <GtMark width={22} height={14} />
                <span className='rr-vh'>General Translation</span>
              </span>{' '}
              builds full-stack infrastructure for localizing apps, docs, and websites.
            </p>
            <div className='rr-acts'>
              <a className='rr-btn is-solid' href={LINKS.getStarted}>
                Get Started
              </a>
              <a className='rr-btn is-line' href={LINKS.docs}>
                Docs
              </a>
              <CopyCommand command={INSTALL_COMMAND} />
            </div>
          </div>
        </div>
      </div>

      <RosetteBand id='rr-ros-b' mid />

      <div className='rr-trust'>
        <p className='rr-trust-lead'>{TRUST_LEAD}</p>
        <ul className='rr-trust-row'>
          {CUSTOMERS.map((customer, i) => (
            <li className='rr-sunk rr-cartouche' key={customer.name}>
              <span className='rr-cartouche-in'>
                <img
                  className='rr-wordmark is-light'
                  src={`/logos/${customer.file}.light.svg`}
                  alt={customer.name}
                  height={20}
                />
                <img
                  className='rr-wordmark is-dark'
                  src={`/logos/${customer.file}.dark.svg`}
                  alt=''
                  height={20}
                />
              </span>
              <NicheStrip id={`rr-niche-${i}`} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
