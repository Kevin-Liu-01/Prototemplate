// Tests for scripts/lint-radius.mjs: a passing and a failing string per
// static rule, the live judges over recorded corners, and the repository.
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { PINS, judgeCorners, lintRadius, lintRadiusCss, lintRadiusTsx } from './lint-radius.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = 'src/app/x/x.css';
const rules = (problems) => problems.map((p) => p.rule);
const css = (body, rel = PAGE) => rules(lintRadiusCss(rel, body));

const TOKENS_OK = `:root {\n${Object.entries(PINS)
  .map(([k, v]) => `  ${k}: ${v};`)
  .join('\n')}\n}\n`;

test('K1: a literal corner fails, a token form passes', () => {
  assert.deepEqual(css('.x { border-radius: 6px; }'), ['K1']);
  assert.deepEqual(css('.x { border-radius: var(--pt-radius-card); }'), []);
  assert.deepEqual(css('.x { border-radius: calc(var(--pt-radius-control) - 1px); }'), []);
  assert.deepEqual(css('.x { border-radius: calc(var(--pt-radius-control) - 4px); }'), ['K1']);
  assert.deepEqual(css('.x { border-radius: 0; }'), ['K1']);
  assert.deepEqual(css('.x { border-radius: var(--pt-radius); }'), ['K1']);
  assert.deepEqual(css('.x { border-radius: var(--pt-radius-card, 6px); }'), ['K1']);
  assert.deepEqual(css('.x { border-radius: inherit; }'), []);
});

test('K1: a longhand and every value of a shorthand', () => {
  assert.deepEqual(css('.x { border-top-left-radius: 5px; }'), ['K1']);
  assert.deepEqual(css('.x { border-start-end-radius: 999px; }'), ['K1']);
  assert.deepEqual(css('.x { border-radius: var(--pt-radius-shell) var(--pt-radius-inner) var(--pt-radius-inner) var(--pt-radius-shell); }'), []);
  assert.deepEqual(css('.x { border-radius: var(--pt-radius-shell) 5px; }'), ['K1']);
});

test('K2: a shell, a row or an inner input is square', () => {
  assert.deepEqual(css('.pt-toolbar { border-radius: var(--pt-radius-control); }'), ['K2']);
  assert.deepEqual(css('.pt-rows > .pt-row { border-radius: var(--pt-radius-card); }'), ['K2']);
  assert.deepEqual(css('.pt-filter input { border-radius: var(--pt-radius-chip); }'), ['K2']);
  assert.deepEqual(css('.pt-toolbar { border-radius: var(--pt-radius-shell); }'), []);
  assert.deepEqual(css('.pt-book-band { border-radius: var(--pt-radius-card); }'), ['K2']);
});

test('K3: a control is never square, a chip reads the chip corner, a group is exempt', () => {
  assert.deepEqual(css('.pt-ib { border-radius: var(--pt-radius-shell); }'), ['K3']);
  assert.deepEqual(css('.pt-search-kbd { border-radius: var(--pt-radius-control); }'), ['K3']);
  assert.deepEqual(css('.pt-seg .pt-ib { border-radius: var(--pt-radius-shell); }'), []);
  assert.deepEqual(css('.pt-filter-clear { border-radius: var(--pt-radius-shell); }'), ['K3']);
  assert.deepEqual(css('.pt-search-kbd { border-radius: var(--pt-radius-chip); }'), []);
  assert.deepEqual(css('.pt-ib { border-radius: var(--pt-radius-control); }'), []);
});

test('K3: the named exception passes with its hatch', () => {
  assert.deepEqual(css('.pt-ib.is-solid {\n  border-radius: 8px; /* lint-radius: allow Present keeps 8px */\n}'), []);
  assert.deepEqual(css('.pt-ib.is-solid {\n  border-radius: 8px;\n}'), ['K1']);
});

test('K4: a radius custom property outside tokens.css fails', () => {
  assert.deepEqual(css('.x { --_radius: 12px; }'), ['K4']);
  assert.deepEqual(css('.x { --pt-gap: 4px; }'), []);
});

test('K5: a style object reads a token string; a Tailwind corner class fails; prose passes', () => {
  const tsx = (s) => rules(lintRadiusTsx('src/app/x/X.tsx', s));
  assert.deepEqual(tsx('<div style={{ borderRadius: 8 }} />'), ['K5']);
  assert.deepEqual(tsx("<div style={{ borderRadius: 'var(--pt-radius-card)' }} />"), []);
  assert.deepEqual(tsx("<div className='rounded-md p-2' />"), ['K5']);
  assert.deepEqual(tsx("<div className={cn('p-2', on && 'md:rounded-lg')} />"), ['K5']);
  assert.deepEqual(tsx("<button aria-label='a rounded corner' />"), []);
});

