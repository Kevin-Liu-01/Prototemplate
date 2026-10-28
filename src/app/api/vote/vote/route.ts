/* POST {left, right, winner}: the matchup the schedule offers, by the
   aliases the voter's state carries; 409 when the pair is voted or is not
   the open one. */
import { isLogoKey } from '@/lib/vote/config';
import { currentSession, fail, json, readBody, route } from '@/lib/vote/api';
import { writeVote } from '@/lib/vote/store';
import { contextOf, loadVoter, stateOf } from '@/lib/vote/views';

import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = route(async (req: NextRequest) => {
  const session = await currentSession();
  if (!session) return fail(401, 'Enter your email first.');
  const body = await readBody(req);
  const sentLeft = body?.left;
  const sentRight = body?.right;
  if (!isLogoKey(sentLeft) || !isLogoKey(sentRight) || sentLeft === sentRight) return fail(400, 'Send left, right and winner.');
  if (body?.winner !== sentLeft && body?.winner !== sentRight) return fail(400, 'The winner is left or right.');
  const parts = await loadVoter(session.voterId);
  if (!parts) return fail(401, 'Enter your email first.');
  const ctx = contextOf(parts);
  const left = ctx.keyOf.get(sentLeft);
  const right = ctx.keyOf.get(sentRight);
  if (!left || !right) return fail(409, 'That pair is no longer open.');
  if (parts.votes.some((vote) => (vote.winner === left && vote.loser === right) || (vote.winner === right && vote.loser === left))) {
    return fail(409, 'You already voted on this pair.');
  }
  /* only the pair the schedule offers counts, so no ballot can vote every pair */
  const open = ctx.sched.pair;
  if (!open || !((open.left === left && open.right === right) || (open.left === right && open.right === left))) {
    return fail(409, 'That pair is no longer open.');
  }
  const winner = body?.winner === sentLeft ? left : right;
  const loser = winner === left ? right : left;
  await writeVote({ winner, loser, left, right, voterId: session.voterId, deviceId: session.deviceId });
  parts.votes.push({ voterId: session.voterId, ts: Date.now(), winner, loser, pathname: '' });
  return json(stateOf(contextOf(parts)));
});
