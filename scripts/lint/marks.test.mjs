// Tests for the marks catalog (src/lib/marks.ts) against public/marks:
// every file a row names exists, every file under public/marks/dynamic has
// a row, every dynamic file is one path in currentColor on the canonical
// 256 unit header and at most 8 KB (the logo and its state are drawn from
// their files on /marks/graticule, in the same header and over 8 KB), the
// shortlist opens on the logo and then its state, the drawn box a row records is the
// file's own within half a unit, SHORTLIST names known ids once each and
// at most 16, every shortlisted mark is one Kevin picked and every dynamic
// mark is a pick or a drawing its family grew from (our own iterations
// stay local until he picks one), every family has its record and holds a mark, every
// mark /brand's badge cuts through after the logo is no wider than it,
// LOGO (src/lib/logo.ts) is the logo's catalog file and the masters and
// the deck's #gt-mark symbol pnpm build:logo writes draw it, the live logo
// motion (GtLogoMotion) rests on it, is what pnpm build:logo-motion writes
// and is the still logo under reduced motion, the lockup files pnpm build:lockup writes draw LOGO beside the Katagami Text name and
// LOCKUP, the globe rows' NAME_WIDTH and NAME_ASPECT and the deck's
// #gt-lockup keep the numbers it measured, and the
// catalog and the dynamic files name each mark by its idea alone:
// ORIGIN_WORDS rejects option letters and catalog numbers in the catalog
// and the dynamic files, and runs everywhere, CI included. Loaded through
// Node's type stripping.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

import { CANONICAL, DYNAMIC_DIR, MAX_BYTES, drawnBox } from '../build/import-marks.mjs';
import { ROOT } from '../lib/root.mjs';

const { CATALOG, DYNAMIC_MARKS, FAMILIES, SHORTLIST, badgeMarks, graticuleMarks, pageFamilies } = await import(new URL('../../src/lib/marks.ts', import.meta.url).href);
const { LOCKUP, LOGO } = await import(new URL('../../src/lib/logo.ts', import.meta.url).href);
/* the globe rows' two numbers, read as text: content.ts imports without extensions, which Node's type stripping cannot load */
const ROWS_TS = readFileSync(join(ROOT, 'src/app/marks/graticule/content.ts'), 'utf8');
const NAME_WIDTH = Number(ROWS_TS.match(/export const NAME_WIDTH = ([\d.]+);/)?.[1]);
const NAME_ASPECT = Number(ROWS_TS.match(/export const NAME_ASPECT = ([\d.]+);/)?.[1]);

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

test('every dynamic row drawn from its file on /marks/graticule is one currentColor path on the canonical header', () => {
  for (const mark of DYNAMIC_MARKS.filter((row) => !row.file.startsWith('/marks/dynamic/'))) {
    assert.match(mark.file, /^\/marks\/graticule\/variations\/[a-z0-9-]+\.svg$/, `${mark.id}: ${mark.file} is outside the two mark folders`);
    assert.match(readFileSync(publicFile(mark.file), 'utf8'), CANONICAL, `${mark.id}: ${mark.file} breaks the header format`);
  }
});

