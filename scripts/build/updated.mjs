// Builds src/lib/updated.ts: the date each page with a book head last
// changed, shown in the Updated row of the head's panel (DESIGN.md section 4,
// The book page). A page's date is the
// committer date of the last commit on HEAD that touched the page's own
// sources and content, as `git log -1 --format=%H%x09%cI HEAD -- <paths>`
// reads it, passing over a commit that only renames the page's files
// (lastChange). pages() below lists those paths for every page that renders a
// book head: the single pages and the skill, package and direction records.
// Shared shell code (src/components/viewer, tokens.css, surfaces.ts,
// search-index.ts, globals.css) is in no page's list, so
// a shell change leaves every date alone; src/lib/updated.ts itself is
// excluded from every list, so committing a regenerated file changes no date.
// It reads git only: it never runs build:motion and never reads motion/.
//
// A page whose paths hold uncommitted changes (staged, unstaged or
// untracked) when the generator runs gets today's local date and no commit:
// the change is about to be committed with this file. The next run fills in
// the commit. With --staged only staged changes count, so in a checkout
// other sessions share, a commit dates the pages it stages and no others.
//
// The output is committed, so the site builds from it alone. Vercel clones
// shallow, and in a shallow clone `git log -1 -- <paths>` returns the clone's
// boundary commit for any page untouched since it, which is the wrong date.
// So the generator refuses to write in a shallow clone, and the check skips
// there (and when VERCEL is set, or when there is no git directory).
//
// The check (--check) compares the file with HEAD and fails when:
//   - HEAD touched a page's paths on a later day than the file records (a
//     commit changed the page and the file was not regenerated with it);
//   - the file records a later day than HEAD's and the page's paths hold no
//     uncommitted change (the change it was dated for was dropped);
//   - a page's path list changed since the file was generated (the `src`
//     hash), a page is missing from the file, or the file holds a page PAGES
//     no longer lists;
//   - a listed path or glob matches nothing (a rename the list missed);
//   - a client module ('use client') imports src/lib/updated.ts, which would
//     ship every page's entry to the browser (pages pass their one entry).
// Two cases only print a note: a day recorded ahead of HEAD for work still
// uncommitted, and a recorded `commit: null` whose change is now committed
// (the date is right; the next run links it).
// With --check --staged (a pre-commit run) it also fails when a staged change
// touches a page and the file records an earlier day than today: the commit
// would ship the page with an old date.
//
// Usage:
//   node scripts/build/updated.mjs           write src/lib/updated.ts
//   node scripts/build/updated.mjs --check   exit 1 when it is stale
//   --staged       the generator dates staged changes only; the check adds
//                  the staged rule above
//   --root <dir>   the checkout (default: the repository root)
//   --out <file>   the output (default: <root>/src/lib/updated.ts)
//   --json         print the computed table and write nothing
//   --head         read HEAD alone and ignore the working tree (with --json or a write)
//   --pages <file> a JSON list of { id, paths } in place of PAGES (the tests)
/* oxlint-disable no-console -- a generator and check reporting to stdout. */
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { promisify } from 'node:util';
import { ROOT as REPO_ROOT } from '../lib/root.mjs';
import { helpIfAsked } from '../lib/help.mjs';

helpIfAsked(import.meta.url);

const run = promisify(execFile);

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const option = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};

const ROOT = option('--root') ?? REPO_ROOT;
const OUT_REL = 'src/lib/updated.ts';
const OUT = option('--out') ?? join(ROOT, OUT_REL);
const CHECK = flag('--check');
const JSON_OUT = flag('--json');
/** --head: the dates as HEAD alone reads them, ignoring the working tree */
const HEAD_ONLY = flag('--head');
const STAGED = flag('--staged');

/** Excluded from every page: the file this script writes. */
const SELF = `:(exclude)${OUT_REL}`;

/** How many git processes run at once. */
const POOL = 8;

