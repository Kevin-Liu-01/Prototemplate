import { GtMark } from '@/components/viewer/GtMark';

import { CUSTOMERS, LINKS } from '../data';
import Claim from './Claim';
import CopyButton from './CopyButton';
import FanBand from './deco/FanBand';
import Numeral from './deco/Numeral';

/**
 * The opening column of the scroll. The vignette register comes first: the
 * dithered fan band over the canon grid. Under it the claim stands as the
 * first rubric, with the numeral in the margin, the sub with the wordmark
 * inline, the two acts and the command. The trust register closes the
 * column: one sentence, then six marks in six ruled cells, each mark an
 * alpha mask taking the page's ink.
 */
const COMMAND = 'npx gt@latest';

export default function Hero() {
  return (
    <section className='pr-col pr-hero' id='top' aria-labelledby='pr-claim'>
      <FanBand />

      <div className='pr-hero-body'>
        <div className='pr-head-margin pr-hero-margin'>
          <Numeral n={1} />
        </div>
        <div className='pr-hero-text'>
          <Claim />
          <p className='pr-lead'>
            <span className='pr-wordmark'>
              <GtMark width={30} height={19} />
              <span className='pr-vh'>General Translation</span>
            </span>{' '}
            builds full-stack infrastructure for localizing apps, docs, and websites
          </p>
          <div className='pr-acts'>
            <a className='pr-btn is-solid' href={LINKS.signIn}>
              Get Started
            </a>
            <a className='pr-btn is-line' href={LINKS.docs}>
              Docs
            </a>
            <span className='pr-cmd'>
              <code>{COMMAND}</code>
              <CopyButton text={COMMAND} label='Copy command' />
            </span>
          </div>
        </div>
      </div>

      <div className='pr-trust'>
        <p className='pr-trust-lead'>Cursor, Ramp and Profound ship in over thirty languages</p>
        <ul className='pr-trust-row'>
          {CUSTOMERS.map((customer) => (
            <li key={customer.name}>
              <a href={customer.href} rel='noreferrer' target='_blank'>
                <span className={`pr-wm ${customer.mark}`} aria-hidden='true' />
                <span className='pr-vh'>{customer.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
