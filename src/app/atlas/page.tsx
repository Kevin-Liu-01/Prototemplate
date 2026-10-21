import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { requireUpdated } from '@/lib/updated';

import AtlasViewer from './AtlasViewer';

const route = seoRoute({
  path: '/atlas',
  title: PAGE_NAMES.atlas.name,
  kind: 'page',
  description: 'Why General Translation publishes long writing as GT Atlas, a shelf of books, and the three looks a story is set in so far.',
});

export const metadata = route.metadata;

/** /atlas: the notes on GT Atlas, read as one book on the viewer shell. */
export default function AtlasPage() {
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <AtlasViewer updated={requireUpdated('/atlas')} />
    </>
  );
}