// ---- the pages ----------------------------------------------------------
//
// One entry per route that renders a book head; no other route shows a
// date, and every listed path must match a file. A plain string is a file
// or a folder (a folder covers everything under it); a string with * is a
// glob. Keys are the route's pathname, so the page check can match a route
// to its entry. A collection is a function of the slugs it reads from the
// repository. /docs/<slug> renders the /docs book and reads its entry, and
// /handbook/<slug> the /handbook book.

/** `src/app/docs/registry.ts`: every `file: '...'` and its slug. */
function docEntries() {
  const src = readFileSync(join(ROOT, 'src/app/docs/registry.ts'), 'utf8');
  const out = [...src.matchAll(/slug: '([^']+)',\s*\n\s*file: '([^']+)'/g)].map((m) => ({ slug: m[1], file: m[2] }));
  if (out.length === 0) throw new Error('build-updated: no documents read from src/app/docs/registry.ts');
  return out;
}

/** `skills/<slug>/SKILL.md` folders. */
function skillSlugs() {
  const dir = join(ROOT, 'skills');
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(join(dir, e.name, 'SKILL.md')))
    .map((e) => e.name)
    .sort();
}

/** The research packages: `public/motion/<slug>.md` (MOTION_BODY_DIR). */
function packageSlugs() {
  return readdirSync(join(ROOT, 'public/motion'))
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.slice(0, -3))
    .sort();
}

/** Every direction slug in src/lib/directions.ts except the shipped reference, which has no /directions page of its own. */
function directionSlugs() {
  const src = readFileSync(join(ROOT, 'src/lib/directions.ts'), 'utf8');
  const out = [...src.matchAll(/^ {4}slug: '([^']+)'/gm)].map((m) => m[1]).filter((s) => s !== 'production');
  if (out.length === 0) throw new Error('build-updated: no directions read from src/lib/directions.ts');
  return out;
}

/** @returns {{ id: string, paths: string[] }[]} */
function pages() {
  const given = option('--pages');
  if (given) return JSON.parse(readFileSync(given, 'utf8'));
  const docs = docEntries();
  return [
    { id: '/brand', paths: ['src/app/brand', 'BRAND.md', 'public/brand'] },
    { id: '/docs', paths: ['src/app/docs', 'README.md', ...docs.map((d) => d.file)] },
    // the handbook renders through the docs book (src/app/docs), which is
    // /docs' own code; /handbook is dated by its documents and its route
    { id: '/handbook', paths: ['docs/handbook', 'src/app/handbook'] },
    { id: '/skills', paths: ['skills', 'src/app/skills', 'src/lib/skills.ts', 'scripts/skills/install.mjs'] },
    ...skillSlugs().map((s) => ({
      id: `/skills/${s}`,
      paths: [`skills/${s}`, 'src/app/skills/[slug]', 'src/app/skills/SkillViewer.tsx'],
    })),
    { id: '/marks', paths: ['src/app/marks', 'src/lib/marks.ts', 'public/marks', 'scripts/build/speed-marks.mjs'] },
    { id: '/blog', paths: ['src/app/blog/page.tsx', 'src/app/blog/blog.css', 'content/blog', 'content/authors', 'src/lib/blog.ts'] },
    {
      id: '/graphics',
      paths: ['src/app/graphics', 'src/lib/graphics.ts', 'src/lib/graphics-model.ts', 'public/static/blogs', 'public/graphics'],
    },
    // motion/ is the Videos session's untracked working folder: the site
    // publishes from public/media and public/motion, so those are listed
    { id: '/motion', paths: ['src/app/motion', 'src/lib/motion.ts', 'public/motion', 'public/media'] },
    ...packageSlugs().map((s) => ({
      id: `/motion/${s}`,
      // the package, its credits, the published cut's sheet and script (the version rule) and the page's code
      paths: [
        `public/motion/${s}.*`,
        `public/motion/sheets/${s}.*`,
        `public/motion/scripts/${s}.md`,
        `public/media/${s}-*`,
        'src/app/motion/[slug]',
        'src/app/motion/records.tsx',
      ],
    })),
    ...directionSlugs().map((s) => ({
      id: `/directions/${s}`,
      paths: [`src/app/d/${s}`, 'src/app/directions'],
    })),
  ];
}

