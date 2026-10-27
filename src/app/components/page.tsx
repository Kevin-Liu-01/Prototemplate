import type { ComponentType, ReactNode } from 'react';

import MarksDemo from '@/components/docs/demos/MarksDemo';
import { getComponentLibrary } from '@/lib/component-library';
import type { ServerPlateModule } from '@/lib/component-library-model';
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
    'Every component Prototemplate keeps, grouped as the docs group them, each running live with its controls beside its source file and its docs page.',
});

export const metadata = route.metadata;

/** The plates with a server half, by the specifier the MDX imports them from; keyed by the model's list, so tsc holds the two together. */
const SERVER_PLATES: Readonly<Record<ServerPlateModule, ComponentType<Record<string, unknown>>>> = {
  '@/components/docs/demos/MarksDemo': MarksDemo,
};

/**
 * /components: the component library as one book. The set is read on the
 * server at build time from the docs Components section, and the plates
 * with a server half are rendered here and handed to the viewer, which
 * mounts each one only while its row is near the reader.
 */
export default function ComponentsPage() {
  const blocks = getComponentLibrary();
  const server: Record<string, ReactNode> = {};
  for (const entry of blocks.flatMap((block) => block.entries)) {
    if (entry.plate?.kind !== 'server') continue;
    const Plate = SERVER_PLATES[entry.plate.module];
    server[entry.id] = <Plate {...entry.plate.props} />;
  }
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <ComponentsViewer blocks={blocks} server={server} updated={requireUpdated('/components')} />
    </>
  );
}
