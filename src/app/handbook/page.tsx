import { bookFacts } from '@/components/book/book';
import BookShell from '@/components/book/BookShell';
import { README_SLUG } from '@/components/book/model';
import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { requireUpdated } from '@/lib/updated';

import { buildHandbook } from './libraries-book';

const route = seoRoute({
  path: '/handbook',
  title: PAGE_NAMES.handbook.name,
  kind: 'article',
  description:
    'How Kevin Liu runs General Translation work, and the canon: the principles, the quality bar, the decisions, the agent guide, brand, design and the ship loop.',
  updated: requireUpdated('/handbook'),
  markdown: '/handbook.md',
});

export const metadata = route.metadata;

/** /handbook opens the handbook at its readme; the fifteen documents follow it in the book shell. */
export default function HandbookPage() {
  const docs = buildHandbook();
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <BookShell
        book='handbook'
        active={README_SLUG}
        docs={docs}
        updated={requireUpdated('/handbook')}
        facts={bookFacts('handbook', docs)}
      />
    </>
  );
}
