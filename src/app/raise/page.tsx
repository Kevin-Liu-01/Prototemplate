import { PAGE_NAMES } from '@/lib/page-names';
import { loadRaise } from '@/lib/raise';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { requireUpdated } from '@/lib/updated';

import { raiseIndex } from './model';
import RaiseViewer from './RaiseViewer';
import StoreMissing from './StoreMissing';

/* the page is built from the store and built again from it at most every five minutes, so a sync shows within that time */
export const revalidate = 300;

const route = seoRoute({
  path: '/raise',
  title: PAGE_NAMES.raise.name,
  kind: 'page',
  description:
    'The finals of the General Translation funding announcement media in posting order, the cuts they replaced, and the rounds that made them.',
  updated: requireUpdated('/raise'),
});

export const metadata = route.metadata;

/**
 * /raise: the media of the funding announcement on the viewer shell, in
 * the format of /motion. The finals, the history and the rounds are read
 * from the Blob store (src/lib/raise.ts) and shaped here on the server
 * (model.ts), so the client receives plain rows. A store that cannot be
 * read shows one line in the same shell.
 */
export default async function RaisePage() {
  const raise = await loadRaise();
  const updated = requireUpdated('/raise');
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      {raise ? <RaiseViewer index={raiseIndex(raise)} updated={updated} /> : <StoreMissing updated={updated} />}
    </>
  );
}
