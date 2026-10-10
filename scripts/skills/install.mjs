#!/usr/bin/env node
/* oxlint-disable no-console -- a command-line tool reporting to stdout. */
/**
 * Installs Prototemplate's curated skills (skills/<slug>/, the canonical
 * copy) into any project or agent home, so Claude Code, Codex and other
 * agents load them there. Node only, no packages.
 *
 * Usage:
 *   node scripts/skills/install.mjs [slug...] (--project <dir> | --user | --into <dir>)
 *     [--agents claude,agents,codex] [--copy] [--dry-run] [--force] [--uninstall]
 *   node scripts/skills/install.mjs --list
 *   pnpm skills:install runs the same from the checkout root.
 *
 * Selection. With no slug it takes every skill in the set; with slugs, only
 * those (an unknown slug exits 2). With no target it prints the list and
 * this help.
 *
 * Targets.
 *   --project <dir>  <dir>/.claude/skills/<slug> and <dir>/.agents/skills/<slug>
 *                    (the default agents, claude and agents); codex adds
 *                    <dir>/.codex/skills/<slug>. --agents picks the set.
 *   --user           the same folders under the home directory.
 *   --into <dir>     exactly <dir>/<slug>, for a folder no flag names.
 *
 * Link or copy. The default links each entry to the canonical folder: a
 * relative link when the target sits inside this checkout (so the links
 * this repository commits work in every clone), an absolute link
 * elsewhere. --copy vendors the folder instead. When git tracks the target
 * in another repository, the script recommends --copy, since an absolute
 * link into one person's checkout breaks on a teammate's machine.
 *
 * The home-folder guard. Each target folder is resolved to its real path.
 * When that path lies inside a git work tree other than the target
 * project's own (for --user, the home directory's), the script refuses to
 * write there and says why, unless --into names that folder. On a machine
 * where ~/.claude/skills and ~/.agents/skills are links into a wiki
 * checkout's runtime list, --user therefore refuses, and the wiki stays
 * untouched.
 *
 * Entries it does not own. An entry is the script's own when it is a link
 * that resolves to the canonical folder, or a folder whose SKILL.md carries
 * `origin: prototemplate`. Its own entries are replaced in place (a link
 * re-pointed, a copy refreshed). Any other entry with the same name (a
 * folder without that origin, or a link to somewhere else) is skipped and
 * counted as refused; --force moves it aside to <slug>.replaced-<timestamp>
 * and installs, and never deletes it.
 *
 * --uninstall removes only the script's own links and copies. --dry-run
 * prints every action and writes nothing. --source <dir> installs from
 * another skills folder (the tests use it). The output is a table of slug,
 * target and result; the exit code is 1 when anything was refused, 2 on a
 * usage error, 0 otherwise.
 */
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
  symlinkSync,
  unlinkSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

/* no scripts/lib import, so a copy at <dir>/scripts/skills/ beside <dir>/skills runs alone */
const HERE = dirname(fileURLToPath(import.meta.url));

/** The folder each agent loads skills from, relative to a project or the home directory. */
const AGENT_DIRS = { claude: '.claude/skills', agents: '.agents/skills', codex: '.codex/skills' };
const DEFAULT_AGENTS = ['claude', 'agents'];
const ORIGIN = /^\s+origin:\s*prototemplate\s*$/m;

const HELP = `Install Prototemplate's skills into a project or an agent home.

  node scripts/skills/install.mjs [slug...] --project <dir>   link into <dir>/.claude/skills and <dir>/.agents/skills
  node scripts/skills/install.mjs [slug...] --user            the same under the home directory
  node scripts/skills/install.mjs [slug...] --into <dir>      link into one folder: <dir>/<slug>

  --agents claude,agents,codex   which agent folders (default claude,agents)
  --copy                         copy the folders instead of linking them
  --dry-run                      print every action and write nothing
  --force                        move an entry this script does not own to <slug>.replaced-<time>, then install
  --uninstall                    remove this script's own links and copies
  --list                         print the skills and exit

With no slug, every skill is selected. Run --dry-run first.`;

