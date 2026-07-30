/**
 * The four artifacts under the band's service grid — one per service, and
 * four DIFFERENT objects, so the row never reads as four copies of one panel:
 * Code is an editor (tab strip, gutter, a translated-strings band pinned to
 * the plate's foot), Content is an API exchange (request block, the doubled
 * thread, a tinted response block), Dashboard is product UI (a lighter card
 * with a locale chip strip and a publish footer), Locadex is a diff sheet
 * (hunk header, full-bleed tinted added lines, a merge band). All four plates
 * stretch to the same bottom line; the pinned band is what lands on it.
 */

export function TcMiniCode() {
  return (
    <div className='tcm is-editor'>
      <div className='tcm-tabs'>
        <span className='is-on'>page.tsx</span>
        <span>checkout.tsx</span>
      </div>
      <pre className='tcm-pre'>
        <div>
          <span className='tcm-ln'>1</span>
          <span className='tcm-kw'>export default function</span> Page() {'{'}
        </div>
        <div>
          <span className='tcm-ln'>2</span>
          {'  '}
          <span className='tcm-kw'>return</span> (
        </div>
        <div>
          <span className='tcm-ln'>3</span>
          {'    '}
          <span className='tcm-dim'>{'<'}</span>
          <span className='tcm-gt'>T</span>
          <span className='tcm-dim'>{'>'}</span>
        </div>
        <div>
          <span className='tcm-ln'>4</span>
          {'      '}
          <span className='tcm-dim'>{'<h1>'}</span>
          Hello, world!
          <span className='tcm-dim'>{'</h1>'}</span>
        </div>
        <div>
          <span className='tcm-ln'>5</span>
          {'    '}
          <span className='tcm-dim'>{'</'}</span>
          <span className='tcm-gt'>T</span>
          <span className='tcm-dim'>{'>'}</span>
        </div>
        <div>
          <span className='tcm-ln'>6</span>
          {'  '})
        </div>
        <div>
          <span className='tcm-ln'>7</span>
          {'}'}
        </div>
      </pre>
      <div className='tcm-rows tcm-bottom'>
        <div className='tcm-row'>
          <span>es</span>
          <b lang='es'>¡Hola, mundo!</b>
        </div>
        <div className='tcm-row'>
          <span>ja</span>
          <b lang='ja'>こんにちは世界！</b>
        </div>
        <div className='tcm-row'>
          <span>fr</span>
          <b lang='fr'>Bonjour le monde !</b>
        </div>
      </div>
    </div>
  );
}

export function TcMiniContent() {
  return (
    <div className='tcm is-api'>
      <div className='tcm-file'>runtime · on demand</div>
      <pre className='tcm-pre'>
        <div>
          <span className='tcm-kw'>const</span> ja = <span className='tcm-kw'>await</span> gt.
          <span className='tcm-gt'>translate</span>(
        </div>
        <div>
          {'  '}
          <span className='tcm-str'>&apos;Payment received&apos;</span>,{' '}
          <span className='tcm-str'>&apos;ja&apos;</span>
        </div>
        <div>)</div>
      </pre>
      <div className='tcm-tail'>
        <svg className='tcm-wire' viewBox='0 0 24 26' width={24} height={26} aria-hidden='true'>
          <path d='M10.5 0v15.5' />
          <path d='M13.5 0v15.5' />
          <path className='tcm-wire-head' d='M6 16.5L12 25L18 16.5Z' />
        </svg>
        <div className='tcm-resp'>
          <div className='tcm-resp-status'>200 · 84 ms · cached</div>
          <pre className='tcm-pre'>
            <div>
              <span className='tcm-dim'>{'{ "ja": '}</span>
              <b lang='ja'>&quot;支払いを受領しました&quot;</b>
              <span className='tcm-dim'>{' }'}</span>
            </div>
          </pre>
        </div>
      </div>
    </div>
  );
}

export function TcMiniDashboard() {
  return (
    <div className='tcm is-dash'>
      <div className='tcm-dash-bar'>
        acme/web <span>production</span>
      </div>
      <div className='tcm-chips' aria-label='enabled locales'>
        <span>de</span>
        <span>es</span>
        <span>fr</span>
        <span>ja</span>
        <span>pt</span>
        <span>zh</span>
      </div>
      <div className='tcm-rows is-ledger'>
        <div className='tcm-row'>
          <span>glossary</span>
          <b>24 terms</b>
        </div>
        <div className='tcm-row'>
          <span>directives</span>
          <b>6 rules</b>
        </div>
        <div className='tcm-row'>
          <span>context groups</span>
          <b>3 applied</b>
        </div>
        <div className='tcm-row'>
          <span>integrations</span>
          <b>github · cli</b>
        </div>
      </div>
      <div className='tcm-foot'>
        <b>v214 · published</b>
        <span>2 min ago</span>
      </div>
    </div>
  );
}

export function TcMiniLocadex() {
  return (
    <div className='tcm is-diff'>
      <div className='tcm-file'>PR #218 · locadex → main</div>
      <pre className='tcm-pre tcm-diffbody'>
        <div className='tcm-dim'>@@ −4,2 +4,3 @@ app/checkout.tsx</div>
        <div className='is-add'>+ import {'{'} T {'}'} from &apos;gt-next&apos;</div>
        <div className='is-del'>− {'<p>Payment received</p>'}</div>
        <div className='is-add'>+ {'<p>'}</div>
        <div className='is-add'>+ {'  <T>Payment received</T>'}</div>
        <div className='is-add'>+ {'</p>'}</div>
      </pre>
      <div className='tcm-rows tcm-bottom'>
        <div className='tcm-row'>
          <span>merged</span>
          <b>+38 −6 · checks passed</b>
        </div>
      </div>
    </div>
  );
}
