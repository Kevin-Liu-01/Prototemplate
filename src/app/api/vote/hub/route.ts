/* GET the hub: the voter and every decision they may see, with their
   progress in each; empty without a session. Sets the device cookie on a
   first visit. */
import { clearSession, currentDevice, currentSession, json, route, setDevice } from '@/lib/vote/api';
import { EMPTY_HUB, hubView } from '@/lib/vote/views';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  const [session, device] = await Promise.all([currentSession(), currentDevice()]);
  const hub = session ? await hubView(session.voterId) : null;
  const res = json(hub ?? EMPTY_HUB);
  if (device.fresh) setDevice(res, device.deviceId);
  /* a session whose voter is gone (another namespace) is dropped */
  if (session && !hub) clearSession(res);
  return res;
});
