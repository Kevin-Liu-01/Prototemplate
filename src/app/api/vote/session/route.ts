/* POST {email}: starts or resumes the voter that email names on this
   device, when the email is on the vote (VOTE_ALLOWED, else the team's
   domain). */
import { currentDevice, fail, json, readBody, route, setDevice, setSession, voteSecret } from '@/lib/vote/api';
import { voteAllowList } from '@/lib/vote/config';
import { emailDomain, isAllowedEmail, normalizeEmail, voterIdFor } from '@/lib/vote/identity';
import { ensureVoter, linkDevice } from '@/lib/vote/store';
import { voterState } from '@/lib/vote/views';
import { getClientIp, isRateLimited } from '@/lib/rate-limit';

import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = route(async (req: NextRequest) => {
  if (isRateLimited('vote-session', getClientIp(req), 30)) {
    return fail(429, 'Too many tries. Wait a minute and try again.');
  }
  const body = await readBody(req);
  const email = normalizeEmail(body?.email);
  if (!email) return fail(400, 'Enter a valid email address.');
  if (!isAllowedEmail(email, voteAllowList())) return fail(403, 'This email is not on the vote.');
  const voterId = voterIdFor(voteSecret(), email);
  const device = await currentDevice();
  await ensureVoter({ voterId, email, domain: emailDomain(email), createdAt: new Date().toISOString() });
  await linkDevice(device.deviceId, voterId);
  const state = await voterState(voterId);
  if (!state) return fail(500, 'Something went wrong. Try again.');
  const res = json(state);
  setSession(res, voterId, device.deviceId);
  if (device.fresh) setDevice(res, device.deviceId);
  return res;
});
