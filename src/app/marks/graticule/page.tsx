import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { requireUpdated } from '@/lib/updated';

import GraticuleViewer from './GraticuleViewer';

const route = seoRoute({
  path: '/marks/graticule',
  title: PAGE_NAMES.graticule.name,
  kind: 'page',
  description: 'Every graticule mark, cut from the lines of a wireframe globe, and the variations of the thicker Graticule jaw.',
  crumbs: [{ name: PAGE_NAMES.marks.name, path: '/marks' }],
  updated: requireUpdated('/marks/graticule'),
});

export const metadata = route.metadata;

/** /marks/graticule: every graticule mark of the catalog, then the variations of Graticule jaw, thicker. */
export default function GraticulePage() {
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <GraticuleViewer updated={requireUpdated('/marks/graticule')} />
    </>
  );
}
