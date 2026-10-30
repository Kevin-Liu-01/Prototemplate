import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { accessEnv, LOCKED_HEADERS, matchKey, SESSION_COOKIE, SESSION_SECONDS, signSession } from '@/lib/access';
import { getClientIp, isAtLimit, isRateLimited } from '@/lib/rate-limit';

/**
 * POST signs in with an access key ({ key }) and sets the session cookie;
 * DELETE signs out. Both refuse a request from another origin. A wrong key
 * answers 401 after about 1.5 seconds, and ten wrong keys from one address
 * in ten minutes answer 429 until the ten minutes pass (per instance, best
 * effort). Without a secret and a key the route answers 503 and nothing
 * opens (src/lib/access.ts).
 */
export const dynamic = 'force-dynamic';

const BUCKET = 'auth-key';
const FAILURES_MAX = 10;
const FAILURE_WINDOW_MS = 10 * 60 * 1000;
const FAILURE_DELAY_MS = 1500;

function answer(status: number, body: Record<string, unknown> | null = null): NextResponse {
  return body ? NextResponse.json(body, { status, headers: LOCKED_HEADERS }) : new NextResponse(null, { status, headers: LOCKED_HEADERS });
}

/** True when the request comes from a page of this site. */
function sameOrigin(request: NextRequest): boolean {
  return request.headers.get('origin') === request.nextUrl.origin;
}

/** The cookie's attributes; Secure everywhere but plain-HTTP development. */
function cookieOptions(request: NextRequest, maxAge: number) {
  const secure = process.env.NODE_ENV === 'production' || request.nextUrl.protocol === 'https:';
  return { httpOnly: true, secure, sameSite: 'lax' as const, path: '/', maxAge };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!sameOrigin(request)) return answer(403, { error: 'origin' });
  const env = accessEnv();
  if (!env) return answer(503, { error: 'off' });
  let key: unknown = null;
  try {
    key = ((await request.json()) as { key?: unknown } | null)?.key;
  } catch {
    key = null;
  }
  /* the limit check, the match and the count run with no await between them, so parallel guesses cannot pass the limit together */
  const ip = getClientIp(request);
  if (isAtLimit(BUCKET, ip, FAILURES_MAX)) return answer(429, { error: 'limit' });
  const id = matchKey(key, env.keys);
  if (!id) {
    isRateLimited(BUCKET, ip, FAILURES_MAX, FAILURE_WINDOW_MS);
    await new Promise((resolve) => setTimeout(resolve, FAILURE_DELAY_MS));
    return answer(401, { error: 'key' });
  }
  const response = answer(204);
  response.cookies.set(SESSION_COOKIE, signSession(env.secret, id), cookieOptions(request, SESSION_SECONDS));
  return response;
}

export function DELETE(request: NextRequest): NextResponse {
  if (!sameOrigin(request)) return answer(403, { error: 'origin' });
  const response = answer(204);
  response.cookies.set(SESSION_COOKIE, '', cookieOptions(request, 0));
  return response;
}
