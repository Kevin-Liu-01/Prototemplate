/* POST: signs the admin out on this browser. */
import { clearAdmin, json, route } from '@/lib/vote/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = route(async () => {
  const res = json({ ok: true });
  clearAdmin(res);
  return res;
});