/* ---- arguments ---- */

function usage(message) {
  console.error(`install-skills: ${message}\n`);
  console.error(HELP);
  process.exit(2);
}

function parseArgs(argv) {
  const opts = { slugs: [], agents: null, copy: false, dryRun: false, force: false, uninstall: false, list: false, help: false };
  const valued = new Set(['--project', '--into', '--agents', '--source']);
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (valued.has(arg)) {
      const value = argv[i + 1];
      if (value === undefined || value.startsWith('--')) usage(`${arg} needs a value`);
      i += 1;
      if (arg === '--project') opts.project = value;
      else if (arg === '--into') opts.into = value;
      else if (arg === '--source') opts.source = value;
      else opts.agents = value.split(',').map((a) => a.trim()).filter(Boolean);
    } else if (arg === '--user') opts.user = true;
    else if (arg === '--copy') opts.copy = true;
    else if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '--force') opts.force = true;
    else if (arg === '--uninstall') opts.uninstall = true;
    else if (arg === '--list') opts.list = true;
    else if (arg === '--help' || arg === '-h') opts.help = true;
    else if (arg.startsWith('-')) usage(`unknown flag ${arg}`);
    else opts.slugs.push(arg);
  }
  return opts;
}

/* ---- the set ---- */

/** The skills a source folder holds: each folder whose SKILL.md carries origin: prototemplate, with its title and areas. */
function readSet(source) {
  if (!existsSync(source)) usage(`no skills folder at ${source}`);
  const out = [];
  for (const slug of readdirSync(source).sort()) {
    const file = join(source, slug, 'SKILL.md');
    if (slug.startsWith('.') || !existsSync(file)) continue;
    const text = readFileSync(file, 'utf8');
    if (!ORIGIN.test(text)) continue;
    const title = /^\s+title:\s*(.+)$/m.exec(text)?.[1]?.trim() ?? slug;
    const areas = /^\s+areas:\s*(.+)$/m.exec(text)?.[1]?.trim() ?? '';
    out.push({ slug, title, areas, dir: realpathSync(join(source, slug)) });
  }
  return out;
}

function printList(set) {
  const width = Math.max(...set.map((s) => s.slug.length));
  console.log(`${set.length} skills:\n`);
  for (const s of set) console.log(`  ${s.slug.padEnd(width)}  ${s.title} (${s.areas})`);
  console.log('');
}

/* ---- paths ---- */

/** The real path of a path that may not exist yet: the real path of its deepest existing ancestor, with the rest appended. */
function real(path) {
  try {
    return realpathSync(path);
  } catch {
    const parent = dirname(path);
    if (parent === path) return path;
    return join(real(parent), basename(path));
  }
}

