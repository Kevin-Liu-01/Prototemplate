import './flow.css';

/**
 * Translation — the real file, forked into the real outputs.
 *
 * The left panel is the component the hero terminal already translated, line
 * for line; the three files on the right are the exact `output` path that
 * `gt.config.json` declares one cell away, each holding the three strings the
 * pipeline actually produces for it. Nothing stands in for anything: the
 * squiggle-slab illustration this replaces showed grey bars where the entire
 * argument — the strings themselves — should have been.
 *
 * The fan-out is drawn with the brand's doubled line: one trunk leaves the
 * panel (two threads, exactly), splits at a drawn junction, and each branch
 * is one path stroked twice (full-gauge ink under a surface-colored core),
 * leaving two parallel threads at constant gauge — source and translation,
 * side by side.
 *
 * Accent: the middle output, the locale currently resolving.
 */

type Tone = 'plain' | 'kw' | 'gt' | 'str';

type Chunk = readonly [Tone, string];

const SRC: readonly (readonly Chunk[])[] = [
  [
    ['kw', 'import'],
    ['plain', ' { '],
    ['gt', 'T'],
    ['plain', ' } '],
    ['kw', 'from'],
    ['str', " 'gt-next'"],
    ['plain', ';'],
  ],
  [['plain', '']],
  [
    ['kw', 'export default function'],
    ['plain', ' Home() {'],
  ],
  [
    ['kw', '  return'],
    ['plain', ' ('],
  ],
  [
    ['plain', '    <'],
    ['gt', 'T'],
    ['plain', '>'],
  ],
  [['plain', '      <h1>Hello, world!</h1>']],
  [['plain', '      <p>Get started</p>']],
  [['plain', '      <p>Payment received</p>']],
  [
    ['plain', '    </'],
    ['gt', 'T'],
    ['plain', '>'],
  ],
  [['plain', '  );']],
  [['plain', '}']],
];

/** Each output holds the three strings the source declares — the same pairs
    the hero terminal prints, because they are the same project. */
const OUTS: readonly {
  file: string;
  lang: string;
  pairs: readonly (readonly [string, string])[];
  lit?: boolean;
}[] = [
  {
    file: 'public/_gt/es.json',
    lang: 'es',
    pairs: [
      ['Hello, world!', '"¡Hola, mundo!"'],
      ['Get started', '"Comenzar ahora"'],
      ['Payment received', '"Pago recibido"'],
    ],
  },
  {
    file: 'public/_gt/ja.json',
    lang: 'ja',
    lit: true,
    pairs: [
      ['Hello, world!', '"こんにちは世界！"'],
      ['Get started', '"始める"'],
      ['Payment received', '"支払いを受領しました"'],
    ],
  },
  {
    file: 'public/_gt/de.json',
    lang: 'de',
    pairs: [
      ['Hello, world!', '"Hallo, Welt!"'],
      ['Get started', '"Jetzt starten"'],
      ['Payment received', '"Zahlung erhalten"'],
    ],
  },
];

/** Fork geometry, in viewBox units: one doubled trunk leaves the panel, and
    the three branches split at a drawn junction. At the panel edge the motif
    is exactly two threads — the trunk — never three overlapped strokes. */
const TRUNK = 'M0 130 L18 130';
const FORK = ['M18 130 C40 104 46 34 72 34', 'M18 130 L72 130', 'M18 130 C40 156 46 226 72 226'];

export type TranslationFlowProps = {
  className?: string;
  title?: string;
};

export default function TranslationFlow({ className, title }: TranslationFlowProps) {
  return (
    <div
      className={['tflow', className].filter(Boolean).join(' ')}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <div className='tf-src'>
        <div className='tf-src-bar'>app/page.tsx</div>
        <pre>
          {SRC.map((line, i) => (
            <div className='tf-src-line' key={i}>
              <span className='tf-src-n'>{i + 1}</span>
              <code>
                {line.map(([tone, text], j) =>
                  tone === 'plain' ? text : (
                    <span className={`tf-t-${tone}`} key={j}>
                      {text}
                    </span>
                  ),
                )}
                {line.length === 1 && line[0]?.[1] === '' ? ' ' : null}
              </code>
            </div>
          ))}
        </pre>
      </div>

      <svg className='tf-fork' viewBox='0 0 72 260' preserveAspectRatio='none' aria-hidden='true'>
        {FORK.map((d) => (
          <g key={d}>
            <path className='tf-thread' d={d} />
            <path className='tf-core' d={d} />
          </g>
        ))}
        {/* Trunk last, so its core carves one clean pair through the junction. */}
        <g>
          <path className='tf-thread' d={TRUNK} />
          <path className='tf-core' d={TRUNK} />
        </g>
      </svg>

      <div className='tf-outs'>
        {OUTS.map((out) => (
          <div className={`tf-out${out.lit ? ' is-lit' : ''}`} key={out.file}>
            <div className='tf-out-bar'>
              <span className='tf-out-file'>{out.file}</span>
              <span className='tf-out-tag'>{out.lang}</span>
            </div>
            <div className='tf-out-body'>
              {out.pairs.map(([src, val]) => (
                <div className='tf-pair' key={src}>
                  <span className='tf-pair-key'>{src}</span>
                  <b className='tf-pair-val' lang={out.lang}>
                    {val}
                  </b>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
