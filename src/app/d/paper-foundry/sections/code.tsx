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

/**
 * CURATION (dark grid, diagram 1 — the <T> wrap brace): the dark direction's
 * CodeWrapDiagram draws five lines of JSX bound by a doubled bracket. The
 * five-line abstract loses to the real 18-line sample this panel already
 * shows, so the *panel* stays — but the bracket was the one thing it said
 * that the sample did not: everything between <T> and </T> ships, as one
 * object. Adapted, not pasted: the brand's doubled line (THREAD_MOTIF, at
 * the page's constant gauge) runs the sample's own left margin from the
 * open tag to the close tag. Samples without a <T> pair get no bracket.
 *
 * The bracket needs two clear columns to stand in, so it only renders when
 * every wrapped line is indented past them — true of all four JSX samples,
 * and the guard keeps a future flush-left sample from colliding with it.
 */
function findWrap(lines: readonly string[]): { start: number; end: number } | null {
  let start = -1;
  let end = -1;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i] ?? '';
    if (start === -1 && /<T[ >]/.test(line)) start = i;
    if (/<\/T>/.test(line)) end = i;
  }
  if (start === -1 || end <= start) return null;
  for (let i = start; i <= end; i += 1) {
    const line = lines[i] ?? '';
    if (line.trim().length > 0 && line.search(/\S/) < 3) return null;
  }
  return { start, end };
}

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
  /* The bracket's offsets assume the numbered gutter; the unnumbered config
     snippets carry no <T> anyway. */
  const wrap = numbers ? findWrap(lines) : null;

  const renderLine = (line: string, i: number) => (
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
  );

  return (
    <div className='tc-code' data-numbers={numbers}>
      <div className='tc-code-bar'>
        <span>{file}</span>
        <button className='tc-code-copy' type='button' onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre>
        {lines.slice(0, wrap ? wrap.start : lines.length).map((line, i) => renderLine(line, i))}
        {wrap ? (
          <div className='tc-code-wrap'>
            {lines.slice(wrap.start, wrap.end + 1).map((line, i) => renderLine(line, wrap.start + i))}
          </div>
        ) : null}
        {wrap ? lines.slice(wrap.end + 1).map((line, i) => renderLine(line, wrap.end + 1 + i)) : null}
      </pre>
    </div>
  );
}
