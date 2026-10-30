import type { NextRequest } from 'next/server';

import { accessEnv, gate, gateResponse, SESSION_COOKIE } from '@/lib/access';
import { isLocked } from '@/lib/seo/policy';

/**
 * The gate in front of every locked area (LOCKED in src/lib/seo/policy.ts):
 * a signed-out page request goes to /sign-in?next=<path>, a signed-out file
 * or API request answers 401, and a signed-in request goes on. Each locked
 * route handler runs the same check again, so a path the matcher misses is
 * still refused.
 *
 * Next reads the matcher only as a literal, so it repeats LOCKED: one
 * entry and its subpaths per locked area. scripts/lint/access.test.mjs
 * fails until the two agree. The matcher keeps the proxy off every other
 * page, which the CDN serves without running it.
 */
export function proxy(request: NextRequest): Response | undefined {
  const { pathname, search } = request.nextUrl;
  if (!isLocked(pathname)) return undefined;
  const answer = gate(accessEnv(), request.cookies.get(SESSION_COOKIE)?.value, pathname, search);
  return gateResponse(answer, request.nextUrl.origin) ?? undefined;
}

export const config = {
  matcher: ['/raise', '/raise/:path*'],
};
