// Tests for scripts/locked/sync.mjs, offline: which files go up, and the
// plan from the store to the folder (unchanged files skipped, changed and
// missing ones uploaded, blobs with no local file deleted).
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { AREAS, localFiles, plan, typeOf } from './sync.mjs';

test('only web types with plain names go up', () => {
  assert.equal(typeOf('index.html'), 'text/html; charset=utf-8');
  assert.equal(typeOf('rounds/r1/a.webp'), 'image/webp');
  assert.equal(typeOf('rounds/r1/a.MP4'), 'video/mp4');
  for (const path of ['notes.md', 'viewer/build.py', 'viewer/__pycache__/x.pyc', '.DS_Store', 'viewer/.hidden.js', 'a/../b.png', 'README']) {
    assert.equal(typeOf(path), null, path);
  }
});

test('the raise files: the viewer, its data and its media when present, never notes, sheets, the archive or other ideas', () => {
  const dir = mkdtempSync(join(tmpdir(), 'pt-sync-'));
  try {
    for (const path of ['index.html', 'rounds.json', 'notes.md', 'sheet.png', 'viewer/app.js', 'viewer/run.py', 'rounds/r1/a.webp', 'posters/p.png', '_archive/old.html', 'other-ideas/x.png']) {
      mkdirSync(join(dir, path, '..'), { recursive: true });
      writeFileSync(join(dir, path), path);
    }
    const files = localFiles(dir, AREAS.raise);
    assert.deepEqual(files.map((file) => file.path), ['index.html', 'rounds.json', 'viewer/app.js', 'rounds/r1/a.webp', 'posters/p.png']);
    assert.ok(files.every((file) => /^[0-9a-f]{64}$/.test(file.sha256)));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('the plan uploads changed and missing files, skips unchanged ones and deletes the rest', () => {
  const local = [
    { path: 'index.html', sha256: 'a' },
    { path: 'rounds.json', sha256: 'b2' },
    { path: 'viewer/app.js', sha256: 'c' },
  ];
  const manifest = { 'index.html': 'a', 'rounds.json': 'b1', 'viewer/app.js': 'c' };
  const remote = new Set(['index.html', 'rounds.json', 'gone.png']);
  const { upload, unchanged, remove } = plan(local, manifest, remote);
  assert.deepEqual(upload.map((file) => file.path), ['rounds.json', 'viewer/app.js']);
  assert.equal(unchanged, 1);
  assert.deepEqual(remove, ['gone.png']);
  assert.deepEqual(plan(local, Object.fromEntries(local.map((f) => [f.path, f.sha256])), new Set(local.map((f) => f.path))), { upload: [], unchanged: 3, remove: [] });
});
