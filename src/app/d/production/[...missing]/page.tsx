import { notFound } from 'next/navigation';

import { seoRoute } from '@/lib/seo/route';

import ProductionNotFound from '../not-found';

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/* Kind error: noindex and no canonical, the head the 404 it throws to
   carries too. */
const route = seoRoute({
  path: '/d/production/missing',
  title: 'Page not found',
  section: 'Shipped',
  kind: 'error',
  description: 'The page you asked for is not on the shipped General Translation site.',
});

export const metadata = route.metadata;

/**
 * The catch-all under /d/production, 1-1 with the real site's own:
 * apps/landing/src/app/[locale]/[...missing]/page.tsx is four lines that
 * call notFound() and nothing else. Claiming every unmatched address and
 * then throwing is what makes the response a real 404 — Next renders the
 * sibling not-found.tsx (../not-found.tsx, the designed horizon band) and
 * sets the status. A catch-all that RETURNED the band would answer 200,
 * which is the thing this control exists to avoid.
 *
 * One request answers 200 with the band: ?state=not-found, which the docs'
 * error-page plate frames (src/components/docs/demos/pages/page-templates.ts),
 * so a page that frames the band logs no failed load. Every other address
 * under /d/production that matches no page still answers 404.
 */
export default async function MissingPage({ searchParams }: PageProps) {
  const { state } = await searchParams;
  if (state !== 'not-found') notFound();
  return <ProductionNotFound />;
}
