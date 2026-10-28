// Tests for src/lib/vote/identity.ts and the pure parts of
// src/lib/vote/config.ts: email normalization, access lists (exact
// addresses, @domain entries, '*', +tags on either side), the voter id, the
// signed session and admin cookie values, the option alias per decision,
// key validation (bad characters are refused everywhere) and the store
// pathnames a vote is read back from.
// Loaded through Node's type stripping.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { importTs } from '../lint/seo.mjs';

const identity = await importTs(new URL('../../src/lib/vote/identity.ts', import.meta.url));
const config = await importTs(new URL('../../src/lib/vote/config.ts', import.meta.url));
const {
  adminToken,
  emailDomain,
  isAllowedEmail,
  newDeviceId,
  normalizeEmail,
  optionAlias,
  parseAccess,
  readAdminToken,
  readSessionToken,
  safeEqual,
  sessionToken,
  voterIdFor,
} = identity;
const {
  defaultAccess,
  domainLabel,
  isDeviceId,
  isOptionKey,
  isVoterId,
  namespace,
  optionSrc,
  parseDecisionFolder,
  parseDevicePath,
  parseHiddenPath,
  parseLikesPath,
  parseMarkerPath,
  parseOptionPath,
  parseVotePath,
  pathnames,
} = config;

const SECRET = 'test-secret';
const VOTER = 'a'.repeat(20);

test('emails are trimmed, lowercased and lose a +tag', () => {
  assert.equal(normalizeEmail('  Ada.Lovelace+votes@Example.COM '), 'ada.lovelace@example.com');
  assert.equal(normalizeEmail('x@sub.example.co'), 'x@sub.example.co');
  assert.equal(emailDomain('x@sub.example.co'), 'sub.example.co');
});

test('things that are not addresses are refused', () => {
  for (const bad of ['', 'plain', '@example.com', 'a@b', 'a@b.c', 'a b@example.com', 'a@exa mple.com', 'a@-x.com', 'a..b@example.com', '+tag@example.com', 'a@example.com.', 42, null, undefined, `${'a'.repeat(65)}@example.com`]) {
    assert.equal(normalizeEmail(bad), null, String(bad));
  }
});

test('the voter id is 20 hex from the normalized email and the secret', () => {
  const id = voterIdFor(SECRET, 'ada@example.com');
  assert.match(id, /^[a-f0-9]{20}$/);
  assert.equal(id, voterIdFor(SECRET, normalizeEmail('ADA+x@example.com')));
  assert.notEqual(id, voterIdFor('other-secret', 'ada@example.com'));
  assert.ok(isVoterId(id));
});

test('a session value round-trips and refuses tampering or another secret', () => {
  const device = newDeviceId();
  assert.ok(isDeviceId(device));
  const token = sessionToken(SECRET, VOTER, device);
  assert.deepEqual(readSessionToken(SECRET, token), { voterId: VOTER, deviceId: device });
  assert.equal(readSessionToken('other-secret', token), null);
  assert.equal(readSessionToken(SECRET, token.replace(VOTER, 'b'.repeat(20))), null);
  assert.equal(readSessionToken(SECRET, `${token}.x`), null);
  assert.equal(readSessionToken(SECRET, undefined), null);
  assert.equal(readSessionToken(SECRET, ''), null);
});

test('an access list takes exact addresses and @domain entries, as text or a list', () => {
  const text = '@team.example, Ada+x@Example.com  bob@other.co';
  const list = ['@team.example', 'Ada+x@Example.com', 'bob@other.co'];
  for (const access of [text, list]) {
    assert.ok(isAllowedEmail('anyone@team.example', access));
    assert.ok(isAllowedEmail('ada@example.com', access), 'a +tag in the entry drops');
    assert.ok(isAllowedEmail('bob@other.co', access));
    assert.ok(!isAllowedEmail('eve@example.com', access));
    assert.ok(!isAllowedEmail('x@sub.team.example', access), 'a subdomain is another domain');
    assert.ok(!isAllowedEmail('x@team.example.evil.co', access));
  }
  /* the voter's own +tag drops before the check, since the session stores the normalized email */
  assert.ok(isAllowedEmail(normalizeEmail('Bob+vote@Other.co'), list));
  assert.ok(!isAllowedEmail('ada@example.com', ''));
  assert.ok(!isAllowedEmail('ada@example.com', []));
  assert.ok(!isAllowedEmail('ada@example.com', ['@']));
  assert.ok(!isAllowedEmail('ada@example.com', ['**', '*@example.com']), 'only a bare * means any email');
});

test("'*' lets any email in", () => {
  assert.ok(isAllowedEmail('anyone@anywhere.io', ['*']));
  assert.ok(isAllowedEmail('anyone@anywhere.io', '*'));
  assert.ok(isAllowedEmail('anyone@anywhere.io', ['@team.example', ' * ']));
});

