import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { DIRECTION_PAGE_SLUGS, getDirection } from '@/lib/directions';

import DirectionViewer from '../DirectionViewer';

export function generateStaticParams() {
  return DIRECTION_PAGE_SLUGS.map((slug) => ({ slug }));
}

export const dynamicParams = false;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const direction = getDirection(slug);
  if (!direction || direction.reference) return { title: 'Directions' };
  return {
    title: direction.name,
    description: direction.concept,
    icons: { icon: [{ url: '/pt-mark.svg', type: 'image/svg+xml' }] },
  };
}

/**
 * /directions/[slug]: one direction on the viewer shell. The list on the
 * left is the site map with this direction's row current; the sheet holds
 * the direction's book with its live page, its captures and, for a site,
 * its pages. The shipped reference has no page here: it answers
 * /d/production, and directionPageHref() sends every caller there. The key
 * on the viewer makes a change of slug a fresh mount.
 */
export default async function DirectionPage({ params }: Params) {
  const { slug } = await params;
  const direction = getDirection(slug);
  if (!direction || direction.reference) notFound();
  return <DirectionViewer key={direction.slug} slug={direction.slug} />;
}