/** A path as a git pathspec: `*` makes it a glob; anything else is literal, so `[slug]` is a folder name and not a class. */
function pathspec(path) {
  return path.includes('*') ? `:(glob)${path}` : `:(literal)${path}`;
}

/** The short hash of a page's path list, recorded so the check sees a changed list. */
function srcHash(paths) {
  return createHash('sha1').update(paths.join('\n')).digest('hex').slice(0, 8);
}

async function git(args) {
  const { stdout } = await run('git', args, { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 });
  return stdout;
}

/** Today in local time, `YYYY-MM-DD`: the day a commit made now would carry. */
function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** A listed path as a test on a repository path: a folder covers what is under it; `*` matches within one segment, as git's :(glob) does. */
function matcher(path) {
  if (!path.includes('*')) return (f) => f === path || f.startsWith(`${path}/`);
  const re = new RegExp(`^${path.split('*').map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('[^/]*')}(/.*)?$`);
  return (f) => re.test(f);
}

/** NUL-separated git output as a list; status lines lose their two status letters and the space. */
function zlist(out, status = false) {
  return out.split('\0').filter(Boolean).map((e) => (status ? e.slice(3) : e));
}

/**
 * The working tree, read once for every page: the files git knows or sees
 * (tracked, and untracked but not ignored), the files with uncommitted
 * changes, and the staged ones. The pathspecs keep git out of folders no
 * page lists, such as the untracked motion/ working folder.
 */
async function readTree(list) {
  const specs = [...new Set(list.flatMap((p) => p.paths))].map(pathspec);
  const [files, status, cached] = await Promise.all([
    git(['ls-files', '-z', '--cached', '--others', '--exclude-standard', '--', ...specs, SELF]),
    git(['status', '--porcelain=v1', '-z', '--no-renames', '--untracked-files=all', '--', ...specs, SELF]),
    git(['diff', '--cached', '--name-only', '-z', '--no-renames', '--', ...specs, SELF]),
  ]);
  return { files: zlist(files), dirty: zlist(status, true), staged: zlist(cached) };
}

/**
 * The last commit on HEAD that changed a page, as [sha, at]. A commit whose
 * every change under the page is a pure rename (a git mv, content
 * unchanged) is passed over and the walk follows the old paths, so moving a
 * listed file re-dates no page.
 */
async function lastChange(page, hit) {
  const old = new Set();
  let rev = 'HEAD';
  for (;;) {
    const log = await git(['log', '-1', '--format=%H%x09%cI', rev, '--', ...page.paths.map(pathspec), ...[...old].map(pathspec), SELF]);
    const [sha, at] = log.trim().split('\t');
    if (!sha) return [];
    const changes = renames(await git(['diff-tree', '-r', '-z', '--root', '--no-commit-id', '--name-status', '-M100%', sha]));
    const mine = changes.filter((c) => hit(c.path) || old.has(c.path) || (c.from && (hit(c.from) || old.has(c.from))));
    if (mine.length === 0 || mine.some((c) => !c.from)) return [sha, at];
    for (const c of mine) old.add(c.from);
    rev = `${sha}^`;
  }
}

/** `git diff-tree -z --name-status` output as { path, from }, where from is set on a pure rename (R100). */
function renames(out) {
  const parts = out.split('\0').filter(Boolean);
  const list = [];
  for (let i = 0; i < parts.length; i++) {
    const status = parts[i];
    if (/^[RC]/.test(status)) {
      list.push({ path: parts[i + 2], from: status === 'R100' ? parts[i + 1] : null });
      i += 2;
    } else list.push({ path: parts[++i], from: null });
  }
  return list;
}

