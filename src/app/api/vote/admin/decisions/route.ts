/* GET every decision with its counts, for the admin. POST {title, id?,
   kind, question?}: makes a draft decision; the id comes from the title
   when none is sent, and an id in use is refused. A new decision's access
   list is VOTE_ALLOWED, else the team's domain. */
import { defaultAccess } from '@/lib/vote/config';
import { checkNewDecision, DEFAULT_APPEARANCES } from '@/lib/vote/decisions';
import { fail, isAdmin, json, readBody, route } from '@/lib/vote/api';
import { createDecision, decisions } from '@/lib/vote/store';
import { adminList } from '@/lib/vote/views';

import type { DecisionMeta } from '@/lib/vote/types';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  if (!(await isAdmin())) return fail(401, 'Sign in with the admin key.');
  return json(await adminList());
});

export const POST = route(async (req: NextRequest) => {
  if (!(await isAdmin())) return fail(401, 'Sign in with the admin key.');
  const body = await readBody(req);
  if (!body) return fail(400, 'Send a title and a kind.');
  const existing = await decisions(true);
  const checked = checkNewDecision(body, new Set(existing.map((meta) => meta.id)));
  if ('error' in checked) return fail(checked.status, checked.error);
  const meta: DecisionMeta = {
    ...checked.value,
    status: 'draft',
    access: defaultAccess(),
    appearances: DEFAULT_APPEARANCES,
    likes: true,
    createdAt: new Date().toISOString(),
    order: Math.max(-1, ...existing.map((other) => other.order)) + 1,
  };
  if (!(await createDecision(meta))) return fail(409, 'A decision with that id exists.');
  return json({ ok: true, decision: meta });
});
