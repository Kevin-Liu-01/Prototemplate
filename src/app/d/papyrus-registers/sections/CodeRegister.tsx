import type { ReactNode } from 'react';

import CopyButton from './CopyButton';

/**
 * A code register: the file name in the bar with the copy control, the
 * sample below in the instrument mono. Tokens follow the scroll's two
 * inks: everything is black carbon ink, and the parts the T component
 * lifts out of the source, the strings and the T tags themselves, are set
 * in the rubric red. Strings are the product; nothing else is colored.
 */
export type CodeRegisterProps = { file: string; code: string };

type Kind = 'str' | 't' | 'tag' | 'kw' | 'text';

const PATTERN = /('[^'\n]*'|"[^"\n]*")|(<\/?T>)|(<\/?[A-Za-z][\w.]*|\/?>)|(\b(?:import|from|export|default|function|return|const|new|async|await)\b)/g;

function kindOf(match: RegExpExecArray): Kind {
  if (match[1]) return 'str';
  if (match[2]) return 't';
  if (match[3]) return 'tag';
  if (match[4]) return 'kw';
  return 'text';
}

/** Splits the sample into spans by kind, plain text between them. */
export function tokenize(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  PATTERN.lastIndex = 0;
  for (let m = PATTERN.exec(code); m !== null; m = PATTERN.exec(code)) {
    if (m.index > last) out.push(code.slice(last, m.index));
    const kind = kindOf(m);
    out.push(
      <span key={key++} className={`pr-tok-${kind}`}>
        {m[0]}
      </span>
    );
    last = m.index + m[0].length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

export default function CodeRegister({ file, code }: CodeRegisterProps) {
  return (
    <figure className='pr-code'>
      <figcaption className='pr-code-bar'>
        <span className='pr-code-file'>{file}</span>
        <CopyButton text={code} label='Copy code' />
      </figcaption>
      <pre className='pr-code-body' tabIndex={0}>
        <code>{tokenize(code)}</code>
      </pre>
    </figure>
  );
}
