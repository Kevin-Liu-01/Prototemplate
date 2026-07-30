const NOTES: { line: number; title: string; body: string }[] = [
  {
    line: 8,
    title: 'LOCADEX / NOTE 1',
    body: 'JSX text node. Covered by the parent <T> boundary — no key, no JSON file.',
  },
  {
    line: 9,
    title: 'LOCADEX / NOTE 2',
    body: 'Marketing tone detected. Will attach context: "Playful, upbeat marketing tone".',
  },
  {
    line: 10,
    title: 'LOCADEX / NOTE 3',
    body: 'Interactive label. Translated in place; width-safe for es / fr / ja / de / zh.',
  },
  {
    line: 11,
    title: 'LOCADEX / NOTE 4',
    body: 'Numeral stays literal; the unit word inflects per locale (idioma / langue / 言語).',
  },
];

type LineProps = {
  n: number;
  children: React.ReactNode;
  variant?: 'add' | 'del';
  note?: number;
};

function Line({ n, children, variant, note }: LineProps) {
  const meta = note ? NOTES[note - 1] : undefined;
  return (
    <div className={variant ? `cm-cl ${variant}` : 'cm-cl'} data-line={n}>
      <span className='ln'>{n}</span>
      <span>{children}</span>
      {variant === 'del' ? <i className='strike' /> : null}
      {meta ? (
        <>
          <span className='lmark' data-lmark>
            {note}
          </span>
          <span className='ltip' data-ltip={note}>
            <b>{meta.title}</b>
            {meta.body}
          </span>
        </>
      ) : null}
    </div>
  );
}

/** Act III: the same window, flipped to the editor Locadex works inside. */
export default function CodeWindow() {
  return (
    <div className='cm-editor' data-editor>
      <div className='cm-ed-bar'>
        <span className='dots'>
          <i />
          <i />
          <i />
        </span>
        <span>src/app/page.tsx</span>
        <span className='cm-ed-chips'>
          <span className='cm-ed-chip commit' data-chip='commit'>
            ⌥ push — feat/homepage
          </span>
          <span className='cm-ed-chip' data-chip='pr'>
            PR #213 opened
          </span>
        </span>
      </div>

      <div className='cm-ed-main' data-ed-main>
        <div className='cm-ed-code' data-ed-code>
          <div className='cm-scanline' data-scanline />

          <Line n={1} variant='del'>
            <span className='tok-kw'>import</span> <span className='tok-dim'>en</span>{' '}
            <span className='tok-kw'>from</span> <span className='tok-str'>&apos;./locales/en.json&apos;</span>;
          </Line>
          <Line n={2} variant='add'>
            <span className='tok-kw'>import</span> {'{ '}
            <span className='tok-cmp'>T</span>
            {' } '}
            <span className='tok-kw'>from</span> <span className='tok-str'>&apos;gt-next&apos;</span>;
          </Line>
          <Line n={3}> </Line>
          <Line n={4}>
            <span className='tok-kw'>export default function</span>{' '}
            <span className='tok-cmp'>Home</span>() {'{'}
          </Line>
          <Line n={5}>
            {'  '}
            <span className='tok-kw'>return</span> (
          </Line>
          <Line n={6} variant='add'>
            {'    '}
            <span className='tok-tag'>&lt;</span>
            <span className='tok-cmp'>T</span>
            <span className='tok-tag'>&gt;</span>
          </Line>
          <Line n={7}>
            {'      '}
            <span className='tok-tag'>&lt;</span>
            <span className='tok-kw'>main</span>
            <span className='tok-tag'>&gt;</span>
          </Line>
          <Line n={8} note={1}>
            {'        '}
            <span className='tok-tag'>&lt;</span>
            <span className='tok-kw'>h1</span>
            <span className='tok-tag'>&gt;</span>
            <span className='tok-txt'>Hello, world!</span>
            <span className='tok-tag'>&lt;/</span>
            <span className='tok-kw'>h1</span>
            <span className='tok-tag'>&gt;</span>
          </Line>
          <Line n={9} note={2}>
            {'        '}
            <span className='tok-tag'>&lt;</span>
            <span className='tok-kw'>p</span>
            <span className='tok-tag'>&gt;</span>
            <span className='tok-txt'>Ship it everywhere.</span>
            <span className='tok-tag'>&lt;/</span>
            <span className='tok-kw'>p</span>
            <span className='tok-tag'>&gt;</span>
          </Line>
          <Line n={10} note={3}>
            {'        '}
            <span className='tok-tag'>&lt;</span>
            <span className='tok-kw'>button</span>
            <span className='tok-tag'>&gt;</span>
            <span className='tok-txt'>Get started</span>
            <span className='tok-tag'>&lt;/</span>
            <span className='tok-kw'>button</span>
            <span className='tok-tag'>&gt;</span>
          </Line>
          <Line n={11} note={4}>
            {'        '}
            <span className='tok-tag'>&lt;</span>
            <span className='tok-kw'>span</span>
            <span className='tok-tag'>&gt;</span>
            <span className='tok-txt'>118 languages ready</span>
            <span className='tok-tag'>&lt;/</span>
            <span className='tok-kw'>span</span>
            <span className='tok-tag'>&gt;</span>
          </Line>
          <Line n={12}>
            {'      '}
            <span className='tok-tag'>&lt;/</span>
            <span className='tok-kw'>main</span>
            <span className='tok-tag'>&gt;</span>
          </Line>
          <Line n={13} variant='add'>
            {'    '}
            <span className='tok-tag'>&lt;/</span>
            <span className='tok-cmp'>T</span>
            <span className='tok-tag'>&gt;</span>
          </Line>
          <Line n={14}>{'  );'}</Line>
          <Line n={15}>{'}'}</Line>
          <Line n={16}> </Line>
          <Line n={17}>
            <span className='tok-dim'>
              // locadex: 4 nodes mapped · context &quot;playful, upbeat&quot; attached
            </span>
          </Line>

          <div className='cm-tr-chips'>
            <span className='cm-tr-chip'>TRANSLATIONS —</span>
            <span className='cm-tr-chip'>
              es <b>✓</b>
            </span>
            <span className='cm-tr-chip'>
              fr <b>✓</b>
            </span>
            <span className='cm-tr-chip'>
              ja <b>✓</b>
            </span>
            <span className='cm-tr-chip'>
              de <b>✓</b>
            </span>
            <span className='cm-tr-chip'>
              zh <b>✓</b>
            </span>
          </div>
        </div>

        <div className='cm-diffwin' data-diffwin>
          <div className='cm-dw-head'>
            <b>PULL REQUEST #214</b>
            <span>locadex/i18n</span>
          </div>
          <div className='cm-dw-stats'>
            <span className='plus'>+38</span> / <span>−1</span> · 4 files · guarded
          </div>
          <div className='cm-dw-files'>
            M src/app/page.tsx <span>+9 −1</span>
            <br />A public/_gt/es.json <span>+42</span>
            <br />A public/_gt/fr.json <span>+42</span>
            <br />A public/_gt/ja.json <span>+42</span>
          </div>
          <div className='cm-dw-foot'>
            <div className='cm-merged' data-merged>
              MERGED ✓
            </div>
            <button className='cm-openpr' type='button' data-openpr>
              Open PR
              <span className='cm-pr-done' data-pr-done>
                PULL REQUEST CREATED FOR REVIEW
              </span>
              <span className='cm-click-flash' data-click-flash />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