test('K6: tokens.css pins the six tokens and drops --pt-radius', () => {
  const tokens = (body) => rules(lintRadiusCss('src/components/viewer/tokens.css', body));
  assert.deepEqual(tokens(TOKENS_OK), []);
  assert.deepEqual(tokens(TOKENS_OK.replace('--pt-radius-control: 6px', '--pt-radius-control: 8px')), ['K6']);
  assert.deepEqual(tokens(`${TOKENS_OK}:root { --pt-radius: 6px; }\n`), ['K6']);
  assert.deepEqual(tokens(TOKENS_OK.replace('  --pt-radius-chip: 4px;\n', '')), ['K6']);
});

test('H0: a hatch needs a reason', () => {
  assert.deepEqual(css('.x {\n  /* lint-radius: allow */\n  border-radius: 3px;\n}'), ['H0']);
  assert.deepEqual(css('.x {\n  /* lint-radius: allow a specimen */\n  border-radius: 3px;\n}'), []);
});

/* a recorded element: the corners in px, the rect, the borders, what it is */
const rec = (id, o = {}) => ({
  id,
  parent: null,
  sel: o.sel ?? `div#${id}`,
  tag: o.tag ?? 'div',
  rect: o.rect ?? { x: 0, y: 0, w: 100, h: 32 },
  corners: (o.r ?? [0, 0, 0, 0]).map((px) => (typeof px === 'string' ? { px: 50, pct: parseFloat(px) } : { px, pct: null })),
  borders: o.borders ?? [1, 1, 1, 1],
  box: o.box ?? true,
  clips: o.clips ?? false,
  media: o.media ?? false,
  interactive: o.interactive ?? false,
  shell: o.shell ?? false,
  row: o.row ?? false,
  inner: false,
  scrim: false,
  group: o.group ?? false,
  specimen: false,
  exception: false,
  chain: o.chain ?? [],
});

test('L1: a shell computes a square corner', () => {
  assert.match(judgeCorners([rec(1, { shell: true, r: [6, 6, 6, 6] })]).failures[0], /^L1 /);
  assert.deepEqual(judgeCorners([rec(1, { shell: true })]).failures, []);
});

test('L2: a control that draws a box is round; a group member squares its interior corners only', () => {
  assert.match(judgeCorners([rec(1, { interactive: true })]).failures[0], /^L2 /);
  assert.deepEqual(judgeCorners([rec(1, { interactive: true, r: [6, 6, 6, 6] })]).failures, []);
  const seg = rec(1, { rect: { x: 0, y: 0, w: 160, h: 32 }, r: [6, 6, 6, 6] });
  const first = rec(2, { interactive: true, group: true, rect: { x: 1, y: 1, w: 79, h: 30 }, r: [5, 0, 0, 5], chain: [{ id: 1 }] });
  const last = rec(3, { interactive: true, group: true, rect: { x: 80, y: 1, w: 79, h: 30 }, r: [0, 0, 0, 0], chain: [{ id: 1 }] });
  const out = judgeCorners([seg, first, last]).failures;
  assert.equal(out.length, 2);
  assert.ok(out.every((f) => f.startsWith('L2 div#3')));
});

test('L3: a corner off the scale, and 50% on a box that is not square', () => {
  assert.match(judgeCorners([rec(1, { r: [8, 8, 8, 8] })]).failures[0], /^L3 /);
  assert.match(judgeCorners([rec(1, { r: ['50%', '50%', '50%', '50%'], rect: { x: 0, y: 0, w: 40, h: 20 } })]).failures[0], /^L3 /);
  assert.deepEqual(judgeCorners([rec(1, { r: ['50%', '50%', '50%', '50%'], rect: { x: 0, y: 0, w: 22, h: 22 } })]).failures, []);
});

test('L4: a picture in a rounded frame is clipped', () => {
  const frame = (clips) => rec(1, { r: [6, 6, 6, 6], rect: { x: 0, y: 0, w: 320, h: 180 }, clips });
  const img = rec(2, { tag: 'img', media: true, box: false, borders: [0, 0, 0, 0], rect: { x: 1, y: 1, w: 318, h: 178 }, chain: [{ id: 1 }] });
  assert.match(judgeCorners([frame(false), img]).failures[0], /^L4 /);
  assert.deepEqual(judgeCorners([frame(true), img]).failures, []);
});

test('L5: a rounded box 1px inside a rounded box is concentric (a warning)', () => {
  const outer = rec(1, { r: [6, 6, 6, 6], rect: { x: 0, y: 0, w: 100, h: 50 } });
  const inner = (r) => rec(2, { r: [r, r, r, r], rect: { x: 1, y: 1, w: 98, h: 48 }, box: false, chain: [{ id: 1 }] });
  assert.match(judgeCorners([outer, inner(4)]).warnings[0], /^L5 /);
  assert.deepEqual(judgeCorners([outer, inner(5)]).warnings, []);
});

test('the repository passes', () => {
  const { problems } = lintRadius(ROOT);
  assert.deepEqual(problems, []);
});
