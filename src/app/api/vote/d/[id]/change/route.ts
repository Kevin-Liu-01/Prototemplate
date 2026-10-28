/* POST {left, right, winner}: changes the winner of a matchup the voter
   voted on in one decision, by the aliases their votes carry. The change is
   a new vote, and the latest vote on a pair counts. 409 when the decision
   is not open, the pair is not two active options, the voter has no vote on
   it, the winner is already theirs (or another change of it, sent at the
   same time, was taken), or they have cast MAX_CASTS votes on it; nothing
   is written then. */
import { checkChange } from '@/lib/vote/change';
import { isOptionKey } from '@/lib/vote/config';
import { isDecisionId, votingOpen } from '@/lib/vote/decisions';
import { currentSession, fail, isAdmin, json, readBody, route } from '@/lib/vote/api';
import { claimChange, releaseChange, writeVote } from '@/lib/vote/store';
import { castsOn, contextOf, loadVoter, myVoteOf } from '@/lib/vote/views';

import type { DecisionParams } from '@/lib/vote/api';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = route(async (req: NextRequest, { params }: DecisionParams) => {
  const { id } = await params;
  if (!isDecisionId(id)) return fail(404, 'No such vote.');
  const session = await currentSession();
  if (!session) return fail(401, 'Enter your email first.');
  const body = await readBody(req);
  const sentLeft = body?.left;
  const sentRight = body?.right;
  if (!isOptionKey(sentLeft) || !isOptionKey(sentRight) || sentLeft === sentRight) return fail(400, 'Send left, right and winner.');
  if (body?.winner !== sentLeft && body?.winner !== sentRight) return fail(400, 'The winner is left or right.');
  const parts = await loadVoter(session.voterId, id, await isAdmin());
  if (!parts) return fail(404, 'No such vote.');
  const ctx = contextOf(parts);
  const left = ctx.keyOf.get(sentLeft);
  const right = ctx.keyOf.get(sentRight);
  const { counted, casts } = left && right ? castsOn(parts.votes, left, right) : { counted: null, casts: 0 };
  const check = checkChange({
    open: votingOpen(parts.meta.status),
    left,
    right,
    pick: body?.winner === sentLeft ? 'left' : 'right',
    counted: counted?.winner ?? null,
    casts,
  });
  if (!check.ok) return fail(409, check.error);
  /* a counted vote is replaced once: of changes sent at once, the first to claim it writes */
  if (!counted || !(await claimChange(id, session.voterId, counted))) return fail(409, 'That is already your vote.');
  const { winner, loser } = check;
  const vote = { decision: id, winner, loser, left: check.left, right: check.right, voterId: session.voterId, deviceId: session.deviceId };
  const ts = await writeVote(vote, counted.ts).catch(async (error: unknown) => {
    await releaseChange(id, session.voterId, counted).catch(() => undefined);
    throw error;
  });
  return json(myVoteOf(ctx, { ts, winner, loser }));
});
