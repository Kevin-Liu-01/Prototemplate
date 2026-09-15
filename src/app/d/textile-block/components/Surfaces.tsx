import Image from 'next/image';

import {
  CLI_COMMAND,
  CLI_DONE,
  CLI_LOCALES,
  CLI_OUTPUT,
  CLI_SCAN,
  CONFIG,
  CONFIG_FILE,
  LIBRARIES,
  REVIEW_ROWS,
  TRACE,
  WORKSPACE_BAR,
  WORKSPACE_FOOT,
} from '../data';
import Tile from './Tile';
import { Block, Course, HEAD_RELIEF_SPAN, Plaque, Relief } from './Wall';

/**
 * textile-block: the product surfaces as concrete objects.
 *
 * The platform course is keyed to the Storer block. Four objects in two
 * rows: the libraries ledger, the CLI with the config it reads and the run
 * it writes, the dashboard's review workspace, and the Locadex agent with
 * its trace. Each object is set flush into its smooth block; the recessed
 * panels inside are ground-colored, so an object reads as cast one layer
 * deeper than its face, the way the Storer slots are cut into the block.
 */
export default function Surfaces() {
  return (
    <Course className='is-surfaces' id='platform' label='The platform'>
      <Plaque label='Storer course' relief='storer' title='Everything localization needs.'>
        Libraries, a CLI, a dashboard, and an agent, set in one platform.
      </Plaque>
      <Relief className='tb-lg-only' relief='storer' span={HEAD_RELIEF_SPAN} />

      {/* ---- libraries: the six first-party SDKs as a ledger ---- */}
      <Block className='tb-obj' span={{ c: 6, r: 5, cMd: 8, rMd: 4, cSm: 6, rSm: 6 }}>
        <h3>Libraries</h3>
        <p className='tb-obj-lead'>Six first-party SDKs. One provider, one loader, the same components everywhere.</p>
        <div className='tb-ledger'>
          <div className='tb-ledger-row tb-ledger-head'>
            <span>Stack</span>
            <span>Package</span>
            <span>Install</span>
          </div>
          {LIBRARIES.map((lib) => (
            <div className='tb-ledger-row' key={lib.id}>
              <span>{lib.name}</span>
              <code>{lib.pkg}</code>
              <code>{lib.install}</code>
            </div>
          ))}
        </div>
      </Block>

      {/* ---- CLI: the config, then one run of the translate command ---- */}
      <Block className='tb-obj' span={{ c: 6, r: 5, cMd: 8, rMd: 6, cSm: 6, rSm: 8 }}>
        <h3>CLI</h3>
        <p className='tb-obj-lead'>One command reads the config, translates what changed, and writes one file per locale.</p>
        <div className='tb-term'>
          <div className='tb-term-file'>{CONFIG_FILE}</div>
          <ol className='tb-config'>
            {CONFIG.map((line, i) => (
              <li key={i}>
                {line.map(([kind, text], j) => (
                  <span className={`is-${kind}`} key={j}>
                    {text}
                  </span>
                ))}
              </li>
            ))}
          </ol>
          <div className='tb-term-line is-cmd'>
            <span aria-hidden='true' className='tb-term-prompt'>
              $
            </span>
            <code>{CLI_COMMAND}</code>
          </div>
          <div className='tb-term-line'>{CLI_SCAN}</div>
          {CLI_LOCALES.map((tag) => (
            <div className='tb-term-line is-out' key={tag}>
              <span>Wrote</span>
              <code>{CLI_OUTPUT(tag)}</code>
              <Tile code={tag} />
            </div>
          ))}
          <div className='tb-term-line'>{CLI_DONE}</div>
        </div>
      </Block>

      {/* ---- dashboard: the review workspace ---- */}
      <Block className='tb-obj' span={{ c: 7, r: 5, cMd: 8, rMd: 5, cSm: 6, rSm: 9 }}>
        <h3>Dashboard</h3>
        <p className='tb-obj-lead'>Source beside translation. Revision state is carried by type and chips.</p>
        <div className='tb-ws'>
          <div className='tb-ws-bar'>
            <span>{WORKSPACE_BAR[0]}</span>
            <span>{WORKSPACE_BAR[1]}</span>
          </div>
          {REVIEW_ROWS.map((row) => (
            <div className='tb-ws-row' key={row.key}>
              <span className='tb-ws-src' lang='en'>
                {row.source}
              </span>
              <span className='tb-ws-tr' lang='es'>
                {row.previous ? <s>{row.previous}</s> : null}
                <span>{row.translation}</span>
                <b className='tb-ws-stamp' data-kind={row.final === 'approved' ? 'ok' : 'chip'}>
                  {row.final === 'approved' ? 'approved' : 'edited'}
                </b>
              </span>
            </div>
          ))}
          <div className='tb-ws-foot'>
            {WORKSPACE_FOOT.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>
      </Block>

      {/* ---- Locadex: the agent, with the real lambda mark ---- */}
      <Block className='tb-obj is-locadex' span={{ c: 5, r: 5, cMd: 8, rMd: 4, cSm: 6, rSm: 6 }}>
        <div className='tb-ldx-head'>
          <Image
            alt=''
            aria-hidden
            className='tb-ldx-mark'
            height={28}
            src='/brand/no-bg-locadex-logo-light.png'
            width={28}
          />
          <h3>Locadex</h3>
        </div>
        <p className='tb-obj-lead'>
          The agent reads the file that changed, wraps the tree in <code>&lt;T&gt;</code>, writes the translations
          against it, and opens the pull request.
        </p>
        <ol className='tb-trace'>
          {TRACE.map(([stage, value]) => (
            <li key={stage}>
              <span className='tb-trace-stage'>{stage}</span>
              <span className='tb-trace-value'>{value}</span>
            </li>
          ))}
        </ol>
      </Block>
    </Course>
  );
}
