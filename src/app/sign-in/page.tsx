import { cookies } from 'next/headers';

import { accessEnv, readSession, safeNext, SESSION_COOKIE } from '@/lib/access';
import { PAGE_NAMES } from '@/lib/page-names';
import JsonLd from '@/lib/seo/JsonLd';
import { seoRoute } from '@/lib/seo/route';

import SignInViewer from './SignInViewer';
import type { SignInState } from './SignInViewer';

const route = seoRoute({
  path: '/sign-in',
  title: PAGE_NAMES.signIn.name,
  kind: 'page',
  description: 'Sign in with an access key to open the locked pages and files of Prototemplate.',
  card: false,
});

export const metadata = route.metadata;

type Props = { searchParams: Promise<{ next?: string | string[] }> };

/**
 * /sign-in: the one sign-in page for every locked area (src/lib/access.ts).
 * It reads the session on the server, so it opens on the right state: the
 * key field, the sign-out button once signed in, or the line that says
 * nothing can be unlocked while no key is configured. `next` is the page
 * to open after signing in, kept to a path on this site.
 */
export default async function SignInPage({ searchParams }: Props) {
  const raw = (await searchParams).next;
  const next = safeNext(Array.isArray(raw) ? raw[0] : raw);
  const env = accessEnv();
  const signedIn = readSession(env, (await cookies()).get(SESSION_COOKIE)?.value) !== null;
  const state: SignInState = env === null ? 'off' : signedIn ? 'in' : 'out';
  return (
    <>
      <JsonLd nodes={route.jsonLd} />
      <SignInViewer state={state} next={next} />
    </>
  );
}
