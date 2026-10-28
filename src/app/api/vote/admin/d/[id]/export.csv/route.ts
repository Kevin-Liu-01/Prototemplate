/* GET every vote in one decision as CSV, oldest first, for the admin. */
import { isDecisionId } from '@/lib/vote/decisions';
import { fail, isAdmin, route } from '@/lib/vote/api';
import { exportCsv } from '@/lib/vote/views';

import type { DecisionParams } from '@/lib/vote/api';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = route(async (_req: NextRequest, { params }: DecisionParams) => {
  if (!(await isAdmin())) return fail(401, 'Sign in with the admin key.');
  const { id } = await params;
  const csv = isDecisionId(id) ? await exportCsv(id) : null;
  if (csv === null) return fail(404, 'No such decision.');
  const day = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${id}-votes-${day}.csv"`,
      'Cache-Control': 'no-store, max-age=0',
    },
  });
});
