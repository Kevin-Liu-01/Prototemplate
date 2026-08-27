import { NextResponse } from 'next/server';

import { analyze } from '@/lib/try/analyze';
import { getClientIp, isRateLimited } from '@/lib/try/rateLimit';
import { gateUserInput } from '@/lib/try/safeFetch';

import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

// analyze() can spend up to 74.5s on fetches alone: 10s for the first page,
// 2 sitemap fetches at 250ms pacing plus up to 3s each, and 8 budgeted
// discovery probes at 250ms pacing plus up to 7s each. 78 leaves headroom
// for parsing and grading while staying under the client's 80s timeout.
export const maxDuration = 78;

const RATE_MAX_PER_MINUTE = 6;

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (isRateLimited('report', getClientIp(req), RATE_MAX_PER_MINUTE)) {
    return NextResponse.json(
      { error: 'Too many reports from this address. Wait a minute and retry.' },
      { status: 429 }
    );
  }
  let raw = '';
  try {
    const body = (await req.json()) as { url?: string } | null;
    raw = String(body?.url ?? '').trim();
  } catch {
    return NextResponse.json(
      { error: 'Send a JSON body with a url field.' },
      { status: 400 }
    );
  }
  const gate = gateUserInput(raw);
  if (!gate.ok) {
    return NextResponse.json({ error: gate.reason }, { status: 400 });
  }
  try {
    const report = await analyze(gate.url.href);
    return NextResponse.json(report, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed.';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
