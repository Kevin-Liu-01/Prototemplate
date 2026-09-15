import LocaleTag from '@/app/d/toolchain/components/LocaleTag';

import WedgeRule from '../diagrams/deco/WedgeRule';
import { CLI_TERMINAL, DASHBOARD_ITEMS, GT_CONFIG, LOCADEX_TRACE, SDKS, STATS } from './content';
import Shelf, { Tablet } from './Shelf';

/**
 * Tablet III: the product surfaces as concrete objects. A stats register,
 * then four columns divided by doubled threads: the libraries as a package
 * ledger, the CLI as its terminal and config, the dashboard as its tools,
 * and Locadex as its mark and its trace. The Locadex mark is the real lambda
 * drawing (A9); nothing here is a robot or a sparkle.
 */
export default function SurfacesTablet() {
  return (
    <Shelf
      id='surfaces'
      label={{
        numeral: 'III',
        name: 'Product surfaces',
        note: 'Four columns divided by doubled threads: the libraries, the CLI, the dashboard, and Locadex. Each column holds the object itself.',
      }}
    >
      <Tablet size='full' className='ct-surfaces'>
        <header className='ct-reg ct-head'>
          <h2>Everything localization needs.</h2>
          <p>Six first-party SDKs, one CLI, a dashboard for review, and an agent that opens the pull request.</p>
        </header>

        <WedgeRule />

        <dl className='ct-reg ct-stats'>
          {STATS.map((stat) => (
            <div className='ct-stat' key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>

        <div className='ct-cols ct-surf-cols'>
          <div className='ct-col'>
            <h3>Libraries</h3>
            <p>One provider, one loader. The same components on every stack.</p>
            <ul className='ct-ledger'>
              {SDKS.map((sdk) => (
                <li className='ct-ledger-row' key={sdk.pkg}>
                  <code className='ct-ledger-pkg'>{sdk.pkg}</code>
                  <span className='ct-ledger-name'>{sdk.name}</span>
                  <code className='ct-ledger-cmd'>{sdk.install}</code>
                </li>
              ))}
            </ul>
          </div>

          <div className='ct-col'>
            <h3>CLI</h3>
            <p>One command scans the source and writes one file per locale.</p>
            <div className='ct-slip ct-term'>
              <div className='ct-term-line' data-tone='cmd'>
                {CLI_TERMINAL.prompt}
              </div>
              <div className='ct-term-line'>{CLI_TERMINAL.summary}</div>
              <div className='ct-term-chips'>
                {CLI_TERMINAL.locales.map((code) => (
                  <LocaleTag code={code} className='ct-lct' key={code} />
                ))}
              </div>
            </div>
            <div className='ct-slip ct-code ct-code-sm'>
              <div className='ct-code-bar'>
                <span className='ct-code-file'>gt.config.json</span>
              </div>
              <pre className='ct-code-body'>
                <code>{GT_CONFIG}</code>
              </pre>
            </div>
          </div>

          <div className='ct-col'>
            <h3>Dashboard</h3>
            <p>Review, glossary, context, and branches in one workspace.</p>
            <ul className='ct-tags'>
              {DASHBOARD_ITEMS.map((item) => (
                <li className='ct-tag' key={item}>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className='ct-col ct-col-locadex'>
            <h3>
              <img
                className='ct-lx-mark'
                src='/brand/no-bg-locadex-logo-light.png'
                alt=''
                width={22}
                height={22}
              />
              Locadex
            </h3>
            <p>The agent reads the file that changed and opens the pull request.</p>
            <ol className='ct-trace'>
              {LOCADEX_TRACE.map((line) => (
                <li className='ct-trace-line' key={line}>
                  <code>{line}</code>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Tablet>
    </Shelf>
  );
}
