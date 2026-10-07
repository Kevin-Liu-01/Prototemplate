import type { Metadata } from 'next';

import { PAGE_NAMES } from '@/lib/page-names';

import CompareRig from './CompareRig';

export const metadata: Metadata = {
  title: PAGE_NAMES.compare.name,
  description: 'Two redesign directions, live and side by side, scrolling in proportion.',
};

/**
 * Two direction pages side by side on the viewer shell. The rig owns the
 * shell, the panes and the scroll sync; the page is the route entry only.
 */
export default function ComparePage() {
  return <CompareRig />;
}
