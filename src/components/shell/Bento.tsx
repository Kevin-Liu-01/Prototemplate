import type { CSSProperties, ReactNode } from 'react';

import { cn } from '@/lib/cn';

import './shell.css';

/**
 * THE SHELL, componentized — Tailwind-first, one owner per line.
 *
 * The law of lines: a ROW (or a rails wrapper) owns every structural line.
 * Cells have no border props at all, so doubled or off-color seams are
 * impossible by construction. Colors only ever come from the shell tokens
 * (--tc-hair / --tc-hair-band families) — enforced by pnpm lint:shell.
 */

/**
 * The page's doubled rail pair for full-bleed band sections that sit
 * OUTSIDE a .tc-rail wrapper. Sections inside a wrapper must render
 * nothing — the wrapper already owns the rails (drawing them twice is the
 * double-rail bug). The parent section must be `relative`.
 */
export function Rails({ outer = true }: { outer?: boolean }) {
  const pair =
    'pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 border-x border-(--tc-hair-band)';
  return (
    <>
      <div aria-hidden className={cn(pair, 'w-[min(var(--tc-rail),100%)]')} />
      {outer ? (
        <div
          aria-hidden
          className={cn(
            pair,
            'w-[calc(min(var(--tc-rail),100%)+var(--tc-rail-outer,18px))]'
          )}
        />
      ) : null}
    </>
  );
}

/**
 * A bento row: owns the seams (1px hair gaps), the column template, and
 * head alignment. `cols` is any grid-template-columns value; below the lg
 * breakpoint the row collapses to one column and the same gaps carry the
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
      className={cn(
        'tc-row shell-row grid gap-px bg-(--tc-hair) [&>*]:min-w-0 max-lg:grid-cols-[minmax(0,1fr)]',
        className
      )}
      data-eq-heads={eqHeads ? '' : undefined}
      style={style}
    >
      {children}
    </div>
  );
}

/**
 * The bento cell: cell → optional nested card → head block → body. The
 * class grammar is preserved verbatim (.tc-cell/.tc-card plus the page's
 * variant classes), so each direction's stylesheet keeps styling the same
 * selectors it always did; only the head gains a shared wrapper.
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
  /** framed cells mount the nested .tc-card and always carry .is-framed;
   * flat cells sit on the page */
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
      <div className={cn('shell-cell-head', headClass)}>
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

  /* The seam grammar keys off the `.is-framed` CLASS, not the prop: the
     stacking media's border-top exclusion and the row's gap-seam both read
     it. A framed cell whose caller forgot the class would collect gap seam
     PLUS border-top — the founder's 2px "double border" below the fold — so
     the prop carries the class itself (skipped when the caller already
     passed it). Framed-without-class is not a supported look: no caller
     relies on it, and the law of lines forbids it. */
  const cellClass = cn(
    'tc-cell',
    framed && !/\bis-framed\b/.test(cell) && 'is-framed',
    cell
  );

  return (
    <div className={cellClass} data-reveal style={style}>
      {framed ? <div className='tc-card'>{body}</div> : body}
    </div>
  );
}
