/**
 * PlateNumeral. Charter C1 home 1, the section head: the numbered plate of a
 * 1930s timetable, standing in the `tc-head-icon` slot at the right of every
 * `.tc-head` (and above the review section's heading, where the head is a
 * copy column). A Roman numeral in Inter 500 sits inside a lozenge whose
 * ring is the brand's doubled line: one path stroked twice by `DoubledLine`,
 * the core carved in the page's own paper, so the engraved double border is
 * one geometry and never two hand-drawn borders. Roman numerals keep the
 * plates free of digits. Decorative only: aria-hidden, no copy.
 */
import DoubledLine from '@/components/shared/diagrams/DoubledLine';

type PlateNumeralProps = {
  /** The plate's Roman numeral, in page order. */
  n: string;
  /** `is-lead` seats the plate statically above a heading instead of in the head's corner. */
  className?: string;
};

export default function PlateNumeral({ n, className }: PlateNumeralProps) {
  return (
    <span className={className ? `lt-plate ${className}` : 'lt-plate'} aria-hidden='true'>
      <svg viewBox='0 0 100 100' focusable='false'>
        <DoubledLine
          d='M50 3 L97 50 L50 97 L3 50 Z'
          gauge={1.25}
          gap={3}
          ink='currentColor'
          core='var(--tc-paper)'
        />
        <text x='50' y='51' textAnchor='middle' dominantBaseline='central'>
          {n}
        </text>
      </svg>
    </span>
  );
}