test('the shortlist opens on the logo, then its state', () => {
  const byId = new Map(CATALOG.map((mark) => [mark.id, mark]));
  assert.equal(byId.get(SHORTLIST[0])?.use, 'logo', 'the first shortlisted mark is not the logo');
  assert.equal(byId.get(SHORTLIST[1])?.use, 'state', 'the second shortlisted mark is not the logo\'s state');
  assert.equal(CATALOG.filter((mark) => mark.use === 'logo').length, 1, 'more than one mark is the logo');
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

test('the shortlist holds only Kevin\'s picks, and every dynamic mark is a pick or a drawing its family grew from', () => {
  const byId = new Map(CATALOG.map((mark) => [mark.id, mark]));
  for (const id of SHORTLIST) assert.ok(byId.get(id)?.pick, `${id} is on the shortlist and Kevin did not pick it`);
  for (const mark of DYNAMIC_MARKS) assert.ok(mark.pick || mark.opens, `${mark.id} is our own iteration, and it stays local until Kevin picks it`);
});

test('every family has its record and holds a mark, and the page closes on In production', () => {
  const families = new Set(FAMILIES.map((family) => family.id));
  for (const mark of CATALOG) assert.ok(families.has(mark.family), `${mark.id}: family ${mark.family} has no record`);
  const order = pageFamilies().map((family) => family.id);
  assert.equal(new Set(order).size, FAMILIES.length, 'a family is missing from the page order or repeats');
  assert.equal(order.at(-1), 'production');
  for (const family of FAMILIES) assert.ok(CATALOG.some((mark) => mark.family === family.id), `${family.id} holds no mark`);
});

test('/marks/graticule draws every graticule mark once: the shortlisted first, then the picks, Graticule jaw, thicker after Graticule jaw', () => {
  const ids = graticuleMarks().map((mark) => mark.id);
  const expected = CATALOG.filter((mark) => mark.id.startsWith('graticule-')).map((mark) => mark.id);
  assert.deepEqual([...ids].sort(), [...expected].sort());
  const tier = (id) => (SHORTLIST.includes(id) ? 0 : CATALOG.find((mark) => mark.id === id)?.pick ? 1 : 2);
  ids.forEach((id, i) => assert.ok(i === 0 || tier(ids[i - 1]) <= tier(id), `${id} comes before a mark ranked above it`));
  assert.equal(ids.indexOf('graticule-jaw-thicker'), ids.indexOf('graticule-jaw') + 1);
});

test('every mark /brand\'s badge cuts through after the logo is no wider than the logo', () => {
  const [, , width, height] = LOGO.viewBox.split(' ').map(Number);
  for (const mark of badgeMarks(width / height)) {
    assert.notEqual(mark.use, 'logo', 'the badge repeats the logo after its first frame');
    assert.ok(mark.box[2] / mark.box[3] <= width / height, `${mark.id} is wider than the logo`);
  }
});

test('LOGO is the logo\'s catalog file, and the masters and the deck symbol draw it', () => {
  const byId = new Map(CATALOG.map((mark) => [mark.id, mark]));
  const logo = byId.get(LOGO.id);
  assert.equal(logo?.use, 'logo', `${LOGO.id} is not the catalog's logo`);
  const pathOf = (text) => text.match(/ d="([^"]+)"/)?.[1];
  assert.equal(pathOf(readFileSync(publicFile(logo.file), 'utf8')), LOGO.d, `${logo.file} draws another path than LOGO`);
  assert.deepEqual(LOGO.viewBox.split(' ').map(Number), logo.box, 'LOGO.viewBox is not the logo\'s drawn box');
  for (const name of ['gt-globe-logo.svg', 'gt-globe-logo-light.svg', 'gt-globe-logo-dark.svg', 'gt-globe-logo-icon.svg']) {
    assert.equal(pathOf(readFileSync(publicFile(`brand/${name}`), 'utf8')), LOGO.d, `public/brand/${name} is stale: run pnpm build:logo`);
  }
  const symbol = readFileSync(join(ROOT, 'deck/parts/head.html'), 'utf8').match(/<symbol id="gt-mark" viewBox="([^"]+)"><path[^>]* d="([^"]+)"/);
  assert.ok(symbol, 'deck/parts/head.html has no #gt-mark symbol');
  assert.equal(symbol[1], LOGO.viewBox, 'the deck symbol\'s viewBox is not LOGO.viewBox: run pnpm build:logo');
  assert.equal(symbol[2], LOGO.d, 'the deck symbol is stale: run pnpm build:logo');
});

test('the lockup files draw LOGO, and LOCKUP, the globe rows and the deck symbol keep the numbers pnpm build:lockup wrote', () => {
  const metrics = JSON.parse(readFileSync(publicFile('brand/gt-globe-lockup.json'), 'utf8'));
  assert.match(metrics.font, /^Katagami Text .*wght 500/, 'the lockup name is not Katagami Text 500');
  const near = (a, b, what) => assert.ok(Math.abs(a - b) < 5e-4, `${what}: ${a} is not ${b}: run pnpm build:lockup`);
  near(LOCKUP.rhythm, metrics.rhythmInCaps, 'LOCKUP.rhythm');
  near(LOCKUP.span, metrics.spanInCaps, 'LOCKUP.span');
  near(LOCKUP.mark, metrics.markInCaps, 'LOCKUP.mark');
  near(LOCKUP.overshoot, metrics.overshootInCaps, 'LOCKUP.overshoot');
  near(LOCKUP.gap, metrics.gapInCaps, 'LOCKUP.gap');
  near(LOCKUP.mark, LOCKUP.scale * LOCKUP.span, 'LOCKUP.mark against scale times span');
  near(NAME_WIDTH, metrics.rows.nameWidthInGlobes, 'NAME_WIDTH');
  near(NAME_ASPECT, metrics.rows.nameAspect, 'NAME_ASPECT');
  assert.match(readFileSync(join(ROOT, 'src/app/marks/graticule/graticule.css'), 'utf8'), new RegExp(`minmax\\(0, ${NAME_WIDTH}fr\\)`), 'the globe rows\' name column is not NAME_WIDTH');
  const viewBoxOf = (text) => text.match(/viewBox="([^"]+)"/)?.[1].split(' ').map(Number);
  const rows = readFileSync(publicFile('marks/graticule/rows/name.svg'), 'utf8');
  assert.deepEqual(viewBoxOf(rows), metrics.rows.viewBox.map((v) => Number(v.toFixed(2))), 'the globe rows\' name is stale: run pnpm build:lockup');
  for (const name of ['gt-globe-lockup.svg', 'gt-globe-lockup-light.svg', 'gt-globe-lockup-dark.svg']) {
    const text = readFileSync(publicFile(`brand/${name}`), 'utf8');
    assert.ok(text.includes(` d="${LOGO.d}"`), `public/brand/${name} draws another globe than LOGO: run pnpm build:lockup`);
    assert.deepEqual(viewBoxOf(text), metrics.viewBox.map((v) => Number(v.toFixed(2))), `public/brand/${name} is stale: run pnpm build:lockup`);
  }
  const symbol = readFileSync(join(ROOT, 'deck/parts/head.html'), 'utf8').match(/<symbol id="gt-lockup" viewBox="([^"]+)">(.*?)<\/symbol>/s);
  assert.ok(symbol, 'deck/parts/head.html has no #gt-lockup symbol: run pnpm build:lockup');
  assert.ok(symbol[2].includes(` d="${LOGO.d}"`), 'the deck\'s #gt-lockup draws another globe than LOGO: run pnpm build:lockup');
  assert.ok(readFileSync(publicFile('brand/gt-globe-lockup.svg'), 'utf8').includes(symbol[2]), 'the deck\'s #gt-lockup differs from public/brand/gt-globe-lockup.svg: run pnpm build:lockup');
});

