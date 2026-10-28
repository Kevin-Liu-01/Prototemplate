/* GET the voter's state; sets the device cookie on a first visit. */
import { clearSession, currentDevice, currentSession, json, route, setDevice } from '@/lib/vote/api';
import { EMPTY_STATE, voterState } from '@/lib/vote/views';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  const [session, device] = await Promise.all([currentSession(), currentDevice()]);
  const state = session ? await voterState(session.voterId) : null;
  const res = json(state ?? EMPTY_STATE);
  if (device.fresh) setDevice(res, device.deviceId);
  /* a session whose voter is gone (another namespace) is dropped */
  if (session && !state) clearSession(res);
  return res;
});