/** One page: the last commit on HEAD over its paths, and whether the working tree holds changes there. */
async function readPage(page, tree) {
  const tests = page.paths.map(matcher);
  const hit = (f) => tests.some((t) => t(f));
  const missing = page.paths.filter((p, i) => !tree.files.some(tests[i]));
  const [sha, at] = await lastChange(page, hit);
  const dirty = !HEAD_ONLY && tree.dirty.some(hit);
  const staged = !HEAD_ONLY && tree.staged.some(hit);
  const committed = sha ? { day: at.slice(0, 10), at, commit: sha.slice(0, 7) } : null;
  return { id: page.id, src: srcHash(page.paths), missing, committed, dirty, staged };
}

async function pool(items, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(POOL, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    })
  );
  return out;
}

/** The entry a page gets now: today while it holds uncommitted work (staged work under --staged), else its last commit. */
function entryOf(read, day) {
  const pending = STAGED ? read.staged : read.dirty;
  if (pending || !read.committed) return { day, at: day, commit: null, src: read.src };
  return { ...read.committed, src: read.src };
}

function render(entries) {
  const q = (s) => (s === null ? 'null' : `'${s}'`);
  const lines = entries.map(
    ([id, e]) => `  ${q(id)}: { day: ${q(e.day)}, at: ${q(e.at)}, commit: ${q(e.commit)}, src: ${q(e.src)} },`
  );
  return `// Generated by scripts/build/updated.mjs (pnpm build:updated). Do not edit.
//
// The day each page last changed: the last commit on HEAD that touched the
// page's own sources and content (the paths are listed in the script), or
// the day the file was generated while those paths held uncommitted work
// (commit null; the next run fills it in). Keys are route pathnames.
// pnpm lint:updated fails when this file is behind HEAD. Server modules
// only: a page passes its one entry to its viewer, and the check refuses a
// 'use client' module that imports this file.
import type { PageUpdated } from './page-updated';

export const UPDATED: Readonly<Record<string, PageUpdated>> = {
${lines.join('\n')}
};

/** The entry for a route pathname; a route with a book head must have one. */
export function requireUpdated(pathname: string): PageUpdated {
  const entry = UPDATED[pathname];
  if (!entry) throw new Error(\`\${pathname} has no entry in src/lib/updated.ts; run pnpm build:updated\`);
  return entry;
}
`;
}

/** Reads the committed file back: id to { day, commit, src }. */
function parse(text) {
  const out = new Map();
  for (const m of text.matchAll(/^ {2}'([^']+)': \{ day: '([^']+)', at: '([^']+)', commit: (null|'[^']+'), src: '([^']+)' \},$/gm)) {
    out.set(m[1], { day: m[2], at: m[3], commit: m[4] === 'null' ? null : m[4].slice(1, -1), src: m[5] });
  }
  return out;
}

/** Client modules that import the generated file: each would ship every page's entry to the browser. */
function clientImports() {
  const out = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, e.name);
      if (e.isDirectory()) walk(path);
      else if (/\.(tsx?|mjs)$/.test(e.name)) {
        const text = readFileSync(path, 'utf8');
        if (/^\s*['"]use client['"]/.test(text) && /from ['"](@\/lib\/updated|[./]+\/updated)['"]/.test(text)) {
          out.push(`${relative(ROOT, path)}: a client module imports ${OUT_REL}; pass the page's entry from its server page.tsx`);
        }
      }
    }
  };
  if (existsSync(join(ROOT, 'src'))) walk(join(ROOT, 'src'));
  return out;
}

async function shallowOrNoGit() {
  if (process.env.VERCEL) return 'VERCEL is set (shallow clone)';
  try {
    const out = (await git(['rev-parse', '--is-shallow-repository'])).trim();
    return out === 'true' ? 'shallow clone' : null;
  } catch {
    return 'no git repository';
  }
}

