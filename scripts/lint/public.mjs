#!/usr/bin/env node
/* oxlint-disable no-console -- a report printed to stdout. */
/**
 * Scans the checkout for what must never be public: key shapes, machine
 * paths and the terms on a private denylist. GitHub publishes every file of
 * this repository, whether or not the site renders it. The findings:
 *   - key shapes: API keys and private keys by their published formats
 *     (Stripe, Anthropic, OpenAI, AWS, Google, GitHub, Slack, PEM headers).
 *     The matched text is never printed.
 *   - machine paths: /Users/<name>/ and /private/tmp/. Write ~, $PROTOTEMPLATE
 *     or a repo-relative path instead (~/gt/ is fine).
 *   - denylist terms: the private list at PT_DENYLIST (one term per line,
 *     # for comments), matched whole-word and case-insensitive, a term of
 *     several words also when it wraps across lines. The list
 *     lives outside this repository, and a finding prints the term's line
 *     number in the list, never the term. Under VERCEL or CI the denylist
 *     is skipped with a printed line, since no private file is there.
 *
 * It is a filesystem walk, so it reads untracked files too. It skips
 * node_modules, package stores (.pnpm-store, .npm, .cache, .yarn), .next,
 * .git, out, .pagecheck, public/media, deck/preview, deck/tmp, .env files,
 * binaries and symlinks. motion/ at the root holds the Videos session's
 * untracked renders and drafts, so only its tracked files are read: the
 * ones git lists, or the whole folder in a checkout without .git (a clean
 * export holds tracked files only). scripts/lint/public.allow.json exempts a path from named rules
 * (this lint's own source and test, which spell the patterns).
 *
 * Every finding fails. The baseline that held the old machine paths and
 * terms while they were cleared (scripts/lint/public.baseline.json) was
 * emptied and removed on 2026-10-10 (system v2, lane L7); fix a finding or,
 * for a file that must spell a pattern, add it to the allow file.
 *
 * Usage:
 *   node scripts/lint/public.mjs [--root <dir>] [--keys]
 *   (pnpm lint:public; pnpm build runs --keys; the pre-push hook runs it all)
 *
 *   --keys   key shapes only (fast; what the build runs)
 *
 * Exit 0 when there is no finding, 1 on any finding, 2 when PT_DENYLIST
 * names a file that is not there.
 */
