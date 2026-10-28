// Tests for src/lib/vote/schedule.ts: every option reaches its target
// number of matchups per voter for 2 to 16 options, a new option is
// scheduled first for a voter who had finished, progress never runs below
// what is done, a decision's own appearances setting, and the likes step,
// which a decision with likes off skips. Loaded through Node's type
// stripping.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { importTs } from '../lint/seo.mjs';

const { appearanceTarget, hash32, needsLikes, schedule, standing, voterOrder } = await importTs(new URL('../../src/lib/vote/schedule.ts', import.meta.url));

const keysOf = (n) => Array.from({ length: n }, (_, i) => `m${i + 1}`);
const pairKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);

/* a voter answers every pair until the schedule stops; the left option wins */
function runVoter(voterId, keys, votes = [], ratings) {
  const seen = new Set(votes.map((v) => pairKey(v.winner, v.loser)));
  for (let step = 0; step < 1000; step += 1) {
    const s = schedule({ voterId, keys, votes, ratings });
    assert.ok(s.progress.total >= s.progress.done, 'total never below done');
    if (!s.pair) return { votes, final: s };
    const { left, right } = s.pair;
    assert.notEqual(left, right);
    assert.ok(keys.includes(left) && keys.includes(right));
    assert.ok(!seen.has(pairKey(left, right)), 'a pair is never asked twice');
    seen.add(pairKey(left, right));
    votes = [...votes, { winner: left, loser: right }];
  }
  throw new Error('the schedule did not finish');
}

test("for 2 to 16 options every option reaches its target and the schedule stops", () => {
  for (let n = 2; n <= 16; n += 1) {
    const keys = keysOf(n);
    const target = appearanceTarget(n, 3);
    assert.equal(target, Math.min(3, n - 1));
    const { votes, final } = runVoter(`voter-${n}`, keys);
    for (const key of keys) assert.ok(final.appearances.get(key) >= target, `${key} of ${n}`);
    assert.deepEqual(final.progress, { done: votes.length, total: votes.length });
    /* never more than one matchup over the ideal ceil(n * target / 2) */
    assert.ok(votes.length <= Math.ceil((n * target) / 2) + 1, `${n} options took ${votes.length}`);
  }
});

test('the first progress total of a new voter is ceil(n * target / 2)', () => {
  for (let n = 2; n <= 16; n += 1) {
    const keys = keysOf(n);
    const first = schedule({ voterId: 'x', keys, votes: [] });
    assert.equal(first.progress.done, 0);
    assert.equal(first.progress.total, Math.ceil((n * appearanceTarget(n, 3)) / 2));
  }
});

test("a newly added option is scheduled first for a voter who had finished", () => {
  const keys = keysOf(8);
  const { votes } = runVoter('returning', keys);
  const grown = [...keys, 'fresh'];
  const s = schedule({ voterId: 'returning', keys: grown, votes });
  assert.ok(s.pair);
  assert.ok([s.pair.left, s.pair.right].includes('fresh'));
  assert.equal(s.progress.done, votes.length);
  assert.ok(s.progress.total > s.progress.done);
  /* every remaining matchup includes the new option, and it stops at the target */
  const { votes: after, final } = runVoter('returning', grown, votes);
  const added = after.slice(votes.length);
  assert.equal(added.length, 3);
  for (const v of added) assert.ok(v.winner === 'fresh' || v.loser === 'fresh');
  assert.equal(final.appearances.get('fresh'), 3);
});

test("duplicate votes, votes on hidden options and self votes do not count", () => {
  const keys = keysOf(4);
  const votes = [
    { winner: 'm1', loser: 'm2' },
    { winner: 'm2', loser: 'm1' },
    { winner: 'm1', loser: 'gone' },
    { winner: 'm3', loser: 'm3' },
  ];
  const s = schedule({ voterId: 'v', keys, votes });
  assert.equal(s.progress.done, 1);
  assert.equal(s.appearances.get('m1'), 1);
  assert.equal(s.appearances.has('gone'), false);
});

test("fewer than two options means no matchups", () => {
  assert.equal(schedule({ voterId: 'v', keys: [], votes: [] }).pair, null);
  const one = schedule({ voterId: 'v', keys: ['m1'], votes: [] });
  assert.equal(one.pair, null);
  assert.deepEqual(one.progress, { done: 0, total: 0 });
});

