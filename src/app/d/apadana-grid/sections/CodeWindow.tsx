/**
 * The windowed code face (A4): a bar with the file name and the copy
 * control, then the sample with line numbers. Strings carry the only syntax
 * hue, the accent, because strings are the product; tags and keywords are
 * set by weight in the ink. The tokenizer splits on quoted strings and JSX
 * tag names only, enough to mark the two things the eye looks for.
 */
import type { ReactNode } from 'react';

import { CopyButton } from './CopyButton';

type Kind = 'plain' | 'str' | 'tag';

type Token = { kind: Kind; text: string };

const TOKEN_SRC = `"[^"\\n]*"|'[^'\\n]*'|<\\/?[A-Za-z][\\w.]*>?`;

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** `mark` is a bare JSX text run that is itself the string, so it takes the string hue too. */
function tokenize(line: string, pattern: RegExp, mark?: string): Token[] {
  const out: Token[] = [];
  let last = 0;
  for (const match of line.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > last) out.push({ kind: 'plain', text: line.slice(last, start) });
    const text = match[0];
    const kind: Kind = text.startsWith('<') && text !== mark ? 'tag' : 'str';
    out.push({ kind, text });
    last = start + text.length;
  }
  if (last < line.length) out.push({ kind: 'plain', text: line.slice(last) });
  return out;
}

export type CodeWindowProps = {
  file: string;
  code: string;
  numbers?: boolean;
  className?: string;
  /** rendered in the bar between the file name and the copy control */
  aside?: ReactNode;
  /** a bare text run to set in the string hue, for JSX children that are the string */
  mark?: string;
};

export function CodeWindow({ file, code, numbers = true, className, aside, mark }: CodeWindowProps) {
  const lines = code.split('\n');
  const pattern = new RegExp(mark ? `${escapeRegExp(mark)}|${TOKEN_SRC}` : TOKEN_SRC, 'g');
  return (
    <div className={className ? `apg-win ${className}` : 'apg-win'}>
      <div className='apg-win-bar'>
        <span className='apg-win-file'>{file}</span>
        {aside}
        <CopyButton text={code} label='Copy code' />
      </div>
      <pre className='apg-code' tabIndex={0}>
        <code>
          {lines.map((line, i) => (
            <span className='apg-line' key={i}>
              {numbers ? <span className='apg-ln'>{i + 1}</span> : null}
              <span className='apg-lc'>
                {tokenize(line, pattern, mark).map((token, j) =>
                  token.kind === 'plain' ? (
                    token.text
                  ) : (
                    <span className={token.kind === 'str' ? 'apg-tok-str' : 'apg-tok-tag'} key={j}>
                      {token.text}
                    </span>
                  )
                )}
                {line.length === 0 ? ' ' : null}
              </span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
