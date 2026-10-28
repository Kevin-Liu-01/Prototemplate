// Tests for src/lib/vote/decisions.ts: decision ids and the reserved path
// segments, keys from names with -2, -3 on a collision, option names from
// file names, text options from lines, a stored meta read back (failing
// closed), meta changes and new decisions checked, who sees a decision in
// each status (a session needs at least one), when the results open, the
// options the hub counts as new for a voter who had finished, with likes on
// and off, and the voter groups the results may show. Loaded through Node's
// type stripping.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { importTs } from '../lint/seo.mjs';

const decisions = await importTs(new URL('../../src/lib/vote/decisions.ts', import.meta.url));
const { isAllowedEmail, normalizeEmail } = await importTs(new URL('../../src/lib/vote/identity.ts', import.meta.url));
const { schedule } = await importTs(new URL('../../src/lib/vote/schedule.ts', import.meta.url));
const {
  canOpen,
  checkMetaPatch,
  checkName,
  checkNewDecision,
  checkText,
  headOf,
  isDecisionId,
  keyFromName,
  keysFor,
  nameFromFilename,
  newOptions,
  parseDecisionMeta,
  parseTextLines,
  resultsOpen,
  sortDecisions,
  uniqueKey,
  visibleDecisions,
  visibleGroups,
  voterSees,
  votingOpen,
} = decisions;

const meta = (over = {}) => ({
  id: 'first',
  title: 'First',
  question: '',
  kind: 'mark',
  status: 'open',
  access: ['@team.example'],
  appearances: 3,
  likes: true,
  createdAt: '2026-10-01T00:00:00.000Z',
  order: 0,
  ...over,
});

test('a decision id is a key and not a reserved path segment', () => {
  for (const good of ['marks-2', 'x', 'a'.repeat(40), 'results-q4']) assert.ok(isDecisionId(good), good);
  for (const bad of ['admin', 'api', 'results', 'new', '', 'A', 'a_b', 'a/b', 'a'.repeat(41), null, 7]) {
    assert.ok(!isDecisionId(bad), String(bad));
  }
});

test('a key from a name', () => {
  assert.equal(keyFromName('Doubled Line 2'), 'doubled-line-2');
  assert.equal(keyFromName('  Café  Noir!! '), 'cafe-noir');
  assert.equal(keyFromName('***'), '');
  assert.ok(keyFromName(`${'x'.repeat(39)} yz`).length <= 40);
});

test('a taken key gets -2, -3 and so on, cut to fit 40 characters', () => {
  assert.equal(uniqueKey('mark', new Set()), 'mark');
  assert.equal(uniqueKey('mark', new Set(['mark'])), 'mark-2');
  assert.equal(uniqueKey('mark', new Set(['mark', 'mark-2'])), 'mark-3');
  assert.equal(uniqueKey('', new Set()), 'option', 'an empty slug falls back');
  assert.equal(uniqueKey('', new Set(['option'])), 'option-2');
  const long = 'a'.repeat(40);
  const next = uniqueKey(long, new Set([long]));
  assert.equal(next, `${'a'.repeat(38)}-2`);
  assert.equal(next.length, 40);
  assert.equal(uniqueKey(`${'a'.repeat(38)}-b`, new Set([`${'a'.repeat(38)}-b`])), `${'a'.repeat(38)}-2`);
});

test('a batch of names gets keys that collide with nothing taken and with each other', () => {
  const keys = keysFor(['Mark', 'mark', 'MARK!', 'Other', '***', '***'], new Set(['mark', 'other']));
  assert.deepEqual(keys, ['mark-2', 'mark-3', 'mark-4', 'other-2', 'option', 'option-2']);
  assert.equal(new Set(keys).size, keys.length);
});

test('an option name from a file name', () => {
  assert.equal(nameFromFilename('doubled-line_two.svg'), 'doubled line two');
  assert.equal(nameFromFilename('C:\\marks\\Round  Mark.final.png'), 'Round Mark.final');
  assert.equal(nameFromFilename('folder/__x__.webp'), 'x');
  assert.equal(nameFromFilename('noext'), 'noext');
  assert.equal(nameFromFilename('.svg'), '');
  assert.ok(nameFromFilename(`${'n'.repeat(100)}.svg`).length <= 80);
});

