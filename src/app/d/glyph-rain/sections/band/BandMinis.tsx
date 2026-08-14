/**
 * The four artifacts under the band's service grid — one per service, four
 * DIFFERENT objects so the row never reads as four copies of one panel:
 * Code is an editor (gutter, a <T> wrap, a pinned translated-strings band),
 * Content is a runtime exchange (request block, response block — the fork's
 * own vocabulary: "language" resolving to the words the hero condenses
 * into), Dashboard is a locale ledger (six real rows, states as type
 * weight), and Locadex is a unified diff (hunk header, the same <T> wrap
 * landing as a merged PR — the PR the band's status transcript reports).
 * Every string, tag and count also appears elsewhere on the page or in the
 * product's own docs; nothing is invented for the panel.
 */

export function MiniCode() {
  return (
    <div className='grm'>
      <div className='grm-bar'>
        <span className='is-on'>page.tsx</span>
        <span>layout.tsx</span>
      </div>
      <pre className='grm-pre'>
        <div>
          <span className='grm-ln'>1</span>
          <span className='grm-kw'>import</span> {'{ '}
          <span className='grm-gt'>T</span>
          {' }'} <span className='grm-kw'>from</span> <span className='grm-str'>'gt-next'</span>;
        </div>
        <div>
          <span className='grm-ln'>2</span>{' '}
        </div>
        <div>
          <span className='grm-ln'>3</span>
          <span className='grm-kw'>export default function</span> Home() {'{'}
        </div>
        <div>
          <span className='grm-ln'>4</span>
          {'  '}
          <span className='grm-kw'>return</span> (
        </div>
        <div>
          <span className='grm-ln'>5</span>
          {'    '}
          <span className='grm-dim'>{'<'}</span>
          <span className='grm-gt'>T</span>
          <span className='grm-dim'>{'>'}</span>
        </div>
        <div>
          <span className='grm-ln'>6</span>
          {'      '}
          <span className='grm-dim'>{'<h1>'}</span>
          Hello, world!
          <span className='grm-dim'>{'</h1>'}</span>
        </div>
        <div>
          <span className='grm-ln'>7</span>
          {'    '}
          <span className='grm-dim'>{'</'}</span>
          <span className='grm-gt'>T</span>
          <span className='grm-dim'>{'>'}</span>
        </div>
        <div>
          <span className='grm-ln'>8</span>
          {'  '});
        </div>
        <div>
          <span className='grm-ln'>9</span>
          {'}'}
        </div>
      </pre>
      <div className='grm-rows'>
        <div className='grm-row'>
          <span>zh</span>
          <b lang='zh'>你好，世界！</b>
        </div>
        <div className='grm-row'>
          <span>ar</span>
          <b lang='ar' dir='rtl'>
            مرحبًا بالعالم!
          </b>
        </div>
        <div className='grm-row'>
          <span>ru</span>
          <b lang='ru'>Привет, мир!</b>
        </div>
      </div>
    </div>
  );
}

export function MiniContent() {
  return (
    <div className='grm'>
      <div className='grm-bar'>
        <span className='is-on'>runtime · on demand</span>
      </div>
      <pre className='grm-pre'>
        <div>
          <span className='grm-kw'>POST</span> /v2/translate
        </div>
        <div>
          <span className='grm-dim'>{'{'}</span> <span className='grm-str'>"text"</span>
          <span className='grm-dim'>:</span> <span className='grm-str'>"language"</span>
          <span className='grm-dim'>,</span>
        </div>
        <div>
          {'  '}
          <span className='grm-str'>"target"</span>
          <span className='grm-dim'>:</span> [<span className='grm-str'>"th"</span>,{' '}
          <span className='grm-str'>"el"</span>] <span className='grm-dim'>{'}'}</span>
        </div>
      </pre>
      <div className='grm-resp'>
        <div className='grm-resp-status'>200 · 61 ms · edge fra</div>
        <pre className='grm-pre'>
          <div>
            <span className='grm-dim'>{'{'}</span> <span className='grm-str'>"th"</span>
            <span className='grm-dim'>:</span> <b lang='th'>&quot;ภาษา&quot;</b>
            <span className='grm-dim'>,</span>
          </div>
          <div>
            {'  '}
            <span className='grm-str'>"el"</span>
            <span className='grm-dim'>:</span> <b lang='el'>&quot;γλωσσα&quot;</b>{' '}
            <span className='grm-dim'>{'}'}</span>
          </div>
        </pre>
      </div>
    </div>
  );
}

const LOCALES: readonly { tag: string; strings: string; state: string; done?: boolean }[] = [
  { tag: 'en', strings: '128', state: 'source', done: true },
  { tag: 'zh', strings: '128', state: 'published', done: true },
  { tag: 'ar', strings: '128', state: 'published', done: true },
  { tag: 'ru', strings: '128', state: 'published', done: true },
  { tag: 'hi', strings: '126', state: 'in review' },
  { tag: 'th', strings: '124', state: 'in review' },
];

export function MiniDashboard() {
  return (
    <div className='grm'>
      <div className='grm-bar'>
        <span className='is-on'>acme/web</span>
        <span>locales</span>
      </div>
      <div className='grm-table'>
        {LOCALES.map((row) => (
          <div className='grm-tr' data-done={row.done} key={row.tag}>
            <span className='grm-td-tag'>{row.tag}</span>
            <span className='grm-td-n'>{row.strings}</span>
            <span className='grm-td-state'>{row.state}</span>
          </div>
        ))}
      </div>
      <div className='grm-rows'>
        <div className='grm-row'>
          <span>publish</span>
          <b>v214 · 6 locales</b>
        </div>
      </div>
    </div>
  );
}

export function MiniLocadex() {
  return (
    <div className='grm'>
      <div className='grm-bar'>
        <span className='is-on'>PR #218</span>
        <span>src/app/page.tsx</span>
      </div>
      <pre className='grm-pre'>
        <div className='grm-hunk'>@@ -4,3 +4,5 @@</div>
        <div>
          <span className='grm-ln'> </span>
          <span className='grm-kw'>return</span> (
        </div>
        <div className='grm-del'>
          <span className='grm-ln'>-</span>
          {'  '}
          {'<h1>Hello, world!</h1>'}
        </div>
        <div className='grm-add'>
          <span className='grm-ln'>+</span>
          {'  '}
          {'<T>'}
        </div>
        <div className='grm-add'>
          <span className='grm-ln'>+</span>
          {'    '}
          {'<h1>Hello, world!</h1>'}
        </div>
        <div className='grm-add'>
          <span className='grm-ln'>+</span>
          {'  '}
          {'</T>'}
        </div>
        <div>
          <span className='grm-ln'> </span>);
        </div>
      </pre>
      <div className='grm-rows'>
        <div className='grm-row'>
          <span>merged</span>
          <b>+38 −6 · QA passed</b>
        </div>
      </div>
    </div>
  );
}
