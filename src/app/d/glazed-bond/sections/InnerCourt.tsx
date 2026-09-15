import Image from 'next/image';

import { FRAMEWORKS } from '@/app/d/dither-field/sections/stacks';

import BondWall from '../components/Bond';
import Chip, { CodeChip } from '../components/Chip';
import CopyButton from '../components/CopyButton';
import CourseHead from '../components/CourseHead';
import GlazeCode from '../components/GlazeCode';
import GlazeField from '../components/GlazeField';
import { CourtParapet } from '../components/Rosette';
import Sheen from '../components/Sheen';
import {
  CLI_LOCALES,
  LOCADEX_DIFF,
  LOCADEX_FINDINGS,
  OUTPUTS,
  PACKAGES,
  REVIEW_ROWS,
  URLS,
} from '../data';

/**
 * The inner court: the page's one dark moment, a lapis glazed wall the
 * full width of the elevation with four tablets set into its bond. Its
 * skyline is the second crenellation rhythm, two-step merlons capped in
 * turquoise rising into the cream ground, over a turquoise register rule.
 * The libraries tablet carries the shipped gt-next sample; the CLI tablet
 * the `gt translate` run; the dashboard tablet the review workspace,
 * source beside translation; the Locadex tablet the agent's findings and
 * its pull request. Each tablet wears a turquoise glaze sheen at its
 * arris. The floor dissolves in a turquoise dither. The court's glaze
 * never remaps: it is dark in both themes.
 */
const NEXT = FRAMEWORKS[0];

export default function InnerCourt() {
  return (
    <section className='gb-court' id='platform'>
      <CourtParapet />

      <div className='gb-court-body'>
        <div className='gb-court-bond' aria-hidden='true'>
          <BondWall stipple={false} />
        </div>
        <GlazeField kind='floor' className='gb-court-floor' scale={3} />

        <div className='gb-court-in'>
          <div className='gb-course-in'>
            <CourseHead
              n={3}
              title='Everything localization needs.'
              sub='Libraries, the CLI, the dashboard and the Locadex agent, each a real surface.'
              glazed
            />

            <div className='gb-tablets'>
              {/* Libraries */}
              <article className='gb-tab is-code'>
                <Sheen ink='turq' />
                <header className='gb-tab-bar'>
                  <span className='gb-tab-title'>
                    {NEXT?.file ?? 'app/page.tsx'} · {NEXT?.pkg ?? 'gt-next'}
                  </span>
                  <CopyButton text={NEXT?.code ?? ''} className='is-bar' />
                </header>
                <GlazeCode code={NEXT?.code ?? ''} />
                <footer className='gb-tab-foot'>
                  <div className='gb-tab-chips' aria-label='Libraries'>
                    {PACKAGES.map((pkg) => (
                      <CodeChip key={pkg}>{pkg}</CodeChip>
                    ))}
                  </div>
                  <dl className='gb-outputs'>
                    {OUTPUTS.map((row) => (
                      <div key={row.label}>
                        <dt>{row.label}</dt>
                        <dd>{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </footer>
              </article>

              {/* CLI */}
              <article className='gb-tab is-cli'>
                <Sheen ink='turq' />
                <header className='gb-tab-bar'>
                  <span className='gb-tab-title'>gt cli · terminal</span>
                  <span className='gb-tab-meta'>zsh</span>
                </header>
                <div className='gb-term'>
                  <div className='gb-term-line is-prompt'>$ npx gt translate</div>
                  <div className='gb-term-line'>128 strings · 3 new · 2 changed</div>
                  <div className='gb-term-chips'>
                    {CLI_LOCALES.map((code) => (
                      <Chip code={code} key={code} />
                    ))}
                  </div>
                  <div className='gb-term-line is-prompt'>$ npx gt translate --dry-run</div>
                  <div className='gb-term-line'>prints what would be translated · bills 0 tokens</div>
                </div>
                <footer className='gb-tab-foot is-plain'>
                  <p>One command reads the project, translates what changed, and writes each locale file.</p>
                </footer>
              </article>

              {/* Dashboard: the review workspace */}
              <article className='gb-tab is-review'>
                <Sheen ink='turq' />
                <header className='gb-tab-bar'>
                  <span className='gb-tab-title'>workspace · es-419</span>
                  <span className='gb-tab-meta'>4 strings</span>
                </header>
                <div className='gb-review' role='table' aria-label='Review workspace'>
                  <div className='gb-rev-row is-head' role='row'>
                    <span role='columnheader'>source · en</span>
                    <span role='columnheader'>translation · es</span>
                    <span role='columnheader' className='gb-vh'>
                      state
                    </span>
                  </div>
                  {REVIEW_ROWS.map((row) => (
                    <div className='gb-rev-row' role='row' key={row.key}>
                      <span className='gb-rev-src' role='cell' lang='en'>
                        {row.source}
                      </span>
                      <span className='gb-rev-tr' role='cell' lang='es'>
                        {row.previous ? <s>{row.previous}</s> : null}
                        <span>{row.translation}</span>
                      </span>
                      <span className={`gb-stamp is-${row.state}`} role='cell'>
                        {row.state === 'approved' ? 'approved' : 'edited'}
                      </span>
                    </div>
                  ))}
                </div>
                <footer className='gb-tab-foot is-bar'>
                  <span>⌘K search</span>
                  <span>history</span>
                  <span>download</span>
                  <span className='is-right'>agent · locadex</span>
                </footer>
              </article>

              {/* Locadex */}
              <article className='gb-tab is-locadex'>
                <Sheen ink='turq' />
                <header className='gb-tab-bar'>
                  <span className='gb-tab-title'>agent · locadex</span>
                  <span className='gb-tab-meta'>PR #218</span>
                </header>
                <div className='gb-lx'>
                  <div className='gb-lx-mark'>
                    <Image
                      src='/brand/no-bg-locadex-logo-light.png'
                      alt='Locadex'
                      width={44}
                      height={44}
                      unoptimized
                    />
                    <p>Locadex reads the file that changed and opens a pull request you can read.</p>
                  </div>
                  <ol className='gb-lx-findings' aria-label='Findings'>
                    {LOCADEX_FINDINGS.map((finding) => (
                      <li key={finding}>{finding}</li>
                    ))}
                  </ol>
                  <pre className='gb-lx-diff' aria-label='Diff'>
                    {LOCADEX_DIFF.map((line) => (
                      <span className={line.sign === '+' ? 'is-add' : 'is-del'} key={line.line}>
                        {line.sign} {line.line}
                      </span>
                    ))}
                  </pre>
                  <div className='gb-lx-status'>
                    <span>6 locales</span>
                    <span>640 translations</span>
                    <span>merged</span>
                  </div>
                </div>
              </article>
            </div>

            <div className='gb-court-acts'>
              <a className='gb-btn is-solid is-glazed' href={URLS.getStarted}>
                Get Started
              </a>
              <a className='gb-btn is-line is-glazed' href={URLS.docs}>
                Docs
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