/** The git work tree a real path lies in: the nearest folder at or above it that holds a .git entry, or null. */
function workTree(path) {
  let dir = path;
  for (;;) {
    if (existsSync(join(dir, '.git'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

function inside(path, root) {
  return path === root || path.startsWith(`${root}${sep}`);
}

/** A path for the table: relative to the working directory when under it, ~ for the home directory. */
function shown(path) {
  const cwd = process.cwd();
  if (inside(path, cwd) && path !== cwd) return relative(cwd, path);
  const home = homedir();
  return inside(path, home) ? `~${path.slice(home.length)}` : path;
}

/** Two folders with the same files and bytes, dotfiles left out. */
function sameTree(a, b) {
  const list = (dir) =>
    readdirSync(dir)
      .filter((e) => !e.startsWith('.'))
      .sort();
  const left = list(a);
  const right = list(b);
  if (left.join('\n') !== right.join('\n')) return false;
  return left.every((entry) => {
    const pa = join(a, entry);
    const pb = join(b, entry);
    const sa = statSync(pa);
    const sb = statSync(pb);
    if (sa.isDirectory() !== sb.isDirectory()) return false;
    if (sa.isDirectory()) return sameTree(pa, pb);
    return readFileSync(pa).equals(readFileSync(pb));
  });
}

/** What sits at an entry: nothing, the script's own link or copy, or something else. */
function inspect(entry, skillDir) {
  let stat;
  try {
    stat = lstatSync(entry);
  } catch {
    return 'absent';
  }
  if (stat.isSymbolicLink()) {
    try {
      return realpathSync(entry) === skillDir ? 'own-link' : 'foreign';
    } catch {
      return 'foreign';
    }
  }
  if (stat.isDirectory()) {
    const file = join(entry, 'SKILL.md');
    return existsSync(file) && ORIGIN.test(readFileSync(file, 'utf8')) ? 'own-copy' : 'foreign';
  }
  return 'foreign';
}

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

/* ---- the run ---- */

const opts = parseArgs(process.argv.slice(2));
const source = resolve(opts.source ?? join(HERE, '../..', 'skills'));
const set = readSet(source);
const sourceRoot = real(dirname(source));
const sourceTree = workTree(sourceRoot);

const targets = [opts.project !== undefined, Boolean(opts.user), opts.into !== undefined].filter(Boolean).length;
if (opts.help) {
  console.log(HELP);
  process.exit(0);
}
if (opts.list) {
  printList(set);
  process.exit(0);
}
if (targets === 0) {
  printList(set);
  console.log(HELP);
  process.exit(opts.slugs.length > 0 || opts.copy || opts.force || opts.uninstall || opts.dryRun ? 2 : 0);
}
if (targets > 1) usage('name one target: --project, --user or --into');

const unknown = opts.slugs.filter((slug) => !set.some((s) => s.slug === slug));
if (unknown.length > 0) usage(`not in the set: ${unknown.join(', ')} (run --list)`);
const chosen = opts.slugs.length > 0 ? set.filter((s) => opts.slugs.includes(s.slug)) : set;

const agents = opts.agents ?? DEFAULT_AGENTS;
const badAgents = agents.filter((a) => !(a in AGENT_DIRS));
if (badAgents.length > 0) usage(`unknown agent ${badAgents.join(', ')} (claude, agents, codex)`);

/** The folders to write and the project they belong to. */
let owner = null;
let folders;
if (opts.into !== undefined) {
  folders = [resolve(opts.into)];
} else {
  owner = opts.user ? homedir() : resolve(opts.project);
  if (!existsSync(owner) || !statSync(owner).isDirectory()) usage(`${owner} is not a folder`);
  folders = agents.map((agent) => join(owner, AGENT_DIRS[agent]));
}
const ownerTree = owner ? workTree(real(owner)) : null;

const rows = [];
const notes = [];
let refused = 0;
const say = (slug, target, result) => rows.push([slug, shown(target), result]);
const dry = opts.dryRun;
/** A result in the tense the run calls for: `would link` on a dry run, `linked` otherwise. */
const act = (present, past) => (dry ? `would ${present}` : past);

for (const folder of folders) {
  const realFolder = real(folder);
  const tree = workTree(realFolder);

  /* the guard: never write into another repository through a linked folder */
  if (inside(realFolder, real(source))) {
    say(`all ${chosen.length}`, folder, 'refused: the folder is inside the skills source');
    refused += 1;
    continue;
  }
  if (opts.into === undefined && tree && tree !== ownerTree) {
    say(`all ${chosen.length}`, folder, `refused: resolves into another git work tree (${shown(tree)})`);
    notes.push(
      `${shown(folder)} resolves to ${realFolder}, inside the git work tree ${tree}, which is not ${shown(owner)}'s. ` +
        `Writing there would change that repository. Pass --into ${shown(folder)} to write there on purpose.`
    );
    refused += 1;
    continue;
  }
  let folderStat = null;
  try {
    folderStat = lstatSync(folder);
  } catch {
    folderStat = null;
  }
  if (folderStat && !existsSync(folder)) {
    say(`all ${chosen.length}`, folder, 'refused: the folder is a broken link');
    refused += 1;
    continue;
  }

  const relativeLinks = inside(realFolder, sourceRoot);
  if (!opts.copy && !opts.uninstall && !relativeLinks && tree && tree !== sourceTree) {
    notes.push(
      `${shown(folder)} is tracked by the git repository at ${shown(tree)}. An absolute link into this checkout breaks on a teammate's machine; pass --copy to vendor the folders.`
    );
  }
  if (!dry && !opts.uninstall) mkdirSync(folder, { recursive: true });

  for (const skill of chosen) {
    const entry = join(folder, skill.slug);
    const state = inspect(entry, skill.dir);

    if (opts.uninstall) {
      if (state === 'absent') say(skill.slug, entry, 'absent');
      else if (state === 'own-link') {
        if (!dry) unlinkSync(entry);
        say(skill.slug, entry, act('remove the link', 'removed the link'));
      } else if (state === 'own-copy') {
        if (!dry) rmSync(entry, { recursive: true, force: true });
        say(skill.slug, entry, act('remove the copy', 'removed the copy'));
      } else {
        say(skill.slug, entry, 'refused: not installed by this script, left in place');
        refused += 1;
      }
      continue;
    }

    const linkTarget = relativeLinks ? relative(realFolder, skill.dir) : skill.dir;
    const make = () => {
      if (dry) return;
      if (opts.copy) cpSync(skill.dir, entry, { recursive: true, filter: (src) => !basename(src).startsWith('.') || src === skill.dir });
      else symlinkSync(linkTarget, entry, 'dir');
    };
    const made = opts.copy ? ['copy', 'copied'] : [`link -> ${linkTarget}`, `linked -> ${linkTarget}`];

    if (state === 'absent') {
      make();
      say(skill.slug, entry, act(made[0], made[1]));
    } else if (state === 'own-link') {
      if (!opts.copy && readlinkSync(entry) === linkTarget) {
        say(skill.slug, entry, 'unchanged');
      } else {
        if (!dry) unlinkSync(entry);
        make();
        say(skill.slug, entry, opts.copy ? act('replace the link with a copy', 'replaced the link with a copy') : act(`re-link -> ${linkTarget}`, `re-linked -> ${linkTarget}`));
      }
    } else if (state === 'own-copy') {
      if (opts.copy && sameTree(entry, skill.dir)) {
        say(skill.slug, entry, 'unchanged');
      } else {
        if (!dry) rmSync(entry, { recursive: true, force: true });
        make();
        say(skill.slug, entry, opts.copy ? act('refresh the copy', 'refreshed the copy') : act('replace the copy with a link', 'replaced the copy with a link'));
      }
    } else if (opts.force) {
      const aside = `${entry}.replaced-${stamp()}`;
      if (!dry) renameSync(entry, aside);
      make();
      say(skill.slug, entry, act(`move the old entry to ${basename(aside)}, then ${made[0]}`, `moved the old entry to ${basename(aside)}, then ${made[1]}`));
    } else {
      say(skill.slug, entry, 'refused: an entry this script does not own (no origin: prototemplate, or a link elsewhere); --force moves it aside');
      refused += 1;
    }
  }
}

/* the table */
const widths = [0, 1].map((col) => Math.max(col === 0 ? 4 : 6, ...rows.map((row) => row[col].length)));
console.log(`${'slug'.padEnd(widths[0])}  ${'target'.padEnd(widths[1])}  result`);
for (const [slug, target, result] of rows) console.log(`${slug.padEnd(widths[0])}  ${target.padEnd(widths[1])}  ${result}`);
for (const note of [...new Set(notes)]) console.log(`\nnote: ${note}`);
console.log(
  `\ninstall-skills: ${dry ? 'dry run, nothing written; ' : ''}${chosen.length} skill${chosen.length === 1 ? '' : 's'} into ${folders.length} folder${folders.length === 1 ? '' : 's'}${refused > 0 ? `, ${refused} refused` : ''}`
);
process.exit(refused > 0 ? 1 : 0);
