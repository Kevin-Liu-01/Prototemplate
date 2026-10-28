/* GET the voter's state in one decision: the open pair, the likes step or
   done. 404 when the decision does not open for this voter (a draft,
   archived, or their email is not on its list). */
import { isDecisionId } from '@/lib/vote/decisions';
import { clearSession, currentDevice, currentSession, fail, isAdmin, json, route, setDevice } from '@/lib/vote/api';
import { getVoter } from '@/lib/vote/store';
import { voterState } from '@/lib/vote/views';

import type { DecisionParams } from '@/lib/vote/api';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = route(async (_req: NextRequest, { params }: DecisionParams) => {
  const { id } = await params;
  if (!isDecisionId(id)) return fail(404, 'No such vote.');
  const [session, device, admin] = await Promise.all([currentSession(), currentDevice(), isAdmin()]);
  const voter = session ? await getVoter(session.voterId) : null;
  const state = session && voter ? await voterState(session.voterId, id, admin) : null;
  const res = !voter ? fail(401, 'Enter your email first.') : state ? json(state) : fail(404, 'No such vote.');
  if (device.fresh) setDevice(res, device.deviceId);
  /* a session whose voter is gone (another namespace) is dropped */
  if (session && !voter) clearSession(res);
  return res;
});
