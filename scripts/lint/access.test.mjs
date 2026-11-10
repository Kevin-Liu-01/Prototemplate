// Tests for src/lib/access.ts and LOCKED in src/lib/seo/policy.ts, loaded
// through Node's type stripping: the environment failing closed, the key
// check, the session cookie (signed, tampered, expired, revoked), isLocked,
// the next-path guard, the gate's answers and the proxy's matcher, which
// must repeat LOCKED. /vault stands in for a locked area.
// The last two tests cover the same-origin check of the POST routes.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { importTs } from './seo.mjs';

const {
  SESSION_SECONDS,
  accessEnv,
  gate,
  gateResponse,
  isFileRequest,
  keyId,
  matchKey,
  readSession,
  safeNext,
  signSession,
} = await importTs(new URL('../../src/lib/access.ts', import.meta.url));
const { LOCKED, PRIVATE_PATHS, isLocked, policyFor } = await importTs(new URL('../../src/lib/seo/policy.ts', import.meta.url));
const { sameOrigin } = await importTs(new URL('../../src/lib/same-origin.ts', import.meta.url));

const SECRET = 's'.repeat(40);
const K1 = 'first-key-0123456789abcdef';
const K2 = 'second-key-0123456789abcdef';
const ENV = { secret: SECRET, keys: [K1, K2] };
const NOW = Date.UTC(2026, 9, 30, 12);

test('the environment fails closed without a secret or a key', () => {
  assert.equal(accessEnv({}), null);
  assert.equal(accessEnv({ AUTH_SECRET: SECRET }), null);
  assert.equal(accessEnv({ AUTH_SECRET: SECRET, PROTOTEMPLATE_ACCESS_KEYS: '' }), null);
  assert.equal(accessEnv({ AUTH_SECRET: SECRET, PROTOTEMPLATE_ACCESS_KEYS: ' , ,' }), null);
  assert.equal(accessEnv({ AUTH_SECRET: 'short', PROTOTEMPLATE_ACCESS_KEYS: K1 }), null, 'a secret under 32 characters');
  assert.equal(accessEnv({ AUTH_SECRET: SECRET, PROTOTEMPLATE_ACCESS_KEYS: 'short-key' }), null, 'a key under 16 characters');
  assert.deepEqual(accessEnv({ AUTH_SECRET: SECRET, PROTOTEMPLATE_ACCESS_KEYS: ` ${K1} , ,${K2},short` }), ENV);
});

test('a key id is the first 12 hex characters of the key SHA-256, never the key', () => {
  assert.equal(keyId(K1), createHash('sha256').update(K1).digest('hex').slice(0, 12));
  assert.match(keyId(K1), /^[0-9a-f]{12}$/);
  assert.notEqual(keyId(K1), keyId(K2));
});

test('the key check: the right key, a wrong key, one of several, no keys', () => {
  assert.equal(matchKey(K1, [K1]), keyId(K1));
  assert.equal(matchKey(K2, ENV.keys), keyId(K2), 'one of several keys');
  assert.equal(matchKey(K1, ENV.keys), keyId(K1));
  assert.equal(matchKey(`${K1}x`, ENV.keys), null, 'a wrong key');
  assert.equal(matchKey(K1.toUpperCase(), ENV.keys), null);
  assert.equal(matchKey(K1, []), null, 'an empty list');
  for (const bad of ['', undefined, null, 42, {}, [K1]]) assert.equal(matchKey(bad, ENV.keys), null, String(bad));
});

test('a session signs and reads back for 30 days, holding the key id and not the key', () => {
  const token = signSession(SECRET, keyId(K1), NOW);
  assert.ok(!token.includes(K1));
  const session = readSession(ENV, token, NOW + 1000);
  assert.deepEqual(session, { keyId: keyId(K1), iat: NOW / 1000, exp: NOW / 1000 + SESSION_SECONDS });
  assert.equal(SESSION_SECONDS, 30 * 24 * 60 * 60);
});

