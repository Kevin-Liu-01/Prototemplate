import { patternId, type Tone } from './BayerDefs';

/**
 * The fold between two leaves of the screenfold. A short band, seated on
 * the span where the two frames meet (the crease sits east of the strip's
 * left edge after a leaf that leans right, west of its right edge after
 * one that leans left, so the hinge takes the same margin), whose density
 * ramps through the Bayer tiers toward the crease and back out: rows of
 * one tier each, edge to edge, compose an exact stepped trough. A valley
 * fold is inked and its crease is a solid hairline at the bottom of the
 * trough. A mountain fold is the same trough in red oxide with the crease
 * left open, a ridge of bare paper catching the light. Both are geometry
 * from one screen; neither is a gradient.
 *
 * Ornament home: the divider between every pair of leaves.
 */
export type FoldHingeProps = {
  fold: 'valley' | 'mountain';
  /** which crease span the hinge sits on: east follows a leaf that leans right, west one that leans left */
  seat: 'east' | 'west' | 'full';
};

const TROUGH: readonly number[] = [1, 2, 3, 4, 6, 8, 10, 8, 6, 4, 3, 2, 1];
const ROW = 3;

export default function FoldHinge({ fold, seat }: FoldHingeProps) {
  const tone: Tone = fold === 'valley' ? 'ink' : 'orn';
  const height = TROUGH.length * ROW;
  const mid = Math.floor(TROUGH.length / 2) * ROW + 1;
  return (
    <div className={`sfc-hinge is-${fold} is-${seat}`} aria-hidden='true'>
      <svg className='sfc-hinge-svg' width='100%' height={height} focusable='false'>
        {TROUGH.map((k, i) => (
          <rect key={i} x='0' y={i * ROW} width='100%' height={ROW} fill={`url(#${patternId(tone, k)})`} />
        ))}
        <rect className='sfc-hinge-crease' x='0' y={mid} width='100%' height={1} />
      </svg>
    </div>
  );
}
