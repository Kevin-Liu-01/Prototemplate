import { notFound } from 'next/navigation';

import { bookFacts } from '@/components/book/book';
import BookShell from '@/components/book/BookShell';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { requireUpdated } from '@/lib/updated';

import { buildHandbook } from '../libraries-book';
import { getHandbookDoc, HANDBOOK } from '../registry';
import type { DocEntry } from '../registry';

export function generateStaticParams() {
  return HANDBOOK.map((doc) => ({ slug: doc.slug }));
}

export const dynamicParams = false;

type Params = { params: Promise<{ slug: string }> };

/** The route's head and JSON-LD: the document as a TechArticle under the handbook, dated by its own file, with its Markdown twin. */
function handbookRoute(doc: DocEntry) {
  return seoRoute({
    path: `/handbook/${doc.slug}`,
    title: doc.title,
    section: 'Handbook',
    kind: 'article',
    description: doc.blurb,
    crumbs: [{ name: 'Handbook', path: '/handbook' }],
    updated: requireUpdated(`/handbook/${doc.slug}`),
    markdown: `/handbook/${doc.slug}.md`,
  });
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const doc = getHandbookDoc(slug);
  if (!doc) notFound();
  return handbookRoute(doc).metadata;
}

/** /handbook/[slug] opens the same book at the named document. */
export default async function HandbookDocPage({ params }: Params) {
  const { slug } = await params;
  const doc = getHandbookDoc(slug);
  if (!doc) notFound();
  const docs = buildHandbook();
  return (
    <>
      <JsonLd nodes={handbookRoute(doc).jsonLd} />
      <BookShell
        book='handbook'
        active={doc.slug}
        docs={docs}
        updated={requireUpdated('/handbook')}
        facts={bookFacts('handbook', docs)}
      />
    </>
  );
}
