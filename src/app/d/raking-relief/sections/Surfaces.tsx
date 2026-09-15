import { FRAMEWORKS } from '@/app/d/dither-field/sections/stacks';
import Image from 'next/image';

import { Carved, Incised } from './deco/Carved';
import Inlay from './deco/Inlay';
import { BarDot, Frame } from './deco/Ornament';
import { CLI_RUN, LOCADEX_DIFF, LOCADEX_FINDINGS, REVIEW_BAR, REVIEW_FOOT, REVIEW_ROWS, STATS } from './content';

/**
 * The product surfaces as four raised tablets laid in a running bond: the
 * libraries and the CLI on the first course, the agent and the dashboard
 * on the second, offset like bricks, each framed by a chevron band. Above
 * them, four figures incised in a ruled register. Every tablet holds a real
 * object: the six packages, one CLI run, the agent's findings, the four
 * review rows.
 */
export default function Surfaces() {
  return (
    <section className='rr-course rr-surfaces' id='platform'>
      <div className='rr-head'>
        <BarDot n={3} />
        <div className='rr-head-copy'>
          <h2>
            <Carved text='Everything localization needs.' />
          </h2>
          <p>Libraries, a CLI, a dashboard, and an agent. Each is a real object with a real output.</p>
        </div>
      </div>

      <ul className='rr-stats rr-sunk'>
        {STATS.map((stat) => (
          <li key={stat.label}>
            <Incised className='rr-stat-value' text={stat.value} />
            <span className='rr-stat-label'>{stat.label}</span>
          </li>
        ))}
      </ul>

      <div className='rr-bond'>
        <article className='rr-raised rr-tablet'>
          <div className='rr-face is-framed'>
            <Frame id='rr-frame-libs' kind='chevron' />
            <div className='rr-tablet-in'>
              <header className='rr-tablet-head'>
                <h3>Libraries</h3>
                <p>Six first-party SDKs with the same components. One install, one command.</p>
              </header>
              <ul className='rr-ledger'>
                {FRAMEWORKS.map((framework) => (
                  <li key={framework.id}>
                    <code className='rr-ledger-pkg'>{framework.pkg}</code>
                    <span className='rr-ledger-name'>{framework.name}</span>
                    <code className='rr-ledger-cmd'>{framework.install[0]}</code>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>

        <article className='rr-raised rr-tablet'>
          <div className='rr-face is-framed'>
            <Frame id='rr-frame-cli' kind='chevron' />
            <div className='rr-tablet-in'>
              <header className='rr-tablet-head'>
                <h3>CLI</h3>
                <p>One run translates what changed and writes every locale build.</p>
              </header>
              <div className='rr-term'>
                <p className='rr-term-line'>
                  <span className='rr-term-prompt' aria-hidden='true'>
                    $
                  </span>{' '}
                  {CLI_RUN.command}
                </p>
                <p className='rr-term-line is-out'>{CLI_RUN.result}</p>
                <p className='rr-term-chips'>
                  {CLI_RUN.locales.map((code) => (
                    <Inlay code={code} key={code} />
                  ))}
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div className='rr-bond is-offset'>
        <article className='rr-raised rr-tablet'>
          <div className='rr-face is-framed'>
            <Frame id='rr-frame-agent' kind='chevron' />
            <div className='rr-tablet-in'>
              <header className='rr-tablet-head'>
                <h3>Locadex</h3>
                <p>The agent reads the file that changed, edits it, and translates in context.</p>
              </header>
              <div className='rr-agent'>
                <Image
                  className='rr-lx'
                  src='/brand/no-bg-locadex-logo-light.png'
                  alt='Locadex'
                  width={28}
                  height={28}
                />
                <ul className='rr-findings'>
                  {LOCADEX_FINDINGS.map((finding) => (
                    <li key={finding}>{finding}</li>
                  ))}
                </ul>
                <code className='rr-agent-diff'>{LOCADEX_DIFF}</code>
              </div>
            </div>
          </div>
        </article>

        <article className='rr-raised rr-tablet'>
          <div className='rr-face is-framed'>
            <Frame id='rr-frame-dash' kind='chevron' />
            <div className='rr-tablet-in'>
              <header className='rr-tablet-head'>
                <h3>Dashboard</h3>
                <p>Source beside translation. Revision state is carried by type and stamps.</p>
              </header>
              <div className='rr-review'>
                <div className='rr-review-bar'>
                  <span>{REVIEW_BAR.workspace}</span>
                  <span>{REVIEW_BAR.count}</span>
                </div>
                <ol className='rr-review-rows'>
                  {REVIEW_ROWS.map((row) => (
                    <li key={row.key}>
                      <span className='rr-review-src' lang='en'>
                        {row.source}
                      </span>
                      <span className='rr-review-tr' lang='es'>
                        {row.previous ? <s>{row.previous}</s> : null}
                        <span>{row.translation}</span>
                      </span>
                      <span className='rr-stamp' data-state={row.state}>
                        {row.state}
                      </span>
                    </li>
                  ))}
                </ol>
                <div className='rr-review-foot'>
                  {REVIEW_FOOT.map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