test('the catalog and the dynamic files name each mark by its idea alone', () => {
  assert.doesNotMatch(readFileSync(join(ROOT, MARKS_TS), 'utf8'), ORIGIN_WORDS, `${MARKS_TS} names a mark's origin`);
  for (const name of dynamicFiles) {
    assert.doesNotMatch(readFileSync(join(ROOT, DYNAMIC_DIR, name), 'utf8'), ORIGIN_WORDS, `${name} names its mark's origin`);
  }
});

test('the live logo motion rests on LOGO and is what pnpm build:logo-motion writes', async () => {
  const { GT_LOGO_MOTION } = await import(new URL('../../src/components/brand/GtLogoMotion.geometry.ts', import.meta.url).href);
  assert.equal(GT_LOGO_MOTION.rest.d, LOGO.d, 'GtLogoMotion rests on another path than LOGO: run pnpm build:logo-motion');
  assert.equal(GT_LOGO_MOTION.viewBox, LOGO.viewBox, 'GtLogoMotion draws another box than LOGO: run pnpm build:logo-motion');
  const run = spawnSync(process.execPath, [join(ROOT, 'scripts/build/logo-motion.mjs'), '--check'], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr || 'pnpm build:logo-motion --check failed');
});

test('under reduced motion the live logo is the still logo, hovered, focused or loading', () => {
  /* every rule that moves the motion layer or hides the rest layer sits in
     the no-preference block, so a reduced motion hover cannot hide the rest
     path while the motion layer is not drawn */
  const css = readFileSync(join(ROOT, 'src/components/brand/GtLogoMotion.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const open = css.indexOf('@media (prefers-reduced-motion: no-preference)');
  assert.ok(open >= 0, 'GtLogoMotion.css has no prefers-reduced-motion: no-preference block');
  let depth = 0;
  let end = css.indexOf('{', open);
  for (; end < css.length; end++) {
    if (css[end] === '{') depth++;
    else if (css[end] === '}' && --depth === 0) break;
  }
  const outside = css.slice(0, open) + css.slice(end + 1).replace(/@keyframes[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '');
  for (const [, selector, body] of outside.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    assert.doesNotMatch(body, /\b(animation|transition)\s*:/, `${selector.trim()} moves outside the no-preference block`);
    if (selector.includes('gt-logo-motion-rest')) assert.doesNotMatch(body, /visibility:\s*hidden/, `${selector.trim()} hides the rest layer outside the no-preference block`);
  }
  assert.match(outside, /prefers-reduced-motion: reduce\)\s*\{\s*\.gt-logo-motion-move\s*\{\s*display:\s*none/, 'the motion layer is drawn under reduced motion');
});
