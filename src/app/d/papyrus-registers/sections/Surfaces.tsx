import Image from 'next/image';

import { CLI_LOCALES, LOCADEX_TRACE, REVIEW_ROWS, SDKS } from '../data';
import Chip from './Chip';
import ColumnHead from './ColumnHead';
import Cartouche from './deco/Cartouche';
import WaterRule from './deco/WaterRule';

/**
 * The four product surfaces as concrete objects in two registers. Libraries
 * are a ledger of the six SDKs; the CLI is a session on the one dark panel
 * of the light page; the dashboard is the collation, source beside
 * translation with revision carried by stamps; Locadex is the mark in its
 * cartouche beside the trace of what the agent does. The water rule divides
 * the two registers.
 */
export default function Surfaces() {
  return (
    <section className='pr-col' id='surfaces' aria-labelledby='pr-surfaces-title'>
      <ColumnHead
        n={3}
        id='pr-surfaces-title'
        title='Four surfaces'
        sub='Libraries, the CLI, the dashboard, and Locadex are one pipeline. Every language ships with the deploy.'
      />

      <div className='pr-reg pr-split'>
        <article className='pr-cell'>
          <h3 className='pr-h3'>Libraries</h3>
          <p className='pr-cell-sub'>
            The same T component in six first-party SDKs. Install one, wrap the source, run the CLI.
          </p>
          <div className='pr-sdk' role='table' aria-label='SDK ledger'>
            <div className='pr-sdk-row is-head' role='row'>
              <span role='columnheader'>Package</span>
              <span role='columnheader'>Framework</span>
              <span role='columnheader'>Install</span>
            </div>
            {SDKS.map((sdk) => (
              <div className='pr-sdk-row' role='row' key={sdk.pkg}>
                <code className='pr-sdk-pkg' role='cell'>
                  {sdk.pkg}
                </code>
                <span role='cell'>
                  <a href={sdk.docs}>{sdk.name}</a>
                </span>
                <code className='pr-sdk-install' role='cell'>
                  {sdk.install}
                </code>
              </div>
            ))}
          </div>
        </article>

        <article className='pr-cell'>
          <h3 className='pr-h3'>CLI</h3>
          <p className='pr-cell-sub'>
            One command reads the source, translates what changed, and writes a file per locale.
          </p>
          <div className='pr-term'>
            <div className='pr-term-bar'>
              <span>gt · translate</span>
              <span>session</span>
            </div>
            <div className='pr-term-body'>
              <p>
                <span className='pr-term-prompt'>$</span>npx gt translate
              </p>
              <p className='pr-term-out'>128 strings · 3 new · 2 changed</p>
              <p className='pr-term-out pr-term-chips'>
                <span className='pr-term-key'>locales</span>
                {CLI_LOCALES.map((code) => (
                  <Chip key={code} code={code} tone='stone' />
                ))}
              </p>
              <p className='pr-term-out'>640 translations · public/_gt/&lt;locale&gt;.json</p>
              <p>
                <span className='pr-term-prompt'>$</span>npx gt translate --dry-run
              </p>
              <p className='pr-term-out'>0 tokens billed</p>
            </div>
          </div>
        </article>
      </div>

      <WaterRule />

      <div className='pr-reg pr-split'>
        <article className='pr-cell'>
          <h3 className='pr-h3'>Dashboard</h3>
          <p className='pr-cell-sub'>
            Source beside translation in one workspace. Revision state is carried by type and stamps, never by
            color.
          </p>
          <div className='pr-coll'>
            <div className='pr-coll-bar'>
              <span>workspace · es-419</span>
              <span>4 strings</span>
            </div>
            <ol className='pr-coll-rows'>
              {REVIEW_ROWS.map((row) => (
                <li className='pr-coll-row' key={row.key}>
                  <span className='pr-coll-src' lang='en'>
                    {row.source}
                  </span>
                  <span className='pr-coll-tr' lang='es'>
                    {row.previous ? <s className='pr-coll-prev'>{row.previous}</s> : null}
                    <span>{row.translation}</span>
                  </span>
                  <span className='pr-coll-state'>
                    <span className='pr-stamp'>{row.state}</span>
                  </span>
                </li>
              ))}
            </ol>
            <div className='pr-coll-foot'>
              <span>⌘K search</span>
              <span>history</span>
              <span>download</span>
              <span>agent · locadex</span>
            </div>
          </div>
        </article>

        <article className='pr-cell pr-agent'>
          <Cartouche>
            <Image
              className='pr-locadex'
              src='/brand/no-bg-locadex-logo-light.png'
              alt='Locadex'
              width={40}
              height={40}
            />
          </Cartouche>
          <div className='pr-agent-text'>
            <h3 className='pr-h3'>Locadex</h3>
            <p className='pr-cell-sub'>
              The agent reads the repository, wraps the strings, runs the translation, and opens the pull
              request.
            </p>
            <ol className='pr-trace' aria-label='Agent trace'>
              {LOCADEX_TRACE.map((step) => (
                <li key={step.verb}>
                  <span className='pr-trace-verb'>{step.verb}</span>
                  <code className='pr-trace-obj'>{step.object}</code>
                </li>
              ))}
            </ol>
          </div>
        </article>
      </div>
    </section>
  );
}
