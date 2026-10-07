// Tests for scripts/build-updated.mjs, each in a throwaway git repository
// with two pages, so nothing here reads or writes the checkout.
import { execFileSync, spawnSync } from 'node:child_process';
import { appendFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'build-updated.mjs');
const PAGES = [
  { id: '/a', paths: ['src/a', 'A.md'] },
  { id: '/b', paths: ['src/[slug]', 'media/b-*'] },
];
const ENV = {
  ...process.env,
  VERCEL: '',
  GIT_AUTHOR_NAME: 'test',
  GIT_AUTHOR_EMAIL: 'test@example.invalid',
  GIT_COMMITTER_NAME: 'test',
  GIT_COMMITTER_EMAIL: 'test@example.invalid',
};
delete ENV.VERCEL;

function repo() {
  const dir = mkdtempSync(join(tmpdir(), 'updated-'));
  const put = (path, text) => {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), text);
  };
  put('src/a/page.tsx', 'a\n');
  put('A.md', '# A\n');
  put('src/[slug]/page.tsx', 'b\n');
  put('media/b-film.mp4', 'film\n');
  put('pages.json', JSON.stringify(PAGES));
  mkdirSync(join(dir, 'src/lib'), { recursive: true });
  const git = (args, date) =>
    execFileSync('git', args, {
      cwd: dir,
      env: date ? { ...ENV, GIT_COMMITTER_DATE: date, GIT_AUTHOR_DATE: date } : ENV,
      encoding: 'utf8',
    });
  git(['init', '-q', '-b', 'main']);
  git(['add', '-A']);
  git(['commit', '-qm', 'first'], '2026-09-01T10:00:00-07:00');
  const script = (...args) =>
    spawnSync('node', [SCRIPT, '--root', dir, '--pages', join(dir, 'pages.json'), ...args], { env: ENV, encoding: 'utf8' });
  return { dir, put, git, script, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

const entry = (dir, id) =>
  new RegExp(`^ {2}'${id}': \\{ day: '([^']+)', at: '([^']+)', commit: (null|'[^']+')`, 'm').exec(
    readFileSync(join(dir, 'src/lib/updated.ts'), 'utf8')
  );

test('writes the last commit per page and passes its own check', (t) => {
  const r = repo();
  t.after(r.cleanup);
  r.put('media/b-poster.jpg', 'poster\n');
  r.git(['add', '-A']);
  r.git(['commit', '-qm', 'b poster'], '2026-09-20T09:00:00-07:00');
  assert.equal(r.script().status, 0);
  assert.equal(entry(r.dir, '/a')[1], '2026-09-01');
  assert.equal(entry(r.dir, '/b')[1], '2026-09-20');
  assert.equal(r.script('--check').status, 0);
});

test('a bracket folder is a literal path, not a glob class', (t) => {
  const r = repo();
  t.after(r.cleanup);
  r.put('src/s/page.tsx', 'not b\n');
  r.git(['add', '-A']);
  r.git(['commit', '-qm', 'src/s'], '2026-09-25T09:00:00-07:00');
  assert.equal(r.script().status, 0);
  assert.equal(entry(r.dir, '/b')[1], '2026-09-01');
});

test('the check fails when HEAD touched a page after the generated date', (t) => {
  const r = repo();
  t.after(r.cleanup);
  r.script();
  r.git(['add', '-A']);
  r.git(['commit', '-qm', 'updated'], '2026-09-02T10:00:00-07:00');
  appendFileSync(join(r.dir, 'A.md'), 'more\n');
  r.git(['commit', '-qam', 'a later'], '2026-09-30T10:00:00-07:00');
  const out = r.script('--check');
  assert.equal(out.status, 1);
  assert.match(out.stderr, /\/a: HEAD touched it on 2026-09-30 \([0-9a-f]{7}\), after the date the file records \(2026-09-01\)/);
});

test('committing only the regenerated file changes no date', (t) => {
  const r = repo();
  t.after(r.cleanup);
  r.script();
  r.git(['add', '-A']);
  r.git(['commit', '-qm', 'updated'], '2026-10-01T10:00:00-07:00');
  assert.equal(r.script('--check').status, 0);
  assert.equal(entry(r.dir, '/a')[1], '2026-09-01');
});

test('an uncommitted change passes the HEAD check, fails the staged check, and is dated today by the generator', (t) => {
  const r = repo();
  t.after(r.cleanup);
  r.script();
  r.git(['add', '-A']);
  r.git(['commit', '-qm', 'updated'], '2026-09-02T10:00:00-07:00');
  appendFileSync(join(r.dir, 'src/a/page.tsx'), 'edit\n');
  assert.equal(r.script('--check').status, 0);
  r.git(['add', 'src/a/page.tsx']);
  const staged = r.script('--check', '--staged');
  assert.equal(staged.status, 1);
  assert.match(staged.stderr, /\/a: a staged change touches it/);
  assert.equal(r.script('--staged').status, 0);
  assert.equal(entry(r.dir, '/a')[3], 'null');
  assert.equal(entry(r.dir, '/b')[1], '2026-09-01');
  r.git(['add', 'src/lib/updated.ts']);
  r.git(['commit', '-qm', 'a with its date']);
  const out = r.script('--check');
  assert.equal(out.status, 0);
  assert.match(out.stdout, /the next run links the date/);
});

test('--staged dates the staged pages only', (t) => {
  const r = repo();
  t.after(r.cleanup);
  appendFileSync(join(r.dir, 'A.md'), 'unstaged\n');
  appendFileSync(join(r.dir, 'media/b-film.mp4'), 'staged\n');
  r.git(['add', 'media/b-film.mp4']);
  assert.equal(r.script('--staged').status, 0);
  assert.equal(entry(r.dir, '/a')[1], '2026-09-01');
  assert.equal(entry(r.dir, '/b')[3], 'null');
});

test('an untracked file under a page dates it today', (t) => {
  const r = repo();
  t.after(r.cleanup);
  r.put('src/a/new.tsx', 'new\n');
  assert.equal(r.script().status, 0);
  assert.equal(entry(r.dir, '/a')[3], 'null');
});

test('a day recorded for work that was then dropped fails', (t) => {
  const r = repo();
  t.after(r.cleanup);
  appendFileSync(join(r.dir, 'A.md'), 'draft\n');
  r.script();
  r.git(['checkout', '--', 'A.md']);
  const out = r.script('--check');
  assert.equal(out.status, 1);
  assert.match(out.stderr, /\/a: the file records/);
});

test('a client module importing the generated file fails', (t) => {
  const r = repo();
  t.after(r.cleanup);
  r.script();
  r.put('src/app/view.tsx', "'use client';\nimport { UPDATED } from '@/lib/updated';\n");
  const out = r.script('--check');
  assert.equal(out.status, 1);
  assert.match(out.stderr, /a client module imports/);
});

test('a changed path list, a missing page and a dropped page fail', (t) => {
  const r = repo();
  t.after(r.cleanup);
  r.script();
  r.put('pages.json', JSON.stringify([{ id: '/a', paths: ['src/a'] }, { id: '/c', paths: ['A.md'] }]));
  const out = r.script('--check');
  assert.equal(out.status, 1);
  assert.match(out.stderr, /\/a: its path list changed/);
  assert.match(out.stderr, /\/c: not in/);
  assert.match(out.stderr, /\/b: in src\/lib\/updated.ts but no longer in PAGES/);
});

test('a path that matches nothing fails the write', (t) => {
  const r = repo();
  t.after(r.cleanup);
  r.put('pages.json', JSON.stringify([{ id: '/a', paths: ['src/gone'] }]));
  const out = r.script();
  assert.equal(out.status, 1);
  assert.match(out.stderr, /src\/gone matches no file/);
});

test('a shallow clone skips the check and refuses to write', (t) => {
  const r = repo();
  t.after(r.cleanup);
  r.git(['commit', '-q', '--allow-empty', '-m', 'second'], '2026-09-03T10:00:00-07:00');
  const shallow = mkdtempSync(join(tmpdir(), 'updated-shallow-'));
  t.after(() => rmSync(shallow, { recursive: true, force: true }));
  execFileSync('git', ['clone', '-q', '--depth', '1', `file://${r.dir}`, shallow], { env: ENV });
  const run = (...args) =>
    spawnSync('node', [SCRIPT, '--root', shallow, '--pages', join(r.dir, 'pages.json'), ...args], { env: ENV, encoding: 'utf8' });
  const check = run('--check');
  assert.equal(check.status, 0);
  assert.match(check.stdout, /skipped: shallow clone/);
  assert.equal(run().status, 1);
});
