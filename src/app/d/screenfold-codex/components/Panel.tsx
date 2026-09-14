import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

import BarDot from './BarDot';

/**
 * One leaf of the screenfold: a page with a red oxide frame, horizontal
 * registers divided by red rules, and a folio numeral in the corner. The
 * leaf is sheared a little along the horizontal axis and adjacent leaves
 * shear the other way, so the strip reads as an accordion seen slightly
 * off its axis. Each register counter-shears its own content, which keeps
 * the type level and, because the two shears pivot on different centers,
 * seats each register's content inside the slanted frame at its own
 * height.
 *
 * Registers are `<Register>` children; the panel draws the frame, the
 * registers draw the rules between them, and nothing else draws a line
 * that parallels either.
 *
 * Ornament home: the frame of every leaf and the register rules inside
 * it, in red oxide, and the folio cartouche in the corner.
 */
export type PanelProps = {
  /** the folio: the leaf's number, printed in bar and dot and in Arabic */
  index: number;
  fold: 'a' | 'b';
  tone?: 'day' | 'night';
  id?: string;
  className?: string;
  children: ReactNode;
};

export function Panel({ index, fold, tone = 'day', id, className, children }: PanelProps) {
  return (
    <section id={id} className={cn('sfc-panel', `is-fold-${fold}`, tone === 'night' && 'is-night', className)}>
      <div className='sfc-folio'>
        <BarDot n={index} layout='row' scale={0.85} />
        <span className='sfc-folio-n'>
          <span className='sfc-vh'>Leaf </span>
          {index}
        </span>
      </div>
      {children}
    </section>
  );
}

export type RegisterProps = {
  className?: string;
  children: ReactNode;
};

export function Register({ className, children }: RegisterProps) {
  return (
    <div className={cn('sfc-reg', className)}>
      <div className='sfc-reg-in'>{children}</div>
    </div>
  );
}
