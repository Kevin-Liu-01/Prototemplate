import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';

import { voterBoot } from './server';
import VoteApp from './VoteApp';

const route = seoRoute({
  path: '/vote',
  title: PAGE_NAMES.vote.name,
  kind: 'page',
  description: 'A private vote in which the team compares logos two at a time and then picks every logo it likes.',
});

export const metadata = route.metadata;

export const dynamic = 'force-dynamic';

/**
 * /vote: the voter's current step, read on the server from the session
 * cookie so the first paint is the right step. The vote pages are private
 * (src/lib/seo/policy.ts, PRIVATE_PATHS): noindex, nofollow, and out of the
 * sitemap, /llms.txt and the search index.
 */
export default async function VotePage() {
  const boot = await voterBoot();
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <VoteApp boot={boot} title={PAGE_NAMES.vote.name} />
    </>
  );
}
