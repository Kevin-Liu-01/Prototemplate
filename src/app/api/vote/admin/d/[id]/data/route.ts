/* GET one decision's settings, options, voters and head-to-head counts, for the admin. */
import { isDecisionId } from '@/lib/vote/decisions';
import { fail, isAdmin, json, route } from '@/lib/vote/api';
import { adminView } from '@/lib/vote/views';

import type { DecisionParams } from '@/lib/vote/api';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = route(async (_req: NextRequest, { params }: DecisionParams) => {
  if (!(await isAdmin())) return fail(401, 'Sign in with the admin key.');
  const { id } = await params;
  const data = isDecisionId(id) ? await adminView(id) : null;
  return data ? json(data) : fail(404, 'No such decision.');
});
