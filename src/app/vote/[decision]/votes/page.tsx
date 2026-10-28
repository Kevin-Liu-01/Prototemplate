import { notFound } from 'next/navigation';

import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { isDecisionId } from '@/lib/vote/decisions';

import { votesBoot } from '../../server';
import YourVotes from '../../YourVotes';

type Params = { params: Promise<{ decision: string }> };

/* the head names the page, not the decision, so it says nothing to a reader the decision is closed to */
function votesRoute(id: string) {
  return seoRoute({
    path: `/vote/${id}/votes`,
    title: PAGE_NAMES.voteMine.name,
    kind: 'page',
    description: 'One voter in one team vote: each matchup they voted on and the options they liked, which they may change while the vote is open.',
    card: false,
  });
}

export async function generateMetadata({ params }: Params) {
  const { decision } = await params;
  if (!isDecisionId(decision)) notFound();
  return votesRoute(decision).metadata;
}

export const dynamic = 'force-dynamic';

/**
 * /vote/[decision]/votes: the voter's own matchups and likes in one
 * decision, each of which they may change while it is open. Without a
 * session it is the email form, as /vote/[decision] is; a decision the
 * voter may not open is a 404.
 */
export default async function VoteMinePage({ params }: Params) {
  const { decision } = await params;
  if (!isDecisionId(decision)) notFound();
  const boot = await votesBoot(decision);
  if (boot.kind === 'missing') notFound();
  return (
    <>
      <JsonLd nodes={votesRoute(decision).jsonLd} />
      <YourVotes boot={boot} id={decision} title={PAGE_NAMES.vote.name} />
    </>
  );
}
