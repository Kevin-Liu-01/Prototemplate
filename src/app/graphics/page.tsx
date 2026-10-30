import { getPosts } from '@/lib/blog';
import { getGraphicsBlocks } from '@/lib/graphics';
import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { requireUpdated } from '@/lib/updated';

import GraphicsViewer from './GraphicsViewer';

const route = seoRoute({
  path: '/graphics',
  title: PAGE_NAMES.graphics.name,
  kind: 'page',
  description:
    'Every illustration of the General Translation blog in every version it ships in: the docs series by area, then the covers and figures of the other posts.',
});

export const metadata = route.metadata;

/**
 * /graphics: the authoritative set. The blocks are read on the server
 * (the manifest the generator writes, the exports, the grounds, the
 * sheets, the earlier posts) and handed to the viewer, which opens the
 * book at its head with every image in the list on the left.
 */
export default function GraphicsPage() {
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <GraphicsViewer blocks={getGraphicsBlocks()} posts={getPosts().length} updated={requireUpdated('/graphics')} />
    </>
  );
}
