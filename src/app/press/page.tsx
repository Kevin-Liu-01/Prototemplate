import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';

import { getCatalog } from './_press/content';
import Landing from './_press/Landing';

const route = seoRoute({
  path: '/press',
  title: PAGE_NAMES.press.name,
  kind: 'page',
  description: 'GT Atlas, the General Translation magazine: each story is a book with its own cover, set in pages of its own.',
});

export const metadata = route.metadata;

export default function PressPage() {
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <Landing catalog={getCatalog()} />
    </>
  );
}
