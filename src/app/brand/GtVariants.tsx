import { BadgeCycle, badgeMark } from '@/components/viewer/BadgeCycle';
import { GT_MARK_VIEWBOX, GtMark } from '@/components/viewer/GtMark';
import { badgeMarks, boxMask } from '@/lib/marks';

/** The GT monogram's width over its height, from its viewBox. */
const [, , gtWidth, gtHeight] = GT_MARK_VIEWBOX.split(' ').map(Number);
const gtAspect = gtWidth / gtHeight;

/**
 * The badge's frames after the GT monogram: the first shortlisted marks no
 * wider than it (badgeMarks in src/lib/marks.ts), each cut to its drawn
 * box. The badge demo on /docs/components/heads cuts through the same.
 */
export const BADGE_MARKS = badgeMarks(gtAspect).map((mark) => badgeMark(mark.file, mark.box ? boxMask(mark.box) : undefined));

/**
 * The brand head's badge: the GT monogram, then BADGE_MARKS, each a hard
 * cut 1.4s after the last. The monogram is the widest frame, so it sets
 * the box's width and the box holds still.
 */
const FRAMES = [{ key: 'gt', content: <GtMark /> }, ...BADGE_MARKS];

export default function GtVariants() {
  return <BadgeCycle frames={FRAMES} />;
}
