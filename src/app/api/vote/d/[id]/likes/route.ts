/* POST {liked}: every option the voter likes in one decision, by the
   aliases their state carries, once their matchups are done. 409 while a
   pair is open, once the likes are in for every option (a stale page
   cannot put back older picks), when the decision is not open, or when it
   has no likes step. */
import { isOptionKey } from '@/lib/vote/config';
import { isDecisionId, votingOpen } from '@/lib/vote/decisions';
import { currentSession, fail, isAdmin, json, readBody, route } from '@/lib/vote/api';
import { writeLikes } from '@/lib/vote/store';
import { contextOf, loadVoter, stateOf } from '@/lib/vote/views';
import { getClientIp, isRateLimited } from '@/lib/rate-limit';

import type { DecisionParams } from '@/lib/vote/api';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = route(async (req: NextRequest, { params }: DecisionParams) => {
  if (isRateLimited('vote-likes', getClientIp(req), 30)) {
    return fail(429, 'Too many tries. Wait a minute and try again.');
  }
  const { id } = await params;
  if (!isDecisionId(id)) return fail(404, 'No such vote.');
  const session = await currentSession();
  if (!session) return fail(401, 'Enter your email first.');
  const body = await readBody(req);
  if (!Array.isArray(body?.liked)) return fail(400, 'Send the options you like.');
  const parts = await loadVoter(session.voterId, id, await isAdmin());
  if (!parts) return fail(404, 'No such vote.');
  if (!votingOpen(parts.meta.status)) return fail(409, 'This vote is not open.');
  if (!parts.meta.likes) return fail(409, 'This vote has no likes step.');
  const ctx = contextOf(parts);
  if (ctx.sched.pair) return fail(409, 'Finish the matchups first.');
  if (!ctx.needsLikes) return fail(409, 'Your likes are in.');
  const liked = [
    ...new Set(
      (body.liked as unknown[])
        .filter(isOptionKey)
        .map((alias) => ctx.keyOf.get(alias))
        .filter((key): key is string => key !== undefined)
    ),
  ];
  if (!liked.length) return fail(400, 'Pick at least one you like.');
  await writeLikes(id, session.voterId, liked, ctx.keys);
  parts.latest = { liked, seen: ctx.keys, ts: Date.now() };
  return json(stateOf(contextOf(parts)));
});
