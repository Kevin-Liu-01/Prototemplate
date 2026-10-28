/**
 * The first paint's reads for every vote page. Each page reads on the
 * server what its API route answers (the same views and the same access
 * rules), so the right step paints first and no screen fetches on mount.
 * Every read fails closed: a deployment without the store or a secret gives
 * 'off', and a read that throws gives 'error'. A decision the reader may
 * not open is 'missing', which the page answers with a 404, so a page never
 * tells a voter that a decision they are not on exists.
 */
import { currentSession, isAdmin } from '@/lib/vote/api';
import { missingEnv } from '@/lib/vote/config';
import { adminList, adminView, EMPTY_HUB, hubView, resultsAccess, resultsView, voterState } from '@/lib/vote/views';
import type { AdminData, AdminList, HubState, Results, VoteState } from '@/lib/vote/types';

import type { Boot } from './types';

type Missing = { kind: 'missing' };

/** The hub for /vote, as GET /api/vote/hub answers it; the email form without a session. */
export async function hubBoot(): Promise<Boot<HubState>> {
  if (missingEnv().length) return { kind: 'off' };
  try {
    const session = await currentSession();
    const hub = session ? await hubView(session.voterId) : null;
    return { kind: 'ready', data: hub ?? EMPTY_HUB, at: Date.now() };
  } catch {
    return { kind: 'error' };
  }
}

/**
 * The voter's state in one decision for /vote/[decision], as GET
 * /api/vote/d/[id]/state answers it; null without a session (the email
 * form). A closed decision brings its results, which the page shows in
 * place of the ballot.
 */
export async function decisionBoot(id: string): Promise<Boot<{ state: VoteState | null; results: Results | null; admin: boolean }> | Missing> {
  if (missingEnv().length) return { kind: 'off' };
  try {
    const session = await currentSession();
    if (!session) return { kind: 'ready', data: { state: null, results: null, admin: false }, at: Date.now() };
    const admin = await isAdmin();
    const state = await voterState(session.voterId, id, admin);
    if (!state) return { kind: 'missing' };
    const closed = state.decision.status === 'closed' && state.results;
    const results = closed ? await resultsView(id, null, admin) : null;
    return { kind: 'ready', data: { state, results, admin }, at: Date.now() };
  } catch {
    return { kind: 'error' };
  }
}

/** One decision's ranking for /vote/[decision]/results; 'denied' sends a voter who has not finished back to the ballot. */
export async function resultsBoot(id: string): Promise<Boot<{ results: Results; admin: boolean }> | Missing | { kind: 'denied' }> {
  if (missingEnv().length) return { kind: 'off' };
  try {
    const [admin, session] = await Promise.all([isAdmin(), currentSession()]);
    const access = await resultsAccess(session?.voterId ?? null, id, admin);
    if (access !== 'ok') return { kind: access };
    const results = await resultsView(id, null, admin);
    return results ? { kind: 'ready', data: { results, admin }, at: Date.now() } : { kind: 'missing' };
  } catch {
    return { kind: 'error' };
  }
}

/** Every decision for /vote/admin; 'signed-out' shows the key form. */
export async function adminListBoot(): Promise<Boot<AdminList> | { kind: 'signed-out' }> {
  if (missingEnv().length) return { kind: 'off' };
  try {
    if (!(await isAdmin())) return { kind: 'signed-out' };
    return { kind: 'ready', data: await adminList(), at: Date.now() };
  } catch {
    return { kind: 'error' };
  }
}

/** One decision's panel for /vote/admin/[decision]; signed out, the key form, which says nothing of the decision. */
export async function adminDecisionBoot(id: string): Promise<Boot<AdminData> | Missing | { kind: 'signed-out' }> {
  if (missingEnv().length) return { kind: 'off' };
  try {
    if (!(await isAdmin())) return { kind: 'signed-out' };
    const data = await adminView(id);
    return data ? { kind: 'ready', data, at: Date.now() } : { kind: 'missing' };
  } catch {
    return { kind: 'error' };
  }
}
