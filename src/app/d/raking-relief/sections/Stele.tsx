import Image from 'next/image';

import Inlay from './Inlay';
import { BarDot } from './Ornament';
import { SteleWall } from './ReliefField';
import { CLI_RUN, LINKS, LOCADEX_TRACE } from './content';

/**
 * The dark moment: a black stone stele set into the wall, full bleed, with
 * a stepped crown above it. Three registers, as on the Rosetta Stone: the
 * head with the Locadex mark, the inscribed run and trace, the acts. The
 * tooled border is the dithered canvas; the registers are polished ground
 * over it. The stele never remaps with the theme.
 */
export default function Stele() {
  return (
    <section className='rr-stele' id='locadex'>
      <div className='rr-stele-crown' aria-hidden='true'>
        <span className='rr-step is-3' />
        <span className='rr-step is-2' />
        <span className='rr-step is-1' />
      </div>

      <div className='rr-stele-slab'>
        <SteleWall />
        <div className='rr-stele-in'>
          <div className='rr-stele-reg rr-stele-head'>
            <BarDot n={5} />
            <div className='rr-stele-title'>
              <Image
                className='rr-lx is-inverted'
                src='/brand/no-bg-locadex-logo-light.png'
                alt='Locadex'
                width={36}
                height={36}
              />
              <h2>The Locadex agent</h2>
            </div>
            <p className='rr-stele-sub'>
              A commit triggers the workflow. Locadex reads the file that changed, wraps the tree in{' '}
              <code>{'<T>'}</code>, writes the translations against the file it read, and opens the
              pull request.
            </p>
          </div>

          <div className='rr-stele-reg rr-stele-body'>
            <div className='rr-stele-run'>
              <p className='rr-stele-label'>gt cli</p>
              <p className='rr-stele-line'>
                <span className='rr-term-prompt' aria-hidden='true'>
                  $
                </span>{' '}
                {CLI_RUN.command}
              </p>
              <p className='rr-stele-line is-out'>{CLI_RUN.result}</p>
              <p className='rr-stele-chips'>
                {CLI_RUN.locales.map((code) => (
                  <Inlay code={code} key={code} />
                ))}
              </p>
            </div>
            <ol className='rr-stele-trace'>
              <li className='rr-stele-label'>trace</li>
              {LOCADEX_TRACE.map((line) => (
                <li className='rr-stele-line' key={line}>
                  {line}
                </li>
              ))}
            </ol>
          </div>

          <div className='rr-stele-reg rr-stele-acts'>
            <a className='rr-btn is-solid' href={LINKS.demo}>
              Get a Demo
            </a>
            <a className='rr-btn is-line' href={LINKS.docsLocadex}>
              Read the Docs
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
