import { BadgeCycle, badgeMark } from '@/components/viewer/BadgeCycle';
import { GtMark } from '@/components/viewer/GtMark';
import { boxMask, shortlist } from '@/lib/marks';

/** How many shortlisted marks the badge cuts through after the GT monogram. */
const SHORTLIST_FRAMES = 4;

/**
 * The brand head's badge: the GT monogram, then the first marks of the
 * shortlist (SHORTLIST in src/lib/marks.ts), each cut to its drawn box,
 * each a hard cut 1.4s after the last.
 */
const FRAMES = [
  { key: 'gt', content: <GtMark /> },
  ...shortlist()
    .slice(0, SHORTLIST_FRAMES)
    .map((mark) => badgeMark(mark.file, mark.box ? boxMask(mark.box) : undefined)),
];

export default function GtVariants() {
  return <BadgeCycle frames={FRAMES} />;
}
