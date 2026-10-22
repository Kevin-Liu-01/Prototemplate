import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';

import { getCatalog, getMagazineIssues } from './_press/content';
import Landing from './_press/Landing';

const route = seoRoute({
  path: '/press',
  title: PAGE_NAMES.press.name,
  kind: 'page',
  description: 'GT Atlas, the General Translation magazine: each story is an issue with its own cover, its own art and its own palette.',
});

export const metadata = route.metadata;

export default function PressPage() {
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <Landing catalog={getCatalog()} issues={getMagazineIssues()} />
    </>
  );
}