test('names and texts are checked', () => {
  assert.equal(checkName('  Two   words '), 'Two words');
  assert.equal(checkName(''), null);
  assert.equal(checkName('x'.repeat(81)), null);
  assert.equal(checkName('a\u0007b'), null);
  assert.equal(checkName(5), null);
  assert.equal(checkText(undefined), '');
  assert.equal(checkText(' A  line\nwrapped '), 'A line wrapped');
  assert.equal(checkText('x'.repeat(280)).length, 280);
  assert.equal(checkText('x'.repeat(281)), null);
  assert.equal(checkText(3), null);
});

test('text options come from lines: "Name" or "Name: text"', () => {
  const parsed = parseTextLines('Ship it\n\n  Wait: Ship next week, after review  \r\nURL: https://example.com/a:b\n');
  assert.deepEqual(parsed, {
    options: [
      { name: 'Ship it', text: '' },
      { name: 'Wait', text: 'Ship next week, after review' },
      { name: 'URL', text: 'https://example.com/a:b' },
    ],
  });
  assert.ok('problems' in parseTextLines(''));
  assert.ok('problems' in parseTextLines('\n  \n'));
  const bad = parseTextLines(`Fine\n: no name\nLong: ${'x'.repeat(281)}`);
  assert.equal(bad.problems.length, 2);
  assert.ok('problems' in parseTextLines(Array.from({ length: 101 }, (_, i) => `Option ${i}`).join('\n')));
});

test('a stored meta reads back with defaults, failing closed', () => {
  assert.deepEqual(parseDecisionMeta(meta(), 'first'), meta());
  const sparse = parseDecisionMeta({ kind: 'text' }, 'second');
  assert.equal(sparse.title, 'second');
  assert.equal(sparse.status, 'draft', 'an unreadable status is a draft');
  assert.deepEqual(sparse.access, [], 'an unreadable access list lets no one in');
  assert.equal(sparse.appearances, 3);
  assert.equal(sparse.likes, true);
  assert.equal(parseDecisionMeta({ ...meta(), kind: 'video' }, 'first'), null);
  assert.equal(parseDecisionMeta(meta(), 'admin'), null);
  assert.equal(parseDecisionMeta(null, 'first'), null);
  assert.equal(parseDecisionMeta({ ...meta(), appearances: 99 }, 'first').appearances, 10);
  assert.equal(parseDecisionMeta({ ...meta(), appearances: 0 }, 'first').appearances, 1);
  assert.deepEqual(parseDecisionMeta({ ...meta(), access: ['@a.io', 4] }, 'first').access, ['@a.io']);
  assert.deepEqual(headOf(meta({ question: 'Which one?' })), { id: 'first', title: 'First', question: 'Which one?', kind: 'mark', status: 'open', likes: true });
});

test('a meta change is checked field by field', () => {
  assert.deepEqual(checkMetaPatch({ title: ' New  title ', status: 'closed', likes: false, appearances: 4, order: 2, question: 'Pick one' }), {
    patch: { title: 'New title', status: 'closed', likes: false, appearances: 4, order: 2, question: 'Pick one' },
  });
  assert.deepEqual(checkMetaPatch({}), { patch: {} });
  assert.deepEqual(checkMetaPatch({ question: '' }), { patch: { question: '' } });
  for (const bad of [{ title: '' }, { status: 'paused' }, { appearances: 0 }, { appearances: 11 }, { appearances: 2.5 }, { likes: 'yes' }, { order: 'first' }, { question: 'x'.repeat(201) }]) {
    assert.ok('error' in checkMetaPatch(bad), JSON.stringify(bad));
  }
});

