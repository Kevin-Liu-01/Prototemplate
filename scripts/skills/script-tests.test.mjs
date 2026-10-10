/**
 * Tests for scripts/skills/script-tests.mjs: node --test
 * scripts/skills/script-tests.test.mjs (pnpm test:skills). Each case runs
 * the runner with --root on a temporary checkout whose one skill bundles a
 * script and its test.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'script-tests.mjs');
const ROOTS = [];

after(() => {
  for (const root of ROOTS) rmSync(root, { recursive: true, force: true });
});

/** A checkout whose skill `alpha` holds add.mjs and a test expecting `expected`. */
function checkout(expected) {
  const root = mkdtempSync(join(tmpdir(), 'skill-scripts-'));
  ROOTS.push(root);
  const dir = join(root, 'skills/alpha/scripts');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'add.mjs'), 'export const add = (a, b) => a + b;\n');
  writeFileSync(
    join(dir, 'add.test.mjs'),
    `import { test } from 'node:test';\nimport assert from 'node:assert/strict';\nimport { add } from './add.mjs';\ntest('adds', () => assert.equal(add(1, 2), ${expected}));\n`
  );
  return root;
}

const run = (root) => spawnSync(process.execPath, [SCRIPT, '--root', root], { encoding: 'utf8' });

describe('test:skill-scripts', () => {
  it('passes when every skill script test passes', () => {
    const result = run(checkout(3));
    assert.equal(result.status, 0, result.stdout);
    assert.match(result.stdout, /ok {3}skills\/alpha\/scripts\/add\.test\.mjs/);
  });

  it('fails when a skill script test fails', () => {
    const result = run(checkout(4));
    assert.equal(result.status, 1);
    assert.match(result.stdout, /FAIL skills\/alpha\/scripts\/add\.test\.mjs/);
  });

  it('passes with no tests at all', () => {
    const root = mkdtempSync(join(tmpdir(), 'skill-scripts-'));
    ROOTS.push(root);
    assert.equal(run(root).status, 0);
  });
});
