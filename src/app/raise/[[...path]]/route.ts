import { get } from '@vercel/blob';
import type { NextRequest } from 'next/server';

import { accessEnv, gate, gateResponse, LOCKED_HEADERS, SESSION_COOKIE } from '@/lib/access';

/**
 * /raise, a locked area: the viewer's files, served from the locked areas'
 * own private Blob store under locked/raise/ (scripts/locked/sync.mjs
 * uploads them) to a signed-in session only. The store's token is read from
 * LOCKED_BLOB_READ_WRITE_TOKEN alone and passed to every call, so no other
 * store's token can open it. /raise opens /raise/index.html, so the viewer's
 * relative addresses resolve under /raise/ and nothing in it is rewritten.
 * Each body streams with its own content type and a byte range when one is
 * asked for (a video seeks), and nothing is cached.
 */
export const dynamic = 'force-dynamic';

const PREFIX = 'locked/raise/';

/** A path segment the store can hold: no dot first, so no `.` or `..` and no hidden file. */
const SEGMENT = /^[A-Za-z0-9_-][A-Za-z0-9._-]*$/;

type Context = { params: Promise<{ path?: string[] }> };

function status(code: number): Response {
  return new Response(null, { status: code, headers: LOCKED_HEADERS });
}

export async function GET(request: NextRequest, { params }: Context): Promise<Response> {
  const { pathname, search, origin } = request.nextUrl;
  const refused = gateResponse(gate(accessEnv(), request.cookies.get(SESSION_COOKIE)?.value, pathname, search), origin);
  if (refused) return refused;

  const { path = [] } = await params;
  if (path.length === 0) {
    return new Response(null, { status: 307, headers: { ...LOCKED_HEADERS, Location: new URL('/raise/index.html', origin).toString() } });
  }
  if (!path.every((segment) => SEGMENT.test(segment))) return status(404);
  const token = process.env.LOCKED_BLOB_READ_WRITE_TOKEN;
  if (!token) return status(503);

  const range = request.headers.get('range');
  try {
    const result = await get(`${PREFIX}${path.join('/')}`, { access: 'private', token, ...(range ? { headers: { range } } : {}) });
    if (!result || result.statusCode !== 200) return status(404);
    const headers = new Headers({ ...LOCKED_HEADERS, 'Content-Type': result.blob.contentType, 'X-Content-Type-Options': 'nosniff', 'Accept-Ranges': 'bytes' });
    const length = result.headers.get('content-length');
    const contentRange = result.headers.get('content-range');
    if (length) headers.set('Content-Length', length);
    if (contentRange) headers.set('Content-Range', contentRange);
    return new Response(result.stream, { status: contentRange ? 206 : 200, headers });
  } catch {
    return status(502);
  }
}
