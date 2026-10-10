/**
 * Tests for scripts/skills/install.mjs: node --test scripts/skills/install.test.mjs
 * (pnpm test:skills). Every case builds its own temporary folders: a fake
 * checkout with two skills, a project, a home directory and a wiki-like
 * repository, and runs the script with --source and HOME pointed at them,
 * so nothing outside the temporary folder is read or written.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, readlinkSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'install.mjs');
const ROOTS = [];

after(() => {
  for (const root of ROOTS) rmSync(root, { recursive: true, force: true });
});

function skillFile(slug, origin = 'prototemplate') {
  return `---\nname: ${slug}\ndescription: >-\n  A test skill. Use when testing.\nmetadata:\n  title: ${slug} title\n  areas: lints\n  updated: 2026-10-05\n  origin: ${origin}\n---\n\n# ${slug} title\n\n## Sources\n`;
}

/** A temporary world: proto/skills/{alpha,beta}, an empty project, an empty home. */
function world() {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'install-skills-')));
  ROOTS.push(root);
  const proto = join(root, 'proto');
  for (const slug of ['alpha', 'beta']) {
    mkdirSync(join(proto, 'skills', slug, 'references'), { recursive: true });
    writeFileSync(join(proto, 'skills', slug, 'SKILL.md'), skillFile(slug));
    writeFileSync(join(proto, 'skills', slug, 'references', 'notes.md'), `# ${slug} notes\n`);
  }
  mkdirSync(join(proto, '.git'));
  const project = join(root, 'project');
  const home = join(root, 'home');
  mkdirSync(project);
  mkdirSync(home);
  return { root, proto, source: join(proto, 'skills'), project, home };
}

function run(w, args) {
  const result = spawnSync(process.execPath, [SCRIPT, '--source', w.source, ...args], {
    cwd: w.root,
    env: { ...process.env, HOME: w.home, USERPROFILE: w.home },
    encoding: 'utf8',
  });
  return { code: result.status, out: `${result.stdout}${result.stderr}` };
}

const isLink = (path) => lstatSync(path).isSymbolicLink();

