/**
 * The skill file contract: node --test scripts/build/skills.test.mjs (pnpm
 * test:skills). A fixture checkout with one supporting file of each allowed
 * type builds; a file of another type fails the build; a SKILL.md over the
 * 24,000-byte budget fails unless an exemption with a reason and an unexpired
 * date covers it, and a stale exemption fails; a missing owner fails; and the build's list,
 * lint:registries' list and the raw route's types stay one list, with
 * Python, shell, text and plain JavaScript served as text/plain.
 */
import { spawnSync } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const SCRIPTS = join(dirname(fileURLToPath(import.meta.url)), '..');
const REPO = join(SCRIPTS, '..');
const TYPES = ['md', 'mjs', 'json', 'py', 'sh', 'txt', 'js'];
const ROOTS = [];

after(() => {
  for (const root of ROOTS) rmSync(root, { recursive: true, force: true });
});

const SKILL = `---\nname: fixture\ndescription: >-\n  A fixture skill. Use when testing the contract.\nmetadata:\n  title: Fixture\n  areas: lints\n  updated: 2026-10-10\n  origin: prototemplate\n  owner: P\n---\n\n# Fixture\n\n## Sources\n`;

/** A git-less checkout holding the build script, its two helpers and one skill with a file of each type. */
function fixture() {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'skills-contract-')));
  ROOTS.push(root);
  writeFileSync(join(root, 'package.json'), '{}\n');
  writeFileSync(join(root, 'README.md'), '| [fixture](./skills/fixture/SKILL.md) |\n');
  for (const rel of ['build/skills.mjs', 'lib/root.mjs', 'lib/help.mjs']) {
    mkdirSync(dirname(join(root, 'scripts', rel)), { recursive: true });
    cpSync(join(SCRIPTS, rel), join(root, 'scripts', rel));
  }
  mkdirSync(join(root, 'src/lib'), { recursive: true });
  const skill = join(root, 'skills/fixture');
  mkdirSync(join(skill, 'scripts'), { recursive: true });
  writeFileSync(join(skill, 'SKILL.md'), SKILL);
  for (const type of TYPES.filter((t) => t !== 'md')) writeFileSync(join(skill, 'scripts', `one.${type}`), 'x\n');
  writeFileSync(join(skill, 'scripts', 'one.md'), '# one\n');
  return root;
}

function build(root, ...args) {
  const empty = mkdtempSync(join(tmpdir(), 'skills-runtime-'));
  ROOTS.push(empty);
  return spawnSync(process.execPath, [join(root, 'scripts/build/skills.mjs'), ...args], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, KEVIN_WIKI_RUNTIME: empty },
  });
}

describe('skill file contract', () => {
  it('builds a skill with one supporting file of each allowed type', () => {
    const root = fixture();
    const run = build(root);
    assert.equal(run.status, 0, run.stderr);
    const registry = readFileSync(join(root, 'src/lib/skills.ts'), 'utf8');
    for (const type of TYPES) assert.match(registry, new RegExp(`'scripts/one\\.${type}'`));
  });

  it('fails on a supporting file of another type', () => {
    const root = fixture();
    writeFileSync(join(root, 'skills/fixture/scripts/one.rb'), 'x\n');
    const run = build(root);
    assert.equal(run.status, 1);
    assert.match(run.stderr + run.stdout, /scripts\/one\.rb: supporting files are/);
  });

  it('fails on a missing owner', () => {
    const root = fixture();
    const file = join(root, 'skills/fixture/SKILL.md');
    writeFileSync(file, readFileSync(file, 'utf8').replace('  owner: P\n', ''));
    const run = build(root, '--check');
    assert.equal(run.status, 1);
    assert.match(run.stderr, /metadata\.owner '' is not one of P, V, O/);
  });

  describe('the SKILL.md byte budget', () => {
    /** The fixture with SKILL.md padded past 24,000 bytes, and an optional exemption file. */
    function oversize(exempt) {
      const root = fixture();
      const file = join(root, 'skills/fixture/SKILL.md');
      writeFileSync(file, `${readFileSync(file, 'utf8')}\n${'A line of detail that belongs in references.\n'.repeat(600)}`);
      if (exempt) writeFileSync(join(root, 'scripts/build/skills.budget.json'), JSON.stringify({ exempt: { fixture: exempt } }));
      return root;
    }
    const later = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

    it('fails an oversize SKILL.md with no exemption', () => {
      const run = build(oversize());
      assert.equal(run.status, 1);
      assert.match(run.stderr, /fixture: SKILL\.md is \d+ bytes \(at most 24000\)/);
    });

    it('passes an oversize SKILL.md under an unexpired exemption with a reason, and says so', () => {
      const run = build(oversize({ reason: 'rewritten in the next lane', expires: later }));
      assert.equal(run.status, 0, run.stderr);
      assert.match(run.stdout, /over the 24000-byte budget under an exemption until/);
    });

    it('fails an expired exemption and one without a reason', () => {
      const expired = build(oversize({ reason: 'rewritten in the next lane', expires: '2026-01-01' }));
      assert.equal(expired.status, 1);
      assert.match(expired.stderr, /expired on 2026-01-01/);
      const silent = build(oversize({ reason: ' ', expires: later }));
      assert.equal(silent.status, 1);
      assert.match(silent.stderr, /has no reason/);
    });

    it('fails an exemption for a skill already under the budget', () => {
      const root = fixture();
      writeFileSync(join(root, 'scripts/build/skills.budget.json'), JSON.stringify({ exempt: { fixture: { reason: 'old', expires: later } } }));
      const run = build(root);
      assert.equal(run.status, 1);
      assert.match(run.stderr, /within the budget; remove its exemption/);
    });
  });

  it('keeps the build, lint:registries and the raw route on one list', () => {
    const list = (rel, pattern) => pattern.exec(readFileSync(join(REPO, rel), 'utf8'))?.[1].split('|');
    assert.deepEqual(list('scripts/build/skills.mjs', /const SUPPORT = \/\\\.\(([a-z|]+)\)\$\//), TYPES);
    assert.deepEqual(list('scripts/lint/registries.mjs', /const SUPPORT = \/\\\.\(([a-z|]+)\)\$\//), TYPES);
    const route = readFileSync(join(REPO, 'src/app/skills/[slug]/[...path]/route.ts'), 'utf8');
    const served = Object.fromEntries([...route.matchAll(/^ {2}([a-z]+): '([^']+)',$/gm)].map((m) => [m[1], m[2]]));
    assert.deepEqual(Object.keys(served).sort(), [...TYPES].sort());
    for (const type of ['py', 'sh', 'txt', 'js']) assert.equal(served[type], 'text/plain; charset=utf-8');
  });
});
