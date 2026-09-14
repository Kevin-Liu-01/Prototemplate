import Image from 'next/image';

import { FRAMEWORKS } from '@/app/d/dither-field/sections/stacks';

import BrickField from '../diagrams/BrickField';
import Rosette from '../diagrams/Rosette';
import { CLI_LOCALES, LINKS, REVIEW_ROWS } from '../data';
import CodeFace from './CodeFace';
import CopyCommand from './CopyCommand';
import LocaleChip from './LocaleChip';

/**
 * brick-lattice · the kiln.
 *
 * Home: the page's one dark moment. The lattice turns to fired obsidian
 * brick with a crenellated parapet along its top course and a stepped foot
 * along its bottom, and four glazed panels sit in it, one per product
 * surface: the libraries as the shipped Next.js sample in a code window,
 * the CLI as one `gt translate` session with the story's figures, the
 * dashboard as the review workspace with its four real rows, and Locadex
 * as its own mark over the trace that ends in PR #218. The tokens in this
 * section are literals on purpose: the kiln stays dark in both themes.
 */
const NEXT = FRAMEWORKS[0]!;

export default function Kiln() {
  return (
    <section className='bl-sec bl-kiln' id='platform'>
      <BrickField field='parapet' />
      <div className='bl-in'>
        <header className='bl-head bl-panel is-kiln'>
          <Rosette size={40} brick={16} petals={8} core='gold' className='is-mark' />
          <h2>Everything localization needs.</h2>
          <p>Libraries, the CLI, the dashboard, and the Locadex agent. Four surfaces, one pipeline.</p>
        </header>

        <div className='bl-kiln-grid'>
          {/* 1 · libraries */}
          <article className='bl-panel is-kiln bl-kp is-lib'>
            <div className='bl-kp-head'>
              <h3>Libraries</h3>
              <p>
                Six first-party SDKs. The <code>&lt;T&gt;</code> component wraps JSX; <code>useGT()</code> and{' '}
                <code>getGT()</code> translate strings; <code>&lt;Num&gt;</code> and <code>&lt;DateTime&gt;</code>{' '}
                format for the locale.
              </p>
            </div>
            <div className='bl-win'>
              <div className='bl-win-bar'>
                <span className='bl-win-file'>{NEXT.file}</span>
                <span className='bl-win-pkg'>{NEXT.pkg}</span>
                <CopyCommand command={NEXT.install[0]} prompt='' className='is-bar' />
              </div>
              <CodeFace code={NEXT.code} />
            </div>
            <ul className='bl-stacks'>
              {FRAMEWORKS.map((f) => (
                <li key={f.id}>
                  <span className='bl-stack-name'>{f.name}</span>
                  <code className='bl-stack-pkg'>{f.pkg}</code>
                </li>
              ))}
            </ul>
          </article>

          {/* 2 · cli */}
          <article className='bl-panel is-kiln bl-kp is-cli'>
            <div className='bl-kp-head'>
              <h3>CLI</h3>
              <p>
                <code>npx gt translate</code> reads the project, sends only the new and changed strings, and
                writes every locale file into the build.
              </p>
            </div>
            <div className='bl-term'>
              <div className='bl-win-bar'>
                <span className='bl-win-file'>gt cli</span>
                <span className='bl-win-pkg'>main</span>
              </div>
              <ol className='bl-term-lines'>
                <li>
                  <span className='bl-term-p'>$</span> npx gt translate
                </li>
                <li className='is-out'>128 strings · 3 new · 2 changed</li>
                <li className='is-out bl-term-chips'>
                  {CLI_LOCALES.map((code) => (
                    <LocaleChip code={code} key={code} />
                  ))}
                </li>
                <li className='is-out'>640 translations · public/_gt/[locale].json</li>
                <li>
                  <span className='bl-term-p'>$</span> npx gt translate --dry-run
                </li>
                <li className='is-out'>0 tokens billed · prints the strings it would send</li>
              </ol>
            </div>
          </article>

          {/* 3 · dashboard */}
          <article className='bl-panel is-kiln bl-kp is-dash'>
            <div className='bl-kp-head'>
              <h3>Dashboard</h3>
              <p>Every string beside its source. Approve it, edit it, or send it back. History keeps each revision.</p>
            </div>
            <div className='bl-ws'>
              <div className='bl-win-bar'>
                <span className='bl-win-file'>workspace · es-419</span>
                <span className='bl-win-pkg'>4 strings</span>
              </div>
              <div className='bl-ws-cols' aria-hidden='true'>
                <span>source · en</span>
                <span>translation · es</span>
                <span>state</span>
              </div>
              <ul className='bl-ws-rows'>
                {REVIEW_ROWS.map((row) => (
                  <li className='bl-ws-row' key={row.key}>
                    <span className='bl-ws-src' lang='en'>
                      {row.source}
                    </span>
                    <span className='bl-ws-tr' lang='es'>
                      {row.previous ? <s className='bl-ws-prev'>{row.previous}</s> : null}
                      <span>{row.translation}</span>
                    </span>
                    <span className={`bl-stamp is-${row.state}`}>{row.state === 'approved' ? 'approved' : 'edit'}</span>
                  </li>
                ))}
              </ul>
              <div className='bl-ws-foot'>
                <span>⌘K search</span>
                <span>history</span>
                <span>download</span>
                <span>agent · locadex</span>
              </div>
            </div>
          </article>

          {/* 4 · locadex */}
          <article className='bl-panel is-kiln bl-kp is-agent'>
            <div className='bl-kp-head'>
              <div className='bl-agent-mark'>
                <Image
                  src='/brand/no-bg-locadex-logo-light.png'
                  alt='Locadex'
                  width={36}
                  height={36}
                  className='bl-locadex-mark'
                />
                <h3>Locadex</h3>
              </div>
              <p>
                The agent reads the file that changed, wraps the tree in <code>&lt;T&gt;</code>, writes the
                translations against that file, and opens the pull request.
              </p>
            </div>
            <ol className='bl-trace'>
              <li>
                <span className='bl-trace-k'>push</span>
                <span className='bl-trace-v'>workflow · locadex scans app/page.tsx</span>
              </li>
              <li>
                <span className='bl-trace-k'>scan</span>
                <span className='bl-trace-v'>unwrapped copy · hand-rolled date · unbuilt label</span>
              </li>
              <li>
                <span className='bl-trace-k'>edit</span>
                <span className='bl-trace-v'>
                  + <code>&lt;T&gt;</code> · + <code>&lt;DateTime&gt;</code> · <code>toLocaleDateString()</code>{' '}
                  removed
                </span>
              </li>
              <li>
                <span className='bl-trace-k'>open pr</span>
                <span className='bl-trace-v'>PR #218 · 6 locales · merged</span>
              </li>
            </ol>
          </article>
        </div>

        <div className='bl-kiln-acts'>
          <a className='bl-btn bl-btn-solid' href={LINKS.getStarted}>
            Get Started
          </a>
          <a className='bl-btn bl-btn-line' href={LINKS.demo}>
            Talk to an Engineer
          </a>
        </div>
      </div>
    </section>
  );
}
