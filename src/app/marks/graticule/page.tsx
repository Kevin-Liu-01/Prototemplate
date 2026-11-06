import { lineLoops } from '@/lib/graticule/line-animations';
import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { requireUpdated } from '@/lib/updated';

import GraticuleViewer from './GraticuleViewer';

const route = seoRoute({
  path: '/marks/graticule',
  title: PAGE_NAMES.graticule.name,
  kind: 'page',
  description: "Every graticule mark, cut from a wireframe globe's lines, the animations that move only its lines, and variations of the globe and the thicker Graticule jaw.",
  crumbs: [{ name: PAGE_NAMES.marks.name, path: '/marks' }],
  updated: requireUpdated('/marks/graticule'),
});

export const metadata = route.metadata;

/**
 * /marks/graticule: every graticule mark of the catalog, then its line globe
 * animations, then its variations: new drawings of the globe, then redraws of
 * Graticule jaw, thicker. The animations'
 * stills are drawn here on the server; the browser computes only their
 * motion, in a worker.
 */
export default function GraticulePage() {
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <GraticuleViewer updated={requireUpdated('/marks/graticule')} loops={lineLoops()} />
    </>
  );
}
