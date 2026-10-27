import { getComponentLibrary } from '@/lib/component-library';
import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { requireUpdated } from '@/lib/updated';

import ComponentsViewer from './ComponentsViewer';

const route = seoRoute({
  path: '/components',
  title: PAGE_NAMES.components.name,
  kind: 'page',
  description:
    'The components Prototemplate keeps. Each one the docs document runs live with its controls, and the rest are listed by export and file.',
});

export const metadata = route.metadata;

/**
 * /components: the component library as one book. The set is read on the
 * server at build time from the docs Components section and handed to the
 * viewer, which mounts each plate only while its row is near the reader.
 */
export default function ComponentsPage() {
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <ComponentsViewer blocks={getComponentLibrary()} updated={requireUpdated('/components')} />
    </>
  );
}
