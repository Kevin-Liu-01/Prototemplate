import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { requireUpdated } from '@/lib/updated';

import TranscreateViewer from '../TranscreateViewer';

const route = seoRoute({
  path: '/transcreate/videos',
  title: PAGE_NAMES.transcreateVideos.name,
  kind: 'page',
  description:
    'Each of the eight product videos from English to Japanese, with the two languages side by side or stacked.',
  crumbs: [{ name: PAGE_NAMES.transcreate.name, path: '/transcreate' }],
  updated: requireUpdated('/transcreate/videos'),
});

export const metadata = route.metadata;

/** /transcreate/videos: each video on its own row, side by side or stacked (TranscreateViewer). */
export default function TranscreateVideosPage() {
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <TranscreateViewer route='videos' updated={requireUpdated('/transcreate/videos')} />
    </>
  );
}