test('the partner is the closest global Elo among equally seen options', () => {
  const keys = ['m1', 'm2', 'm3', 'm4'];
  /* the first option is the voter's own hash order; rate one other option next to it and the rest far away */
  const pick = [...keys].sort((x, y) => hash32(`elo:${x}`) - hash32(`elo:${y}`) || (x < y ? -1 : 1))[0];
  const near = keys.filter((k) => k !== pick).at(-1);
  const ratings = new Map(keys.map((k) => [k, k === pick ? 1200 : k === near ? 1190 : 800]));
  const { pair } = schedule({ voterId: 'elo', keys, votes: [], ratings });
  assert.deepEqual([pair.left, pair.right].sort(), [pick, near].sort());
});

test('voters differ in order, and each voter sees one stable side per pair', () => {
  const keys = keysOf(10);
  const firsts = new Set();
  for (let i = 0; i < 20; i += 1) {
    const { pair } = schedule({ voterId: `v${i}`, keys, votes: [] });
    firsts.add(pairKey(pair.left, pair.right));
  }
  assert.ok(firsts.size > 3);
  const one = schedule({ voterId: 'same', keys, votes: [] }).pair;
  const two = schedule({ voterId: 'same', keys, votes: [] }).pair;
  assert.deepEqual(one, two);
  assert.notDeepEqual(voterOrder('a', keys), voterOrder('b', keys));
  assert.deepEqual([...voterOrder('a', keys)].sort(), [...keys].sort());
});

test("the likes step is owed until the latest record has seen every active option", () => {
  const keys = ['m1', 'm2', 'm3'];
  assert.equal(needsLikes(null, keys), true);
  assert.equal(needsLikes({ seen: ['m1', 'm2'] }, keys), true);
  assert.equal(needsLikes({ seen: ['m1', 'm2', 'm3', 'old'] }, keys), false);
  assert.equal(needsLikes(null, []), false);
});

test('hash32 is FNV-1a', () => {
  assert.equal(hash32(''), 0x811c9dc5);
  assert.equal(hash32('a'), 0xe40c292c);
});

test("a decision's appearances setting sets the target", () => {
  const keys = keysOf(8);
  for (const appearances of [1, 2, 5]) {
    const votes = [];
    let s = schedule({ voterId: 'a', keys, votes, appearances });
    assert.equal(s.target, appearances);
    while (s.pair) {
      votes.push({ winner: s.pair.left, loser: s.pair.right });
      s = schedule({ voterId: 'a', keys, votes, appearances });
    }
    for (const key of keys) assert.ok(s.appearances.get(key) >= appearances, `${key} at ${appearances}`);
    assert.ok(votes.length <= Math.ceil((keys.length * appearances) / 2) + 1);
  }
});

test('with likes off a voter is complete when the matchups are done', () => {
  const keys = keysOf(5);
  const { final } = runVoter('off', keys);
  assert.deepEqual(standing({ sched: final, keys, latest: null, likes: false }), { needsLikes: false, complete: true });
  assert.deepEqual(standing({ sched: final, keys, latest: null, likes: true }), { needsLikes: true, complete: false });
  assert.deepEqual(standing({ sched: final, keys, latest: { seen: keys }, likes: true }), { needsLikes: false, complete: true });
  const open = schedule({ voterId: 'off', keys, votes: [] });
  assert.deepEqual(standing({ sched: open, keys, latest: null, likes: false }), { needsLikes: false, complete: false });
  assert.deepEqual(standing({ sched: open, keys, latest: null, likes: true }), { needsLikes: false, complete: false }, 'likes wait for the matchups');
});

test('a new option after the likes step asks for the matchups, then the likes again', () => {
  const keys = keysOf(4);
  const { votes, final } = runVoter('again', keys);
  const latest = { seen: keys };
  assert.equal(standing({ sched: final, keys, latest, likes: true }).complete, true);
  const grown = [...keys, 'fresh'];
  const s = schedule({ voterId: 'again', keys: grown, votes });
  assert.ok(s.pair);
  assert.deepEqual(standing({ sched: s, keys: grown, latest, likes: true }), { needsLikes: false, complete: false });
  const { final: after } = runVoter('again', grown, votes);
  assert.deepEqual(standing({ sched: after, keys: grown, latest, likes: true }), { needsLikes: true, complete: false });
});
