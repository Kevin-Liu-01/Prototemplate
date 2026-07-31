import type { CSSProperties, ReactNode } from 'react';

import './shell.css';

/**
 * The bento cell, componentized. One place decides the shell anatomy —
 * cell → optional nested card → head block → body — so every bento across
 * the directions shares its bones, and a row can align all of its heads
 * (data-eq-heads on the row) so the first rule under each head sits at one
 * shared y.
 *
 * The class grammar is preserved verbatim (.tc-cell/.tc-card plus the
 * page's variant classes), so each direction's stylesheet keeps styling
 * the same selectors it always did; only the head gains a shared wrapper
 * (.shell-cell-head).
 */
export function BentoCell({
  cell = '',
  framed = true,
  headClass = '',
  title,
  sub,
  head,
  children,
  style,
}: {
  /** variant classes appended to .tc-cell (e.g. 'is-tall is-framed') */
  cell?: string;
  /** framed cells mount the nested .tc-card; flat cells sit on the page */
  framed?: boolean;
  /** extra head class (e.g. tc-bleed-head keeps its padding grammar) */
  headClass?: string;
  title?: ReactNode;
  sub?: ReactNode;
  /** extra head content rendered under title/sub, inside the head block */
  head?: ReactNode;
  children?: ReactNode;
  style?: CSSProperties;
}) {
  const headBlock =
    title || sub || head ? (
      <div className={`shell-cell-head${headClass ? ` ${headClass}` : ''}`}>
        {title ? <h3>{title}</h3> : null}
        {sub ? <p>{sub}</p> : null}
        {head}
      </div>
    ) : null;

  const body = (
    <>
      {headBlock}
      {children}
    </>
  );

  return (
    <div className={`tc-cell${cell ? ` ${cell}` : ''}`} data-reveal style={style}>
      {framed ? <div className='tc-card'>{body}</div> : body}
    </div>
  );
}