test('a tampered session is refused', () => {
  const token = signSession(SECRET, keyId(K1), NOW);
  const [v, id, iat, exp, sig] = token.split('.');
  const flip = (s, i) => s.slice(0, i) + (s[i] === '0' ? '1' : '0') + s.slice(i + 1);
  const bad = [
    `${v}.${id}.${iat}.${exp}.${flip(sig, 10)}`,
    `${v}.${keyId(K2)}.${iat}.${exp}.${sig}`,
    `${v}.${id}.${iat}.${Number(exp) + 86400}.${sig}`,
    `${v}.${id}.${Number(iat) - 1}.${exp}.${sig}`,
    `v2.${id}.${iat}.${exp}.${sig}`,
    `${v}.${id}.${iat}.${exp}`,
    `${token}.x`,
    signSession('o'.repeat(40), keyId(K1), NOW),
    '',
    undefined,
  ];
  for (const value of bad) assert.equal(readSession(ENV, value, NOW + 1000), null, String(value));
  assert.equal(readSession(null, token, NOW + 1000), null, 'no environment');
});

test('an expired session is refused', () => {
  const token = signSession(SECRET, keyId(K1), NOW);
  assert.ok(readSession(ENV, token, NOW + SESSION_SECONDS * 1000 - 1000));
  assert.equal(readSession(ENV, token, NOW + SESSION_SECONDS * 1000), null);
  assert.equal(readSession(ENV, token, NOW - 120_000), null, 'issued in the future');
});

test('removing a key signs out every session made with it, and only those', () => {
  const first = signSession(SECRET, keyId(K1), NOW);
  const second = signSession(SECRET, keyId(K2), NOW);
  const revoked = { secret: SECRET, keys: [K2] };
  assert.equal(readSession(revoked, first, NOW + 1000), null);
  assert.ok(readSession(revoked, second, NOW + 1000));
});

test('isLocked: a locked area and everything under it, in any spelling', () => {
  const areas = ['/vault'];
  for (const path of ['/vault', '/vault/', '/vault/index.html', '/vault/viewer/app.js', '/VAULT', '/%76ault/x', '//vault', '/vault//x', '/vault?next=1', '/vault#top']) {
    assert.equal(isLocked(path, areas), true, path);
  }
  for (const path of ['/', '/vaults', '/vaulted/x', '/brand', '/sign-in', 'vault', 'https://www.prototemplate.com/vault', '', '/%E0%A4%A']) {
    assert.equal(isLocked(path, areas), false, path);
  }
  for (const base of LOCKED) assert.equal(isLocked(`${base}/x`), true, base);
  assert.equal(isLocked('/raise/r1'), false, '/raise is public');
});

test('a locked area is private: noindex, nofollow, out of the sitemap; /sign-in too', () => {
  for (const path of [...LOCKED, '/sign-in']) assert.ok(PRIVATE_PATHS.includes(path), path);
  for (const path of ['/sign-in']) {
    const policy = policyFor(path);
    assert.equal(policy.index, false, path);
    assert.equal(policy.follow, false, path);
    assert.equal(policy.inSitemap, false, path);
  }
  for (const path of ['/raise', '/raise/r1', '/raise/finals']) {
    assert.equal(PRIVATE_PATHS.includes(path), false, path);
    assert.equal(policyFor(path).index, true, path);
  }
});

test('the next path stays on this site', () => {
  for (const [raw, want] of [
    ['/raise', '/raise'],
    ['/raise/index.html?view=now#r2', '/raise/index.html?view=now#r2'],
    ['/a/../raise', '/raise'],
    ['/%2F%2Fexample.com', '/%2F%2Fexample.com'],
  ]) {
    assert.equal(safeNext(raw), want, raw);
  }
  for (const raw of [
    '//example.com',
    '//example.com/raise',
    '/..//evil.com',
    '/.%2e//evil.com',
    '/%2e%2e//evil.com',
    '/raise/..//evil.com',
    '/\\example.com',
    '/raise\\..\\x',
    'https://example.com',
    'javascript:alert(1)',
    'raise',
    '/\texample.com',
    '/raise\n',
    '/sign-in',
    '/sign-in?next=/raise',
    '',
    undefined,
    null,
    ['/raise'],
    `/${'a'.repeat(2048)}`,
  ]) {
    assert.equal(safeNext(raw), '/', String(raw));
  }
});

test('a file or an API request is told apart from a page', () => {
  for (const path of ['/raise/rounds.json', '/raise/viewer/app.js', '/raise/rounds/a.mp4', '/api/auth/key']) assert.equal(isFileRequest(path), true, path);
  for (const path of ['/raise', '/raise/', '/raise/index.html', '/raise/viewer']) assert.equal(isFileRequest(path), false, path);
});

