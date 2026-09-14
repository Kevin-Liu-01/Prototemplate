import { useId } from 'react';

/**
 * Frieze. The stepped chevron band: one 48px tile repeated across the divider.
 * The chevron is one center path stroked twice (ground over cream) so it
 * reads as the brand's doubled thread carved into the cream band; a gold
 * triangle sits in each peak. Decorative and aria-hidden.
 *
 * C1 home: dividers (C1.2). Mounted inside the tc-hatch spacer, which owns the
 * band's two rules; the frieze draws no border of its own.
 */

/* one peak over 48px, drawn 6px past both edges so the tile seam is clean */
const CHEVRON = 'M-6 32H0V27H6V22H12V17H18V12H30V17H36V22H42V27H48V32H54';
const STUD = 'M24 18L20 25H28Z';

export default function Frieze() {
  const id = `sba-frieze-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <svg className='sba-frieze' aria-hidden='true' focusable='false'>
      <defs>
        <pattern id={id} width='48' height='44' patternUnits='userSpaceOnUse'>
          <path className='sba-frieze-thread' d={CHEVRON} />
          <path className='sba-frieze-core' d={CHEVRON} />
          <path className='sba-frieze-stud' d={STUD} />
        </pattern>
      </defs>
      <rect width='100%' height='100%' fill={`url(#${id})`} />
    </svg>
  );
}