describe('install-skills', () => {
  it('a dry run prints every action and writes nothing', () => {
    const w = world();
    const { code, out } = run(w, ['--project', w.project, '--dry-run']);
    assert.equal(code, 0, out);
    assert.match(out, /would link/);
    assert.match(out, /dry run, nothing written/);
    assert.deepEqual(readdirSync(w.project), []);
  });

  it('links every skill into .claude/skills and .agents/skills with absolute links outside the checkout', () => {
    const w = world();
    const { code, out } = run(w, ['--project', w.project]);
    assert.equal(code, 0, out);
    for (const folder of ['.claude/skills', '.agents/skills']) {
      for (const slug of ['alpha', 'beta']) {
        const entry = join(w.project, folder, slug);
        assert.ok(isLink(entry), `${entry} is a link`);
        assert.equal(readlinkSync(entry), join(w.source, slug));
        assert.equal(realpathSync(entry), join(w.source, slug));
      }
    }
    assert.ok(!existsSync(join(w.project, '.codex')));
  });

  it('links relatively inside the checkout itself, and a second run changes nothing', () => {
    const w = world();
    assert.equal(run(w, ['--project', w.proto]).code, 0);
    assert.equal(readlinkSync(join(w.proto, '.claude/skills/alpha')), '../../skills/alpha');
    const again = run(w, ['--project', w.proto]);
    assert.equal(again.code, 0, again.out);
    assert.match(again.out, /unchanged/);
    assert.doesNotMatch(again.out, /linked ->/);
  });

  it('installs only the named slugs, and refuses an unknown one', () => {
    const w = world();
    assert.equal(run(w, ['beta', '--project', w.project]).code, 0);
    assert.deepEqual(readdirSync(join(w.project, '.claude/skills')), ['beta']);
    const bad = run(w, ['gamma', '--project', w.project]);
    assert.equal(bad.code, 2);
    assert.match(bad.out, /not in the set: gamma/);
  });

  it('copies with --copy, adds codex on request, and refreshes its own copy', () => {
    const w = world();
    assert.equal(run(w, ['--project', w.project, '--copy', '--agents', 'claude,codex']).code, 0);
    const copy = join(w.project, '.codex/skills/alpha');
    assert.ok(!isLink(copy));
    assert.equal(readFileSync(join(copy, 'SKILL.md'), 'utf8'), skillFile('alpha'));
    assert.ok(existsSync(join(copy, 'references/notes.md')));
    assert.ok(!existsSync(join(w.project, '.agents')));
    writeFileSync(join(w.source, 'alpha', 'references', 'notes.md'), '# changed\n');
    const again = run(w, ['--project', w.project, '--copy', '--agents', 'claude,codex']);
    assert.equal(again.code, 0, again.out);
    assert.match(again.out, /refreshed the copy/);
    assert.equal(readFileSync(join(copy, 'references/notes.md'), 'utf8'), '# changed\n');
  });

  it('recommends --copy when git tracks the target in another repository', () => {
    const w = world();
    mkdirSync(join(w.project, '.git'));
    const { code, out } = run(w, ['--project', w.project]);
    assert.equal(code, 0, out);
    assert.match(out, /pass --copy to vendor the folders/);
  });

  it('skips an entry it does not own and exits 1', () => {
    const w = world();
    const foreign = join(w.project, '.claude/skills/alpha');
    mkdirSync(foreign, { recursive: true });
    writeFileSync(join(foreign, 'SKILL.md'), skillFile('alpha', 'wiki'));
    const elsewhere = join(w.root, 'elsewhere');
    mkdirSync(elsewhere);
    mkdirSync(join(w.project, '.agents/skills'), { recursive: true });
    symlinkSync(elsewhere, join(w.project, '.agents/skills/alpha'));
    const { code, out } = run(w, ['--project', w.project]);
    assert.equal(code, 1, out);
    assert.match(out, /refused: an entry this script does not own/);
    assert.equal(readFileSync(join(foreign, 'SKILL.md'), 'utf8'), skillFile('alpha', 'wiki'));
    assert.equal(readlinkSync(join(w.project, '.agents/skills/alpha')), elsewhere);
    assert.ok(isLink(join(w.project, '.claude/skills/beta')));
  });

  it('--force moves the old entry aside and never deletes it', () => {
    const w = world();
    const foreign = join(w.project, '.claude/skills/alpha');
    mkdirSync(foreign, { recursive: true });
    writeFileSync(join(foreign, 'SKILL.md'), skillFile('alpha', 'wiki'));
    const { code, out } = run(w, ['alpha', '--project', w.project, '--agents', 'claude', '--force']);
    assert.equal(code, 0, out);
    assert.ok(isLink(foreign));
    const aside = readdirSync(join(w.project, '.claude/skills')).filter((e) => e.startsWith('alpha.replaced-'));
    assert.equal(aside.length, 1);
    assert.equal(readFileSync(join(w.project, '.claude/skills', aside[0], 'SKILL.md'), 'utf8'), skillFile('alpha', 'wiki'));
  });

  it('refuses a target folder that links into another git work tree, unless --into names it', () => {
    const w = world();
    const runtime = join(w.root, 'wiki', 'skills', '.runtime', 'all');
    mkdirSync(runtime, { recursive: true });
    mkdirSync(join(w.root, 'wiki', '.git'));
    mkdirSync(join(w.home, '.claude'));
    symlinkSync(runtime, join(w.home, '.claude', 'skills'));
    mkdirSync(join(w.home, '.agents'));
    symlinkSync(runtime, join(w.home, '.agents', 'skills'));

    const user = run(w, ['--user']);
    assert.equal(user.code, 1, user.out);
    assert.match(user.out, /refused: resolves into another git work tree/);
    assert.match(user.out, /Pass --into/);
    assert.deepEqual(readdirSync(runtime), []);

    const project = join(w.root, 'project2');
    mkdirSync(join(project, '.claude'), { recursive: true });
    symlinkSync(runtime, join(project, '.claude', 'skills'));
    const linked = run(w, ['--project', project, '--agents', 'claude']);
    assert.equal(linked.code, 1, linked.out);
    assert.deepEqual(readdirSync(runtime), []);

    const into = run(w, ['alpha', '--into', join(w.home, '.claude', 'skills')]);
    assert.equal(into.code, 0, into.out);
    assert.ok(isLink(join(runtime, 'alpha')));
  });

  it('--user writes under the home directory when nothing links it elsewhere', () => {
    const w = world();
    const { code, out } = run(w, ['beta', '--user']);
    assert.equal(code, 0, out);
    assert.ok(isLink(join(w.home, '.claude/skills/beta')));
    assert.ok(isLink(join(w.home, '.agents/skills/beta')));
  });

  it('--uninstall removes only its own links and copies', () => {
    const w = world();
    assert.equal(run(w, ['--project', w.project, '--agents', 'claude']).code, 0);
    assert.equal(run(w, ['beta', '--project', w.project, '--agents', 'agents', '--copy']).code, 0);
    const foreign = join(w.project, '.agents/skills/alpha');
    mkdirSync(foreign);
    writeFileSync(join(foreign, 'SKILL.md'), skillFile('alpha', 'wiki'));
    const { code, out } = run(w, ['--project', w.project, '--uninstall']);
    assert.equal(code, 1, out);
    assert.deepEqual(readdirSync(join(w.project, '.claude/skills')), []);
    assert.deepEqual(readdirSync(join(w.project, '.agents/skills')), ['alpha']);
    assert.match(out, /removed the copy/);
    assert.match(out, /left in place/);
  });

  it('prints the list and the help with no target', () => {
    const w = world();
    const { code, out } = run(w, []);
    assert.equal(code, 0, out);
    assert.match(out, /2 skills:/);
    assert.match(out, /--project <dir>/);
    assert.deepEqual(readdirSync(w.project), []);
  });
});
