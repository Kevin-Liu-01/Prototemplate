/**
 * Act III's code window — the paper site flips to this and Locadex works the
 * file: a scanline stamps numbered notes, the import line is struck, the <T>
 * lines slide in, then the diff window docks and the agent opens the PR.
 *
 * `.cl` is `white-space: pre`, so the leading indentation inside each
 * `.cl-txt` is written as an explicit string literal.
 */
export default function CodeEditor() {
  return (
    <div className='editor' id='editor'>
      <div className='ed-bar'>
        <span className='dots'>
          <i />
          <i />
          <i />
        </span>
        <span>src/app/page.tsx</span>
        <span className='ed-chips'>
          <span className='ed-chip commit' id='chip-commit'>
            ⌥ push — feat/homepage
          </span>
          <span className='ed-chip' id='chip-pr'>
            PR #213 opened
          </span>
        </span>
      </div>
      <div className='ed-main'>
        <div className='ed-code' id='ed-code'>
          <div className='scanline' id='scanline' />
          <div className='cl del' data-del>
            <span className='ln'>1</span>
            <span className='cl-txt'>
              <span className='tok-kw'>import</span> <span className='tok-dim'>en</span>{' '}
              <span className='tok-kw'>from</span>{' '}
              <span className='tok-str'>&apos;./locales/en.json&apos;</span>;
            </span>
            <i className='strike' />
          </div>
          <div className='cl add' data-add>
            <span className='ln'>2</span>
            <span className='cl-txt'>
              <span className='tok-kw'>import</span> {'{ '}
              <span className='tok-cmp'>T</span>
              {' } '}
              <span className='tok-kw'>from</span>{' '}
              <span className='tok-str'>&apos;gt-next&apos;</span>;
            </span>
          </div>
          <div className='cl'>
            <span className='ln'>3</span>
            <span className='cl-txt'> </span>
          </div>
          <div className='cl'>
            <span className='ln'>4</span>
            <span className='cl-txt'>
              <span className='tok-kw'>export default function</span>{' '}
              <span className='tok-cmp'>Home</span>() {'{'}
            </span>
          </div>
          <div className='cl'>
            <span className='ln'>5</span>
            <span className='cl-txt'>
              {'  '}
              <span className='tok-kw'>return</span> (
            </span>
          </div>
          <div className='cl add' data-add>
            <span className='ln'>6</span>
            <span className='cl-txt'>
              {'    '}
              <span className='tok-tag'>&lt;</span>
              <span className='tok-cmp'>T</span>
              <span className='tok-tag'>&gt;</span>
            </span>
          </div>
          <div className='cl'>
            <span className='ln'>7</span>
            <span className='cl-txt'>
              {'      '}
              <span className='tok-tag'>&lt;</span>
              <span className='tok-kw'>main</span>
              <span className='tok-tag'>&gt;</span>
            </span>
          </div>
          <div className='cl' id='line-m1'>
            <span className='ln'>8</span>
            <span className='cl-txt'>
              {'        '}
              <span className='tok-tag'>&lt;</span>
              <span className='tok-kw'>h1</span>
              <span className='tok-tag'>&gt;</span>
              <span className='tok-txt'>Hello, world!</span>
              <span className='tok-tag'>&lt;/</span>
              <span className='tok-kw'>h1</span>
              <span className='tok-tag'>&gt;</span>
            </span>
            <span className='lmark' data-lmark>
              1
            </span>
            <span className='ltip'>
              <b>LOCADEX / NOTE 1</b>JSX text node. Covered by the parent &lt;T&gt; boundary — no
              key, no JSON file.
            </span>
          </div>
          <div className='cl' id='line-m2'>
            <span className='ln'>9</span>
            <span className='cl-txt'>
              {'        '}
              <span className='tok-tag'>&lt;</span>
              <span className='tok-kw'>p</span>
              <span className='tok-tag'>&gt;</span>
              <span className='tok-txt'>Ship it everywhere.</span>
              <span className='tok-tag'>&lt;/</span>
              <span className='tok-kw'>p</span>
              <span className='tok-tag'>&gt;</span>
            </span>
            <span className='lmark' data-lmark>
              2
            </span>
            <span className='ltip'>
              <b>LOCADEX / NOTE 2</b>Marketing tone detected. Will attach context: &quot;Playful,
              upbeat marketing tone&quot;.
            </span>
          </div>
          <div className='cl' id='line-m3'>
            <span className='ln'>10</span>
            <span className='cl-txt'>
              {'        '}
              <span className='tok-tag'>&lt;</span>
              <span className='tok-kw'>button</span>
              <span className='tok-tag'>&gt;</span>
              <span className='tok-txt'>Get started</span>
              <span className='tok-tag'>&lt;/</span>
              <span className='tok-kw'>button</span>
              <span className='tok-tag'>&gt;</span>
            </span>
            <span className='lmark' data-lmark>
              3
            </span>
            <span className='ltip'>
              <b>LOCADEX / NOTE 3</b>Interactive label. Translated in place; width-safe for es / fr
              / ja / de / zh.
            </span>
          </div>
          <div className='cl' id='line-m4'>
            <span className='ln'>11</span>
            <span className='cl-txt'>
              {'        '}
              <span className='tok-tag'>&lt;</span>
              <span className='tok-kw'>span</span>
              <span className='tok-tag'>&gt;</span>
              <span className='tok-txt'>118 languages ready</span>
              <span className='tok-tag'>&lt;/</span>
              <span className='tok-kw'>span</span>
              <span className='tok-tag'>&gt;</span>
            </span>
            <span className='lmark' data-lmark>
              4
            </span>
            <span className='ltip'>
              <b>LOCADEX / NOTE 4</b>Numeral stays literal; unit word inflects per locale
              (idioma/langue/言語).
            </span>
          </div>
          <div className='cl'>
            <span className='ln'>12</span>
            <span className='cl-txt'>
              {'      '}
              <span className='tok-tag'>&lt;/</span>
              <span className='tok-kw'>main</span>
              <span className='tok-tag'>&gt;</span>
            </span>
          </div>
          <div className='cl add' data-add>
            <span className='ln'>13</span>
            <span className='cl-txt'>
              {'    '}
              <span className='tok-tag'>&lt;/</span>
              <span className='tok-cmp'>T</span>
              <span className='tok-tag'>&gt;</span>
            </span>
          </div>
          <div className='cl'>
            <span className='ln'>14</span>
            <span className='cl-txt'>{'  );'}</span>
          </div>
          <div className='cl'>
            <span className='ln'>15</span>
            <span className='cl-txt'>{'}'}</span>
          </div>
          <div className='cl'>
            <span className='ln'>16</span>
            <span className='cl-txt'> </span>
          </div>
          <div className='cl'>
            <span className='ln'>17</span>
            <span className='cl-txt'>
              <span className='tok-dim'>
                // locadex: 4 nodes mapped · context &quot;playful, upbeat&quot; attached
              </span>
            </span>
          </div>
          <div className='tr-chips' id='tr-chips'>
            <span className='tr-chip'>TRANSLATIONS —</span>
            <span className='tr-chip'>
              es <b>✓</b>
            </span>
            <span className='tr-chip'>
              fr <b>✓</b>
            </span>
            <span className='tr-chip'>
              ja <b>✓</b>
            </span>
            <span className='tr-chip'>
              de <b>✓</b>
            </span>
            <span className='tr-chip'>
              zh <b>✓</b>
            </span>
          </div>
        </div>

        <div className='diffwin' id='diffwin'>
          <div className='dw-head'>
            <b>PULL REQUEST #214</b>
            <span>locadex/i18n</span>
          </div>
          <div className='dw-stats'>
            <span className='plus'>+38</span> / <span>−1</span> · 4 files · guarded
          </div>
          <div className='dw-files'>
            M src/app/page.tsx <span>+9 −1</span>
            <br />A public/_gt/es.json <span>+42</span>
            <br />A public/_gt/fr.json <span>+42</span>
            <br />A public/_gt/ja.json <span>+42</span>
          </div>
          <div className='dw-foot'>
            <div className='merged-stamp' id='merged'>
              MERGED ✓
            </div>
            <button id='openpr' type='button'>
              Open PR
              <span className='pr-done' id='pr-done'>
                PULL REQUEST CREATED FOR REVIEW
              </span>
              <span className='click-flash' id='click-flash' />
            </button>
          </div>
        </div>

        <div className='agent-cursor' id='agent-cursor'>
          <svg viewBox='0 0 24 24'>
            <path d='M4 2 L20 12 L12 13.5 L9 21 Z' fill='#fff' stroke='#080808' strokeWidth='1.5' />
          </svg>
          <span className='ac-tag'>LOCADEX</span>
        </div>
      </div>
    </div>
  );
}
