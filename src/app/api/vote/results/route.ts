/* GET the ranking, optionally for one domain's voters; for a voter who has
   finished, or the admin. A voter may filter only to a domain the results
   list, one with enough voters that no single ballot shows. */
import { currentSession, fail, isAdmin, json, route } from '@/lib/vote/api';
import { contextOf, loadVoter, resultsView } from '@/lib/vote/views';

import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = route(async (req: NextRequest) => {
  const domain = (req.nextUrl.searchParams.get('domain') ?? '').trim().toLowerCase();
  if (domain && !/^[a-z0-9.-]{1,253}$/.test(domain)) return fail(400, 'That is not a domain.');
  const admin = await isAdmin();
  if (!admin) {
    const session = await currentSession();
    const parts = session ? await loadVoter(session.voterId) : null;
    if (!parts || !contextOf(parts).complete) return fail(403, 'Finish voting to see the results.');
  }
  const results = await resultsView(domain || null, admin);
  if (!results) return fail(403, 'That group has too few voters to show.');
  return json(results);
});
