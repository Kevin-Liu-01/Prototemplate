import type { ReactNode } from 'react';

/**
 * The code tablet's face. A five-kind tokenizer for the shipped samples:
 * strings, JSX tag names, keywords, comments and the rest. Only strings
 * take a hue (the sheet's court accent); the string is the product.
 */
type Kind = 'str' | 'tag' | 'kw' | 'cmt' | 'txt';

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
  'new',
  'def',
]);

const TOKEN = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\/\/[^\n]*|#[^\n]*)|(<\/?[A-Za-z][\w.]*)|([A-Za-z_]\w*)/g;

function tokenize(line: string): { kind: Kind; text: string }[] {
  const out: { kind: Kind; text: string }[] = [];
  let last = 0;
  for (const match of line.matchAll(TOKEN)) {
    const at = match.index ?? 0;
    if (at > last) out.push({ kind: 'txt', text: line.slice(last, at) });
    const [text, str, cmt, tag, word] = match;
    if (str) out.push({ kind: 'str', text });
    else if (cmt) out.push({ kind: 'cmt', text });
    else if (tag) out.push({ kind: 'tag', text });
    else if (word) out.push({ kind: KEYWORDS.has(word) ? 'kw' : 'txt', text });
    else out.push({ kind: 'txt', text });
    last = at + text.length;
  }
  if (last < line.length) out.push({ kind: 'txt', text: line.slice(last) });
  return out;
}

export type GlazeCodeProps = { code: string };

export default function GlazeCode({ code }: GlazeCodeProps) {
  const lines = code.split('\n');
  const rows: ReactNode[] = lines.map((line, i) => (
    <span className='gb-code-line' key={i}>
      <span className='gb-code-n' aria-hidden='true'>
        {i + 1}
      </span>
      <span className='gb-code-t'>
        {tokenize(line).map((token, j) => (
          <span className={`gb-tok is-${token.kind}`} key={j}>
            {token.text}
          </span>
        ))}
        {line.length === 0 ? ' ' : null}
      </span>
    </span>
  ));
  return <pre className='gb-code'>{rows}</pre>;
}
