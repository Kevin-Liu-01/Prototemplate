import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';

import Hub from './Hub';
import { hubBoot } from './server';

const route = seoRoute({
  path: '/vote',
  title: PAGE_NAMES.vote.name,
  kind: 'page',
  description: 'The team votes, each one a set of options compared two at a time, with the progress of the voter signed in.',
  card: false,
});

export const metadata = route.metadata;

export const dynamic = 'force-dynamic';

/**
 * /vote: the email form, then the decisions this voter can see, read on
 * the server from the session cookie so the first paint is the right one.
 * The vote pages are private (src/lib/seo/policy.ts, PRIVATE_PATHS):
 * noindex, nofollow, out of the sitemap, /llms.txt and the search index,
 * and with no social card (seoRoute card: false).
 */
export default async function VotePage() {
  const boot = await hubBoot();
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <Hub boot={boot} title={PAGE_NAMES.vote.name} />
    </>
  );
}
