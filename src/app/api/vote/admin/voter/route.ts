/* POST {voterId, excluded}: leaves a voter out of the results, or counts them again. */
import { isVoterId } from '@/lib/vote/config';
import { fail, isAdmin, json, readBody, route } from '@/lib/vote/api';
import { setExcluded } from '@/lib/vote/store';

import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = route(async (req: NextRequest) => {
  if (!(await isAdmin())) return fail(401, 'Sign in with the admin key.');
  const body = await readBody(req);
  const voterId = body?.voterId;
  const excluded = body?.excluded;
  if (!isVoterId(voterId) || typeof excluded !== 'boolean') return fail(400, 'Send a voterId and excluded.');
  await setExcluded(voterId, excluded);
  return json({ ok: true });
});
