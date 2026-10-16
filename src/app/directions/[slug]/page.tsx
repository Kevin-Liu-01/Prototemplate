import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { DIRECTION_PAGE_SLUGS, getDirection } from '@/lib/directions';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { requireUpdated } from '@/lib/updated';

import DirectionViewer from '../DirectionViewer';
import { directionDescription } from '../descriptions';

export function generateStaticParams() {
  return DIRECTION_PAGE_SLUGS.map((slug) => ({ slug }));
}

export const dynamicParams = false;

type Params = { params: Promise<{ slug: string }> };

/**
 * The head of a direction's presentation page: indexed, since the writing
 * and the captures here are the lab's own, while the study at /d/<slug>
 * stays noindex. Home, the gallery, is its parent; the card draws the
 * direction's dark capture.
 */
function directionRoute(slug: string) {
  const direction = getDirection(slug);
  if (!direction || direction.reference) notFound();
  return seoRoute({
    path: `/directions/${direction.slug}`,
    title: direction.name,
    section: 'Directions',
    kind: 'direction',
    description: directionDescription(direction.slug),
    updated: requireUpdated(`/directions/${direction.slug}`),
  });
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  return directionRoute(slug).metadata;
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
  const route = directionRoute(slug);
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <DirectionViewer key={slug} slug={slug} updated={requireUpdated(`/directions/${slug}`)} />
    </>
  );
}
