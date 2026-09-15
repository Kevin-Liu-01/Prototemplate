import { cn } from '@/lib/cn';

import { patternId, type Tone } from './BayerDefs';

/**
 * A glyph block: the codex's unit of writing rendered as a geometric
 * dithered square. The square fills from one Bayer tier and carries one
 * sign carved through the screen in the ground color. The twelve signs
 * are the page's pattern vocabulary; each stands for one product concept
 * (data.ts, SIGNS) and is reused wherever that concept appears: the folio
 * of the leaf about it, the tablet that holds it, the step that performs
 * it. Every sign is geometry from the lineage and nothing else: the Mitla
 * stepped fret, the stepped pyramid, concentric rings, a running brick
 * bond, a quartered field, chevrons, crossed diagonals, a lozenge, a Greek
 * key meander, a rosette as a radial repeat, a battered pylon wall, the sun
 * disk reduced to a circle and two bars. Never a figure.
 *
 * Ornament home: the hero band, the fold map, every folio cartouche, the
 * tablet heads, the story steps, the script tiles' corner marks, and the
 * sign key on the back board.
 */
export type Motif =
  | 'fret'
  | 'step'
  | 'rings'
  | 'bond'
  | 'quad'
  | 'chevron'
  | 'cross'
  | 'lozenge'
  | 'key'
  | 'rosette'
  | 'pylon'
  | 'disk';

export const MOTIFS: readonly Motif[] = [
  'fret',
  'step',
  'rings',
  'bond',
  'quad',
  'chevron',
  'cross',
  'lozenge',
  'key',
  'rosette',
  'pylon',
  'disk',
];

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
  key: 'M7 31 V9 H19 V23 H13 V15 M23 31 V9 H35 V23 H29 V15',
  rosette:
    'M20 7 V33 M7 20 H33 M10.8 10.8 L29.2 29.2 M29.2 10.8 L10.8 29.2 M20 12 A8 8 0 1 1 20 28 A8 8 0 1 1 20 12 Z',
  pylon: 'M7 33 L12 7 H28 L33 33 Z M15 33 V20 H25 V33',
  disk: 'M20 14 A6 6 0 1 1 20 26 A6 6 0 1 1 20 14 Z M4 20 H11 M29 20 H36 M7 25 H12 M28 25 H33',
};

export type GlyphBlockProps = {
  tier: number;
  motif: Motif;
  tone?: Tone;
  /** CSS pixels on a side. */
  size?: number;
  className?: string;
  /** an accessible name; without one the block is decorative */
  label?: string;
};

export default function GlyphBlock({ tier, motif, tone = 'ink', size = 56, className, label }: GlyphBlockProps) {
  return (
    <svg
      className={cn('sfc-glyph', `is-${tone}`, className)}
      viewBox='0 0 40 40'
      width={size}
      height={size}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable='false'
      data-motif={motif}
    >
      <rect className='sfc-glyph-fill' x={1} y={1} width={38} height={38} rx={2} fill={`url(#${patternId(tone, tier)})`} />
      <path
        className='sfc-glyph-motif'
        d={MOTIF_PATH[motif]}
        fill='none'
        strokeWidth={2.6}
        strokeLinecap='square'
        strokeLinejoin='miter'
      />
      <rect
        className='sfc-glyph-frame'
        x={1}
        y={1}
        width={38}
        height={38}
        rx={2}
        fill='none'
        stroke='currentColor'
        strokeWidth={1}
        vectorEffect='non-scaling-stroke'
      />
    </svg>
  );
}
