import { cn } from '@/lib/cn';

import { patternId, type Tone } from './BayerDefs';

/**
 * A glyph block: the codex's unit of writing rendered as a geometric
 * dithered square. The square fills from one Bayer tier and carries one
 * motif carved through the screen in the ground color: a stepped fret, a
 * stepped pyramid, concentric rings, a running brick bond, a quartered
 * field, chevrons, crossed diagonals, a lozenge. Never a figure.
 *
 * Ornament home: the hero band, the night panel's margin, and the corner
 * marks of the script tiles.
 */
export type Motif = 'fret' | 'step' | 'rings' | 'bond' | 'quad' | 'chevron' | 'cross' | 'lozenge';

export const MOTIFS: readonly Motif[] = ['fret', 'step', 'rings', 'bond', 'quad', 'chevron', 'cross', 'lozenge'];

/** Paths in the block's 40 by 40 space, each a single stroke. */
const MOTIF_PATH: Record<Motif, string> = {
  fret: 'M9 31 V9 H31 V27 H15 V15 H25 V21 H21',
  step: 'M7 33 H11 V27 H15 V21 H19 V15 H23 V21 H27 V27 H31 V33 H35',
  rings: 'M20 8 A12 12 0 1 1 20 32 A12 12 0 1 1 20 8 Z M20 14 A6 6 0 1 1 20 26 A6 6 0 1 1 20 14 Z',
  bond: 'M5 13 H35 M5 20 H35 M5 27 H35 M13 6 V13 M27 6 V13 M20 13 V20 M13 20 V27 M27 20 V27 M20 27 V34',
  quad: 'M20 6 V34 M6 20 H34 M15 15 H25 V25 H15 Z',
  chevron: 'M8 24 L20 12 L32 24 M8 32 L20 20 L32 32',
  cross: 'M8 8 L32 32 M32 8 L8 32',
  lozenge: 'M20 6 L34 20 L20 34 L6 20 Z M20 14 L26 20 L20 26 L14 20 Z',
};

export type GlyphBlockProps = {
  tier: number;
  motif: Motif;
  tone?: Tone;
  /** CSS pixels on a side. */
  size?: number;
  className?: string;
};

export default function GlyphBlock({ tier, motif, tone = 'ink', size = 56, className }: GlyphBlockProps) {
  return (
    <svg
      className={cn('sfc-glyph', `is-${tone}`, className)}
      viewBox='0 0 40 40'
      width={size}
      height={size}
      aria-hidden='true'
      focusable='false'
      data-motif={motif}
    >
      <rect className='sfc-glyph-fill' x={1} y={1} width={38} height={38} rx={3} fill={`url(#${patternId(tone, tier)})`} />
      <path className='sfc-glyph-motif' d={MOTIF_PATH[motif]} fill='none' strokeWidth={2.6} strokeLinecap='square' strokeLinejoin='miter' />
      <rect
        className='sfc-glyph-frame'
        x={1}
        y={1}
        width={38}
        height={38}
        rx={3}
        fill='none'
        stroke='currentColor'
        strokeWidth={1}
        vectorEffect='non-scaling-stroke'
      />
    </svg>
  );
}
