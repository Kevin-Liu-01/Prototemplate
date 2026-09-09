import type { Metadata } from 'next';

import CompareRig from './CompareRig';

export const metadata: Metadata = {
  title: { absolute: 'Compare directions' },
  description: 'Two redesign directions, live and side by side, scrolling in proportion.',
};

/**
 * Two direction pages side by side on the viewer shell. The rig owns the
 * shell, the panes and the scroll sync; the page is the route entry only.
 */
export default function ComparePage() {
  return <CompareRig />;
}