import { spawnSync } from 'node:child_process';
import { closeSync, existsSync, lstatSync, openSync, readFileSync, readSync, readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { ROOT as REPO_ROOT } from '../lib/root.mjs';
import { helpIfAsked } from '../lib/help.mjs';

helpIfAsked(import.meta.url);

const argv = process.argv.slice(2);
const at = argv.indexOf('--root');
const ROOT = at >= 0 ? resolve(argv[at + 1]) : REPO_ROOT;
const KEYS_ONLY = argv.includes('--keys');
const ALLOW_REL = 'scripts/lint/public.allow.json';

/** The key formats, each anchored and with its length, as the providers publish them. */
export const KEY_SHAPES = [
  ['stripe', /\bsk_(live|test)_[A-Za-z0-9]{24,}/],
  ['anthropic', /sk-ant-api\d\d-[A-Za-z0-9_-]{20,}/],
  ['openai', /sk-proj-[A-Za-z0-9_-]{20,}/],
  ['aws', /AKIA[0-9A-Z]{16}/],
  ['google', /AIza[0-9A-Za-z_-]{35}/],
  ['github', /gh[pousr]_[A-Za-z0-9]{36}/],
  ['github-pat', /github_pat_[A-Za-z0-9_]{20,}/],
  ['slack', /xox[bp]-[0-9A-Za-z-]{10,}/],
  ['pem', /-----BEGIN (?:RSA |EC |DSA |OPENSSH |ENCRYPTED |PGP )?PRIVATE KEY(?: BLOCK)?-----/],
];
const MACHINE_PATH = /\/Users\/[A-Za-z0-9._-]+\/|\/private\/tmp\//g;

/* package stores and caches a CI or Vercel build keeps inside the checkout hold other projects' files */
const SKIP_NAMES = new Set(['node_modules', '.pnpm-store', '.npm', '.cache', '.yarn', '.next', '.git', 'out', '.pagecheck', '.vercel', '.turbo', '.DS_Store']);
const SKIP_PATHS = new Set(['motion', 'public/media', 'deck/preview', 'deck/tmp']);
const BINARY = /\.(png|jpe?g|webp|gif|avif|ico|mp4|webm|mov|mp3|wav|m4a|woff2?|ttf|otf|pdf|zip|gz|tgz|glb|bin|tsbuildinfo)$/i;

function readJson(rel, fallback) {
  const abs = join(ROOT, rel);
  return existsSync(abs) ? JSON.parse(readFileSync(abs, 'utf8')) : fallback;
}

/** True when the file's first 8 KB hold a NUL byte. */
function isBinary(abs) {
  const fd = openSync(abs, 'r');
  const buf = Buffer.alloc(8192);
  const n = readSync(fd, buf, 0, buf.length, 0);
  closeSync(fd);
  return buf.subarray(0, n).includes(0);
}

/** Every text file under the root, repo-relative, skipping the excluded folders, symlinks and binaries. */
function walk(dir = ROOT, out = []) {
  for (const entry of readdirSync(dir)) {
    const abs = join(dir, entry);
    const rel = relative(ROOT, abs);
    if (SKIP_NAMES.has(entry) || SKIP_PATHS.has(rel) || entry.startsWith('.env')) continue;
    const stat = lstatSync(abs);
    if (stat.isSymbolicLink()) continue;
    if (stat.isDirectory()) walk(abs, out);
    else if (stat.isFile() && !BINARY.test(entry) && !isBinary(abs)) out.push(rel);
  }
  return out;
}

/** motion/'s tracked text files: git's list when there is a .git, else the folder as it is. */
function motionFiles() {
  const dir = join(ROOT, 'motion');
  if (!existsSync(dir)) return [];
  if (!existsSync(join(ROOT, '.git'))) return walk(dir);
  const listed = spawnSync('git', ['ls-files', '-z', 'motion'], { cwd: ROOT, encoding: 'utf8' });
  if (listed.status !== 0) return walk(dir);
  return listed.stdout.split('\0').filter((rel) => {
    if (!rel) return false;
    const abs = join(ROOT, rel);
    if (!existsSync(abs)) return false;
    const stat = lstatSync(abs);
    return stat.isFile() && !BINARY.test(rel) && !isBinary(abs);
  });
}

/** The denylist's terms as [line number, regex], or a reason it is skipped. */
function denylist() {
  if (KEYS_ONLY) return { skip: 'key shapes only (--keys)' };
  if (process.env.VERCEL || process.env.CI) return { skip: `${process.env.VERCEL ? 'VERCEL' : 'CI'} is set; no private list here` };
  const file = process.env.PT_DENYLIST;
  if (!file) return { skip: 'PT_DENYLIST is not set' };
  if (!existsSync(file)) {
    console.error(`lint:public: PT_DENYLIST names ${file}, which does not exist`);
    process.exit(2);
  }
  const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const listed = readFileSync(file, 'utf8')
    .split('\n')
    .map((line, i) => [i + 1, line.trim()])
    .filter(([, term]) => term && !term.startsWith('#'));
  const terms = listed.map(([line, term]) => [line, new RegExp(`(?<![A-Za-z0-9_])${escape(term)}(?![A-Za-z0-9_])`, 'i')]);
  /* a term of several words may be wrapped across lines, with quote marks at the start of the next */
  const wrapped = listed
    .filter(([, term]) => /\s/.test(term))
    .map(([line, term]) => [line, new RegExp(`(?<![A-Za-z0-9_])${term.split(/\s+/).map(escape).join('[\\s>]+')}(?![A-Za-z0-9_])`, 'gi')]);
  return { terms, wrapped };
}

const allow = readJson(ALLOW_REL, { allow: [] }).allow ?? [];
const allowed = (rel, rule) => allow.some((a) => (rel === a.path || rel.startsWith(`${a.path}/`)) && a.rules.includes(rule));
const deny = denylist();
if (deny.skip) console.log(`lint:public: denylist skipped: ${deny.skip}`);

/** Every finding: { rule, kind, file, line, text }; `text` is printable (never a key or a term). */
const findings = [];
for (const rel of [...walk(), ...motionFiles()]) {
  const whole = readFileSync(join(ROOT, rel), 'utf8');
  const lines = whole.split('\n');
  if (!KEYS_ONLY && deny.wrapped && !allowed(rel, 'denylist')) {
    for (const [n, term] of deny.wrapped) {
      for (const m of whole.matchAll(term)) {
        if (!m[0].includes('\n')) continue;
        const line = whole.slice(0, m.index).split('\n').length;
        findings.push({ rule: 'denylist', file: rel, line, text: `denylist term across a line break (line ${n} of the list)` });
      }
    }
  }
  lines.forEach((text, i) => {
    for (const [name, shape] of KEY_SHAPES) {
      if (shape.test(text) && !allowed(rel, 'key-shape')) findings.push({ rule: 'key-shape', file: rel, line: i + 1, text: `${name} key shape` });
    }
    if (KEYS_ONLY) return;
    if (!allowed(rel, 'machine-path')) {
      for (const m of text.matchAll(MACHINE_PATH)) findings.push({ rule: 'machine-path', file: rel, line: i + 1, text: m[0] });
    }
    if (deny.terms && !allowed(rel, 'denylist')) {
      for (const [n, term] of deny.terms) if (term.test(text)) findings.push({ rule: 'denylist', file: rel, line: i + 1, text: `denylist term (line ${n} of the list)` });
    }
  });
}

const RULES = KEYS_ONLY ? ['key-shape'] : ['key-shape', 'machine-path', 'denylist'];
let failed = 0;
for (const rule of RULES) {
  if (rule === 'denylist' && !deny.terms) continue;
  const found = findings.filter((f) => f.rule === rule);
  const files = new Set(found.map((f) => f.file)).size;
  for (const f of found) console.log(`  FAIL ${f.file}:${f.line}  ${f.text}`);
  failed += found.length;
  console.log(`lint:public: ${rule}: ${found.length} finding${found.length === 1 ? '' : 's'} in ${files} file${files === 1 ? '' : 's'}`);
}
console.log(`lint:public: ${failed === 0 ? 'pass' : 'fail'}`);
process.exit(failed === 0 ? 0 : 1);
