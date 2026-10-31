/**
 * Access to the locked areas (LOCKED in src/lib/seo/policy.ts): the access
 * keys, the signed session cookie, the sign-in page's next path and the
 * gate's answer to one request. The proxy (src/proxy.ts), each locked route
 * handler, the sign-in route (src/app/api/auth/key/route.ts) and the
 * sign-in page all read it.
 *
 * PROTOTEMPLATE_ACCESS_KEYS holds the keys, separated by commas, so one key
 * can be revoked on its own. A session names its key by the first 12 hex
 * characters of the key's SHA-256 and never holds the key itself, and every
 * check confirms that the key is still listed, so removing a key signs out
 * everyone who used it. AUTH_SECRET signs the sessions. Without a secret
 * of 32 characters or a key of 16, nothing opens.
 *
 * The file imports node:crypto alone, so scripts/lint/access.test.mjs loads
 * it through Node's type stripping: no TypeScript syntax that emits code.
 */
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

/** The session cookie's name. */
export const SESSION_COOKIE = 'pt_access';

/** How long a session lasts, in seconds: 30 days. */
export const SESSION_SECONDS = 30 * 24 * 60 * 60;

/** The shortest secret and the shortest key the gate accepts. */
export const SECRET_MIN = 32;
export const KEY_MIN = 16;

/** The sign-in page's path. */
export const SIGN_IN_PATH = '/sign-in';

/** What the gate checks against: the signing secret and the access keys. */
export type AccessEnv = { secret: string; keys: readonly string[] };

/** A verified session: the key's id and the session's issue and expiry times in seconds. */
export type Session = { keyId: string; iat: number; exp: number };

/** The gate's answer to one request to a locked path. */
export type GateAnswer = { kind: 'pass'; session: Session } | { kind: 'redirect'; location: string } | { kind: 'deny' };

function sha256(text: string): Buffer {
  return createHash('sha256').update(text).digest();
}

function sign(secret: string, payload: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

/** The keys in a comma-separated value, trimmed; a key shorter than KEY_MIN is left out. */
export function parseKeys(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((key) => key.trim())
    .filter((key) => key.length >= KEY_MIN);
}

/** The secret and keys from the environment, or null when either is missing, so the gate fails closed. */
export function accessEnv(env: Readonly<Record<string, string | undefined>> = process.env): AccessEnv | null {
  const secret = env.AUTH_SECRET ?? '';
  const keys = parseKeys(env.PROTOTEMPLATE_ACCESS_KEYS);
  if (secret.length < SECRET_MIN || keys.length === 0) return null;
  return { secret, keys };
}

/** A key's id: the first 12 hex characters of its SHA-256. */
export function keyId(key: string): string {
  return sha256(key).toString('hex').slice(0, 12);
}

/**
 * The id of the listed key a candidate equals, or null. Both sides are
 * hashed to 32 bytes and compared with timingSafeEqual, and every key is
 * checked whatever the earlier ones gave, so the time taken says nothing
 * about the keys.
 */
export function matchKey(candidate: unknown, keys: readonly string[]): string | null {
  if (typeof candidate !== 'string' || candidate.length === 0) return null;
  const given = sha256(candidate);
  let found: string | null = null;
  for (const key of keys) {
    const want = sha256(key);
    if (timingSafeEqual(given, want) && found === null) found = want.toString('hex').slice(0, 12);
  }
  return found;
}

/** A session cookie value for a key id: v1.<key id>.<issued>.<expires>.<HMAC-SHA256>, the times in seconds. */
export function signSession(secret: string, id: string, now: number = Date.now()): string {
  const iat = Math.floor(now / 1000);
  const payload = `v1.${id}.${iat}.${iat + SESSION_SECONDS}`;
  return `${payload}.${sign(secret, payload)}`;
}

/**
 * The session a cookie value carries when this server signed it, it has not
 * expired and its key is still listed; null otherwise. The signature is
 * compared in constant time.
 */
export function readSession(env: AccessEnv | null, token: string | undefined, now: number = Date.now()): Session | null {
  if (!env || !token) return null;
  const parts = token.split('.');
  if (parts.length !== 5) return null;
  const [version, id, iatText, expText, sig] = parts as [string, string, string, string, string];
  if (version !== 'v1' || !/^[0-9a-f]{12}$/.test(id) || !/^\d{1,12}$/.test(iatText) || !/^\d{1,12}$/.test(expText)) return null;
  if (!/^[0-9a-f]{64}$/.test(sig)) return null;
  const want = Buffer.from(sign(env.secret, `v1.${id}.${iatText}.${expText}`), 'hex');
  if (!timingSafeEqual(Buffer.from(sig, 'hex'), want)) return null;
  const iat = Number(iatText);
  const exp = Number(expText);
  const seconds = now / 1000;
  if (exp <= seconds || iat > seconds + 60 || exp - iat > SESSION_SECONDS) return null;
  if (!env.keys.some((key) => keyId(key) === id)) return null;
  return { keyId: id, iat, exp };
}

/**
 * The page to open after signing in: a path on this site, kept with its
 * query and fragment, or `/`. Anything that could leave the site (`//host`
 * before or after dot segments collapse, a backslash, a scheme, a control
 * character) and the sign-in page itself fall back to `/`.
 */
export function safeNext(raw: unknown): string {
  if (typeof raw !== 'string' || raw.length > 2048) return '/';
  if (!raw.startsWith('/') || raw.startsWith('//') || /[\\\u0000-\u001f\u007f]/.test(raw)) return '/';
  let url: URL;
  try {
    url = new URL(raw, 'https://next.invalid');
  } catch {
    return '/';
  }
  if (url.origin !== 'https://next.invalid') return '/';
  if (url.pathname === SIGN_IN_PATH || url.pathname.startsWith(`${SIGN_IN_PATH}/`)) return '/';
  /* parsing collapses dot segments, so `/..//host` comes out as `//host`: check the result too */
  const out = `${url.pathname}${url.search}${url.hash}`;
  return out.startsWith('/') && !out.startsWith('//') ? out : '/';
}

/** A file (a name with an extension other than .html) or an API request answers 401 when signed out; a page request goes to the sign-in page. */
export function isFileRequest(pathname: string): boolean {
  if (pathname.startsWith('/api/')) return true;
  const last = pathname.slice(pathname.lastIndexOf('/') + 1);
  return last.includes('.') && !/\.html?$/i.test(last);
}

/** The gate for one request to a locked path: pass with a session, else the sign-in page for a page and a refusal for a file. */
export function gate(env: AccessEnv | null, token: string | undefined, pathname: string, search = '', now: number = Date.now()): GateAnswer {
  const session = readSession(env, token, now);
  if (session) return { kind: 'pass', session };
  if (isFileRequest(pathname)) return { kind: 'deny' };
  return { kind: 'redirect', location: `${SIGN_IN_PATH}?next=${encodeURIComponent(safeNext(`${pathname}${search}`))}` };
}

/** The headers every locked answer carries: never cached, never indexed. */
export const LOCKED_HEADERS: Readonly<Record<string, string>> = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
};

/** The response for a refused request (a redirect to the sign-in page, or 401), or null when the gate passes. */
export function gateResponse(answer: GateAnswer, origin: string): Response | null {
  if (answer.kind === 'pass') return null;
  if (answer.kind === 'redirect') {
    return new Response(null, { status: 307, headers: { ...LOCKED_HEADERS, Location: new URL(answer.location, origin).toString() } });
  }
  return new Response('Sign in to open this file.\n', { status: 401, headers: { ...LOCKED_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' } });
}
