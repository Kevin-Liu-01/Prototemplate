/**
 * Tests for scripts/lint/logo-pixels.mjs (pnpm lint:logo --pixels):
 * node --test scripts/lint/logo-pixels.test.mjs (pnpm test:logo-pixels).
 * Not in lint:static: it needs python3 with numpy and Pillow and Chrome,
 * and skips when either is missing. It reads pictures already in the
 * repository: the open-source reel's end frame from before the globe (the
 * monogram, listed under history), a page captured with the globe in its
 * header, and the generated globe at 256 px.
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'logo-pixels.mjs');
const MONOGRAM = 'deck/shots/reel-poster.jpg';
const GLOBE_PAGE = 'public/shots/pages/live-home-light.jpg';
const GLOBE = 'public/brand/no-bg-gt-globe-logo-dark-256.png';

const python = spawnSync('python3', ['-c', 'import numpy, PIL'], { encoding: 'utf8' }).status === 0;
const dir = mkdtempSync(join(tmpdir(), 'logo-pixels-'));
after(() => rmSync(dir, { recursive: true, force: true }));

describe('lint:logo --pixels', { skip: python ? false : 'needs python3 with numpy and Pillow' }, () => {
  const out = join(dir, 'report.json');
  const run = spawnSync(process.execPath, [SCRIPT, MONOGRAM, GLOBE_PAGE, GLOBE, '--json', out], { encoding: 'utf8' });
  const skip = run.status === 2 ? `a tool is missing: ${run.stderr.trim()}` : false;
  const report = skip ? { files: [] } : JSON.parse(readFileSync(out, 'utf8'));
  const entry = (rel) => report.files.find((e) => e.file === rel);

  it('finds the monogram in a film frame from before the globe, and passes because history lists it', { skip }, () => {
    assert.equal(run.status, 0, run.stdout);
    assert.equal(entry(MONOGRAM)?.monogram, true);
    assert.equal(entry(MONOGRAM)?.listed?.list, 'history');
  });

  it('finds the globe, and no monogram, in a page header and in the generated logo', { skip }, () => {
    for (const rel of [GLOBE_PAGE, GLOBE]) {
      assert.ok(entry(rel)?.logo.length, `${rel}: the globe was not found`);
      assert.equal(entry(rel)?.monogram, false, `${rel}: a monogram was reported`);
    }
  });
});
