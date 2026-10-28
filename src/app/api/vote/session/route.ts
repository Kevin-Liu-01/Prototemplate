/* POST {email}: starts or resumes the voter that email names on this
   device, when the email is on at least one open or closed decision's
   access list; nothing is written for an email on none. Answers the hub. */
import { currentDevice, fail, json, readBody, route, setDevice, setSession, voteSecret } from '@/lib/vote/api';
import { emailDomain, normalizeEmail, voterIdFor } from '@/lib/vote/identity';
import { decisions, ensureVoter, linkDevice } from '@/lib/vote/store';
import { hubView, visibleTo } from '@/lib/vote/views';
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
  /* read past this instance's copy, so a decision opened a moment ago lets its voters in */
  if (!visibleTo(email, await decisions(true)).length) return fail(403, 'This email is not on any vote.');
  const voterId = voterIdFor(voteSecret(), email);
  const device = await currentDevice();
  await ensureVoter({ voterId, email, domain: emailDomain(email), createdAt: new Date().toISOString() });
  await linkDevice(device.deviceId, voterId);
  const hub = await hubView(voterId);
  if (!hub) return fail(500, 'Something went wrong. Try again.');
  const res = json(hub);
  setSession(res, voterId, device.deviceId);
  if (device.fresh) setDevice(res, device.deviceId);
  return res;
});
