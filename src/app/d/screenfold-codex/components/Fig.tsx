import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

import BarDot from './BarDot';

/**
 * A figure as the codex prints one: the bar-and-dot numeral in red oxide,
 * then the Arabic form in the instrument voice. Every count, price, and
 * step on the page goes through this so the two systems always print
 * together. The numeral is decorative; the text carries the reading.
 *
 * Ornament home: the margins and row heads of every register.
 */
export type FigProps = {
  n: number;
  children: ReactNode;
  scale?: number;
  className?: string;
};

export default function Fig({ n, children, scale = 0.9, className }: FigProps) {
  return (
    <span className={cn('sfc-figure', className)}>
      <BarDot n={n} layout='row' scale={scale} />
      <span className='sfc-figure-text'>{children}</span>
    </span>
  );
}