test('a new decision takes its id from the title, never a reserved or taken one', () => {
  assert.deepEqual(checkNewDecision({ title: 'Homepage Hero', kind: 'image' }, new Set()), {
    value: { id: 'homepage-hero', title: 'Homepage Hero', kind: 'image', question: '' },
  });
  assert.equal(checkNewDecision({ title: 'Homepage Hero', kind: 'image' }, new Set(['homepage-hero'])).value.id, 'homepage-hero-2');
  assert.equal(checkNewDecision({ title: 'Admin', kind: 'text' }, new Set()).value.id, 'admin-2');
  assert.equal(checkNewDecision({ title: 'Results', kind: 'text' }, new Set()).value.id, 'results-2');
  assert.equal(checkNewDecision({ title: '!!!', kind: 'text' }, new Set()).value.id, 'decision');
  assert.equal(checkNewDecision({ title: 'X', id: 'chosen', kind: 'mark' }, new Set()).value.id, 'chosen');
  assert.deepEqual(checkNewDecision({ title: 'X', id: 'chosen', kind: 'mark' }, new Set(['chosen'])).status, 409);
  assert.equal(checkNewDecision({ title: 'X', id: 'new', kind: 'mark' }, new Set()).status, 400);
  assert.equal(checkNewDecision({ title: 'X', id: 'Bad Id', kind: 'mark' }, new Set()).status, 400);
  assert.equal(checkNewDecision({ title: 'X', kind: 'video' }, new Set()).status, 400);
  assert.equal(checkNewDecision({ kind: 'mark' }, new Set()).status, 400);
});

test('decisions sort by order, then age, then id', () => {
  const sorted = sortDecisions([
    meta({ id: 'c', order: 1 }),
    meta({ id: 'b', order: 0, createdAt: '2026-10-02T00:00:00.000Z' }),
    meta({ id: 'a', order: 0, createdAt: '2026-10-02T00:00:00.000Z' }),
    meta({ id: 'z', order: 0, createdAt: '2026-09-01T00:00:00.000Z' }),
  ]);
  assert.deepEqual(sorted.map((m) => m.id), ['z', 'a', 'b', 'c']);
});

test('drafts and archived decisions are hidden from voters; open and closed show', () => {
  assert.deepEqual(['draft', 'open', 'closed', 'archived'].map(voterSees), [false, true, true, false]);
  assert.deepEqual(['draft', 'open', 'closed', 'archived'].map(votingOpen), [false, true, false, false]);
  for (const status of ['draft', 'archived']) {
    assert.equal(canOpen(status, true, false), false, status);
    assert.equal(canOpen(status, true, true), true, `the admin opens a ${status}`);
  }
  assert.equal(canOpen('open', false, false), false, 'off the list');
  assert.equal(canOpen('closed', true, false), true);
  assert.equal(canOpen('open', false, true), true, 'the admin bypasses the list');
});

test('results open to a finished voter, to every voter once closed, and to the admin', () => {
  assert.equal(resultsOpen('open', false, false), false);
  assert.equal(resultsOpen('open', true, false), true);
  assert.equal(resultsOpen('closed', false, false), true);
  assert.equal(resultsOpen('draft', true, false), false);
  assert.equal(resultsOpen('archived', true, false), false);
  assert.equal(resultsOpen('draft', false, true), true);
});

test('a session needs at least one open or closed decision with the email on its list', () => {
  const metas = [
    meta({ id: 'draft', status: 'draft', access: ['*'] }),
    meta({ id: 'archived', status: 'archived', access: ['*'] }),
    meta({ id: 'team', status: 'open', access: ['@team.example'] }),
    meta({ id: 'closed', status: 'closed', access: ['ada@guest.io'] }),
    meta({ id: 'anyone', status: 'open', access: ['*'] }),
  ];
  const seen = (raw) => {
    const email = normalizeEmail(raw);
    return visibleDecisions(metas, (access) => isAllowedEmail(email, access)).map((m) => m.id);
  };
  assert.deepEqual(seen('x@team.example'), ['team', 'anyone']);
  assert.deepEqual(seen('Ada+hub@Guest.io'), ['closed', 'anyone']);
  assert.deepEqual(seen('eve@else.co'), ['anyone']);
  const onlyHidden = metas.slice(0, 2);
  assert.deepEqual(visibleDecisions(onlyHidden, () => true), [], 'drafts and archived never start a session');
  const noAny = metas.filter((m) => m.id !== 'anyone');
  assert.deepEqual(visibleDecisions(noAny, (access) => isAllowedEmail('eve@else.co', access)), [], 'an email on no decision is refused');
});

/* a voter answers every pair until the schedule stops; the left option wins */
function finish(voterId, keys, votes = [], appearances = 3) {
  for (let step = 0; step < 1000; step += 1) {
    const s = schedule({ voterId, keys, votes, appearances });
    if (!s.pair) return votes;
    votes = [...votes, { winner: s.pair.left, loser: s.pair.right }];
  }
  throw new Error('the schedule did not finish');
}

