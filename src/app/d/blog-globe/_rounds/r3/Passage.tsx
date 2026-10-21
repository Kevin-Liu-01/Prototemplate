import { STOPS, type PassageLine } from '@/app/d/blog-globe/_rounds/r3/stops';

import type { CSSProperties } from 'react';

import './passage.css';

/** How many of Euclid's definitions 1 to 8 show: eight, the first five, or 'fit' for eight on a wide screen and five on a phone. */
export type PassageLines = 5 | 8 | 'fit';

type PassageProps = {
  lines?: PassageLines;
  className?: string;
};

/* Every stop's definitions as an ordered list, stacked on shared rows in
   one box: line N sits at one height in every language, and the box keeps
   the tallest language's height, so a change never moves the page. Without
   JavaScript the first stop shows, or the stop checked in a LanguageLinks
   in the same figure. mount-passage.ts adds the row dissolve. */
export default function Passage({ lines = 8, className }: PassageProps) {
  const count = lines === 'fit' ? 8 : lines;
  return (
    <div
      className={className ? `gp ${className}` : 'gp'}
      data-fit={lines === 'fit' || undefined}
      data-testid='blog-globe-passage'
      style={{ '--gp-rows': count } as CSSProperties}
    >
      {STOPS.map((stop) => {
        const all: readonly PassageLine[] = stop.lines;
        const shown = all.slice(0, count);
        return (
          <ol
            key={stop.lang}
            role='list'
            className='gp-panel'
            lang={stop.lang}
            dir={stop.dir}
            data-numbered={shown.some((line) => line.n) || undefined}
          >
            {shown.map((line, i) => (
              <li key={i}>
                {line.n ? <span className='gp-n'>{line.n}</span> : null}
                <span className='gp-t'>{line.text}</span>
              </li>
            ))}
          </ol>
        );
      })}
    </div>
  );
}
