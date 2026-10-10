/**
 * Tests for scripts/lint/copies.mjs: node --test scripts/lint/copies.test.mjs
 * (pnpm test:copies). Each case runs the lint with --root on a temporary
 * checkout holding one pinned file and one fork.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'copies.mjs');
const ROOTS = [];
const BODY = `export const rule = ${JSON.stringify('x'.repeat(300))};\n`;

after(() => {
  for (const root of ROOTS) rmSync(root, { recursive: true, force: true });
});

function checkout() {
  const root = mkdtempSync(join(tmpdir(), 'copies-'));
  ROOTS.push(root);
  mkdirSync(join(root, 'scripts/lint/plugins'), { recursive: true });
  mkdirSync(join(root, 'src/lib'), { recursive: true });
  writeFileSync(join(root, 'scripts/lint/plugins/rule.ts'), BODY);
  writeFileSync(join(root, 'src/lib/field.ts'), `${BODY}// the hub's variant\n`);
  const copies = [
    { path: 'scripts/lint/plugins/rule.ts', mode: 'pin', from: 'gt-cloud:tooling/rule.ts', sha256: createHash('sha256').update(BODY).digest('hex') },
    { path: 'src/lib/field.ts', mode: 'fork', from: 'gt-cloud:lib/field.ts', reason: 'test' },
  ];
  writeFileSync(join(root, 'scripts/lint/copies.json'), JSON.stringify({ copies }));
  return root;
}

const run = (root) => spawnSync(process.execPath, [SCRIPT, '--root', root], { encoding: 'utf8', env: { ...process.env, GT_CLOUD: '' } });

describe('lint:copies', () => {
  it('passes when every entry holds', () => {
    const result = run(checkout());
    assert.equal(result.status, 0, result.stdout);
  });

  it('fails when a pinned file is edited', () => {
    const root = checkout();
    writeFileSync(join(root, 'scripts/lint/plugins/rule.ts'), `${BODY}// a local fix\n`);
    const result = run(root);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /rule\.ts: edited since it was pinned/);
  });

  it('fails on an unlisted copy', () => {
    const root = checkout();
    mkdirSync(join(root, 'src/components'), { recursive: true });
    copyFileSync(join(root, 'src/lib/field.ts'), join(root, 'src/components/field.ts'));
    const result = run(root);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /unlisted copy: .*src\/components\/field\.ts/);
  });

  it('fails when a listed path is gone', () => {
    const root = checkout();
    rmSync(join(root, 'src/lib/field.ts'));
    const result = run(root);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /field\.ts: listed as fork but not on disk/);
  });
});
