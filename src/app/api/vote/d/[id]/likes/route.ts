/* POST {liked}: every option the voter likes in one decision, by the
   aliases their state carries, once their matchups are done. A voter whose
   likes are in may send them again to change them; the latest record
   counts. 409 while a pair is open, for a set the latest record already
   holds (a stale page sending the same picks), once the voter has written
   MAX_LIKES records, when the decision is not open, or when it has no
   likes step. */
import { checkLikes } from '@/lib/vote/change';
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
  const liked = (body.liked as unknown[])
    .filter(isOptionKey)
    .map((alias) => ctx.keyOf.get(alias))
    .filter((key): key is string => key !== undefined);
  const records = parts.latest?.records ?? 0;
  const record = checkLikes({ liked, keys: ctx.keys, latest: parts.latest, owes: ctx.needsLikes, records });
  if (!record.ok) return fail(record.status, record.error);
  await writeLikes(id, session.voterId, record.liked, record.seen);
  parts.latest = { liked: record.liked, seen: record.seen, ts: Date.now(), records: records + 1 };
  return json(stateOf(contextOf(parts)));
});
