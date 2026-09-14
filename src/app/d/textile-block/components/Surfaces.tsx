import Image from 'next/image';

import { CLI_LOCALES, LIBRARIES, REVIEW_ROWS } from '../data';
import Tile from './Tile';
import { Block, Course, Relief } from './Wall';

/**
 * textile-block: the product surfaces as concrete objects.
 *
 * Four blocks in two courses: the libraries ledger, the CLI transcript, the
 * dashboard's review workspace, and the Locadex agent with its trace. Each
 * object is set flush into its smooth block; the recessed panels inside are
 * ground-colored, so an object reads as cast one layer deeper than its face.
 */

const TRACE: readonly (readonly [string, string])[] = [
  ['push', 'workflow'],
  ['scan', 'app/page.tsx'],
  ['edit', '<T> · <DateTime>'],
  ['PR #218', '6 locales · merged'],
];

const WORKSPACE_FOOT: readonly string[] = ['⌘K search', 'history', 'download', 'agent · locadex'];

export default function Surfaces() {
  return (
    <Course className='is-surfaces' id='platform' label='The platform'>
      <Block className='tb-head' span={{ c: 8, r: 2, cMd: 8, rMd: 2, cSm: 6, rSm: 3 }}>
        <h2 className='tb-h2'>Everything localization needs.</h2>
        <p>Libraries, a CLI, a dashboard, and an agent, set in one platform.</p>
      </Block>
      <Relief className='tb-lg-only' motif='step' span={{ c: 4, r: 2 }} />

      {/* ---- libraries: the six first-party SDKs as a ledger ---- */}
      <Block className='tb-obj' span={{ c: 6, r: 4, cMd: 8, rMd: 4, cSm: 6, rSm: 6 }}>
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

      {/* ---- CLI: one run of the translate command ---- */}
      <Block className='tb-obj' span={{ c: 6, r: 4, cMd: 8, rMd: 4, cSm: 6, rSm: 6 }}>
        <h3>CLI</h3>
        <p className='tb-obj-lead'>One command reads the config, translates what changed, and uploads every locale.</p>
        <div className='tb-term'>
          <div className='tb-term-line is-cmd'>
            <span aria-hidden='true' className='tb-term-prompt'>
              $
            </span>
            <code>npx gt translate</code>
          </div>
          <div className='tb-term-line'>reading gt.config.json</div>
          <div className='tb-term-line'>128 strings · 3 new · 2 changed</div>
          <div className='tb-term-chips'>
            {CLI_LOCALES.map((code) => (
              <Tile code={code} key={code} />
            ))}
          </div>
          <div className='tb-term-line'>6 locales · uploaded · served from the edge</div>
        </div>
      </Block>

      {/* ---- dashboard: the review workspace ---- */}
      <Block className='tb-obj' span={{ c: 7, r: 5, cMd: 8, rMd: 5, cSm: 6, rSm: 9 }}>
        <h3>Dashboard</h3>
        <p className='tb-obj-lead'>Source beside translation. Revision state is carried by type and chips.</p>
        <div className='tb-ws'>
          <div className='tb-ws-bar'>
            <span>workspace · es-419</span>
            <span>4 strings</span>
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
