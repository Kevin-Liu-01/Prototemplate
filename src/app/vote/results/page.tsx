import { redirect } from 'next/navigation';

import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';

import { resultsBoot } from '../server';
import VoteResultsView from './VoteResultsView';

const route = seoRoute({
  path: '/vote/results',
  title: PAGE_NAMES.voteResults.name,
  kind: 'page',
  description: 'The ranking of the team logo vote: Elo ratings from the head-to-head votes, each record, and how many voters liked each logo.',
});

export const metadata = route.metadata;

export const dynamic = 'force-dynamic';

/**
 * /vote/results: open to a voter who has finished every matchup and the
 * likes, and to the admin; anyone else goes back to /vote to finish.
 */
export default async function VoteResultsPage() {
  const boot = await resultsBoot();
  if (boot.kind === 'denied') redirect('/vote');
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <VoteResultsView boot={boot} title={PAGE_NAMES.voteResults.name} />
    </>
  );
}
