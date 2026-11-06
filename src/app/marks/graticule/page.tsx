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
  description: "The best graticule marks, every mark cut from a wireframe globe's lines, the animations that move only those lines, and every variation of the globe.",
  crumbs: [{ name: PAGE_NAMES.marks.name, path: '/marks' }],
  updated: requireUpdated('/marks/graticule'),
});

export const metadata = route.metadata;

/**
 * /marks/graticule: the best graticule marks, then every graticule mark of
 * the catalog, then its line globe animations, then every variation by
 * study, newest first. The animations' stills are drawn here on the server;
 * the browser computes only their motion, in a worker.
 */
export default function GraticulePage() {
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <GraticuleViewer updated={requireUpdated('/marks/graticule')} loops={lineLoops()} />
    </>
  );
}
