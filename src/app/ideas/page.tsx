import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { requireUpdated } from '@/lib/updated';

import IdeasViewer from './IdeasViewer';

const route = seoRoute({
  path: '/ideas',
  title: PAGE_NAMES.ideas.name,
  kind: 'page',
  description:
    'What each General Translation surface took its ideas from: the references, then the versions made from them, with the chosen one marked.',
});

export const metadata = route.metadata;

/** /ideas: the references behind each surface and what was made from them, read from src/lib/ideas.ts. */
export default function IdeasPage() {
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <IdeasViewer updated={requireUpdated('/ideas')} />
    </>
  );
}