test('an access list is parsed, normalized and checked entry by entry', () => {
  assert.deepEqual(parseAccess(' @Team.Example,\nAda+x@Example.com ada@example.com  '), { access: ['@team.example', 'ada@example.com'] });
  assert.deepEqual(parseAccess(['bob@other.co', '', '@x.io']), { access: ['bob@other.co', '@x.io'] });
  assert.deepEqual(parseAccess(['@team.example', '*']), { access: ['*'] });
  assert.deepEqual(parseAccess(''), { access: [] });
  for (const bad of ['@', '@localhost', '@-x.com', 'not-an-email', 'a@b', '*.example.com']) {
    assert.ok('error' in parseAccess(bad), bad);
  }
  assert.ok('error' in parseAccess([1, 2]));
  assert.ok('error' in parseAccess(7));
  assert.ok('error' in parseAccess(Array.from({ length: 501 }, (_, i) => `u${i}@example.com`)));
});

test('the default access list is VOTE_ALLOWED, else the team domain', () => {
  const before = process.env.VOTE_ALLOWED;
  delete process.env.VOTE_ALLOWED;
  assert.deepEqual(defaultAccess(), ['@generaltranslation.com']);
  process.env.VOTE_ALLOWED = ' @Example.com, ada@x.io @example.com ';
  assert.deepEqual(defaultAccess(), ['@example.com', 'ada@x.io']);
  process.env.VOTE_ALLOWED = '   ';
  assert.deepEqual(defaultAccess(), ['@generaltranslation.com']);
  if (before === undefined) delete process.env.VOTE_ALLOWED;
  else process.env.VOTE_ALLOWED = before;
});

test('the admin value binds the admin key and its issue time', () => {
  const now = 1_800_000_000_000;
  const day = 24 * 60 * 60 * 1000;
  const token = adminToken(SECRET, 'key-1', now);
  assert.match(token, /^\d+\.[a-f0-9]{64}$/);
  assert.ok(readAdminToken(SECRET, 'key-1', token, 30 * day, now + day));
  assert.ok(!readAdminToken(SECRET, 'key-2', token, 30 * day, now + day), 'a rotated key signs every admin out');
  assert.ok(!readAdminToken('other-secret', 'key-1', token, 30 * day, now + day));
  assert.ok(!readAdminToken(SECRET, 'key-1', token, 30 * day, now + 31 * day), 'an old value expires on the server');
  assert.ok(!readAdminToken(SECRET, 'key-1', token.replace(String(now), String(now + day)), 30 * day, now + day));
  assert.ok(!readAdminToken(SECRET, '', adminToken(SECRET, '', now), 30 * day, now));
  for (const bad of [undefined, '', 'x', `${token}.x`, `abc.${token.split('.')[1]}`]) {
    assert.ok(!readAdminToken(SECRET, 'key-1', bad, 30 * day, now), String(bad));
  }
});

test('an option alias is opaque, stable per secret and decision, and a valid key', () => {
  const alias = optionAlias(SECRET, 'first', 'mark-two');
  assert.match(alias, /^[a-f0-9]{12}$/);
  assert.ok(isOptionKey(alias));
  assert.equal(alias, optionAlias(SECRET, 'first', 'mark-two'));
  assert.notEqual(alias, optionAlias(SECRET, 'first', 'mark-three'));
  assert.notEqual(alias, optionAlias('other-secret', 'first', 'mark-two'));
});

test('one key in two decisions has two unrelated aliases', () => {
  const a = optionAlias(SECRET, 'first', 'shared');
  const b = optionAlias(SECRET, 'second', 'shared');
  assert.notEqual(a, b);
  /* the ':' between the decision and the key is unambiguous, since neither may hold one */
  assert.ok(!isOptionKey('b:c'));
  const many = new Set(Array.from({ length: 50 }, (_, i) => optionAlias(SECRET, `d${i}`, 'shared')));
  assert.equal(many.size, 50);
});

test('strings are compared in equal time', () => {
  assert.ok(safeEqual('abc', 'abc'));
  assert.ok(!safeEqual('abc', 'abd'));
  assert.ok(!safeEqual('abc', 'abcd'));
});

test('keys are a to z, 0 to 9 and hyphens, 1 to 40 long', () => {
  for (const good of ['m1', 'mark-two', 'x', 'a'.repeat(40)]) assert.ok(isOptionKey(good), good);
  for (const bad of ['', 'A', 'a_b', 'a b', 'a.b', '../a', 'a/b', 'é', 'a'.repeat(41), 7, null]) assert.ok(!isOptionKey(bad), String(bad));
  assert.ok(!isVoterId('A'.repeat(20)));
  assert.ok(!isDeviceId('a'.repeat(20)));
});

