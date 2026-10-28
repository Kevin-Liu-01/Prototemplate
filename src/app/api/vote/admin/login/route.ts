/* POST {key}: signs the admin in on this browser for 30 days. */
import { fail, json, readBody, route, setAdmin } from '@/lib/vote/api';
import { safeEqual } from '@/lib/vote/identity';
import { getClientIp, isRateLimited } from '@/lib/rate-limit';

import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = route(async (req: NextRequest) => {
  if (isRateLimited('vote-admin', getClientIp(req), 10)) {
    return fail(429, 'Too many tries. Wait a minute and try again.');
  }
  const body = await readBody(req);
  const key = typeof body?.key === 'string' ? body.key : '';
  if (!key || !safeEqual(key, process.env.VOTE_ADMIN_KEY ?? '')) return fail(401, 'That key is wrong.');
  const res = json({ ok: true });
  setAdmin(res);
  return res;
});
