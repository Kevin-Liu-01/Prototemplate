// Tests for src/lib/every-lines.ts, loaded through Node's type stripping:
// EverySentence's dust sampler groups a hidden copy's glyph boxes into the
// browser's own line boxes, so the ink it samples breaks where the print does.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { importTs } from './seo.mjs';

const { groupEveryLines } = await importTs(new URL('../../src/lib/every-lines.ts', import.meta.url));

const at = (text, left, top) => ({ text, box: { left, top, height: 40 } });
const gap = { text: ' ', box: null };

test('splits a centered two-line sentence where the browser broke it, keeping each line’s own left edge', () => {
  const glyphs = [
    at('모', 87, 0),
    at('든', 127, 0),
    gap,
    at('언', 177, 0),
    at('어', 217, 0),
    at('로', 257, 0),
    gap,
    at('확', 74, 47),
    at('장', 114, 47),
    at('하', 154, 47),
    at('세', 194, 47),
    at('요', 234, 47),
  ];
  assert.deepEqual(groupEveryLines(glyphs), [
    { text: '모든 언어로', x: 87 },
    { text: '확장하세요', x: 74 },
  ]);
});

test('keeps a glyph on its line when its box sits a little higher, as tall diacritics do', () => {
  assert.deepEqual(groupEveryLines([at('a', 0, 0), at('ä', 20, -6), at('b', 40, 0)]), [{ text: 'aäb', x: 0 }]);
});

test('never starts a line with whitespace', () => {
  assert.deepEqual(groupEveryLines([gap, at('a', 12, 0)]), [{ text: 'a', x: 12 }]);
});
