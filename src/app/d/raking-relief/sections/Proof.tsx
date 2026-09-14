import { FRAMEWORKS } from '@/app/d/dither-field/sections/stacks';

import { CopyButton } from './CopyCommand';
import Inlay from './Inlay';
import { BarDot } from './Ornament';
import { HELLO, HELLO_SOURCE, OUTPUTS } from './content';

/**
 * The T component's proof, as an inscribed panel: the source file stands
 * raised on the left, its translations are cut into the wall on the right,
 * each with a lapis inlay naming the locale. Under both, a second sunk
 * register carries the formatted outputs the same component produces.
 */

const NEXT = FRAMEWORKS[0]!;

type Token = { kind: 'code' | 'str'; text: string };

/** Strings carry the only hue: they are the product. Everything else is ink. */
function tokenize(code: string): Token[] {
  const out: Token[] = [];
  const re = /'[^']*'|"[^"]*"/g;
  let last = 0;
  for (const match of code.matchAll(re)) {
    const at = match.index ?? 0;
    if (at > last) out.push({ kind: 'code', text: code.slice(last, at) });
    out.push({ kind: 'str', text: match[0] });
    last = at + match[0].length;
  }
  if (last < code.length) out.push({ kind: 'code', text: code.slice(last) });
  return out;
}

export default function Proof() {
  const tokens = tokenize(NEXT.code);
  const lines = NEXT.code.split('\n').length;

  return (
    <section className='rr-course rr-proof' id='proof'>
      <div className='rr-head'>
        <BarDot n={2} />
        <div className='rr-head-copy'>
          <h2>The T component</h2>
          <p>
            Wrap the markup you already wrote. GT extracts every string, translates it, and
            serves each locale build from the edge.
          </p>
        </div>
      </div>

      <div className='rr-proof-grid'>
        <div className='rr-raised rr-code'>
          <div className='rr-face'>
            <div className='rr-code-bar'>
              <span className='rr-code-file'>{NEXT.file}</span>
              <span className='rr-code-pkg'>{NEXT.pkg}</span>
              <CopyButton text={NEXT.code} />
            </div>
            <div className='rr-code-scroll'>
              <pre className='rr-code-body'>
                <span className='rr-code-nums' aria-hidden='true'>
                  {Array.from({ length: lines }, (_, i) => (
                    <span key={i}>{i + 1}</span>
                  ))}
                </span>
                <code>
                  {tokens.map((token, i) =>
                    token.kind === 'str' ? (
                      <span className='rr-tok-str' key={i}>
                        {token.text}
                      </span>
                    ) : (
                      <span key={i}>{token.text}</span>
                    )
                  )}
                </code>
              </pre>
            </div>
          </div>
        </div>

        <div className='rr-sunk rr-incised'>
          <div className='rr-incised-head'>
            <span className='rr-incised-src' lang='en'>
              {HELLO_SOURCE}
            </span>
            <span className='rr-incised-meta'>source · en</span>
          </div>
          <ol className='rr-incised-rows'>
            {HELLO.map((row) => (
              <li key={row.code}>
                <Inlay code={row.code} />
                <span className='rr-incised-text' lang={row.lang} dir={row.dir ?? 'ltr'}>
                  {row.text}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className='rr-outputs rr-sunk'>
        <ul className='rr-outputs-row'>
          {OUTPUTS.map((output) => (
            <li key={output.cap}>
              <span className='rr-outputs-cap'>{output.cap}</span>
              <code className='rr-outputs-val'>{output.value}</code>
              <Inlay code={output.code} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
