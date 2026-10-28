// Tests for src/lib/vote/elo.ts: Elo replayed over the vote log, with the
// first vote per voter per pair counted, excluded voters and hidden options
// skipped, and the domain filter. Loaded through Node's type stripping.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { importTs } from '../lint/seo.mjs';

const { computeElo, dedupeVotes, expectedScore, pairId } = await importTs(new URL('../../src/lib/vote/elo.ts', import.meta.url));

const KEYS = ['a', 'b', 'c', 'd'];
const vote = (voterId, ts, winner, loser) => ({ voterId, ts, winner, loser });

test('one vote moves both ratings by K/2 from the start', () => {
  const { rows } = computeElo([vote('v1', 1, 'a', 'b')], { keys: KEYS });
  assert.equal(rows.get('a').elo, 1016);
  assert.equal(rows.get('b').elo, 984);
  assert.deepEqual([rows.get('a').wins, rows.get('a').losses, rows.get('a').games], [1, 0, 1]);
  assert.deepEqual([rows.get('b').wins, rows.get('b').losses, rows.get('b').games], [0, 1, 1]);
  assert.equal(rows.get('c').games, 0);
  assert.equal(rows.get('c').elo, 1000);
});

test('a repeated pair from one voter counts once, the first in time, either order', () => {
  const votes = [vote('v1', 30, 'b', 'a'), vote('v1', 10, 'a', 'b'), vote('v1', 20, 'a', 'b')];
  const { rows, counted } = computeElo(votes, { keys: KEYS });
  assert.equal(counted.length, 1);
  assert.equal(counted[0].ts, 10);
  assert.equal(rows.get('a').wins, 1);
  assert.equal(rows.get('b').wins, 0);
  assert.equal(dedupeVotes(votes).length, 1);
  assert.equal(pairId('b', 'a'), pairId('a', 'b'));
});

test('the same pair from two voters counts twice', () => {
  const { rows } = computeElo([vote('v1', 1, 'a', 'b'), vote('v2', 2, 'a', 'b')], { keys: KEYS });
  assert.equal(rows.get('a').wins, 2);
  assert.equal(rows.get('b').losses, 2);
});

test('votes replay in time order whatever order they arrive in', () => {
  const votes = [vote('v1', 3, 'c', 'a'), vote('v2', 1, 'a', 'b'), vote('v3', 2, 'b', 'c')];
  const shuffled = [votes[1], votes[2], votes[0]];
  const one = computeElo(votes, { keys: KEYS });
  const two = computeElo(shuffled, { keys: KEYS });
  for (const key of KEYS) assert.equal(one.rows.get(key).elo, two.rows.get(key).elo);
  assert.deepEqual(one.counted.map((v) => v.ts), [1, 2, 3]);
});

test('excluded voters are skipped', () => {
  const votes = [vote('v1', 1, 'a', 'b'), vote('bad', 2, 'b', 'a'), vote('bad', 3, 'c', 'a')];
  const { rows, counted } = computeElo(votes, { keys: KEYS, excluded: new Set(['bad']) });
  assert.equal(counted.length, 1);
  assert.equal(rows.get('b').wins, 0);
  assert.equal(rows.get('c').games, 0);
});

test('an option outside the active keys (hidden) takes no part, nor do its votes', () => {
  const votes = [vote('v1', 1, 'a', 'hidden'), vote('v1', 2, 'hidden', 'b'), vote('v1', 3, 'a', 'b')];
  const { rows, counted, matrix } = computeElo(votes, { keys: ['a', 'b'] });
  assert.equal(counted.length, 1);
  assert.equal(rows.has('hidden'), false);
  assert.equal(rows.get('a').games, 1);
  assert.deepEqual(matrix.keys, ['a', 'b']);
});

test('the voter filter replays only those voters (a domain)', () => {
  const votes = [vote('team1', 1, 'a', 'b'), vote('team2', 2, 'a', 'c'), vote('out1', 3, 'd', 'a')];
  const team = computeElo(votes, { keys: KEYS, voters: new Set(['team1', 'team2']) });
  assert.equal(team.counted.length, 2);
  assert.equal(team.rows.get('a').wins, 2);
  assert.equal(team.rows.get('d').games, 0);
  const all = computeElo(votes, { keys: KEYS });
  assert.equal(all.counted.length, 3);
  assert.equal(all.rows.get('d').wins, 1);
});

test('the matrix holds wins of row over column', () => {
  const votes = [vote('v1', 1, 'a', 'b'), vote('v2', 2, 'a', 'b'), vote('v3', 3, 'b', 'a'), vote('v1', 4, 'c', 'd')];
  const { matrix } = computeElo(votes, { keys: KEYS });
  const at = (row, col) => matrix.wins[matrix.keys.indexOf(row)][matrix.keys.indexOf(col)];
  assert.equal(at('a', 'b'), 2);
  assert.equal(at('b', 'a'), 1);
  assert.equal(at('c', 'd'), 1);
  assert.equal(at('d', 'c'), 0);
  assert.equal(at('a', 'a'), 0);
});

test('ratings are conserved and the expected score is symmetric', () => {
  const votes = [];
  for (let i = 0; i < 40; i += 1) {
    const [w, l] = [KEYS[i % 4], KEYS[(i * 3 + 1) % 4]];
    if (w !== l) votes.push(vote(`v${i % 7}`, i, w, l));
  }
  const { rows } = computeElo(votes, { keys: KEYS });
  const sum = KEYS.reduce((s, key) => s + rows.get(key).elo, 0);
  assert.ok(Math.abs(sum - 4000) < 1e-9);
  assert.ok(Math.abs(expectedScore(1100, 1000) + expectedScore(1000, 1100) - 1) < 1e-12);
});

test('a vote of an option against itself is ignored', () => {
  const { counted } = computeElo([vote('v1', 1, 'a', 'a')], { keys: KEYS });
  assert.equal(counted.length, 0);
});
