'use client';

import { useRef, useState } from 'react';

/**
 * A four-tone highlighter — comment, string, keyword, GT symbol — and nothing
 * else. The page has one accent colour and spends it here on GT's own API, so
 * a reader's eye lands on `<T>` and `useGT()` rather than on syntax confetti.
 */

type TokenKind = 'plain' | 'com' | 'str' | 'kw' | 'gt' | 'num';

export type Token = { k: TokenKind; v: string };

const PATTERN = new RegExp(
  [
    '(#[^\\n]*|//[^\\n]*)',
    "('[^']*'|\"[^\"]*\")",
    '\\b(import|from|export|default|const|function|return|new|async|await|def|class)\\b',
    '\\b(T|Num|DateTime|GTProvider|LocaleSelector|useGT|getGT|initializeGT|withGTConfig|initialize_gt)\\b',
    '\\b(\\d[\\d_]*)\\b',
  ].join('|'),
  'g'
);

const KIND: TokenKind[] = ['com', 'str', 'kw', 'gt', 'num'];

/** Tokenised one line at a time, so line numbers stay trivial to render. */
export function tokenize(line: string): Token[] {
  const out: Token[] = [];
  let last = 0;

  for (const match of line.matchAll(PATTERN)) {
    const at = match.index ?? 0;
    if (at > last) out.push({ k: 'plain', v: line.slice(last, at) });
    const group = KIND.findIndex((_, i) => match[i + 1] !== undefined);
    out.push({ k: KIND[group] ?? 'plain', v: match[0] });
    last = at + match[0].length;
  }

  if (last < line.length) out.push({ k: 'plain', v: line.slice(last) });
  return out;
}

export type CodeBlockProps = {
  file: string;
  code: string;
  /** Show the gutter. Off for short config snippets, where it is noise. */
  numbers?: boolean;
};

export default function CodeBlock({ file, code, numbers = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const copy = () => {
    void navigator.clipboard?.writeText(code);
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };

  const lines = code.replace(/\n$/, '').split('\n');

  return (
    <div className='tc-code' data-numbers={numbers}>
      <div className='tc-code-bar'>
        <span>{file}</span>
        <button className='tc-code-copy' type='button' onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre>
        {lines.map((line, i) => (
          <div className='tc-code-line' key={`${file}-${i}`}>
            {numbers ? <span className='tc-code-n'>{i + 1}</span> : null}
            <code>
              {tokenize(line).map((token, j) =>
                token.k === 'plain' ? (
                  token.v
                ) : (
                  <span className={`tc-t-${token.k}`} key={j}>
                    {token.v}
                  </span>
                )
              )}
              {line.length === 0 ? ' ' : null}
            </code>
          </div>
        ))}
      </pre>
    </div>
  );
}
