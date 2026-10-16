import { notFound } from 'next/navigation';

import { seoRoute } from '@/lib/seo/route';

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
 */
export default function MissingPage() {
  notFound();
}
