/**
 * The first paint's reads for /vote, /vote/results and /vote/admin. Each
 * page reads on the server what its API route answers (the same views and
 * the same access rules), so the right step paints first and no screen
 * fetches on mount. Every read fails closed: a deployment without the store
 * or a secret gives 'off', and a read that throws gives 'error'.
 */
import { currentSession, isAdmin } from '@/lib/vote/api';
import { missingEnv } from '@/lib/vote/config';
import { adminView, contextOf, EMPTY_STATE, loadVoter, resultsView, voterState } from '@/lib/vote/views';
import type { AdminData, Results, VoteState } from '@/lib/vote/types';

import type { Boot } from './types';

/** The voter's state for /vote, as GET /api/vote/state answers it. */
export async function voterBoot(): Promise<Boot<VoteState>> {
  if (missingEnv().length) return { kind: 'off' };
  try {
    const session = await currentSession();
    const state = session ? await voterState(session.voterId) : null;
    return { kind: 'ready', data: state ?? EMPTY_STATE };
  } catch {
    return { kind: 'error' };
  }
}

/** The ranking for /vote/results; 'denied' unless the voter has finished or the admin is signed in. */
export async function resultsBoot(): Promise<Boot<Results> | { kind: 'denied' }> {
  if (missingEnv().length) return { kind: 'off' };
  try {
    const admin = await isAdmin();
    if (!admin) {
      const session = await currentSession();
      const parts = session ? await loadVoter(session.voterId) : null;
      if (!parts || !contextOf(parts).complete) return { kind: 'denied' };
    }
    const data = await resultsView(null, admin);
    return data ? { kind: 'ready', data } : { kind: 'denied' };
  } catch {
    return { kind: 'error' };
  }
}

/** The admin panel's data for /vote/admin; 'signed-out' shows the key form. */
export async function adminBoot(): Promise<Boot<AdminData> | { kind: 'signed-out' }> {
  if (missingEnv().length) return { kind: 'off' };
  try {
    if (!(await isAdmin())) return { kind: 'signed-out' };
    return { kind: 'ready', data: await adminView() };
  } catch {
    return { kind: 'error' };
  }
}
