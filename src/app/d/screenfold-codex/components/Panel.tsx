import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

import BarDot from './BarDot';
import GlyphBlock, { type Motif } from './GlyphBlock';

/**
 * One leaf of the screenfold. The leaf is a parallelogram: its top and
 * bottom edges are level, its two side edges run `--sfc-lean` pixels
 * across from top to bottom, and adjacent leaves lean the opposite way.
 * Because the run is a fixed length and not an angle, every crease lines
 * up exactly whatever the heights of the leaves on either side of it, and
 * the strip's silhouette zigzags down the page the way an accordion
 * pleat does when it is seen a little off its axis.
 *
 * The geometry is two clip paths and no transform. The outer section is
 * the red oxide frame: a red ground clipped to the parallelogram. The
 * inner leaf is the bark-paper ground clipped to the same parallelogram
 * two pixels in, so the red that shows between the two clips is the
 * frame, one owner, two pixels wide along every edge including the
 * slanted ones. The register rules inside are level border-tops that the
 * inner clip cuts off at the slanted frame. Type is never transformed
 * and stays crisp.
 *
 * Registers are `<Register>` children; the leaf draws the frame, the
 * registers draw the rules between them, and nothing else draws a line
 * that parallels either. The folio cartouche in the corner names the
 * leaf with its sign, its number in bar and dot, and its number in
 * Arabic.
 *
 * Ornament home: the frame of every leaf and the register rules inside
 * it, in red oxide, and the folio cartouche in the corner.
 */
export type PanelProps = {
  /** the folio: the leaf's number, printed in bar and dot and in Arabic */
  index: number;
  fold: 'a' | 'b';
  sign: Motif;
  tone?: 'day' | 'night';
  id?: string;
  className?: string;
  children: ReactNode;
};

export function Panel({ index, fold, sign, tone = 'day', id, className, children }: PanelProps) {
  return (
    <section id={id} className={cn('sfc-panel', `is-fold-${fold}`, tone === 'night' && 'is-night', className)}>
      <div className='sfc-leaf'>
        <div className='sfc-folio'>
          <GlyphBlock motif={sign} tier={6} size={18} tone={tone === 'night' ? 'night' : 'ink'} />
          <BarDot n={index} layout='row' scale={0.85} />
          <span className='sfc-folio-n'>
            <span className='sfc-vh'>Leaf </span>
            {index}
          </span>
        </div>
        {children}
      </div>
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
