import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';

import { getCatalog } from '../_press/content';
import Landing from '../_press/Landing';

const route = seoRoute({
  path: '/press/shelf',
  title: 'GT Atlas, the shelf',
  kind: 'page',
  description: 'The direction GT Atlas took before the magazine, kept to explore: each story a hardcover on a shelf, read in a look of its own.',
  crumbs: [{ name: PAGE_NAMES.press.name, path: '/press' }],
});

export const metadata = route.metadata;

/* The shelf: GT Atlas as it stood before the magazine, every story a book
   on one shelf and read in its own look (the docs reader, Fumadocs' own
   look, the printed book). Its links stay on the shelf. */
export default function PressShelfPage() {
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <Landing catalog={getCatalog()} edition='shelf' />
    </>
  );
}
