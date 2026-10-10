/**
 * Tests for scripts/lint/public.mjs: node --test scripts/lint/public.test.mjs
 * (pnpm test:public). Every case runs the scan with --root on a temporary
 * checkout. The fixtures build each key shape, machine path and denylist
 * term at runtime, so this file holds none of them whole.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'public.mjs');
const ROOTS = [];

after(() => {
  for (const root of ROOTS) rmSync(root, { recursive: true, force: true });
});

const a = (n) => 'a'.repeat(n);
const A = (n) => 'A'.repeat(n);
/** One sample of each key shape, joined from parts. */
const KEYS = {
  stripe: ['sk', 'live', a(24)].join('_'),
  anthropic: ['sk', 'ant', 'api03', a(20)].join('-'),
  openai: ['sk', 'proj', a(20)].join('-'),
  aws: ['AK', 'IA', A(16)].join(''),
  google: ['AI', 'za', a(35)].join(''),
  github: ['gh', 'p_', a(36)].join(''),
  'github-pat': ['github', 'pat', a(20)].join('_'),
  slack: ['xo', 'xb-', '1234567890'].join(''),
  pem: ['-----BEGIN', 'RSA PRIVATE', 'KEY-----'].join(' '),
};
const MACHINE = ['', 'Users', 'someone', 'notes'].join('/');
const TERM = ['acme', 'pager'].join('-');

function checkout(files = {}) {
  const root = mkdtempSync(join(tmpdir(), 'public-scan-'));
  ROOTS.push(root);
  for (const [rel, body] of Object.entries(files)) {
    mkdirSync(dirname(join(root, rel)), { recursive: true });
    writeFileSync(join(root, rel), body);
  }
  return root;
}

function scan(root, args = [], env = {}) {
  const clean = { ...process.env, CI: '', VERCEL: '', PT_DENYLIST: '', ...env };
  return spawnSync(process.execPath, [SCRIPT, '--root', root, ...args], { encoding: 'utf8', env: clean });
}

describe('lint:public', () => {
  for (const [name, key] of Object.entries(KEYS)) {
    it(`finds the ${name} key shape and never prints it`, () => {
      const result = scan(checkout({ 'src/config.ts': `const key = '${key}';\n` }), ['--keys']);
      assert.equal(result.status, 1);
      assert.match(result.stdout, new RegExp(`src/config\\.ts:1  ${name} key shape`));
      assert.ok(!result.stdout.includes(key));
    });
  }

  it('fails on a key shape even with a baseline', () => {
    const root = checkout({
      'src/config.ts': `const key = '${KEYS.aws}';\n`,
      'scripts/lint/public.baseline.json': JSON.stringify({ 'key-shape': { 'src/config.ts': 9 } }),
    });
    assert.equal(scan(root).status, 1);
  });

  it('holds machine paths to the baseline and fails on a new one', () => {
    const root = checkout({ 'docs/notes.md': `see ${MACHINE}\n` });
    assert.equal(scan(root).status, 1);
    assert.equal(scan(root, ['--write-baseline']).status, 0);
    assert.equal(scan(root).status, 0);
    writeFileSync(join(root, 'docs/notes.md'), `see ${MACHINE}\nand ${MACHINE}\n`);
    const result = scan(root);
    assert.equal(result.status, 1);
    assert.match(result.stdout, /docs\/notes\.md: 2 machine-path findings, 1 in the baseline/);
    assert.equal(scan(root, ['--strict']).status, 1);
  });

  it('matches denylist terms whole-word and prints the list line, never the term', () => {
    const root = checkout({ 'docs/a.md': `ask in #${TERM.toUpperCase()} today\n`, 'docs/b.md': `x${TERM}y is fine\n` });
    const list = join(root, '..', `${root.split('/').pop()}-denylist.txt`);
    ROOTS.push(list);
    writeFileSync(list, `# comment\n${TERM}\n`);
    const result = scan(root, [], { PT_DENYLIST: list });
    assert.equal(result.status, 1);
    assert.match(result.stdout, /docs\/a\.md:1  denylist term \(line 2 of the list\)/);
    assert.ok(!result.stdout.includes('docs/b.md'));
    assert.ok(!result.stdout.toLowerCase().includes(TERM));
  });

  it('skips the denylist under CI and VERCEL with a printed line', () => {
    const root = checkout({ 'docs/a.md': `${TERM}\n` });
    const list = join(root, 'list.txt');
    writeFileSync(list, `${TERM}\n`);
    for (const env of [{ CI: 'true' }, { VERCEL: '1' }]) {
      const result = scan(root, [], { ...env, PT_DENYLIST: list });
      assert.equal(result.status, 0, result.stdout);
      assert.match(result.stdout, /denylist skipped: (CI|VERCEL) is set/);
    }
  });

  it('exits 2 when PT_DENYLIST names a missing file', () => {
    assert.equal(scan(checkout({ 'a.md': 'x\n' }), [], { PT_DENYLIST: join(tmpdir(), 'no-such-denylist.txt') }).status, 2);
  });

  it('skips excluded folders, binaries and allowed paths', () => {
    const root = checkout({
      'node_modules/pkg/index.js': `${KEYS.github}\n`,
      '.pnpm-store/v11/files/0d/abc': `${KEYS.aws}\n`,
      'motion/notes.md': `${MACHINE}\n`,
      'public/media/clip.txt': `${MACHINE}\n`,
      'public/logo.png': `${KEYS.github}\n`,
      'docs/tool.mjs': `${MACHINE}\n`,
      'scripts/lint/public.allow.json': JSON.stringify({ allow: [{ path: 'docs/tool.mjs', rules: ['machine-path'] }] }),
    });
    const result = scan(root);
    assert.equal(result.status, 0, result.stdout);
  });
});
