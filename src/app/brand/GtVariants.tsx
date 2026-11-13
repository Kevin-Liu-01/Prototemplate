import GtLogoMotion from '@/components/brand/GtLogoMotion';
import { BadgeCycle } from '@/components/viewer/BadgeCycle';

/**
 * The brand head's badge: the logo alone, with its hover, so the meridian
 * draws back while the reader points at it. The explorations the badge
 * once cut through stay on /marks (Kevin, 2026-11-13: "Refined logo
 * only").
 */
const FRAMES = [{ key: 'gt', content: <GtLogoMotion mode='hover' /> }];

export default function GtVariants() {
  return <BadgeCycle frames={FRAMES} />;
}