test('the gate: signed out a page goes to sign-in and a file answers 401; signed in it passes', () => {
  const token = signSession(SECRET, keyId(K1), NOW);
  assert.deepEqual(gate(ENV, undefined, '/vault', '', NOW), { kind: 'redirect', location: '/sign-in?next=%2Fvault' });
  assert.deepEqual(gate(ENV, undefined, '/vault/index.html', '?view=now', NOW), { kind: 'redirect', location: '/sign-in?next=%2Fvault%2Findex.html%3Fview%3Dnow' });
  assert.deepEqual(gate(ENV, undefined, '/vault/rounds.json', '', NOW), { kind: 'deny' });
  assert.deepEqual(gate(ENV, 'forged', '/vault/rounds.json', '', NOW), { kind: 'deny' });
  assert.deepEqual(gate(null, token, '/vault', '', NOW), { kind: 'redirect', location: '/sign-in?next=%2Fvault' }, 'no keys configured');
  assert.equal(gate(ENV, token, '/vault/rounds.json', '', NOW + 1000).kind, 'pass');
  assert.equal(gate({ secret: SECRET, keys: [K2] }, token, '/vault/rounds.json', '', NOW + 1000).kind, 'deny', 'a revoked key');
});

test('the gate responses: 307 to sign-in, 401 for a file, never cached or indexed', async () => {
  const origin = 'https://www.prototemplate.com';
  const redirect = gateResponse({ kind: 'redirect', location: '/sign-in?next=%2Fvault' }, origin);
  assert.equal(redirect.status, 307);
  assert.equal(redirect.headers.get('location'), `${origin}/sign-in?next=%2Fvault`);
  const deny = gateResponse({ kind: 'deny' }, origin);
  assert.equal(deny.status, 401);
  assert.doesNotMatch(await deny.text(), /vault/i);
  for (const response of [redirect, deny]) {
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    assert.match(response.headers.get('x-robots-tag'), /noindex/);
  }
  assert.equal(gateResponse({ kind: 'pass', session: { keyId: keyId(K1), iat: 0, exp: 1 } }, origin), null);
});

test('the proxy matcher repeats LOCKED: each area and its subpaths, nothing else', () => {
  const source = readFileSync(new URL('../../src/proxy.ts', import.meta.url), 'utf8');
  const literal = /matcher:\s*\[([^\]]*)\]/.exec(source);
  assert.ok(literal, 'src/proxy.ts exports a literal matcher');
  const matcher = [...literal[1].matchAll(/'([^']+)'/g)].map((m) => m[1]).sort();
  const want = LOCKED.flatMap((base) => [base, `${base}/:path*`]).sort();
  assert.deepEqual(matcher, want, 'add each LOCKED entry to the matcher in src/proxy.ts as /<area> and /<area>/:path*');
});

test('the key form posts, so Enter before hydration sends the key in a body, never in the URL', () => {
  const source = readFileSync(new URL('../../src/app/sign-in/SignInViewer.tsx', import.meta.url), 'utf8');
  const forms = [...source.matchAll(/<form\b[^>]*>/g)].map((m) => m[0]);
  assert.ok(forms.length > 0, 'SignInViewer renders a form');
  for (const form of forms) assert.match(form, /\bmethod='post'/, form);
});

test('sameOrigin: only a request whose Origin header is this site passes', () => {
  const request = (origin, site = 'https://www.example.test') => ({ headers: new Headers(origin === undefined ? {} : { origin }), nextUrl: { origin: site } });
  assert.equal(sameOrigin(request('https://www.example.test')), true);
  assert.equal(sameOrigin(request('https://other.example.test')), false);
  assert.equal(sameOrigin(request('http://www.example.test')), false, 'the scheme is part of the origin');
  assert.equal(sameOrigin(request('null')), false);
  assert.equal(sameOrigin(request(undefined)), false, 'no Origin header');
});

test('the POST routes refuse another origin before doing any work', () => {
  for (const rel of ['../../src/app/api/try/fetch/route.ts', '../../src/app/api/auth/key/route.ts']) {
    const source = readFileSync(new URL(rel, import.meta.url), 'utf8');
    assert.match(source, /import \{ sameOrigin \} from '@\/lib\/same-origin';/, rel);
    const post = source.slice(source.indexOf('export async function POST'));
    assert.match(post, /^[^\n]*\n\s*if \(!sameOrigin\(/, `${rel}: the origin check is the first statement of POST`);
  }
});
