'use client';

import { useRef } from 'react';

import { FRAMEWORKS } from '@/app/d/dither-field/sections/stacks';

import BarDot from '../components/BarDot';
import Chip from '../components/Chip';
import { useQuietReveal } from '../components/motion';
import { Panel, Register } from '../components/Panel';
import { CLI_LOCALES, REVIEW_ROWS } from '../data';

/**
 * Leaf three: the product surfaces as four tablets in one register. The
 * libraries as a ledger of the six SDKs, the CLI as a terminal face, the
 * dashboard as the review workspace with its four rows, and Locadex as
 * the lambda mark with the pull request it opens. Every figure prints in
 * bar and dot beside its Arabic form.
 */
export default function SurfacesPanel() {
  const root = useRef<HTMLDivElement>(null);
  useQuietReveal(root);

  return (
    <div ref={root}>
      <Panel index={3} fold='a' id='surfaces'>
        <Register className='is-head'>
          <h2 className='sfc-h2' data-reveal>
            Everything localization needs.
          </h2>
          <p className='sfc-lead' data-reveal>
            Libraries, the CLI, the dashboard, and the Locadex agent, as the objects they are.
          </p>
        </Register>

        <Register>
          <div className='sfc-tablet' data-reveal>
            <article className='sfc-cell'>
              <header className='sfc-cell-head'>
                <h3>Libraries</h3>
                <span className='sfc-figure'>
                  <BarDot n={6} layout='row' scale={0.9} />
                  <span>6 first-party SDKs</span>
                </span>
              </header>
              <ul className='sfc-ledger is-sdks'>
                {FRAMEWORKS.map((f) => (
                  <li className='sfc-ledger-row' key={f.id}>
                    <span className='sfc-ledger-name'>{f.name}</span>
                    <code className='sfc-ledger-pkg'>{f.pkg}</code>
                    <code className='sfc-ledger-cmd'>{f.install[0]}</code>
                  </li>
                ))}
              </ul>
            </article>

            <article className='sfc-cell'>
              <header className='sfc-cell-head'>
                <h3>CLI</h3>
                <span className='sfc-figure'>
                  <BarDot n={128} layout='row' scale={0.9} />
                  <span>128 strings</span>
                </span>
              </header>
              <div className='sfc-term'>
                <div className='sfc-term-bar'>
                  <span>gt cli</span>
                  <span>session</span>
                </div>
                <pre className='sfc-term-pre'>
                  <code>
                    <span className='sfc-term-prompt'>$</span> npx gt translate{'\n'}
                    <span className='sfc-term-dim'>128 strings · 3 new · 2 changed</span>
                    {'\n'}
                  </code>
                </pre>
                <div className='sfc-term-chips'>
                  {CLI_LOCALES.map((loc) => (
                    <Chip code={loc} key={loc} />
                  ))}
                </div>
                <pre className='sfc-term-pre'>
                  <code>
                    <span className='sfc-term-dim'>wrote public/_gt/*.json</span>
                    {'\n'}
                  </code>
                </pre>
              </div>
            </article>

            <article className='sfc-cell'>
              <header className='sfc-cell-head'>
                <h3>Dashboard</h3>
                <span className='sfc-figure'>
                  <BarDot n={4} layout='row' scale={0.9} />
                  <span>4 strings</span>
                </span>
              </header>
              <div className='sfc-review'>
                <div className='sfc-review-bar'>
                  <span>workspace · es-419</span>
                  <span>4 strings</span>
                </div>
                <div className='sfc-review-cols'>
                  <span>source · en</span>
                  <span>translation · es</span>
                </div>
                <ul className='sfc-review-rows'>
                  {REVIEW_ROWS.map((row) => (
                    <li className='sfc-review-row' key={row.source}>
                      <span className='sfc-review-src' lang='en'>
                        {row.source}
                      </span>
                      <span className='sfc-review-tr' lang='es'>
                        {row.previous ? <s className='sfc-review-prev'>{row.previous}</s> : null}
                        <span>{row.translation}</span>
                        <b className={`sfc-stamp is-${row.state}`}>{row.state === 'approved' ? 'approved' : 'edited'}</b>
                      </span>
                    </li>
                  ))}
                </ul>
                <div className='sfc-review-foot'>
                  <span>⌘K search</span>
                  <span>history</span>
                  <span>download</span>
                  <span>agent · locadex</span>
                </div>
              </div>
            </article>

            <article className='sfc-cell is-locadex'>
              <header className='sfc-cell-head'>
                <h3>Locadex</h3>
                <span className='sfc-figure'>
                  <BarDot n={218} layout='row' scale={0.9} />
                  <span>PR #218</span>
                </span>
              </header>
              <div className='sfc-locadex'>
                <img className='sfc-locadex-mark' src='/brand/no-bg-locadex-logo-light.png' alt='Locadex' width={72} height={72} />
                <p className='sfc-p'>
                  Locadex reads the file that changed, wraps the tree in <code>&lt;T&gt;</code>, writes the
                  translations against the source it just read, and opens the pull request. One PR, a
                  diff you can read.
                </p>
              </div>
            </article>
          </div>
        </Register>
      </Panel>
    </div>
  );
}
