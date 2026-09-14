import type { ReactNode } from 'react';

import { CopyButton } from './CopyButton';

/**
 * The code face of a band. Five token kinds; strings carry the page's one
 * syntax hue because strings are the product. The bar names the file and
 * the package and holds the copy control, as every GT code window does.
 */
type Kind = 'plain' | 'kw' | 'str' | 'tag' | 'cm' | 'num';

const TOKEN =
  /(\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|(<\/?[A-Za-z][\w.]*|\/?>)|(\b\d+(?:\.\d+)?\b)|(\b(?:import|from|export|default|function|return|const|async|await|def|new)\b)/g;

const KIND_CLASS: Record<Kind, string> = {
  plain: '',
  kw: 'tr-tok-kw',
  str: 'tr-tok-str',
  tag: 'tr-tok-tag',
  cm: 'tr-tok-cm',
  num: 'tr-tok-num',
};

function kindOf(match: RegExpExecArray): Kind {
  if (match[1] !== undefined) return 'cm';
  if (match[2] !== undefined) return 'str';
  if (match[3] !== undefined) return 'tag';
  if (match[4] !== undefined) return 'num';
  return 'kw';
}

export function tokenize(line: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  TOKEN.lastIndex = 0;
  let match: RegExpExecArray | null = TOKEN.exec(line);
  while (match) {
    if (match.index > last) out.push(line.slice(last, match.index));
    const kind = kindOf(match);
    out.push(
      <span className={KIND_CLASS[kind]} key={key++}>
        {match[0]}
      </span>
    );
    last = match.index + match[0].length;
    match = TOKEN.exec(line);
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

export type CodeBlockProps = {
  file: string;
  pkg: string;
  code: string;
  /** an id the tab that selects this panel points at */
  id?: string;
  labelledBy?: string;
};

export function CodeBlock({ file, pkg, code, id, labelledBy }: CodeBlockProps) {
  const lines = code.split('\n');
  return (
    <div className='tr-code' id={id} role={labelledBy ? 'tabpanel' : undefined} aria-labelledby={labelledBy}>
      <div className='tr-code-bar'>
        <span className='tr-code-file'>{file}</span>
        <span className='tr-code-pkg'>{pkg}</span>
        <CopyButton text={code} />
      </div>
      <pre className='tr-code-face' tabIndex={0}>
        <code>
          {lines.map((line, i) => (
            <span className='tr-code-line' key={i}>
              <span className='tr-code-n' aria-hidden='true'>
                {i + 1}
              </span>
              <span className='tr-code-src'>{tokenize(line)}</span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
