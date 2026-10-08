import { BadgeCycle, badgeMark } from '@/components/viewer/BadgeCycle';
import { GtMark } from '@/components/viewer/GtMark';

/**
 * The brand head's badge: the GT monogram, then the register's monograms
 * from /marks (public/marks), each a hard cut 1.4s after the last. The
 * dithered and ASCII monograms stay on /marks: at the badge's size their
 * cells fall under a pixel and read as a gray texture.
 */
const FRAMES = [
  { key: 'gt', content: <GtMark /> },
  badgeMark('/marks/bar-monogram.svg'),
  badgeMark('/marks/plate-inverted.svg'),
  badgeMark('/marks/two-way.svg'),
  badgeMark('/marks/globe-g.svg'),
];

export default function GtVariants() {
  return <BadgeCycle frames={FRAMES} />;
}
