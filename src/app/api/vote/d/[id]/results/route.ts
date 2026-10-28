/* GET one decision's ranking, optionally for one domain's voters: for a
   voter who finished an open decision, every voter on a closed one's list,
   or the admin. A voter may filter only to a domain the results list, one
   with enough voters that no single ballot shows. */
import { isDecisionId } from '@/lib/vote/decisions';
import { currentSession, fail, isAdmin, json, route } from '@/lib/vote/api';
import { resultsAccess, resultsView } from '@/lib/vote/views';

import type { DecisionParams } from '@/lib/vote/api';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest, { params }: DecisionParams) => {
  const { id } = await params;
  if (!isDecisionId(id)) return fail(404, 'No such vote.');
  const domain = (req.nextUrl.searchParams.get('domain') ?? '').trim().toLowerCase();
  if (domain && !/^[a-z0-9.-]{1,253}$/.test(domain)) return fail(400, 'That is not a domain.');
  const [session, admin] = await Promise.all([currentSession(), isAdmin()]);
  const { access } = await resultsAccess(session?.voterId ?? null, id, admin);
  if (access === 'missing') return fail(404, 'No such vote.');
  if (access === 'denied') return fail(403, 'Finish voting to see the results.');
  const results = await resultsView(id, domain || null, admin);
  if (!results) return fail(403, 'That group has too few voters to show.');
  return json(results);
});
