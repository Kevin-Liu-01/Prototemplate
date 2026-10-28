/* GET every vote as CSV, oldest first, for the admin. */
import { fail, isAdmin, route } from '@/lib/vote/api';
import { exportCsv } from '@/lib/vote/views';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  if (!(await isAdmin())) return fail(401, 'Sign in with the admin key.');
  const day = new Date().toISOString().slice(0, 10);
  return new Response(await exportCsv(), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="votes-${day}.csv"`,
      'Cache-Control': 'no-store, max-age=0',
    },
  });
});
