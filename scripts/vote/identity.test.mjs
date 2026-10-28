// Tests for src/lib/vote/identity.ts and the pure parts of
// src/lib/vote/config.ts: email normalization, the allowlist, the voter id,
// the signed session and admin cookie values, the logo alias, key
// validation (bad characters are refused everywhere) and the store
// pathnames a vote is read back from.
// Loaded through Node's type stripping.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { importTs } from '../lint/seo.mjs';

const identity = await importTs(new URL('../../src/lib/vote/identity.ts', import.meta.url));
const config = await importTs(new URL('../../src/lib/vote/config.ts', import.meta.url));
const { adminToken, emailDomain, isAllowedEmail, logoAlias, normalizeEmail, readAdminToken, readSessionToken, safeEqual, sessionToken, voterIdFor, newDeviceId } = identity;
const {
  domainLabel,
  isDeviceId,
  isLogoKey,
  isVoterId,
  keyFromName,
  voteAllowList,
  logoSrc,
  namespace,
  parseDevicePath,
  parseLikesPath,
  parseLogoPath,
  parseMarkerPath,
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

test('the allowlist takes exact addresses and @domain entries', () => {
  const list = '@team.example, Ada+x@Example.com  bob@other.co';
  assert.ok(isAllowedEmail('anyone@team.example', list));
  assert.ok(isAllowedEmail('ada@example.com', list));
  assert.ok(isAllowedEmail('bob@other.co', list));
  assert.ok(!isAllowedEmail('eve@example.com', list));
  assert.ok(!isAllowedEmail('x@sub.team.example', list));
  assert.ok(!isAllowedEmail('x@team.example.evil.co', list));
  assert.ok(!isAllowedEmail('ada@example.com', ''));
  assert.ok(!isAllowedEmail('ada@example.com', '@'));
  const before = process.env.VOTE_ALLOWED;
  delete process.env.VOTE_ALLOWED;
  assert.equal(voteAllowList(), '@generaltranslation.com');
  process.env.VOTE_ALLOWED = ' @example.com ';
  assert.equal(voteAllowList(), '@example.com');
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

test('a logo alias is opaque, stable per secret and a valid key', () => {
  const alias = logoAlias(SECRET, 'mark-two');
  assert.match(alias, /^[a-f0-9]{12}$/);
  assert.ok(isLogoKey(alias));
  assert.equal(alias, logoAlias(SECRET, 'mark-two'));
  assert.notEqual(alias, logoAlias(SECRET, 'mark-three'));
  assert.notEqual(alias, logoAlias('other-secret', 'mark-two'));
});

test('strings are compared in equal time', () => {
  assert.ok(safeEqual('abc', 'abc'));
  assert.ok(!safeEqual('abc', 'abd'));
  assert.ok(!safeEqual('abc', 'abcd'));
});

test('keys are a to z, 0 to 9 and hyphens, 1 to 40 long', () => {
  for (const good of ['m1', 'mark-two', 'x', 'a'.repeat(40)]) assert.ok(isLogoKey(good), good);
  for (const bad of ['', 'A', 'a_b', 'a b', 'a.b', '../a', 'a/b', 'é', 'a'.repeat(41), 7, null]) assert.ok(!isLogoKey(bad), String(bad));
  assert.ok(!isVoterId('A'.repeat(20)));
  assert.ok(!isDeviceId('a'.repeat(20)));
});

test('a key from a name', () => {
  assert.equal(keyFromName('Doubled Line 2'), 'doubled-line-2');
  assert.equal(keyFromName('  Café  Noir!! '), 'cafe-noir');
  assert.equal(keyFromName('***'), '');
  assert.equal(keyFromName('x'.repeat(39) + ' yz').length <= 40, true);
  assert.ok(isLogoKey(keyFromName('x'.repeat(39) + ' yz')));
});

test('a vote pathname carries the vote, and a bad key or id is refused', () => {
  const path = pathnames.vote('vote', VOTER, 1700000000000, 'm1', 'm2');
  assert.equal(path, `vote/votes/${VOTER}/1700000000000_m1_m2.json`);
  assert.deepEqual(parseVotePath('vote', path), { voterId: VOTER, ts: 1700000000000, winner: 'm1', loser: 'm2' });
  for (const bad of [
    `vote/votes/${VOTER}/1_m_1_m2.json`,
    `vote/votes/${VOTER}/1_M1_m2.json`,
    `vote/votes/${VOTER}/1_m1_m1.json`,
    `vote/votes/${VOTER}/x_m1_m2.json`,
    `vote/votes/${VOTER}/1_m1_m2.txt`,
    `vote/votes/short/1_m1_m2.json`,
    `vote/votes/${VOTER}/sub/1_m1_m2.json`,
    `other/votes/${VOTER}/1_m1_m2.json`,
  ]) {
    assert.equal(parseVotePath('vote', bad), null, bad);
  }
});

test('the other pathnames parse back and refuse bad shapes', () => {
  const device = 'c'.repeat(24);
  assert.deepEqual(parseLikesPath('vote', pathnames.like('vote', VOTER, 5)), { voterId: VOTER, ts: 5 });
  assert.equal(parseLikesPath('vote', `vote/likes/${VOTER}/x.json`), null);
  assert.deepEqual(parseDevicePath('vote', pathnames.device('vote', device, VOTER)), { deviceId: device, voterId: VOTER });
  assert.equal(parseDevicePath('vote', `vote/devices/${device}/nope`), null);
  assert.deepEqual(parseLogoPath('vote', 'vote/logos/m1.svg'), { key: 'm1', ext: 'svg' });
  assert.deepEqual(parseLogoPath('vote', 'vote/logos/m1.json'), { key: 'm1', ext: 'json' });
  assert.equal(parseLogoPath('vote', 'vote/logos/m1.gif'), null);
  assert.equal(parseLogoPath('vote', 'vote/logos/a_b.svg'), null);
  assert.equal(parseLogoPath('vote', 'vote/logos/x/m1.svg'), null);
  assert.equal(parseMarkerPath('vote', 'vote/hidden/m1', 'hidden'), 'm1');
  assert.equal(parseMarkerPath('vote', 'vote/hidden/M1', 'hidden'), null);
  assert.equal(parseMarkerPath('vote', `vote/excluded/${VOTER}`, 'excluded'), VOTER);
  assert.equal(parseMarkerPath('vote', `vote/voters/${VOTER}.json`, 'voters'), VOTER);
  assert.equal(parseMarkerPath('vote', `vote/voters/${VOTER}`, 'voters'), null);
});

test('the namespace, the logo address and the team label', () => {
  const before = process.env.VOTE_NAMESPACE;
  delete process.env.VOTE_NAMESPACE;
  assert.equal(namespace(), 'vote');
  process.env.VOTE_NAMESPACE = 'vote-smoke';
  assert.equal(namespace(), 'vote-smoke');
  process.env.VOTE_NAMESPACE = '../x';
  assert.equal(namespace(), 'vote');
  if (before === undefined) delete process.env.VOTE_NAMESPACE;
  else process.env.VOTE_NAMESPACE = before;
  assert.equal(logoSrc('m1', 36), '/api/vote/logo/m1?v=10');
  assert.equal(domainLabel('generaltranslation.com'), 'GT team');
  assert.equal(domainLabel('example.com'), 'example.com');
});
