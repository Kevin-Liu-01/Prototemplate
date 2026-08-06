import { notFound } from 'next/navigation';

import DocsShell, { readDoc } from '../DocsShell';
import { DOCS, getDoc } from '../registry';

export function generateStaticParams() {
  return DOCS.map((doc) => ({ slug: doc.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDoc(slug);
  return {
    title: doc ? `${doc.title} — Prototemplate` : 'Docs — Prototemplate',
    description: doc?.blurb,
    icons: { icon: [{ url: '/pt-mark.svg', type: 'image/svg+xml' }] },
  };
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDoc(slug);
  if (!doc) notFound();
  return <DocsShell active={doc.slug} source={readDoc(doc.file)} />;
}
