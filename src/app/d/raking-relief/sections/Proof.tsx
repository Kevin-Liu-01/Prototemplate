import { FRAMEWORKS } from '@/app/d/dither-field/sections/stacks';

import { Carved, Incised } from './deco/Carved';
import { CopyButton } from './CopyCommand';
import Inlay from './deco/Inlay';
import { BarDot, Frame } from './deco/Ornament';
import { HELLO, HELLO_SOURCE, OUTPUTS } from './content';

/**
 * The T component's proof, as an inscribed panel: the source file stands
 * raised on the left inside a guilloche frame, its translations are cut
 * into the wall on the right, each incised with a lapis inlay naming the
 * locale, and the T tag stands between them as the keystone. Under both, a
 * second sunk register carries the formatted outputs the same components
 * produce: number, currency, date, plural, route, and the two hooks.
 */

const NEXT = FRAMEWORKS[0];

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
  if (!NEXT) return null;
  const tokens = tokenize(NEXT.code);
  const lines = NEXT.code.split('\n').length;

  return (
    <section className='rr-course rr-proof' id='proof'>
      <div className='rr-head'>
        <BarDot n={2} />
        <div className='rr-head-copy'>
          <h2>
            <Carved text='The T component' />
          </h2>
          <p>
            Wrap the markup you already wrote. GT extracts every string, translates it, and
            serves each locale build from the edge.
          </p>
        </div>
      </div>

      <div className='rr-proof-grid'>
        <div className='rr-raised rr-code'>
          <div className='rr-face is-framed'>
            <Frame id='rr-frame-code' kind='guilloche' />
            <div className='rr-tablet-in rr-code-in'>
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
        </div>

        <div className='rr-keystone' aria-hidden='true'>
          <code>{'<T>'}</code>
        </div>

        <div className='rr-sunk rr-incised'>
          <div className='rr-incised-head'>
            <Incised className='rr-incised-src' text={HELLO_SOURCE} lang='en' />
            <span className='rr-incised-meta'>source · en</span>
          </div>
          <ol className='rr-incised-rows'>
            {HELLO.map((row) => (
              <li key={row.code}>
                <Inlay code={row.code} />
                <Incised className='rr-incised-text' text={row.text} lang={row.lang} dir={row.dir ?? 'ltr'} />
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
              <Incised className='rr-outputs-val' text={output.value} />
              {output.code ? <Inlay code={output.code} /> : <span className='rr-outputs-any'>every locale</span>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
