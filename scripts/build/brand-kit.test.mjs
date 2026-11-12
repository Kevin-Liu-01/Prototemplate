/**
 * Tests for scripts/build/brand-kit.mjs: node --test scripts/build/brand-kit.test.mjs
 * (pnpm test:brand-kit). Each case builds a stand-in kit whose logo PNGs
 * differ from the committed ones, runs the builder with --root on a
 * temporary checkout holding the real src/lib/logo.ts and
 * scripts/lint/logo.json, and reads the manifest after: every logo picture
 * the kit writes is pinned at its new bytes and the current LOGO.d, and an
 * unlisted one fails the build. The builder cuts the sheets with sips and
 * cwebp, so the cases skip where either is missing (Linux CI).
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

import { ROOT } from '../lib/root.mjs';
import { MANIFEST, RASTER, loadLogo, sha256 } from '../lib/logo-lock.mjs';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'brand-kit.mjs');
const has = (tool) => spawnSync('which', [tool]).status === 0;
const SKIP = has('sips') && has('cwebp') ? false : 'needs sips and cwebp';
const ROOTS = [];
const { LOGO } = await loadLogo(ROOT);
const LOGO_SHA = sha256(LOGO.d);
/** a real PNG, cut to 64 px so cwebp is quick, for the guide sheets the builder measures and cuts */
let sheetPng;
function sheet() {
  if (!sheetPng) {
    sheetPng = join(tempDir('brand-kit-sheet-'), 'sheet.png');
    spawnSync('sips', ['-Z', '64', join(ROOT, 'public/brand/kit/png/gt-wordmark-ink-on-transparent-1024.png'), '--out', sheetPng]);
  }
  return readFileSync(sheetPng);
}

const TYPES = [
  ['mark', 'gt-mark'],
  ['lockup-stacked', 'gt-lockup-stacked'],
  ['lockup-horizontal', 'gt-lockup-horizontal'],
  ['wordmark', 'gt-wordmark'],
  ['wordmark', 'gt-wordmark-stacked'],
];
const SHEETS = ['guides/brand-sheet', 'guides/clear-space', 'guides/minimum-size', 'guides/variant-sheet', 'type/type-spec', 'color/color-sheet', 'frames/frames-sheet'];

after(() => {
  for (const root of ROOTS) rmSync(root, { recursive: true, force: true });
});

function put(root, rel, body) {
  mkdirSync(dirname(join(root, rel)), { recursive: true });
  writeFileSync(join(root, rel), body);
}

function tempDir(prefix) {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  ROOTS.push(dir);
  return dir;
}

/** A checkout with the real logo source and manifest; `edit` changes the manifest. */
function checkout(edit = (manifest) => manifest) {
  const root = tempDir('brand-kit-root-');
  mkdirSync(join(root, 'src/lib'), { recursive: true });
  copyFileSync(join(ROOT, 'src/lib/logo.ts'), join(root, 'src/lib/logo.ts'));
  put(root, MANIFEST, `${JSON.stringify(edit(JSON.parse(readFileSync(join(ROOT, MANIFEST), 'utf8'))), null, 2)}\n`);
  return root;
}

/** A kit folder whose every file is a stand-in, the logo PNGs unlike the committed ones. */
function kit() {
  const from = tempDir('brand-kit-from-');
  put(from, 'README.md', '# kit\n');
  for (const [folder, stem] of TYPES) {
    for (const c of ['ink', 'white', 'accent', 'accent-lift', 'currentcolor']) put(from, `logo/${folder}/svg/${stem}-${c}.svg`, '<svg xmlns="http://www.w3.org/2000/svg"/>\n');
    for (const c of ['ink', 'white']) put(from, `logo/transparent/${folder}/${stem}-${c}-on-transparent-1024.png`, `a rebuilt ${stem} ${c}`);
  }
  for (const name of ['colors.css', 'colors.json', 'colors.ase']) put(from, `color/${name}`, name);
  for (const name of SHEETS) put(from, `${name}.png`, sheet());
  put(from, 'motion/loop.txt', 'a film');
  return from;
}

const run = (root, from) => spawnSync(process.execPath, [SCRIPT, '--from', from, '--root', root], { encoding: 'utf8' });
const kitPictures = (manifest) => manifest.generated.filter((e) => e.path.startsWith('public/brand/kit/') && RASTER.test(e.path));

describe('brand-kit records its logo pictures', { skip: SKIP }, () => {
  it('pins every listed kit picture at its new bytes and the current LOGO.d', () => {
    const root = checkout();
    const before = kitPictures(JSON.parse(readFileSync(join(root, MANIFEST), 'utf8')));
    assert.ok(before.length >= 6, 'the manifest lists the mark and lockup PNGs');
    const result = run(root, kit());
    assert.equal(result.status, 0, result.stderr);
    const pinned = kitPictures(JSON.parse(readFileSync(join(root, MANIFEST), 'utf8')));
    assert.deepEqual(pinned.map((e) => e.path), before.map((e) => e.path));
    for (const entry of pinned) {
      const bytes = readFileSync(join(root, entry.path));
      assert.equal(entry.sha256, sha256(bytes), `${entry.path} is pinned at the bytes the kit wrote`);
      assert.notEqual(entry.sha256, before.find((e) => e.path === entry.path).sha256, `${entry.path} changed`);
      assert.equal(entry.sourceSha256, LOGO_SHA, `${entry.path} is pinned at the current LOGO.d`);
    }
  });

  it('fails on a logo picture the manifest does not list', () => {
    const missing = 'public/brand/kit/png/gt-mark-white-on-transparent-1024.png';
    const root = checkout((manifest) => ({ ...manifest, generated: manifest.generated.filter((e) => e.path !== missing) }));
    const result = run(root, kit());
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /gt-mark-white-on-transparent-1024\.png is listed under neither/);
  });
});