async function main() {
  const skip = await shallowOrNoGit();
  if (skip) {
    if (CHECK) {
      console.log(`build-updated: check skipped: ${skip}; the committed ${OUT_REL} stands`);
      return 0;
    }
    console.error(`build-updated: refusing to write: ${skip}; dates would be the clone's boundary commit`);
    return 1;
  }

  const list = pages();
  const ids = new Set();
  for (const p of list) {
    if (ids.has(p.id)) throw new Error(`build-updated: ${p.id} is listed twice`);
    ids.add(p.id);
  }
  const tree = await readTree(list);
  const reads = await pool(list, (page) => readPage(page, tree));
  const day = today();

  const errors = [];
  for (const r of reads) {
    for (const p of r.missing) errors.push(`${r.id}: ${p} matches no file (renamed or removed? fix PAGES)`);
  }

  const entries = reads.map((r) => [r.id, entryOf(r, day)]);

  if (JSON_OUT) {
    console.log(JSON.stringify(Object.fromEntries(entries), null, 2));
    return errors.length ? 1 : 0;
  }

  if (!CHECK) {
    if (errors.length) {
      for (const e of errors) console.error(`build-updated: ${e}`);
      return 1;
    }
    writeFileSync(OUT, render(entries));
    const pending = entries.filter(([, e]) => e.commit === null).length;
    console.log(`build-updated: wrote ${relative(ROOT, OUT) || OUT} (${entries.length} pages, ${pending} with uncommitted changes dated ${day})`);
    return 0;
  }

  // --check
  if (!existsSync(OUT)) {
    console.error(`build-updated: ${OUT_REL} is missing; run pnpm build:updated`);
    return 1;
  }
  const recorded = parse(readFileSync(OUT, 'utf8'));
  const warnings = [];
  const pendingIds = [];
  for (const r of reads) {
    const was = recorded.get(r.id);
    if (!was) {
      errors.push(`${r.id}: not in ${OUT_REL}`);
      continue;
    }
    if (was.src !== r.src) errors.push(`${r.id}: its path list changed since ${OUT_REL} was generated`);
    const head = r.committed;
    if (head && head.day > was.day) {
      errors.push(`${r.id}: HEAD touched it on ${head.day} (${head.commit}), after the date the file records (${was.day})`);
    } else if (!head || was.day > head.day) {
      if (r.dirty) pendingIds.push(r.id);
      else errors.push(`${r.id}: the file records ${was.day}, but HEAD last touched it on ${head ? head.day : 'no day'} and nothing is uncommitted`);
    } else if (was.commit === null && head) {
      warnings.push(`${r.id}: committed as ${head.commit}; the next run links the date to it`);
    }
    if (STAGED && r.staged && was.day < day) {
      errors.push(`${r.id}: a staged change touches it, and the file records ${was.day}; run pnpm build:updated --staged and stage ${OUT_REL}`);
    }
  }
  for (const id of recorded.keys()) if (!ids.has(id)) errors.push(`${id}: in ${OUT_REL} but no longer in PAGES`);
  errors.push(...clientImports());
  if (pendingIds.length) {
    const shown = pendingIds.slice(0, 4).join(', ');
    warnings.push(`${pendingIds.length} pages dated ahead of HEAD for uncommitted work (${shown}${pendingIds.length > 4 ? ', ...' : ''})`);
  }

  for (const w of warnings) console.log(`build-updated: note: ${w}`);
  if (errors.length) {
    for (const e of errors) console.error(`build-updated: ${e}`);
    console.error(`build-updated: ${errors.length} stale; run pnpm build:updated and commit ${OUT_REL} with the change`);
    return 1;
  }
  console.log(`build-updated: ${OUT_REL} is current (${entries.length} pages)`);
  return 0;
}

process.exitCode = await main();
