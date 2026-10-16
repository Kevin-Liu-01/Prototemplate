import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ARCHIVE, archiveDate, getArchiveEntry } from '@/lib/archive';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';

import ArchiveViewer from './ArchiveViewer';

export function generateStaticParams() {
  return ARCHIVE.map((item) => ({ slug: item.slug }));
}

export const dynamicParams = false;

type Params = { params: Promise<{ slug: string }> };

/** The head of one archived capture: a page in the Archive section, indexed with the hub. */
function archiveRoute(slug: string) {
  const item = getArchiveEntry(slug);
  if (!item) notFound();
  return seoRoute({
    path: `/archive/${item.slug}`,
    title: item.name,
    section: 'Archive',
    kind: 'page',
    description: `The retired ${item.name} direction, captured at ${item.width} pixels wide on ${archiveDate(item)} before its route was deleted.`,
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  return archiveRoute(slug).metadata;
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
  const route = archiveRoute(slug);
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <ArchiveViewer key={slug} slug={slug} />
    </>
  );
}
