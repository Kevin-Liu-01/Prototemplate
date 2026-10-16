import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';

import CompareRig from './CompareRig';

const route = seoRoute({
  path: '/compare',
  title: PAGE_NAMES.compare.name,
  kind: 'page',
  description: 'Two redesign directions, live and side by side, scrolling in proportion.',
});

export const metadata = route.metadata;

/**
 * Two direction pages side by side on the viewer shell. The rig owns the
 * shell, the panes and the scroll sync; the page is the route entry only.
 */
export default function ComparePage() {
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <CompareRig />
    </>
  );
}
