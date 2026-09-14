import { patternId } from './BayerDefs';

/**
 * The fold between two leaves of the screenfold. A short band whose
 * density ramps through the Bayer tiers toward the crease: a valley fold
 * darkens downward (the next leaf turns under), a mountain fold darkens
 * upward. Rows of one tier each, edge to edge, compose an exact stepped
 * ramp; the panel frames on either side are the crease's own lines, so the
 * hinge draws no rule of its own.
 *
 * Ornament home: the divider between every pair of panels.
 */
export type FoldHingeProps = { fold: 'valley' | 'mountain' };

const RAMP: readonly number[] = [1, 2, 3, 4, 5, 6];
const ROW = 6;

export default function FoldHinge({ fold }: FoldHingeProps) {
  const tiers = fold === 'valley' ? RAMP : [...RAMP].reverse();
  return (
    <div className={`sfc-hinge is-${fold}`} aria-hidden='true'>
      <svg className='sfc-hinge-svg' width='100%' height={tiers.length * ROW} focusable='false'>
        {tiers.map((k, i) => (
          <rect key={i} x='0' y={i * ROW} width='100%' height={ROW} fill={`url(#${patternId('ink', k)})`} />
        ))}
      </svg>
    </div>
  );
}
