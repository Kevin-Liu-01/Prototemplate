import { SiGithub } from '@icons-pack/react-simple-icons';

import { FRAMEWORKS } from '@/app/d/dither-field/sections/stacks';

import { CLI_LOCALES, TRACE } from '../data';
import { Chip } from './Chip';
import { Band, Register } from './Register';

/**
 * Register IV. The product surfaces as concrete objects: the six libraries
 * with their install commands in the first band, the CLI's transcript in
 * the second, the dashboard and the Locadex agent in the third. Locadex is
 * the lambda mark and nothing else.
 */
export function Instruments() {
  return (
    <Register id='instruments' numeral='IV' name='The instruments'>
      <Band label='libraries · 6 first-party SDKs' className='is-libs'>
        <h2 className='tr-h2' data-cut>
          Everything localization needs.
        </h2>
        <p className='tr-sub' data-cut>
          Libraries, the CLI, the dashboard, and the agent. Each one is a concrete object with a real output.
        </p>
        <ul className='tr-libs'>
          {FRAMEWORKS.map((item) => (
            <li className='tr-lib' key={item.id} data-cut>
              <code className='tr-lib-pkg'>{item.pkg}</code>
              <span className='tr-lib-name'>{item.name}</span>
              <code className='tr-lib-install'>{item.install[0]}</code>
            </li>
          ))}
        </ul>
      </Band>

      <Band label='cli · the run' className='is-cli'>
        <div className='tr-term' data-cut>
          <p className='tr-term-line is-cmd'>
            <span className='tr-term-prompt' aria-hidden='true'>
              $
            </span>{' '}
            npx gt translate
          </p>
          <p className='tr-term-line'>128 strings · 3 new · 2 changed</p>
          <p className='tr-term-line is-chips'>
            {CLI_LOCALES.map((loc) => (
              <Chip code={loc} key={loc} />
            ))}
          </p>
          <p className='tr-term-line'>640 translations · served from the edge</p>
        </div>
      </Band>

      <Band label='dashboard · locadex' className='is-agents'>
        <div className='tr-pair'>
          <div className='tr-pair-cell' data-cut>
            <h3>Dashboard</h3>
            <p>Glossaries, directives, and review in one workspace.</p>
            <ul className='tr-ledger-mini'>
              <li>
                <b>acme/web</b>
                <span>production</span>
              </li>
              <li>
                <b>128 strings</b>
                <span>6 locales</span>
              </li>
              <li>
                <b>glossary</b>
                <span>directives · review</span>
              </li>
            </ul>
          </div>
          <div className='tr-pair-cell' data-cut>
            <h3>
              <img
                className='tr-ldx'
                src='/brand/no-bg-locadex-logo-light.png'
                alt=''
                aria-hidden='true'
                width={22}
                height={22}
              />
              Locadex
            </h3>
            <p>The agent that internationalizes your repo in guarded PRs.</p>
            <ol className='tr-trace'>
              {TRACE.map((line) => (
                <li key={line}>
                  <code>{line}</code>
                </li>
              ))}
            </ol>
            <p className='tr-trace-foot'>
              <SiGithub size={13} color='currentColor' aria-hidden />
              <span>PR #218</span>
              <span>locadex → main</span>
            </p>
          </div>
        </div>
      </Band>
    </Register>
  );
}
