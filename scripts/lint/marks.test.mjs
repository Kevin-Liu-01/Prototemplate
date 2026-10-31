// Tests for the marks catalog (src/lib/marks.ts) against public/marks:
// every file a row names exists, every file under public/marks/dynamic has
// a row, every dynamic file is one path in currentColor on the canonical
// 256 unit header and at most 8 KB, the drawn box a row records is the
// file's own within half a unit, SHORTLIST names known ids once each and
// at most 16, every family has its record and holds a mark, and the
// catalog and the dynamic files name each mark by its idea alone:
// ORIGIN_WORDS rejects option letters and catalog numbers in the catalog
// and the dynamic files, and runs everywhere, CI included. Loaded through
// Node's type stripping.
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { CANONICAL, DYNAMIC_DIR, MAX_BYTES, drawnBox } from '../build/import-marks.mjs';
import { ROOT } from '../lib/root.mjs';

const { CATALOG, DYNAMIC_MARKS, FAMILIES, SHORTLIST, pageFamilies } = await import(new URL('../../src/lib/marks.ts', import.meta.url).href);

const MARKS_TS = 'src/lib/marks.ts';
const publicFile = (path) => join(ROOT, 'public', path);
const dynamicFiles = readdirSync(join(ROOT, DYNAMIC_DIR)).filter((name) => name.endsWith('.svg'));
const ORIGIN_WORDS = /\boption [a-d]\b|\bsym(?:bol)?[\s_-]*\d/i;

test('every file a catalog row names exists', () => {
  for (const mark of CATALOG) {
    for (const file of [mark.file, mark.file16, mark.constructionFile].filter(Boolean)) {
      assert.ok(existsSync(publicFile(file)), `${mark.id}: ${file} is missing`);
    }
  }
});

test('ids are unique, lowercase kebab, and carry no zero-padded number', () => {
  const ids = CATALOG.map((mark) => mark.id);
  assert.equal(new Set(ids).size, ids.length, 'an id repeats');
  for (const id of ids) {
    assert.match(id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${id} is not lowercase kebab`);
    assert.doesNotMatch(id, /(?:^|-)0\d\d(?:-|$)/, `${id} carries a zero-padded number`);
  }
});

test('every file under public/marks/dynamic has a row', () => {
  const named = new Set(DYNAMIC_MARKS.flatMap((mark) => [mark.file, mark.file16].filter(Boolean)));
  for (const name of dynamicFiles) assert.ok(named.has(`/marks/dynamic/${name}`), `${name} has no catalog row`);
});

test('every dynamic file is one currentColor path on the canonical header, at most 8 KB', () => {
  for (const name of dynamicFiles) {
    const text = readFileSync(join(ROOT, DYNAMIC_DIR, name), 'utf8');
    assert.match(text, CANONICAL, `${name} breaks the header format`);
    assert.ok(Buffer.byteLength(text) <= MAX_BYTES, `${name} is over ${MAX_BYTES} bytes`);
  }
});

test('every recorded box is the file\'s drawn box within half a unit', () => {
  for (const mark of DYNAMIC_MARKS) {
    assert.ok(mark.box, `${mark.id} records no box`);
    const box = drawnBox(readFileSync(publicFile(mark.file), 'utf8'));
    assert.ok(box, `${mark.id}: the box cannot be measured`);
    mark.box.forEach((v, i) => assert.ok(Math.abs(v - box[i]) <= 0.5, `${mark.id}: box [${mark.box}] is not the file's [${box}]`));
  }
});

test('SHORTLIST names known ids once each, at most 16', () => {
  const ids = new Set(CATALOG.map((mark) => mark.id));
  assert.ok(SHORTLIST.length <= 16, 'the shortlist holds more than 16');
  assert.equal(new Set(SHORTLIST).size, SHORTLIST.length, 'the shortlist repeats an id');
  for (const id of SHORTLIST) assert.ok(ids.has(id), `${id} is on the shortlist and not in the catalog`);
});

test('every family has its record and holds a mark, and the page closes on In production', () => {
  const families = new Set(FAMILIES.map((family) => family.id));
  for (const mark of CATALOG) assert.ok(families.has(mark.family), `${mark.id}: family ${mark.family} has no record`);
  const order = pageFamilies().map((family) => family.id);
  assert.equal(new Set(order).size, FAMILIES.length, 'a family is missing from the page order or repeats');
  assert.equal(order.at(-1), 'production');
  for (const family of FAMILIES) assert.ok(CATALOG.some((mark) => mark.family === family.id), `${family.id} holds no mark`);
});

test('the catalog and the dynamic files name each mark by its idea alone', () => {
  assert.doesNotMatch(readFileSync(join(ROOT, MARKS_TS), 'utf8'), ORIGIN_WORDS, `${MARKS_TS} names a mark's origin`);
  for (const name of dynamicFiles) {
    assert.doesNotMatch(readFileSync(join(ROOT, DYNAMIC_DIR, name), 'utf8'), ORIGIN_WORDS, `${name} names its mark's origin`);
  }
});
