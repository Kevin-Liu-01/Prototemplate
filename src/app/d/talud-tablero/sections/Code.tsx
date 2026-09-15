import type { ReactNode } from 'react';

import { CopyButton } from './CopyButton';

/**
 * A code window: a bar with the file name and the copy control, then the
 * numbered lines. Strings carry the only syntax hue, because strings are
 * the product; keywords and JSX tags stay in the panel's own greys. The
 * tokenizer is deliberately small: strings, JSX tags, and a fixed keyword
 * list, applied per line.
 */

export type CodeProps = {
  file: string;
  code: string;
  className?: string;
};

const KEYWORDS = new Set([
  'import',
  'from',
  'export',
  'default',
  'function',
  'return',
  'const',
  'await',
  'async',
  'def',
]);

const TOKEN = /("[^"]*"|'[^']*')|(<\/?[A-Za-z][\w.]*|\/?>)|([A-Za-z_]\w*)/g;

function tokenize(line: string, lineNo: number): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of line.matchAll(TOKEN)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push(line.slice(last, idx));
    const [text, str, tag, word] = m;
    if (str) out.push(<span key={`${lineNo}-${key++}`} className='tt-tok-str'>{text}</span>);
    else if (tag) out.push(<span key={`${lineNo}-${key++}`} className='tt-tok-tag'>{text}</span>);
    else if (word && KEYWORDS.has(word)) out.push(<span key={`${lineNo}-${key++}`} className='tt-tok-kw'>{text}</span>);
    else out.push(text);
    last = idx + text.length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

export function Code({ file, code, className }: CodeProps) {
  const lines = code.split('\n');
  return (
    <div className={className ? `tt-code ${className}` : 'tt-code'}>
      <div className='tt-code-bar'>
        <span className='tt-code-file'>{file}</span>
        <CopyButton text={code} />
      </div>
      <pre className='tt-code-body'>
        <code>
          {lines.map((line, i) => (
            <span className='tt-code-line' key={i}>
              <span className='tt-code-no' aria-hidden='true'>
                {i + 1}
              </span>
              <span className='tt-code-src'>{tokenize(line, i)}</span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

export default Code;
