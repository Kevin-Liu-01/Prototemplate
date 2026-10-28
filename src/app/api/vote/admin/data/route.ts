/* GET every logo, voter and head-to-head count, for the admin. */
import { fail, isAdmin, json, route } from '@/lib/vote/api';
import { adminView } from '@/lib/vote/views';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  if (!(await isAdmin())) return fail(401, 'Sign in with the admin key.');
  return json(await adminView());
});
