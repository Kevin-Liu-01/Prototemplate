import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ARCHIVE, archiveDate, getArchiveEntry } from '@/lib/archive';

import ArchiveViewer from './ArchiveViewer';

export function generateStaticParams() {
  return ARCHIVE.map((item) => ({ slug: item.slug }));
}

export const dynamicParams = false;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const item = getArchiveEntry(slug);
  if (!item) return { title: { absolute: 'Archive' } };
  return {
    title: { absolute: `${item.name}, archived` },
    description: `The retired ${item.name} direction, captured at ${item.width} pixels wide on ${archiveDate(item)} before its route was deleted.`,
    icons: { icon: [{ url: '/pt-mark.svg', type: 'image/svg+xml' }] },
  };
}

/**
 * /archive/[slug]: one retired version on the viewer shell. The list on the
 * left is the site map with the archive as its last section; the sheet
 * holds the full-page capture under its record. The key on the viewer makes
 * a change of slug a fresh mount, so the shell's active item always matches
 * the address.
 */
export default async function ArchivePage({ params }: Params) {
  const { slug } = await params;
  const item = getArchiveEntry(slug);
  if (!item) notFound();
  return <ArchiveViewer key={item.slug} slug={item.slug} />;
}
