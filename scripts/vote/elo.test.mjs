// Tests for src/lib/vote/elo.ts: Elo replayed over the vote log, with the
// latest vote per voter per pair counted at its own time, excluded voters
// and hidden options skipped, and the domain filter. Loaded through Node's
// type stripping.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { importTs } from '../lint/seo.mjs';

const { byNewestMatchup, computeElo, dedupeVotes, expectedScore, firstVoteAt, pairId } = await importTs(new URL('../../src/lib/vote/elo.ts', import.meta.url));

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

test('a repeated pair from one voter counts once, the latest in time, either order', () => {
  const votes = [vote('v1', 30, 'b', 'a'), vote('v1', 10, 'a', 'b'), vote('v1', 20, 'a', 'b')];
  const { rows, counted } = computeElo(votes, { keys: KEYS });
  assert.equal(counted.length, 1);
  assert.equal(counted[0].ts, 30);
  assert.equal(rows.get('b').wins, 1);
  assert.equal(rows.get('a').wins, 0);
  assert.equal(rows.get('a').losses, 1);
  assert.equal(dedupeVotes(votes).length, 1);
  assert.equal(pairId('b', 'a'), pairId('a', 'b'));
});

test('a changed vote replays at the time of its latest cast, after the votes cast before it', () => {
  /* v1 voted a over b first, then v2 voted c over a, then v1 changed to b over a */
  const changed = [vote('v1', 1, 'a', 'b'), vote('v2', 2, 'c', 'a'), vote('v1', 3, 'b', 'a')];
  const replay = [vote('v2', 2, 'c', 'a'), vote('v1', 3, 'b', 'a')];
  const one = computeElo(changed, { keys: KEYS });
  const two = computeElo(replay, { keys: KEYS });
  assert.deepEqual(one.counted.map((v) => [v.voterId, v.ts]), [['v2', 2], ['v1', 3]]);
  for (const key of KEYS) assert.equal(one.rows.get(key).elo, two.rows.get(key).elo);
  /* the order matters: replayed at its first time, the same two votes rate a differently */
  const early = computeElo([vote('v1', 1, 'b', 'a'), vote('v2', 2, 'c', 'a')], { keys: KEYS });
  assert.notEqual(early.rows.get('b').elo, one.rows.get('b').elo);
});

test('a changed vote moves the record and the matrix, never counting the pair twice', () => {
  const votes = [vote('v1', 1, 'a', 'b'), vote('v1', 5, 'b', 'a'), vote('v1', 9, 'a', 'b'), vote('v2', 2, 'a', 'b')];
  const { rows, counted, matrix } = computeElo(votes, { keys: KEYS });
  assert.equal(counted.length, 2);
  assert.deepEqual([rows.get('a').wins, rows.get('a').losses, rows.get('a').games], [2, 0, 2]);
  assert.deepEqual([rows.get('b').wins, rows.get('b').losses, rows.get('b').games], [0, 2, 2]);
  assert.equal(matrix.wins[0][1], 2);
  assert.equal(matrix.wins[1][0], 0);
});

test('two casts on one pair in one millisecond resolve the same way whatever order they arrive in', () => {
  const one = dedupeVotes([vote('v1', 7, 'a', 'b'), vote('v1', 7, 'b', 'a')]);
  const two = dedupeVotes([vote('v1', 7, 'b', 'a'), vote('v1', 7, 'a', 'b')]);
  assert.equal(one.length, 1);
  assert.deepEqual(one, two);
});

test('the counted votes list newest matchup first, and a changed vote keeps the place of its first vote', () => {
  /* v1 voted a over b, then c over d, then changed a over b to b over a */
  const votes = [vote('v1', 1, 'a', 'b'), vote('v1', 2, 'c', 'd'), vote('v1', 3, 'b', 'a')];
  assert.deepEqual(byNewestMatchup(votes).map((v) => [v.winner, v.ts]), [['c', 2], ['b', 3]]);
  assert.deepEqual(byNewestMatchup([...votes].reverse()), byNewestMatchup(votes));
  assert.deepEqual([...firstVoteAt(votes).values()].sort(), [1, 2]);
  /* one millisecond, two matchups: the order is still fixed */
  const tied = [vote('v1', 5, 'c', 'd'), vote('v1', 5, 'a', 'b')];
  assert.deepEqual(byNewestMatchup(tied), byNewestMatchup([...tied].reverse()));
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
