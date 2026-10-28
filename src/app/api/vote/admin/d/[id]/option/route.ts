/* POST {key, name?, text?, order?, hidden?}: renames, rewords (a text
   option only), reorders, hides or shows one option. A hidden option keeps
   its votes, and showing it again restores them. */
import { isOptionKey } from '@/lib/vote/config';
import { checkName, checkText, isDecisionId, MAX_NAME_LENGTH, MAX_TEXT_LENGTH } from '@/lib/vote/decisions';
import { fail, isAdmin, json, readBody, route } from '@/lib/vote/api';
import { decision, registry, setHidden, updateOption } from '@/lib/vote/store';

import type { DecisionParams } from '@/lib/vote/api';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ORDER_LIMIT = 1_000_000;

export const POST = route(async (req: NextRequest, { params }: DecisionParams) => {
  if (!(await isAdmin())) return fail(401, 'Sign in with the admin key.');
  const { id } = await params;
  if (!isDecisionId(id)) return fail(404, 'No such decision.');
  const body = await readBody(req);
  const key = body?.key;
  if (!isOptionKey(key)) return fail(400, 'Send the option key.');
  let name: string | undefined;
  if (body?.name !== undefined) {
    const checked = checkName(body.name);
    if (checked === null) return fail(400, `A name has 1 to ${MAX_NAME_LENGTH} characters.`);
    name = checked;
  }
  let text: string | undefined;
  if (body?.text !== undefined) {
    const checked = checkText(body.text);
    if (checked === null) return fail(400, `A text has at most ${MAX_TEXT_LENGTH} characters.`);
    text = checked;
  }
  const order = body?.order;
  if (order !== undefined && !(typeof order === 'number' && Number.isFinite(order) && Math.abs(order) <= ORDER_LIMIT)) {
    return fail(400, 'The order is a number.');
  }
  const hidden = body?.hidden;
  if (hidden !== undefined && typeof hidden !== 'boolean') return fail(400, 'Hidden is true or false.');
  if (name === undefined && text === undefined && order === undefined && hidden === undefined) {
    return fail(400, 'Send a name, a text, an order or hidden.');
  }
  const meta = await decision(id, true);
  if (!meta) return fail(404, 'No such decision.');
  if (text !== undefined && meta.kind !== 'text') return fail(400, 'Only a text option has a text.');
  if (!(await registry(id, true)).byKey.has(key)) return fail(404, 'No such option.');
  if (name !== undefined || text !== undefined || order !== undefined) await updateOption(id, key, { name, text, order });
  if (hidden !== undefined) await setHidden(id, key, hidden);
  return json({ ok: true });
});
