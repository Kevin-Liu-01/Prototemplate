/* POST: forgets the voter on this browser, so a shared machine can switch email. */
import { clearSession, json, route } from '@/lib/vote/api';
import { EMPTY_HUB } from '@/lib/vote/views';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = route(async () => {
  const res = json(EMPTY_HUB);
  clearSession(res);
  return res;
});
