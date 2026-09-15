import { CLI_LOCALES, CONFIG_SOURCE, GLOSSARY, GLOSSARY_DIRECTIVE, LOCADEX_DIFF, SDKS, STATS } from '../data';
import { Code } from './Code';
import { Chip } from './deco/Chip';
import { Tablero, Talud, Terrace } from './deco/Terrace';

/**
 * The product surfaces as four concrete objects set into one tablero:
 * the libraries (six SDKs with their install lines), the CLI (the config
 * file and a dry run), the dashboard (a glossary term pinned across three
 * locales with its directive), and Locadex (the agent's edit as a diff with
 * its pull request). A four-cell ledger of the platform's counts closes the
 * panel. The talud below carries the stepped-key relief.
 */
export default function Surfaces() {
  return (
    <Terrace tier={3} className='tt-surfaces' id='surfaces'>
      <Tablero depth={2}>
        <header className='tt-head'>
          <h2 className='tt-h2'>Everything localization needs.</h2>
          <p>Libraries, the CLI, the dashboard, and Locadex, as they ship.</p>
        </header>

        <div className='tt-objects'>
          <article className='tt-object'>
            <h3>Libraries</h3>
            <p>Six first-party SDKs, one import each.</p>
            <ul className='tt-ledger'>
              {SDKS.map((sdk) => (
                <li key={sdk.pkg}>
                  <span className='tt-ledger-name'>{sdk.name}</span>
                  <code className='tt-ledger-pkg'>{sdk.pkg}</code>
                  <code className='tt-ledger-cmd'>{sdk.install}</code>
                </li>
              ))}
            </ul>
          </article>

          <article className='tt-object'>
            <h3>CLI</h3>
            <p>One config file and one command per build.</p>
            <Code file={CONFIG_SOURCE.file} code={CONFIG_SOURCE.code} className='is-small' />
            <div className='tt-run'>
              <code className='tt-run-cmd'>$ npx gt translate --dry-run</code>
              <span className='tt-run-out'>128 strings · 6 locales · 0 tokens billed</span>
              <span className='tt-run-chips'>
                {CLI_LOCALES.map((code) => (
                  <Chip key={code} code={code} />
                ))}
              </span>
            </div>
          </article>

          <article className='tt-object'>
            <h3>Dashboard</h3>
            <p>Glossaries, directives, and review in one workspace.</p>
            <table className='tt-glossary'>
              <thead>
                <tr>
                  <th scope='col'>Term</th>
                  <th scope='col'>Locale</th>
                  <th scope='col'>Pinned as</th>
                </tr>
              </thead>
              <tbody>
                {GLOSSARY.map((row) => (
                  <tr key={row.code}>
                    <td>{row.term}</td>
                    <td>
                      <Chip code={row.code} />
                    </td>
                    <td>
                      <code>{row.value}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className='tt-directive'>
              <span className='tt-directive-tag'>directive</span> {GLOSSARY_DIRECTIVE}
            </p>
          </article>

          <article className='tt-object is-locadex'>
            <h3>
              <img className='tt-lx-mark' src='/brand/no-bg-locadex-logo-light.png' alt='' width={18} height={18} />
              Locadex
            </h3>
            <p>The agent that internationalizes your repo in guarded pull requests.</p>
            <pre className='tt-diff'>
              <code>
                {LOCADEX_DIFF.map((line, i) => (
                  <span key={i} className={`tt-diff-line is-${line.kind}`}>
                    <span className='tt-diff-sign' aria-hidden='true'>
                      {line.kind === 'add' ? '+' : line.kind === 'del' ? '-' : ' '}
                    </span>
                    {line.text}
                  </span>
                ))}
              </code>
            </pre>
            <div className='tt-pr'>
              <span className='tt-pr-no'>PR #218</span>
              <span>6 locales</span>
              <span>merged</span>
            </div>
          </article>
        </div>

        <ul className='tt-stats' aria-label='Platform counts'>
          {STATS.map((stat) => (
            <li key={stat.label}>
              <b>{stat.value}</b>
              <span>{stat.label}</span>
            </li>
          ))}
        </ul>
      </Tablero>
      <Talud relief='steps' />
    </Terrace>
  );
}