test('a vote pathname carries its decision and the vote, and a bad key or id is refused', () => {
  const path = pathnames.vote('vote', 'first', VOTER, 1700000000000, 'm1', 'm2');
  assert.equal(path, `vote/decisions/first/votes/${VOTER}/1700000000000_m1_m2.json`);
  assert.deepEqual(parseVotePath('vote', 'first', path), { voterId: VOTER, ts: 1700000000000, winner: 'm1', loser: 'm2' });
  assert.equal(parseVotePath('vote', 'second', path), null, 'a vote parses only under its own decision');
  for (const bad of [
    `vote/decisions/first/votes/${VOTER}/1_m_1_m2.json`,
    `vote/decisions/first/votes/${VOTER}/1_M1_m2.json`,
    `vote/decisions/first/votes/${VOTER}/1_m1_m1.json`,
    `vote/decisions/first/votes/${VOTER}/x_m1_m2.json`,
    `vote/decisions/first/votes/${VOTER}/1_m1_m2.txt`,
    `vote/decisions/first/votes/short/1_m1_m2.json`,
    `vote/decisions/first/votes/${VOTER}/sub/1_m1_m2.json`,
    `vote/votes/${VOTER}/1_m1_m2.json`,
    `other/decisions/first/votes/${VOTER}/1_m1_m2.json`,
  ]) {
    assert.equal(parseVotePath('vote', 'first', bad), null, bad);
  }
});

test('the other pathnames parse back and refuse bad shapes', () => {
  const device = 'c'.repeat(24);
  assert.equal(pathnames.meta('vote', 'first'), 'vote/decisions/first/meta.json');
  assert.equal(pathnames.option('vote', 'first', 'm1', 'webp'), 'vote/decisions/first/options/m1.webp');
  assert.equal(pathnames.hidden('vote', 'first', 'm1'), 'vote/decisions/first/hidden/m1');
  assert.equal(pathnames.like('vote', 'first', VOTER, 5), `vote/decisions/first/likes/${VOTER}/5.json`);
  assert.deepEqual(parseLikesPath('vote', 'first', pathnames.like('vote', 'first', VOTER, 5)), { voterId: VOTER, ts: 5 });
  assert.equal(parseLikesPath('vote', 'first', `vote/decisions/first/likes/${VOTER}/x.json`), null);
  assert.equal(parseLikesPath('vote', 'second', pathnames.like('vote', 'first', VOTER, 5)), null);
  assert.deepEqual(parseDevicePath('vote', pathnames.device('vote', device, VOTER)), { deviceId: device, voterId: VOTER });
  assert.equal(parseDevicePath('vote', `vote/devices/${device}/nope`), null);
  for (const ext of ['svg', 'png', 'jpg', 'webp', 'json']) {
    assert.deepEqual(parseOptionPath('vote', 'first', `vote/decisions/first/options/m1.${ext}`), { key: 'm1', ext });
  }
  assert.equal(parseOptionPath('vote', 'first', 'vote/decisions/first/options/m1.gif'), null);
  assert.equal(parseOptionPath('vote', 'first', 'vote/decisions/first/options/a_b.svg'), null);
  assert.equal(parseOptionPath('vote', 'first', 'vote/decisions/first/options/x/m1.svg'), null);
  assert.equal(parseOptionPath('vote', 'first', 'vote/old/m1.svg'), null, 'the old layout is never read');
  assert.equal(parseHiddenPath('vote', 'first', 'vote/decisions/first/hidden/m1'), 'm1');
  assert.equal(parseHiddenPath('vote', 'first', 'vote/decisions/first/hidden/M1'), null);
  assert.equal(parseHiddenPath('vote', 'first', 'vote/hidden/m1'), null);
  assert.equal(parseMarkerPath('vote', `vote/excluded/${VOTER}`, 'excluded'), VOTER);
  assert.equal(parseMarkerPath('vote', `vote/voters/${VOTER}.json`, 'voters'), VOTER);
  assert.equal(parseMarkerPath('vote', `vote/voters/${VOTER}`, 'voters'), null);
  assert.equal(parseDecisionFolder('vote', 'vote/decisions/first/'), 'first');
  assert.equal(parseDecisionFolder('vote', 'vote/decisions/first'), null);
  assert.equal(parseDecisionFolder('vote', 'vote/decisions/a/b/'), null);
  assert.equal(parseDecisionFolder('vote', 'vote/decisions/Bad/'), null);
});

test('the namespace, the option address and the team label', () => {
  const before = process.env.VOTE_NAMESPACE;
  delete process.env.VOTE_NAMESPACE;
  assert.equal(namespace(), 'vote');
  process.env.VOTE_NAMESPACE = 'vote-smoke';
  assert.equal(namespace(), 'vote-smoke');
  process.env.VOTE_NAMESPACE = '../x';
  assert.equal(namespace(), 'vote');
  if (before === undefined) delete process.env.VOTE_NAMESPACE;
  else process.env.VOTE_NAMESPACE = before;
  assert.equal(optionSrc('first', 'm1', 36), '/api/vote/d/first/option/m1?v=10');
  assert.equal(domainLabel('generaltranslation.com'), 'GT team');
  assert.equal(domainLabel('example.com'), 'example.com');
});
