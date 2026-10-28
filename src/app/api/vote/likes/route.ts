/* POST {liked}: every logo the voter likes, by the aliases their state
   carries, once their matchups are done. */
import { isLogoKey } from '@/lib/vote/config';
import { currentSession, fail, json, readBody, route } from '@/lib/vote/api';
import { writeLikes } from '@/lib/vote/store';
import { contextOf, loadVoter, stateOf } from '@/lib/vote/views';
import { getClientIp, isRateLimited } from '@/lib/rate-limit';

import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = route(async (req: NextRequest) => {
  if (isRateLimited('vote-likes', getClientIp(req), 30)) {
    return fail(429, 'Too many tries. Wait a minute and try again.');
  }
  const session = await currentSession();
  if (!session) return fail(401, 'Enter your email first.');
  const body = await readBody(req);
  if (!Array.isArray(body?.liked)) return fail(400, 'Send the logos you like.');
  const parts = await loadVoter(session.voterId);
  if (!parts) return fail(401, 'Enter your email first.');
  const ctx = contextOf(parts);
  if (ctx.sched.pair) return fail(409, 'Finish the matchups first.');
  const liked = [
    ...new Set(
      (body.liked as unknown[])
        .filter(isLogoKey)
        .map((alias) => ctx.keyOf.get(alias))
        .filter((key): key is string => key !== undefined)
    ),
  ];
  if (!liked.length) return fail(400, 'Pick at least one logo you like.');
  await writeLikes(session.voterId, liked, ctx.keys);
  parts.latest = { liked, seen: ctx.keys, ts: Date.now() };
  return json(stateOf(contextOf(parts)));
});
