import { BadgeCycle, badgeMark } from '@/components/viewer/BadgeCycle';
import { GtMark } from '@/components/viewer/GtMark';
import { LOGO } from '@/lib/logo';
import { badgeMarks, boxMask } from '@/lib/marks';

/** The logo's width over its height, from its drawn box. */
const [, , logoWidth, logoHeight] = LOGO.viewBox.split(' ').map(Number);
const logoAspect = logoWidth / logoHeight;

/**
 * The badge's frames after the logo: the first shortlisted marks after it
 * no wider than it (badgeMarks in src/lib/marks.ts), each cut to its drawn
 * box. The badge demo on /docs/components/heads cuts through the same.
 */
export const BADGE_MARKS = badgeMarks(logoAspect).map((mark) => badgeMark(mark.file, mark.box ? boxMask(mark.box) : undefined));

/**
 * The brand head's badge: the logo, then BADGE_MARKS, each a hard cut
 * 1.4s after the last. No frame is wider than the logo, so it sets the
 * box's width and the box holds still.
 */
const FRAMES = [{ key: 'gt', content: <GtMark /> }, ...BADGE_MARKS];

export default function GtVariants() {
  return <BadgeCycle frames={FRAMES} />;
}
