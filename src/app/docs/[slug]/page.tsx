import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { requireUpdated } from '@/lib/updated';

import { bookFacts, buildDocs } from '../book';
import DocsShell from '../DocsShell';
import { docWindowTitle, README_SLUG } from '../model';
import { DOCS, getDoc } from '../registry';

export function generateStaticParams() {
  return DOCS.map((doc) => ({ slug: doc.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDoc(slug);
  return {
    title: { absolute: doc ? docWindowTitle(doc.slug, doc.title) : docWindowTitle(README_SLUG, 'Readme') },
    description: doc?.blurb,
    icons: { icon: [{ url: '/pt-mark.svg', type: 'image/svg+xml' }] },
  };
}

/** /docs/[slug] opens the same book at the named document. */
export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();
  const docs = buildDocs();
  return (
    <DocsShell
      book='docs'
      active={doc.slug}
      docs={docs}
      updated={requireUpdated('/docs')}
      facts={bookFacts('docs', docs)}
    />
  );
}
