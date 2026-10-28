import { notFound, redirect } from 'next/navigation';

import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { isDecisionId } from '@/lib/vote/decisions';

import Ranking from '../../Ranking';
import { resultsBoot } from '../../server';
import Unavailable from '../../Unavailable';

type Params = { params: Promise<{ decision: string }> };

function resultsRoute(id: string) {
  return seoRoute({
    path: `/vote/${id}/results`,
    title: PAGE_NAMES.voteResults.name,
    kind: 'page',
    description: 'The ranking of one team vote: Elo ratings from the head-to-head votes, each record, and how many voters liked each option.',
    card: false,
  });
}

export async function generateMetadata({ params }: Params) {
  const { decision } = await params;
  if (!isDecisionId(decision)) notFound();
  return resultsRoute(decision).metadata;
}

export const dynamic = 'force-dynamic';

/**
 * /vote/[decision]/results: open to a voter who has finished an open
 * decision, to every voter on a closed one, and to the admin; a voter who
 * has not finished goes back to the ballot.
 */
export default async function VoteResultsPage({ params }: Params) {
  const { decision } = await params;
  if (!isDecisionId(decision)) notFound();
  const boot = await resultsBoot(decision);
  if (boot.kind === 'missing') notFound();
  if (boot.kind === 'denied') redirect(`/vote/${decision}`);
  return (
    <>
      <JsonLd nodes={resultsRoute(decision).jsonLd} />
      {boot.kind === 'ready' ? (
        <Ranking initial={boot.data.results} at={boot.at} id={decision} admin={boot.data.admin} />
      ) : (
        <Unavailable title={PAGE_NAMES.voteResults.name} kind={boot.kind} />
      )}
    </>
  );
}
