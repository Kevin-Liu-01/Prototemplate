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
/**
 * A bento row: owns the seams (1px hair gaps), the column template, and
 * head alignment. Cells inside draw NO outer borders — the row is the only
 * thing that ever draws a structural line, which is what makes doubled or
 * off-color seams impossible. `cols` is any grid-template-columns value;
 * below 1020px the row collapses to one column and the same gaps carry the
 * stacked seams.
 */
export function BentoRow({
  cols,
  className = '',
  eqHeads = true,
  headH,
  children,
}: {
  /** grid-template-columns for the row (e.g. '7fr 5fr') */
  cols?: string;
  /** page variant classes (is-lead, is-split, ...) */
  className?: string;
  /** align every cell head in the row to one height */
  eqHeads?: boolean;
  /** override the aligned head height (e.g. '96px') */
  headH?: string;
  children?: ReactNode;
}) {
  const style: CSSProperties = {};
  if (cols) style['--shell-cols' as never] = cols as never;
  if (headH) style['--shell-head-h' as never] = headH as never;
  return (
    <div
      className={`tc-row shell-row${className ? ` ${className}` : ''}`}
      data-eq-heads={eqHeads ? '' : undefined}
      style={style}
    >
      {children}
    </div>
  );
}

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
