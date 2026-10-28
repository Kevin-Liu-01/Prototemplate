// Tests for src/lib/vote/change.ts: a voter changes a matchup's winner only
// while the decision is open, on two active options, on a pair they voted
// on, to the other side and under MAX_CASTS votes on the pair; and sends
// their likes again only once the set differs from their latest record,
// under MAX_LIKES records, which keeps what it held for hidden options.
// Loaded through Node's type stripping.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { importTs } from '../lint/seo.mjs';

const { checkChange, checkLikes, MAX_CASTS, MAX_LIKES } = await importTs(new URL('../../src/lib/vote/change.ts', import.meta.url));
const { dedupeVotes } = await importTs(new URL('../../src/lib/vote/elo.ts', import.meta.url));

/* a voter who voted a over b once */
const base = { open: true, left: 'a', right: 'b', pick: 'right', counted: 'a', casts: 1 };

test('a change to the other side writes it, with the sides as sent', () => {
  assert.deepEqual(checkChange(base), { ok: true, left: 'a', right: 'b', winner: 'b', loser: 'a' });
  assert.deepEqual(checkChange({ ...base, left: 'b', right: 'a', pick: 'left' }), { ok: true, left: 'b', right: 'a', winner: 'b', loser: 'a' });
});

test('a decision that is not open takes no change, with the vote route sentence', () => {
  assert.deepEqual(checkChange({ ...base, open: false }), { ok: false, error: 'This vote is not open.' });
});

test('an alias that names no active option (hidden, missing, another decision) is refused', () => {
  for (const side of [{ left: undefined }, { right: undefined }, { left: 'b' }]) {
    const check = checkChange({ ...base, ...side });
    assert.equal(check.ok, false);
    assert.equal(check.error, 'That pair is no longer open.');
  }
});

test('a pair the voter never voted on is refused', () => {
  assert.deepEqual(checkChange({ ...base, counted: null, casts: 0 }), { ok: false, error: 'You have not voted on this pair.' });
});

test('the winner that already counts is refused, so nothing is written', () => {
  assert.deepEqual(checkChange({ ...base, pick: 'left' }), { ok: false, error: 'That is already your vote.' });
  /* after a change the changed winner is the one that counts */
  assert.equal(checkChange({ ...base, counted: 'b', casts: 2 }).error, 'That is already your vote.');
  assert.equal(checkChange({ ...base, counted: 'b', casts: 2, pick: 'left' }).ok, true);
});

test('a pair takes MAX_CASTS votes in all: the first and nine changes', () => {
  assert.equal(MAX_CASTS, 10);
  assert.equal(checkChange({ ...base, casts: MAX_CASTS - 1 }).ok, true);
  assert.deepEqual(checkChange({ ...base, casts: MAX_CASTS }), { ok: false, error: 'This pair takes no more changes.' });
});

test('the counted winner a change checks against is the latest cast, as Elo counts it', () => {
  const votes = [
    { voterId: 'v', ts: 1, winner: 'a', loser: 'b' },
    { voterId: 'v', ts: 2, winner: 'b', loser: 'a' },
  ];
  const [counted] = dedupeVotes(votes);
  assert.equal(counted.winner, 'b');
  assert.equal(checkChange({ ...base, counted: counted.winner, casts: votes.length }).error, 'That is already your vote.');
});

const keys = ['a', 'b', 'c'];

test('a voter who owes the likes step sends any set of at least one', () => {
  assert.deepEqual(checkLikes({ liked: ['a', 'a', 'c'], keys, latest: null, owes: true }), { ok: true, liked: ['a', 'c'], seen: keys });
  assert.deepEqual(checkLikes({ liked: [], keys, latest: null, owes: true }), { ok: false, status: 400, error: 'Pick at least one you like.' });
  assert.equal(checkLikes({ liked: ['gone'], keys, latest: null, owes: true }).status, 400);
});

test('a voter whose likes are in may change them; the same set again is a 409', () => {
  const latest = { liked: ['a', 'c'], seen: keys };
  assert.deepEqual(checkLikes({ liked: ['c', 'a'], keys, latest, owes: false }), { ok: false, status: 409, error: 'Your likes are in.' });
  assert.deepEqual(checkLikes({ liked: ['b'], keys, latest, owes: false }), { ok: true, liked: ['b'], seen: keys });
  assert.deepEqual(checkLikes({ liked: [], keys, latest, owes: false }).status, 400);
});

test('a voter who owes likes for a new option may send the same set, which now sees it', () => {
  const latest = { liked: ['a'], seen: ['a', 'b'] };
  assert.deepEqual(checkLikes({ liked: ['a'], keys, latest, owes: true }), { ok: true, liked: ['a'], seen: keys });
});

test('a new record keeps the latest record for options outside the active set', () => {
  /* h was liked and seen, then hidden: showing it again restores the pick and owes nothing */
  const latest = { liked: ['a', 'h'], seen: [...keys, 'h'] };
  assert.deepEqual(checkLikes({ liked: ['a'], keys, latest, owes: false }).error, 'Your likes are in.');
  assert.deepEqual(checkLikes({ liked: ['b'], keys, latest, owes: false }), { ok: true, liked: ['b', 'h'], seen: [...keys, 'h'] });
});

test('a change of likes stops at MAX_LIKES records; a record a new option owes is always taken', () => {
  const latest = { liked: ['a'], seen: keys };
  assert.equal(MAX_LIKES, 10);
  assert.equal(checkLikes({ liked: ['b'], keys, latest, owes: false, records: MAX_LIKES - 1 }).ok, true);
  assert.deepEqual(checkLikes({ liked: ['b'], keys, latest, owes: false, records: MAX_LIKES }), {
    ok: false,
    status: 409,
    error: 'Your likes take no more changes.',
  });
  /* the same set still says the likes are in */
  assert.equal(checkLikes({ liked: ['a'], keys, latest, owes: false, records: MAX_LIKES }).error, 'Your likes are in.');
  assert.equal(checkLikes({ liked: ['b'], keys, latest: { liked: ['a'], seen: ['a'] }, owes: true, records: MAX_LIKES }).ok, true);
});
