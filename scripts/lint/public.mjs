#!/usr/bin/env node
/* oxlint-disable no-console -- a report printed to stdout. */
/**
 * Scans the checkout for what must never be public: key shapes, machine
 * paths and the terms on a private denylist. GitHub publishes every file of
 * this repository, whether or not the site renders it. The findings:
 *   - key shapes: API keys and private keys by their published formats
 *     (Stripe, Anthropic, OpenAI, AWS, Google, GitHub, Slack, PEM headers).
 *     The matched text is never printed. A key shape always fails: the
 *     baseline never holds one.
 *   - machine paths: /Users/<name>/ and /private/tmp/. Write ~, $PROTOTEMPLATE
 *     or a repo-relative path instead (~/gt/ is fine).
 *   - denylist terms: the private list at PT_DENYLIST (one term per line,
 *     # for comments), matched whole-word and case-insensitive. The list
 *     lives outside this repository, and a finding prints the term's line
 *     number in the list, never the term. Under VERCEL or CI the denylist
 *     is skipped with a printed line, since no private file is there.
 *
 * It is a filesystem walk with no git call, so it reads untracked files
 * too. It skips node_modules, package stores (.pnpm-store, .npm, .cache,
 * .yarn), .next, .git, out, .pagecheck, motion/ at the
 * root, public/media, deck/preview, deck/tmp, .env files, binaries and
 * symlinks. scripts/lint/public.allow.json exempts a path from named rules
 * (this lint's own source and test, which spell the patterns).
 *
 * Until the switch (L7) the scan runs in baseline mode: machine-path and
 * denylist counts per file are compared with scripts/lint/public.baseline.json,
 * and only a count above its baseline fails. --strict ignores the baseline.
 *
 * Usage:
 *   node scripts/lint/public.mjs [--root <dir>] [--keys] [--strict] [--all] [--write-baseline]
 *   (pnpm lint:public; pnpm build runs --keys)
 *
 *   --keys            key shapes only (fast; what the build runs)
 *   --strict          fail on every finding, baseline or not
 *   --all             print baselined findings too, not only new ones
 *   --write-baseline  record today's machine-path and denylist counts
 *
 * Exit 0 when nothing is above the baseline, 1 on a key shape or a count
 * above it, 2 when PT_DENYLIST names a file that is not there.
 */
import { closeSync, existsSync, lstatSync, mkdirSync, openSync, readFileSync, readSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

import { ROOT as REPO_ROOT } from '../lib/root.mjs';
import { helpIfAsked } from '../lib/help.mjs';

helpIfAsked(import.meta.url);

const argv = process.argv.slice(2);
const at = argv.indexOf('--root');
const ROOT = at >= 0 ? resolve(argv[at + 1]) : REPO_ROOT;
const KEYS_ONLY = argv.includes('--keys');
const STRICT = argv.includes('--strict');
const ALL = argv.includes('--all');
const WRITE = argv.includes('--write-baseline');
const ALLOW_REL = 'scripts/lint/public.allow.json';
const BASELINE_REL = 'scripts/lint/public.baseline.json';

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
  const terms = readFileSync(file, 'utf8')
    .split('\n')
    .map((line, i) => [i + 1, line.trim()])
    .filter(([, term]) => term && !term.startsWith('#'))
    .map(([line, term]) => [line, new RegExp(`(?<![A-Za-z0-9_])${escape(term)}(?![A-Za-z0-9_])`, 'i')]);
  return { terms };
}

const allow = readJson(ALLOW_REL, { allow: [] }).allow ?? [];
const allowed = (rel, rule) => allow.some((a) => (rel === a.path || rel.startsWith(`${a.path}/`)) && a.rules.includes(rule));
const deny = denylist();
if (deny.skip) console.log(`lint:public: denylist skipped: ${deny.skip}`);

/** Every finding: { rule, kind, file, line, text }; `text` is printable (never a key or a term). */
const findings = [];
for (const rel of walk()) {
  const lines = readFileSync(join(ROOT, rel), 'utf8').split('\n');
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
const count = (rule) => {
  const per = {};
  for (const f of findings.filter((x) => x.rule === rule)) per[f.file] = (per[f.file] ?? 0) + 1;
  return per;
};

if (WRITE) {
  if (findings.some((f) => f.rule === 'key-shape')) {
    console.error('lint:public: refusing to write a baseline while a key shape is present; remove the key first');
    process.exit(1);
  }
  const previous = readJson(BASELINE_REL, {});
  const baseline = {
    $comment: 'Counts per file that lint:public tolerates until L5 drains them and L7 removes this file. Key shapes are never recorded.',
    'machine-path': count('machine-path'),
    /* without the private list, keep the recorded denylist counts */
    denylist: deny.terms ? count('denylist') : (previous.denylist ?? {}),
  };
  mkdirSync(dirname(join(ROOT, BASELINE_REL)), { recursive: true });
  writeFileSync(join(ROOT, BASELINE_REL), `${JSON.stringify(baseline, null, 2)}\n`);
  console.log(`lint:public: wrote ${BASELINE_REL}`);
  process.exit(0);
}

const baseline = STRICT ? {} : readJson(BASELINE_REL, {});
let failed = 0;
for (const rule of RULES) {
  if (rule === 'denylist' && !deny.terms) continue;
  const per = count(rule);
  const limit = rule === 'key-shape' ? {} : (baseline[rule] ?? {});
  const over = Object.keys(per).filter((file) => per[file] > (limit[file] ?? 0));
  const total = Object.values(per).reduce((a, b) => a + b, 0);
  const shown = ALL ? findings.filter((f) => f.rule === rule) : findings.filter((f) => f.rule === rule && over.includes(f.file));
  for (const f of shown) console.log(`  ${over.includes(f.file) ? 'FAIL' : 'base'} ${f.file}:${f.line}  ${f.text}`);
  for (const file of over) if (limit[file]) console.log(`  FAIL ${file}: ${per[file]} ${rule} findings, ${limit[file]} in the baseline`);
  failed += over.length;
  const held = total - over.reduce((n, file) => n + per[file], 0);
  console.log(`lint:public: ${rule}: ${total} finding${total === 1 ? '' : 's'} in ${Object.keys(per).length} file${Object.keys(per).length === 1 ? '' : 's'}${held > 0 ? ` (${held} held by the baseline)` : ''}${over.length > 0 ? `, ${over.length} file${over.length === 1 ? '' : 's'} above it` : ''}`);
}
console.log(`lint:public: ${failed === 0 ? 'pass' : 'fail'}${STRICT ? ' (strict)' : ''}`);
process.exit(failed === 0 ? 0 : 1);
