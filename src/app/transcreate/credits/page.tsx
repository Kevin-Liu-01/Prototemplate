import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { requireUpdated } from '@/lib/updated';

import TranscreateViewer from '../TranscreateViewer';

const route = seoRoute({
  path: '/transcreate/credits',
  title: PAGE_NAMES.transcreateCredits.name,
  kind: 'page',
  description:
    'The original of each Transcreate video and the company it belongs to, with the title and address where they are recorded.',
  crumbs: [{ name: PAGE_NAMES.transcreate.name, path: '/transcreate' }],
  updated: requireUpdated('/transcreate/credits'),
});

export const metadata = route.metadata;

/** /transcreate/credits: each original video and its company (TranscreateViewer). */
export default function TranscreateCreditsPage() {
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <TranscreateViewer route='credits' updated={requireUpdated('/transcreate/credits')} />
    </>
  );
}
