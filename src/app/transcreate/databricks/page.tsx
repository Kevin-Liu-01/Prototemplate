import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { requireUpdated } from '@/lib/updated';

import TranscreateViewer from '../TranscreateViewer';

const route = seoRoute({
  path: '/transcreate/databricks',
  title: PAGE_NAMES.transcreateDatabricks.name,
  kind: 'page',
  description:
    'Four Databricks videos from English to Japanese: all four at once, then each with the original above the Japanese version or the Japanese version alone.',
  crumbs: [{ name: PAGE_NAMES.transcreate.name, path: '/transcreate' }],
  updated: requireUpdated('/transcreate/databricks'),
});

export const metadata = route.metadata;

/** /transcreate/databricks: the grid of the four Databricks videos, then each video stacked or in Japanese (TranscreateViewer). */
export default function TranscreateDatabricksPage() {
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <TranscreateViewer route='databricks' updated={requireUpdated('/transcreate/databricks')} />
    </>
  );
}
