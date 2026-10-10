#!/usr/bin/env node
/* oxlint-disable no-console -- a report printed to stdout. */
/**
 * Holds every copy in this repository to its record in
 * scripts/lint/copies.json. The modes:
 *   - pin: gt-cloud is the source and this copy is frozen; the file's
 *     sha256 must equal the recorded one, so an edit fails until the copy
 *     is re-synced and the hash updated (or the entry becomes a fork)
 *   - source: this repository is the source; the path must exist
 *   - fork: the copies differ on purpose; the path must exist, nothing is
 *     compared
 * It also fails on an unlisted copy: two code files with the same bytes
 * under src/, scripts/, skills/, graphics/, deck/ or docs/ that no entry
 * covers. src/app/d is left out: the archived directions repeat their
 * sections by design and are not maintained.
 *
 * With GT_CLOUD set to a gt-cloud checkout, each pin and source entry is
 * also compared with gt-cloud's side and any difference printed as a note
 * that never fails the run.
 *
 * Usage:
 *   node scripts/lint/copies.mjs [--root <dir>]   (pnpm lint:copies)
 *
 * Exit 0 when every entry holds and no unlisted copy exists, 1 otherwise,
 * 2 when copies.json is missing or malformed.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { ROOT as REPO_ROOT } from '../lib/root.mjs';
import { helpIfAsked } from '../lib/help.mjs';

helpIfAsked(import.meta.url);

const argv = process.argv.slice(2);
const at = argv.indexOf('--root');
const ROOT = at >= 0 ? resolve(argv[at + 1]) : REPO_ROOT;
const MANIFEST = 'scripts/lint/copies.json';
const SCAN = ['src', 'scripts', 'skills', 'graphics', 'deck', 'docs'];
const SKIP = new Set(['node_modules', '.next', '.git', 'src/app/d']);
const CODE = /\.(ts|tsx|mjs|js|py|css|sh)$/;
/* a few lines of boilerplate in two places is not a copy worth recording */
const MIN_BYTES = 200;

let manifest;
try {
  manifest = JSON.parse(readFileSync(join(ROOT, MANIFEST), 'utf8'));
  if (!Array.isArray(manifest.copies)) throw new Error('no "copies" array');
} catch (error) {
  console.error(`lint:copies: ${MANIFEST}: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(2);
}

const sha256 = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');

/** Every file under a path (the path itself when it is a file), relative to `base`. */
function files(abs, base) {
  if (!existsSync(abs)) return [];
  if (!statSync(abs).isDirectory()) return [relative(base, abs)];
  return readdirSync(abs).flatMap((entry) => {
    const rel = relative(ROOT, join(abs, entry));
    return SKIP.has(entry) || SKIP.has(rel) ? [] : files(join(abs, entry), base);
  });
}

let failures = 0;
const fail = (line) => {
  failures += 1;
  console.log(`  FAIL ${line}`);
};
const note = (line) => console.log(`  note ${line}`);
const gtCloud = process.env.GT_CLOUD ? resolve(process.env.GT_CLOUD) : undefined;

/** Notes the files that differ between a path here and one in gt-cloud; never fails. */
function compareWithGtCloud(local, remote) {
  if (!gtCloud || !remote?.startsWith('gt-cloud:')) return;
  const there = join(gtCloud, remote.slice('gt-cloud:'.length).split(' ')[0]);
  if (!existsSync(there)) return note(`${local}: ${remote} is not in ${gtCloud}`);
  const here = join(ROOT, local);
  const names = new Set([...files(here, here), ...files(there, there)]);
  const differ = [...names].filter((rel) => {
    const a = statSync(here).isDirectory() ? join(here, rel) : here;
    const b = statSync(there).isDirectory() ? join(there, rel) : there;
    return !existsSync(a) || !existsSync(b) || sha256(a) !== sha256(b);
  });
  if (differ.length > 0) note(`${local}: ${differ.length} file(s) differ from ${remote}`);
}

console.log(`Copies: ${manifest.copies.length} entries in ${MANIFEST}`);
for (const entry of manifest.copies) {
  const abs = join(ROOT, entry.path ?? '');
  if (!entry.path || !['pin', 'source', 'fork'].includes(entry.mode)) {
    fail(`${entry.path ?? '(no path)'}: mode is pin, source or fork, and a path is required`);
    continue;
  }
  if (!existsSync(abs)) {
    fail(`${entry.path}: listed as ${entry.mode} but not on disk`);
    continue;
  }
  if (entry.mode === 'pin') {
    const now = statSync(abs).isDirectory() ? undefined : sha256(abs);
    if (!now) fail(`${entry.path}: a pin is one file`);
    else if (now !== entry.sha256) fail(`${entry.path}: edited since it was pinned (sha256 ${now.slice(0, 12)}, recorded ${String(entry.sha256).slice(0, 12)}); re-sync it from ${entry.from} and record the new sha256, or list it as a fork`);
    else console.log(`  ok   ${entry.path} (pin)`);
    compareWithGtCloud(entry.path, entry.from);
  } else {
    console.log(`  ok   ${entry.path} (${entry.mode})`);
    for (const copy of entry.copies ?? []) compareWithGtCloud(entry.path, copy);
  }
}

/* ---- unlisted copies ---- */

const covered = manifest.copies.flatMap((entry) => [entry.path, ...String(entry.from ?? '').split('; ').filter((p) => p && !p.includes(':'))]);
const isCovered = (rel) => covered.some((p) => rel === p || rel.startsWith(`${p}/`));
const byHash = new Map();
for (const dir of SCAN) {
  for (const rel of files(join(ROOT, dir), ROOT)) {
    if (!CODE.test(rel) || statSync(join(ROOT, rel)).size < MIN_BYTES) continue;
    const hash = sha256(join(ROOT, rel));
    byHash.set(hash, [...(byHash.get(hash) ?? []), rel]);
  }
}
let unlisted = 0;
for (const group of byHash.values()) {
  if (group.length < 2 || group.every(isCovered)) continue;
  unlisted += 1;
  fail(`unlisted copy: ${group.join(', ')} hold the same bytes; import one from the other, or record it in ${MANIFEST}`);
}
if (unlisted === 0) console.log(`  ok   no unlisted copies under ${SCAN.join(', ')}`);

console.log(`\nlint:copies: ${failures === 0 ? 'pass' : `${failures} failure${failures === 1 ? '' : 's'}`}`);
process.exit(failures === 0 ? 0 : 1);
