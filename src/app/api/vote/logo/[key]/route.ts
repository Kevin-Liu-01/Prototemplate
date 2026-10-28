/* GET a mark from the private store by its alias, for a voter on the vote
   or the admin. The URL carries the file's version, so the answer caches
   for good. */
import { isLogoKey, voteAllowList } from '@/lib/vote/config';
import { currentSession, fail, isAdmin, route } from '@/lib/vote/api';
import { isAllowedEmail } from '@/lib/vote/identity';
import { getVoter, openMark, registry } from '@/lib/vote/store';
import { byAlias } from '@/lib/vote/views';

import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ key: string }> };

export const GET = route(async (_req: NextRequest, { params }: Context) => {
  const { key: alias } = await params;
  if (!isLogoKey(alias)) return fail(404, 'No such logo.');
  const [session, admin] = await Promise.all([currentSession(), isAdmin()]);
  const voter = !admin && session ? await getVoter(session.voterId) : null;
  if (!admin && !(voter && isAllowedEmail(voter.email, voteAllowList()))) return fail(401, 'Enter your email first.');
  /* a hidden logo is the admin's alone; a stale registry is listed again once */
  const find = async (fresh: boolean) => {
    const logo = byAlias((await registry(fresh)).logos).get(alias);
    return logo && (!logo.hidden || admin) ? openMark(logo.file) : null;
  };
  const mark = (await find(false)) ?? (await find(true));
  if (!mark) return fail(404, 'No such logo.');
  return new Response(mark.stream, {
    headers: {
      'Content-Type': mark.contentType,
      'Cache-Control': 'private, max-age=31536000, immutable',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      'X-Content-Type-Options': 'nosniff',
    },
  });
});
