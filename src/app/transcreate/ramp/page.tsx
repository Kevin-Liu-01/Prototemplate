import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { requireUpdated } from '@/lib/updated';

import TranscreateViewer from '../TranscreateViewer';

const route = seoRoute({
  path: '/transcreate/ramp',
  title: PAGE_NAMES.transcreateRamp.name,
  kind: 'page',
  description:
    'Ramp Procurement from English to Spanish and Japanese: the three versions at once, then the original alone and each translation under the original or alone.',
  crumbs: [{ name: PAGE_NAMES.transcreate.name, path: '/transcreate' }],
  updated: requireUpdated('/transcreate/ramp'),
});

export const metadata = route.metadata;

/** /transcreate/ramp: Ramp Procurement's three versions as columns, then each version (TranscreateViewer). */
export default function TranscreateRampPage() {
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <TranscreateViewer route='ramp' updated={requireUpdated('/transcreate/ramp')} />
    </>
  );
}
