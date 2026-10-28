/* GET an option's file from the private store by its alias, for a voter
   the decision opens for, or the admin. The URL carries the file's
   version, so the answer caches for good. A raw key is never looked up.
   An alias the cached options lack lists them again past the cache, at
   most once per FRESH_MS per instance and MISSES times a minute per
   address, so random aliases cannot run up store reads. */
import { isOptionKey } from '@/lib/vote/config';
import { isDecisionId } from '@/lib/vote/decisions';
import { currentSession, fail, isAdmin, route } from '@/lib/vote/api';
import { decision, getVoter, openFile, registry, registryWithin } from '@/lib/vote/store';
import { byAlias, mayOpen } from '@/lib/vote/views';
import { getClientIp, isRateLimited } from '@/lib/rate-limit';

import type { Registry } from '@/lib/vote/store';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string; alias: string }> };

const FRESH_MS = 5_000;
const MISSES = 30;

export const GET = route(async (req: NextRequest, { params }: Context) => {
  const { id, alias } = await params;
  if (!isDecisionId(id) || !isOptionKey(alias)) return fail(404, 'No such option.');
  const [session, admin] = await Promise.all([currentSession(), isAdmin()]);
  const voter = !admin && session ? await getVoter(session.voterId) : null;
  if (!admin && !voter) return fail(401, 'Enter your email first.');
  const meta = await decision(id);
  if (!meta || meta.kind === 'text' || (voter && !mayOpen(meta, voter, admin))) return fail(404, 'No such option.');
  /* a hidden option is the admin's alone */
  const find = async (read: Promise<Registry>) => {
    const option = byAlias(id, (await read).options).get(alias);
    return option?.file && (!option.hidden || admin) ? openFile(id, option.file) : null;
  };
  let file = await find(registry(id));
  if (!file) {
    if (isRateLimited('vote-option-miss', getClientIp(req), MISSES)) return fail(429, 'Too many tries. Wait a minute and try again.');
    file = await find(registryWithin(id, FRESH_MS));
  }
  if (!file) return fail(404, 'No such option.');
  return new Response(file.stream, {
    headers: {
      'Content-Type': file.contentType,
      'Cache-Control': 'private, max-age=31536000, immutable',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      'X-Content-Type-Options': 'nosniff',
    },
  });
});
