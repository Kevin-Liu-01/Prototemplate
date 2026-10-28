import { notFound } from 'next/navigation';

import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';
import { isDecisionId } from '@/lib/vote/decisions';

import Ranking from '../Ranking';
import { decisionBoot } from '../server';
import VoteApp from '../VoteApp';

type Params = { params: Promise<{ decision: string }> };

/* the head names the page, not the decision, so it says nothing to a reader the decision is closed to */
function decisionRoute(id: string) {
  return seoRoute({
    path: `/vote/${id}`,
    title: PAGE_NAMES.vote.name,
    kind: 'page',
    description: 'One team vote: its options compared two at a time, then every option the voter likes, ranked by Elo once done.',
    card: false,
  });
}

export async function generateMetadata({ params }: Params) {
  const { decision } = await params;
  if (!isDecisionId(decision)) notFound();
  return decisionRoute(decision).metadata;
}

export const dynamic = 'force-dynamic';

/**
 * /vote/[decision]: the voter's current step in one decision, read on the
 * server so the first paint is the right step: the email form without a
 * session, then the matchups, the likes and done. A closed decision shows
 * its results. A decision the voter may not open is a 404.
 */
export default async function VoteDecisionPage({ params }: Params) {
  const { decision } = await params;
  if (!isDecisionId(decision)) notFound();
  const boot = await decisionBoot(decision);
  if (boot.kind === 'missing') notFound();
  const results = boot.kind === 'ready' ? boot.data.results : null;
  return (
    <>
      <JsonLd nodes={decisionRoute(decision).jsonLd} />
      {boot.kind === 'ready' && results ? (
        <Ranking initial={results} at={boot.at} id={decision} admin={boot.data.admin} />
      ) : (
        <VoteApp
          boot={boot.kind === 'ready' ? { kind: 'ready', data: boot.data.state, at: boot.at } : boot}
          id={decision}
          title={PAGE_NAMES.vote.name}
        />
      )}
    </>
  );
}
