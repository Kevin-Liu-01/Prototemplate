import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { requireUpdated } from '@/lib/updated';

import TranscreateViewer from './TranscreateViewer';

const route = seoRoute({
  path: '/transcreate',
  title: PAGE_NAMES.transcreate.name,
  kind: 'page',
  description:
    'Three launch films from Profound and Canva beside their Japanese versions, then eight product videos translated from English to Japanese.',
  updated: requireUpdated('/transcreate'),
});

export const metadata = route.metadata;

/**
 * /transcreate: the overview of the English to Japanese videos, with the
 * three featured films (PairViewer) and the grid of all eight. The Transcreate pages are private
 * (src/lib/seo/policy.ts, PRIVATE_PATHS): each answers noindex, nofollow,
 * and the sitemap and /llms.txt leave them out. The videos are web copies
 * in public/media/transcreate (videos.ts).
 */
export default function TranscreatePage() {
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <TranscreateViewer route='overview' updated={requireUpdated('/transcreate')} />
    </>
  );
}
