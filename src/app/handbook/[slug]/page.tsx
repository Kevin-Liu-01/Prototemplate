import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { bookFacts, buildBook } from '@/app/docs/book';
import DocsShell from '@/app/docs/DocsShell';
import { docWindowTitle } from '@/app/docs/model';
import { requireUpdated } from '@/lib/updated';

import { getHandbookDoc, HANDBOOK } from '../registry';

export function generateStaticParams() {
  return HANDBOOK.map((doc) => ({ slug: doc.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = getHandbookDoc(slug);
  if (!doc) return {};
  return {
    title: { absolute: docWindowTitle(doc.slug, doc.title, 'handbook') },
    description: doc.blurb,
    icons: { icon: [{ url: '/pt-mark.svg', type: 'image/svg+xml' }] },
  };
}

/** /handbook/[slug] opens the same book at the named document. */
export default async function HandbookDocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getHandbookDoc(slug);
  if (!doc) notFound();
  const docs = buildBook('handbook');
  return (
    <DocsShell
      book='handbook'
      active={doc.slug}
      docs={docs}
      updated={requireUpdated('/handbook')}
      facts={bookFacts('handbook', docs)}
    />
  );
}
