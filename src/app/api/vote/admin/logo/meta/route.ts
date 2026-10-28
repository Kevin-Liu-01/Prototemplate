/* POST {key, name?, order?, hidden?}: renames, reorders, hides or shows a logo. */
import { isLogoKey, MAX_NAME_LENGTH } from '@/lib/vote/config';
import { fail, isAdmin, json, readBody, route } from '@/lib/vote/api';
import { registry, setHidden, updateLogoMeta } from '@/lib/vote/store';

import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = route(async (req: NextRequest) => {
  if (!(await isAdmin())) return fail(401, 'Sign in with the admin key.');
  const body = await readBody(req);
  const key = body?.key;
  if (!isLogoKey(key)) return fail(400, 'Send the logo key.');
  let name: string | undefined;
  if (body?.name !== undefined) {
    name = typeof body.name === 'string' ? body.name.trim().replace(/\s+/g, ' ') : '';
    if (!name || name.length > MAX_NAME_LENGTH || /\p{Cc}/u.test(name)) {
      return fail(400, `A name has 1 to ${MAX_NAME_LENGTH} characters.`);
    }
  }
  const order = body?.order;
  if (order !== undefined && !(typeof order === 'number' && Number.isFinite(order))) return fail(400, 'The order is a number.');
  const hidden = body?.hidden;
  if (hidden !== undefined && typeof hidden !== 'boolean') return fail(400, 'Hidden is true or false.');
  if (name === undefined && order === undefined && hidden === undefined) return fail(400, 'Send a name, an order or hidden.');
  if (!(await registry(true)).byKey.has(key)) return fail(404, 'No such logo.');
  if (name !== undefined || order !== undefined) await updateLogoMeta(key, { name, order });
  if (hidden !== undefined) await setHidden(key, hidden);
  return json({ ok: true });
});
