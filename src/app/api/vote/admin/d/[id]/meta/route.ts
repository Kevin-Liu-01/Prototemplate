/* POST {title?, question?, status?, access?, appearances?, likes?, order?}:
   changes a decision's settings. The kind is set when the decision is
   made. Access is a list or text of exact emails and @domain entries, or
   '*' for any email. */
import { checkMetaPatch, isDecisionId } from '@/lib/vote/decisions';
import { fail, isAdmin, json, readBody, route } from '@/lib/vote/api';
import { parseAccess } from '@/lib/vote/identity';
import { decision, writeDecision } from '@/lib/vote/store';

import type { DecisionParams } from '@/lib/vote/api';
import type { DecisionMeta } from '@/lib/vote/types';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = route(async (req: NextRequest, { params }: DecisionParams) => {
  if (!(await isAdmin())) return fail(401, 'Sign in with the admin key.');
  const { id } = await params;
  if (!isDecisionId(id)) return fail(404, 'No such decision.');
  const body = await readBody(req);
  if (!body) return fail(400, 'Send the settings to change.');
  if (body.kind !== undefined || body.id !== undefined) return fail(400, 'The id and kind are set when a decision is made.');
  const checked = checkMetaPatch(body);
  if ('error' in checked) return fail(400, checked.error);
  const next: Partial<DecisionMeta> = { ...checked.patch };
  if (body.access !== undefined) {
    const access = parseAccess(body.access);
    if ('error' in access) return fail(400, access.error);
    next.access = access.access;
  }
  if (!Object.keys(next).length) return fail(400, 'Send the settings to change.');
  const meta = await decision(id, true);
  if (!meta) return fail(404, 'No such decision.');
  const saved: DecisionMeta = { ...meta, ...next };
  await writeDecision(saved);
  return json({ ok: true, decision: saved });
});
