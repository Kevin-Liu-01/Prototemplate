import DoubledLine from '@/components/shared/diagrams/DoubledLine';

/**
 * Deco layer. C1 home: 4 (the hero plate). This is the poster's subject, not
 * an ornament: the T component drawn as a monument.
 *
 * One geometric form in the Cassandre manner: a stepped crossbar, a stem, a
 * stepped plinth, standing between the two angle brackets of `<T>`. The
 * silhouette is filled in the plate's own midnight so it cuts out of the
 * dither fan behind it, and its edge is the brand's doubled line (one path
 * stroked twice at constant screen gauge, never two offset outlines). Every
 * color is a CSS token read by the SVG, so the form follows the plate.
 */

/* The monument, as one closed outline: crossbar tiers, stem, plinth tiers.
   Coordinates are viewBox units on a 640-square. */
const T_OUTLINE = [
  'M256 96',
  'H384',
  'V128',
  'H440',
  'V168',
  'H512',
  'V232',
  'H356',
  'V520',
  'H408',
  'V552',
  'H464',
  'V576',
  'H176',
  'V552',
  'H232',
  'V520',
  'H284',
  'V232',
  'H128',
  'V168',
  'H200',
  'V128',
  'H256',
  'Z',
].join(' ');

const BRACKET_L = 'M112 296 L52 376 L112 456';
const BRACKET_R = 'M528 296 L588 376 L528 456';

export default function PosterForm() {
  return (
    <svg
      className='cp-poster-form'
      viewBox='0 0 640 640'
      role='img'
      aria-label='The T component drawn as a monument: a stepped crossbar over a stem and plinth, standing between two angle brackets'
    >
      {/* the silhouette: the plate's ground, so the fan stops at the edge */}
      <path d={T_OUTLINE} fill='var(--tc-dark)' />
      {/* the edge: the doubled line, carved by the plate's own color */}
      <DoubledLine d={T_OUTLINE} ink='var(--cp-plate-ink)' core='var(--tc-dark)' />
      {/* the brackets, same gauge, same two threads */}
      <DoubledLine d={BRACKET_L} ink='var(--cp-plate-ink-2)' core='var(--tc-dark)' />
      <DoubledLine d={BRACKET_R} ink='var(--cp-plate-ink-2)' core='var(--tc-dark)' />
    </svg>
  );
}
