/* GET the voter's own votes in one decision: every matchup they voted on
   among the active options, newest matchup first, with the vote that
   counts, and their latest likes. 404 when the decision does not open for
   this voter (a draft, archived, or their email is not on its list). */
import { isDecisionId } from '@/lib/vote/decisions';
import { clearSession, currentSession, fail, isAdmin, json, route } from '@/lib/vote/api';
import { getVoter } from '@/lib/vote/store';
import { myVotes } from '@/lib/vote/views';

import type { DecisionParams } from '@/lib/vote/api';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = route(async (_req: NextRequest, { params }: DecisionParams) => {
  const { id } = await params;
  if (!isDecisionId(id)) return fail(404, 'No such vote.');
  const [session, admin] = await Promise.all([currentSession(), isAdmin()]);
  const voter = session ? await getVoter(session.voterId) : null;
  const mine = session && voter ? await myVotes(session.voterId, id, admin) : null;
  const res = !voter ? fail(401, 'Enter your email first.') : mine ? json(mine) : fail(404, 'No such vote.');
  /* a session whose voter is gone (another namespace) is dropped */
  if (session && !voter) clearSession(res);
  return res;
});
