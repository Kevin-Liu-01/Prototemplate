'use client';

import { Check, Copy } from 'lucide-react';
import { useRef, useState } from 'react';

/**
 * A code window on the dark stone: a bar with the file name and a copy
 * control, then the sample. Strings carry the only syntax hue, because
 * strings are the product; tags and keywords stay in the panel's greys.
 * The tokenizer is five kinds and one pass: string literals, JSX tags,
 * a short keyword list, punctuation, and everything else.
 */
export type CodeFaceProps = {
  file: string;
  code: string;
  className?: string;
};

type Token = { kind: 'str' | 'tag' | 'kw' | 'plain'; text: string };

const KEYWORDS = new Set(['import', 'from', 'export', 'default', 'function', 'return', 'new', 'const', 'await', 'async']);

const TOKEN_RE = /('[^']*'|"[^"]*")|(<\/?[A-Za-z][A-Za-z0-9.]*|\/?>)|([A-Za-z_$][A-Za-z0-9_$]*)/g;

function tokenize(line: string): Token[] {
  const out: Token[] = [];
  let last = 0;
  for (const m of line.matchAll(TOKEN_RE)) {
    const start = m.index ?? 0;
    if (start > last) out.push({ kind: 'plain', text: line.slice(last, start) });
    if (m[1]) out.push({ kind: 'str', text: m[1] });
    else if (m[2]) out.push({ kind: 'tag', text: m[2] });
    else if (m[3]) out.push({ kind: KEYWORDS.has(m[3]) ? 'kw' : 'plain', text: m[3] });
    last = start + m[0].length;
  }
  if (last < line.length) out.push({ kind: 'plain', text: line.slice(last) });
  return out;
}

export default function CodeFace({ file, code, className }: CodeFaceProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lines = code.split('\n');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      // the clipboard is unavailable: the code stays selectable as text
    }
  };

  return (
    <div className={['sf-code', className].filter(Boolean).join(' ')}>
      <div className='sf-code-bar'>
        <span className='sf-code-file'>{file}</span>
        <button type='button' className='sf-code-copy' onClick={copy} aria-label={copied ? 'Copied' : 'Copy the code'}>
          {copied ? <Check size={13} strokeWidth={1.75} aria-hidden /> : <Copy size={13} strokeWidth={1.75} aria-hidden />}
        </button>
      </div>
      <pre className='sf-code-body'>
        <code>
          {lines.map((line, i) => (
            <span className='sf-code-line' key={i}>
              <span className='sf-code-n' aria-hidden='true'>
                {i + 1}
              </span>
              <span className='sf-code-t'>
                {tokenize(line).map((token, j) =>
                  token.kind === 'plain' ? (
                    token.text
                  ) : (
                    <span className={`is-${token.kind}`} key={j}>
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
