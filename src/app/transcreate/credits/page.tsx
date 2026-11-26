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
    'Kevin Liu, the author of Transcreate, with the methods he devised, and the original of each Transcreate video with its company.',
  crumbs: [{ name: PAGE_NAMES.transcreate.name, path: '/transcreate' }],
  updated: requireUpdated('/transcreate/credits'),
});

export const metadata = route.metadata;

/** /transcreate/credits: each original video and its company, and the author's methods (TranscreateViewer). */
export default function TranscreateCreditsPage() {
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <TranscreateViewer route='credits' updated={requireUpdated('/transcreate/credits')} />
    </>
  );
}
