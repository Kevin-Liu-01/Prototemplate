import { get } from '@vercel/blob';
import type { NextRequest } from 'next/server';

import { LOCKED_HEADERS } from '@/lib/access';

/** A path segment the store can hold: no dot first, so no `.` or `..` and no hidden file. */
const SEGMENT = /^[A-Za-z0-9_-][A-Za-z0-9._-]*$/;

type Context = { params: Promise<{ path: string[] }> };

function status(code: number): Response {
  return new Response(null, { status: code, headers: LOCKED_HEADERS });
}

/**
 * The GET handler of an area's files, served by link from the locked areas'
 * own private Blob store under locked/<area>/ (scripts/locked/sync.mjs
 * uploads it), never indexed. The route is a catch-all, so `path` is the
 * file's path inside the area: /raise/files/<path> serves
 * locked/raise/<path>, and only under one of `folders` (the media), so the
 * area's data files stay on the server that renders its pages. The store's
 * token is read from LOCKED_BLOB_READ_WRITE_TOKEN alone and passed to every
 * call, so no other store's token can open it. Each body streams with its own content type
 * and a byte range when one is asked for (a video or a track seeks), and
 * nothing is cached.
 */
export function blobArea(area: string, folders: readonly string[]): (request: NextRequest, context: Context) => Promise<Response> {
  const prefix = `locked/${area}/`;
  return async function GET(request, { params }) {
    const { path } = await params;
    if (path.length < 2 || !folders.includes(path[0] ?? '') || !path.every((segment) => SEGMENT.test(segment))) return status(404);
    const token = process.env.LOCKED_BLOB_READ_WRITE_TOKEN;
    if (!token) return status(503);

    const range = request.headers.get('range');
    try {
      const result = await get(`${prefix}${path.join('/')}`, { access: 'private', token, ...(range ? { headers: { range } } : {}) });
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
  };
}
