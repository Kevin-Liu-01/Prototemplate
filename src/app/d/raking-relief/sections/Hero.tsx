import { GtMark } from '@/components/viewer/GtMark';

import { Incised } from './deco/Carved';
import CopyCommand from './CopyCommand';
import Inlay from './deco/Inlay';
import { BarDot, Frame, NicheStrip, RosetteBand, SunDisk } from './deco/Ornament';
import ReliefClaim from './ReliefClaim';
import { HeroWall } from './deco/ReliefField';
import { CLAIMS, CUSTOMERS, INSTALL_COMMAND, LINKS, TRUST_LEAD } from './content';

/**
 * The first carved course. A rosette band, the wall under raking light
 * (the dithered canvas), the deep raised panel framed by a stepped fret,
 * the sun-disk crown, the claim in inscriptional capitals and its cast
 * shadow, the sub with the wordmark inline, the two acts and the install
 * command. Under the panel the claim frieze: the same sentence incised in
 * its sixteen shipped locales, each with its lapis inlay, one register that
 * runs past the frame. Then a second rosette band and the six customer
 * cartouches sunk into the wall.
 */
export default function Hero() {
  return (
    <section className='rr-course rr-hero' id='top'>
      <RosetteBand id='rr-ros-a' />

      <div className='rr-hero-stage'>
        <HeroWall />
        <div className='rr-raised is-deep rr-hero-panel'>
          <div className='rr-face rr-hero-face'>
            <Frame id='rr-frame-hero' kind='fret' />
            <div className='rr-hero-in'>
              <div className='rr-crown'>
                <BarDot n={1} />
                <SunDisk />
              </div>
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
      </div>

      <div className='rr-frieze-wrap'>
        <div className='rr-frieze rr-sunk'>
          <p className='rr-frieze-meta'>
            <span>the claim</span>
            <span>{CLAIMS.length} locales</span>
          </p>
          <ol className='rr-frieze-row'>
            {CLAIMS.map((claim) => (
              <li key={claim.lang}>
                <Incised className='rr-frieze-text' text={claim.text} lang={claim.lang} dir={claim.dir ?? 'ltr'} />
                <Inlay code={claim.lang} />
              </li>
            ))}
          </ol>
        </div>
      </div>

      <RosetteBand id='rr-ros-b' mid />

      <div className='rr-trust'>
        <p className='rr-trust-lead'>{TRUST_LEAD}</p>
        <ul className='rr-trust-row'>
          {CUSTOMERS.map((customer, i) => (
            <li className='rr-sunk rr-cartouche' key={customer.name}>
              <a className='rr-cartouche-in' href={customer.href} rel='noreferrer' target='_blank'>
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
              </a>
              <NicheStrip id={`rr-niche-${i}`} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
