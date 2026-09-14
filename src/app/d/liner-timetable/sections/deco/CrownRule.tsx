/**
 * CrownRule. Charter C1 home 4, the hero crown: one gold doubled rule closed
 * by a diamond terminal at each end. Two of these flank the GT mark in the
 * hero's crown lockup, the monogram between engraved rules that opens a
 * sailing list. The rule is `DoubledLine` (one path, stroked twice, the core
 * carved in the hero card's paper); the terminals are two small lozenges in
 * the same ink. The ink is `currentColor`, set by `.lt-crown`. Decorative.
 */
import DoubledLine from '@/components/shared/diagrams/DoubledLine';

export default function CrownRule() {
  return (
    <svg className='lt-crown-rule' viewBox='0 0 96 12' aria-hidden='true' focusable='false'>
      <DoubledLine d='M6 6 H90' gauge={1.5} gap={3} ink='currentColor' core='var(--tc-card)' />
      <path d='M0 6 L6 0 L12 6 L6 12 Z' fill='currentColor' />
      <path d='M84 6 L90 0 L96 6 L90 12 Z' fill='currentColor' />
    </svg>
  );
}
