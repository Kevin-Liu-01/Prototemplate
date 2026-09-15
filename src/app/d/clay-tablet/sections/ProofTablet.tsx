import type { ReactNode } from 'react';

import WedgeRule from '../diagrams/deco/WedgeRule';
import { PROOF_SOURCE, TRANSLATE_RUN } from './content';
import CopyCommand from './CopyCommand';
import ProofColumns from './ProofColumns';
import Shelf, { Tablet } from './Shelf';

/** Strings and the GT components are the only marked tokens: strings carry the one hue, the components carry weight. */
const TOKEN = /('[^']*'|"[^"]*"|<\/?(?:T|Num|DateTime)>)/g;

function tokenize(line: string, lineIndex: number): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let k = 0;
  TOKEN.lastIndex = 0;
  let match: RegExpExecArray | null = TOKEN.exec(line);
  while (match) {
    if (match.index > last) out.push(line.slice(last, match.index));
    const token = match[0];
    out.push(
      <span className={token.startsWith('<') ? 'ct-tok-gt' : 'ct-tok-str'} key={`${lineIndex}-${k++}`}>
        {token}
      </span>
    );
    last = match.index + token.length;
    match = TOKEN.exec(line);
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

function SourcePanel() {
  const lines = PROOF_SOURCE.code.split('\n');
  return (
    <div className='ct-slip ct-code'>
      <div className='ct-code-bar'>
        <span className='ct-code-file'>{PROOF_SOURCE.file}</span>
        <span className='ct-code-pkg'>{PROOF_SOURCE.pkg}</span>
        <CopyCommand text={PROOF_SOURCE.code} compact />
      </div>
      <pre className='ct-code-body'>
        <code>
          {lines.map((line, i) => (
            <span className='ct-code-line' key={i}>
              <span className='ct-ln' aria-hidden='true'>
                {i + 1}
              </span>
              <span className='ct-lc'>{tokenize(line, i)}</span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

/**
 * Tablet II: the T component proof. Like the Behistun inscription, the same
 * text stands in parallel registers, one per language: the source in the
 * first column, the outputs impressed in the columns that follow, each under
 * its flag seal. The bottom register is the run that wrote them.
 */
export default function ProofTablet() {
  return (
    <Shelf
      id='proof'
      label={{
        numeral: 'II',
        name: 'The T component',
        note: 'Source in the first column. Translations impressed in the columns that follow, each under its locale seal. The last register is the run.',
      }}
    >
      <Tablet size='full' className='ct-proof'>
        <header className='ct-reg ct-head'>
          <h2>How a string becomes a shipped translation.</h2>
          <p>
            Wrap the markup in <code>&lt;T&gt;</code>. The build writes one file per locale, and every
            column here is one of those files rendered.
          </p>
        </header>

        <WedgeRule />

        <ProofColumns source={<SourcePanel />} />

        <div className='ct-reg ct-run'>
          <ol className='ct-run-lines'>
            {TRANSLATE_RUN.map((line) => (
              <li className='ct-run-line' data-tone={line.tone} key={`${line.key ?? ''}${line.text}`}>
                {line.key ? <span className='ct-run-key'>{line.key}</span> : null}
                <span>{line.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </Tablet>
    </Shelf>
  );
}
