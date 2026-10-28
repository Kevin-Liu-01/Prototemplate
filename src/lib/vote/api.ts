/* What every vote route handler shares: JSON answers that are never cached,
   the closed answer when the deployment lacks the store or the secrets, the
   refusal of a post from another site, the size-limited JSON body read, and
   the three cookies (the voter session, the device, the admin). Cookies are
   read with next/headers and written on the response. */
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import {
  ADMIN_COOKIE,
  ADMIN_MAX_AGE,
  DEVICE_COOKIE,
  DEVICE_MAX_AGE,
  isDeviceId,
  isVoterId,
  MAX_JSON_BYTES,
  missingEnv,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from './config';
import { adminToken, newDeviceId, readAdminToken, readSessionToken, sessionToken } from './identity';

import type { NextRequest } from 'next/server';

const NO_STORE = { 'Cache-Control': 'no-store, max-age=0' };

export function json<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status, headers: NO_STORE });
}

export function fail(status: number, error: string): NextResponse {
  return json({ error }, status);
}

/** The secret every signature uses; route() has checked it is set. */
export function voteSecret(): string {
  return process.env.VOTE_SECRET ?? '';
}

function adminKey(): string {
  return process.env.VOTE_ADMIN_KEY ?? '';
}

/* a post the browser marks as sent from another site; one without the header is an older browser or a script */
function crossSite(req: NextRequest): boolean {
  if (req.method === 'GET' || req.method === 'HEAD') return false;
  const site = req.headers.get('sec-fetch-site');
  return site !== null && site !== 'same-origin' && site !== 'none';
}

/**
 * A route handler that answers 503 while the deployment lacks the store or
 * the secrets, 403 to a post from another site, and 500 with a plain
 * sentence on any other failure.
 */
export function route<C>(handler: (req: NextRequest, ctx: C) => Promise<Response>) {
  return async (req: NextRequest, ctx: C): Promise<Response> => {
    if (missingEnv().length) return fail(503, 'Voting is not set up on this deployment.');
    if (crossSite(req)) return fail(403, 'This request came from another site.');
    try {
      return await handler(req, ctx);
    } catch (error) {
      console.error('[vote]', error instanceof Error ? error.message : error);
      return fail(500, 'Something went wrong. Try again.');
    }
  };
}

/**
 * The JSON object body, at most MAX_JSON_BYTES; null when it is missing,
 * too large, not an object or not sent as JSON (a form from another site
 * cannot send that type without a preflight).
 */
export async function readBody(req: NextRequest): Promise<Record<string, unknown> | null> {
  if (!(req.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) return null;
  if (Number(req.headers.get('content-length') ?? 0) > MAX_JSON_BYTES) return null;
  const text = await req.text().catch(() => '');
  if (!text || text.length > MAX_JSON_BYTES) return null;
  try {
    const value: unknown = JSON.parse(text);
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function cookieOptions(maxAge: number) {
  return { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge };
}

export async function currentSession(): Promise<{ voterId: string; deviceId: string } | null> {
  const session = readSessionToken(voteSecret(), (await cookies()).get(SESSION_COOKIE)?.value);
  return session && isVoterId(session.voterId) && isDeviceId(session.deviceId) ? session : null;
}

/** This browser's device id; a new one when the cookie is missing, which the caller then sets. */
export async function currentDevice(): Promise<{ deviceId: string; fresh: boolean }> {
  const value = (await cookies()).get(DEVICE_COOKIE)?.value;
  return isDeviceId(value) ? { deviceId: value, fresh: false } : { deviceId: newDeviceId(), fresh: true };
}

/** True for an admin cookie signed with the current admin key and under ADMIN_MAX_AGE old, so rotating the key signs every admin out. */
export async function isAdmin(): Promise<boolean> {
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  return readAdminToken(voteSecret(), adminKey(), value, ADMIN_MAX_AGE * 1000, Date.now());
}

export function setSession(res: NextResponse, voterId: string, deviceId: string): void {
  res.cookies.set(SESSION_COOKIE, sessionToken(voteSecret(), voterId, deviceId), cookieOptions(SESSION_MAX_AGE));
}

export function clearSession(res: NextResponse): void {
  res.cookies.set(SESSION_COOKIE, '', cookieOptions(0));
}

export function setDevice(res: NextResponse, deviceId: string): void {
  res.cookies.set(DEVICE_COOKIE, deviceId, cookieOptions(DEVICE_MAX_AGE));
}

export function setAdmin(res: NextResponse): void {
  res.cookies.set(ADMIN_COOKIE, adminToken(voteSecret(), adminKey(), Date.now()), cookieOptions(ADMIN_MAX_AGE));
}

export function clearAdmin(res: NextResponse): void {
  res.cookies.set(ADMIN_COOKIE, '', cookieOptions(0));
}
