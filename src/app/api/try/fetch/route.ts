import { NextResponse } from 'next/server';

import { getClientIp, isRateLimited } from '@/lib/rate-limit';
import { createSafeFetcher } from '@/lib/try/safeFetch';

import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

// One SSRF-gated upstream fetch per call; the report pipeline runs in the
// browser and orchestrates these. Longest allowed upstream fetch is 10s.
export const maxDuration = 15;

/* A full report run makes at most 11 calls (1 base page, 2 sitemap, 8
   probes), so 90 per minute allows ~8 runs while capping what one address
   can make this server fetch. */
const RATE_MAX_PER_MINUTE = 90;
const MAX_TIMEOUT_MS = 10000;

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (isRateLimited('try-fetch', getClientIp(req), RATE_MAX_PER_MINUTE)) {
    return NextResponse.json(
      {
        error: 'Too many requests from this address. Wait a minute and retry.',
      },
      { status: 429 }
    );
  }
  let url = '';
  let acceptLanguage: string | undefined;
  let timeoutMs = 8000;
  try {
    const body = (await req.json()) as {
      url?: string;
      acceptLanguage?: string;
      timeoutMs?: number;
    } | null;
    url = String(body?.url ?? '').trim();
    if (typeof body?.acceptLanguage === 'string') {
      acceptLanguage = body.acceptLanguage.slice(0, 100);
    }
    if (typeof body?.timeoutMs === 'number') timeoutMs = body.timeoutMs;
  } catch {
    return NextResponse.json(
      { error: 'Send a JSON body with a url field.' },
      { status: 400 }
    );
  }
  timeoutMs = Math.min(Math.max(1000, timeoutMs), MAX_TIMEOUT_MS);
  const page = await createSafeFetcher(1).fetchPage(url, {
    acceptLanguage,
    timeoutMs,
    countsAgainstBudget: false,
  });
  if (!page) {
    return NextResponse.json({ error: 'fetch failed' }, { status: 502 });
  }
  return NextResponse.json(
    {
      status: page.status,
      finalUrl: page.finalUrl,
      contentType: page.contentType,
      body: page.body,
      error: page.error,
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
