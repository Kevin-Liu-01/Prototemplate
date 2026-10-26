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
    'Every component Prototemplate keeps, grouped as the docs Components section groups them, each with its captured plate, its source file and its docs page.',
});

export const metadata = route.metadata;

/**
 * /components: the component library as one book. The set is read on the
 * server at build time from the docs Components section and the plate
 * captures, and handed to the viewer.
 */
export default function ComponentsPage() {
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <ComponentsViewer blocks={getComponentLibrary()} updated={requireUpdated('/components')} />
    </>
  );
}
