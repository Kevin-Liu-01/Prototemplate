/**
 * The skill file contract: node --test scripts/build/skills.test.mjs (pnpm
 * test:skills). A fixture checkout with one supporting file of each allowed
 * type builds; a file of another type fails the build; and the build's list,
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

const SKILL = `---\nname: fixture\ndescription: >-\n  A fixture skill. Use when testing the contract.\nmetadata:\n  title: Fixture\n  areas: lints\n  updated: 2026-10-10\n  origin: prototemplate\n---\n\n# Fixture\n\n## Sources\n`;

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