/* newOptions' inputs for one voter: every key added at `added` (ms), or at the time its entry in `late` gives */
function fresh(keys, votes, { lastVoteAt, added = 0, late = {}, likes = false, latestSeen = null }) {
  return newOptions({
    keys,
    addedAt: new Map(keys.map((key) => [key, new Date(late[key] ?? added).toISOString()])),
    lastVoteAt,
    latestSeen,
    likes,
    finishedAmong: (old) => schedule({ voterId: 'v', keys: old, votes, appearances: 3 }).pair === null,
  });
}

test('the hub counts new options for a voter who had finished, with likes off', () => {
  const keys = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'];
  const votes = finish('v', keys);
  const grown = [...keys, 'fresh-1', 'fresh-2'];
  const s = schedule({ voterId: 'v', keys: grown, votes, appearances: 3 });
  assert.ok(s.pair, 'the new options are scheduled');
  const late = { 'fresh-1': 3000, 'fresh-2': 3000 };
  assert.deepEqual(fresh(keys, votes, { lastVoteAt: 2000 }), [], 'nothing was added since');
  assert.deepEqual(fresh(grown, votes, { lastVoteAt: 2000, late }), ['fresh-1', 'fresh-2']);
  /* once the voter votes on the new options they stop counting as new */
  const after = finish('v', grown, votes);
  assert.deepEqual(fresh(grown, after, { lastVoteAt: 4000, late }), []);
});

test('a voter part way through has nothing new, and neither does one who has not started', () => {
  const keys = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'];
  assert.deepEqual(fresh(keys, [], { lastVoteAt: 0 }), []);
  const partial = finish('v', keys).slice(0, 2);
  assert.deepEqual(fresh(keys, partial, { lastVoteAt: 2000 }), []);
  assert.deepEqual(fresh(keys, partial, { lastVoteAt: 2000, likes: true }), [], 'no likes record yet');
  /* one vote among ten: the two options met are not a finished set */
  const ten = Array.from({ length: 10 }, (_, i) => `o${i}`);
  const one = finish('v', ten).slice(0, 1);
  assert.deepEqual(fresh(ten, one, { lastVoteAt: 2000 }), []);
  /* an option added after a voter's first vote is not new while they are part way */
  assert.deepEqual(fresh(ten, one, { lastVoteAt: 2000, late: { o9: 3000 } }), []);
});

test('with likes on, new options are the ones the latest likes record has not seen', () => {
  const keys = ['m1', 'm2', 'm3', 'fresh'];
  assert.deepEqual(fresh(keys, [], { lastVoteAt: 2000, likes: true, latestSeen: ['m1', 'm2', 'm3'] }), ['fresh']);
  assert.deepEqual(fresh(keys, [], { lastVoteAt: 2000, likes: true, latestSeen: [...keys, 'gone'] }), []);
});

test('voter groups show only when All minus them cannot single out a ballot', () => {
  const groups = (entries, admin = false) => visibleGroups(new Map(entries), admin, 3).map(([name]) => name);
  assert.deepEqual(groups([['a.co', 5], ['b.co', 3]]), ['a.co', 'b.co'], 'every voter is in a listed group');
  assert.deepEqual(groups([['a.co', 5], ['b.co', 3], ['c.co', 1]]), [], 'All minus the groups would show the one c.co ballot');
  assert.deepEqual(groups([['a.co', 5], ['b.co', 3], ['c.co', 1], ['d.co', 1]]), [], 'a rest of two is still too few');
  assert.deepEqual(groups([['a.co', 5], ['b.co', 3], ['c.co', 2], ['d.co', 1]]), ['a.co', 'b.co'], 'a rest of three stands as a group');
  assert.deepEqual(groups([['a.co', 5], ['c.co', 1]]), [], 'one listed group beside a lone voter');
  assert.deepEqual(groups([['a.co', 5], ['c.co', 2], ['d.co', 2]]), [], 'one listed group beside any rest');
  assert.deepEqual(groups([['a.co', 5]]), ['a.co'], 'one group that is everyone shows nothing new');
  assert.deepEqual(groups([['a.co', 2], ['b.co', 1]]), []);
  assert.deepEqual(groups([['a.co', 5], ['c.co', 1]], true), ['a.co', 'c.co'], 'the admin sees every group');
});
