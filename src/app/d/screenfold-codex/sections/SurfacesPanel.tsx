'use client';

import { useRef } from 'react';

import { FRAMEWORKS } from '@/app/d/dither-field/sections/stacks';

import Chip from '../components/Chip';
import Fig from '../components/Fig';
import GlyphBlock from '../components/GlyphBlock';
import { useQuietReveal } from '../components/motion';
import { Panel, Register } from '../components/Panel';
import { CASCADE, CLI_LOCALES, LOCADEX_DIFF, leaf } from '../data';

/**
 * Leaf three: the product surfaces as four tablets in one register, each
 * headed by its sign and its figure. The libraries as a ledger of the six
 * SDKs with their install commands, the CLI as a terminal face with the
 * run's counts and locale chips, the dashboard as the context cascade of
 * three setbacks (Organization, Project, Component) listing the objects
 * that live at each level, and Locadex as the lambda mark beside the
 * pull request it opens, shown as the diff it is.
 */
const LEAF = leaf('surfaces');

export default function SurfacesPanel() {
  const root = useRef<HTMLDivElement>(null);
  useQuietReveal(root);

  return (
    <div ref={root}>
      <Panel index={LEAF.n} fold={LEAF.fold} sign={LEAF.sign} id={LEAF.id}>
        <Register className='is-head'>
          <h2 className='sfc-h2' data-reveal>
            Everything localization needs.
          </h2>
          <p className='sfc-lead' data-reveal>
            Libraries, the CLI, the dashboard, and the Locadex agent, as the objects they are.
          </p>
        </Register>

        <Register className='is-tablet'>
          <div className='sfc-tablet' data-reveal>
            <article className='sfc-cell'>
              <header className='sfc-cell-head'>
                <GlyphBlock motif='bond' tier={6} size={22} />
                <h3>Libraries</h3>
                <Fig n={6}>6 first-party SDKs</Fig>
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
                <GlyphBlock motif='key' tier={6} size={22} />
                <h3>CLI</h3>
                <Fig n={128}>128 strings</Fig>
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
                    <span className='sfc-term-dim'>6 locales · 640 translations</span>
                    {'\n'}
                  </code>
                </pre>
                <div className='sfc-term-foot'>
                  <Fig n={640} scale={0.8}>
                    640 translations
                  </Fig>
                  <Fig n={6} scale={0.8}>
                    6 locales
                  </Fig>
                </div>
              </div>
            </article>

            <article className='sfc-cell'>
              <header className='sfc-cell-head'>
                <GlyphBlock motif='pylon' tier={6} size={22} />
                <h3>Dashboard</h3>
                <span className='sfc-kicker'>context cascade</span>
              </header>
              <ol className='sfc-cascade'>
                {CASCADE.map((level, i) => (
                  <li className={`sfc-cascade-level is-l${i}`} key={level.name}>
                    <span className='sfc-cascade-name'>
                      <Fig n={i + 1} scale={0.75}>
                        {level.name}
                      </Fig>
                    </span>
                    <ul className='sfc-cascade-items'>
                      {level.items.map((item) => (
                        <li key={item}>{item.startsWith('<') || item.includes('=') ? <code>{item}</code> : item}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
              <p className='sfc-note'>
                Context set at the organization reaches every project. Context set on a project reaches
                every component in it.
              </p>
            </article>

            <article className='sfc-cell is-locadex'>
              <header className='sfc-cell-head'>
                <img
                  className='sfc-locadex-mark is-head'
                  src='/brand/no-bg-locadex-logo-light.png'
                  alt='Locadex'
                  width={22}
                  height={22}
                />
                <h3>Locadex</h3>
                <Fig n={218}>PR #218</Fig>
              </header>
              <div className='sfc-diff'>
                <div className='sfc-diff-bar'>
                  <span>app/page.tsx</span>
                  <span>agent · locadex</span>
                </div>
                <pre className='sfc-diff-pre'>
                  <code>
                    {LOCADEX_DIFF.map((line, i) => (
                      <span className={`sfc-diff-line is-${line.kind === '-' ? 'del' : line.kind === '+' ? 'add' : 'ctx'}`} key={i}>
                        <span className='sfc-diff-sign'>{line.kind}</span>
                        {line.text}
                        {'\n'}
                      </span>
                    ))}
                  </code>
                </pre>
              </div>
              <p className='sfc-p'>
                Locadex reads the file that changed, wraps the tree in <code>&lt;T&gt;</code>, writes the
                translations against the source it just read, and opens the pull request. One PR, a
                diff you can read.
              </p>
            </article>
          </div>
        </Register>
      </Panel>
    </div>
  );
}
