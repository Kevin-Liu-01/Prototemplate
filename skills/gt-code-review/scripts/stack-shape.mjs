#!/usr/bin/env node
/* oxlint-disable no-console -- a report printed to stdout. */
// The stack shape check of gt-code-review (references/stack.md). It reads the
// pull requests of a stack and prints each one that breaks a shape rule, as
// `#number  RULE  reason`. A printed line is a lead for the reviewer to read.
//
// Usage:
//   node stack-shape.mjs --repo <owner/name> <number> [<number> ...] [--json]
//   node stack-shape.mjs --stdin [--json] < prs.json
//
// --copied <prefix,...>  paths that are vendored or generated (default: none)
// --shared <prefix,...>  shared packages (default: SHARED below)
//
// Requires Node 18 or later, and the gh CLI signed in for --repo. It only reads.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

/** Added lines to read past which a pull request names its concepts or its reading order (K4). */
export const ADDED_MAX = 1500;
/** A change this small belongs inside the pull request it completes. */
export const TINY_MAX = 20;
export const SHARED = [
  'packages/agent-core/',
  'packages/node/',
  'packages/sandbox-core/',
  'packages/settings/',
  'packages/locales/',
  'packages/billing/',
  'packages/db/',
  'packages/events/',
  'packages/formats/',
  'packages/ui/',
  'apps/api/',
  'tooling/',
];
const NOT_READ = /(^|\/)(pnpm-lock\.yaml|uv\.lock|package-lock\.json)$|(^|\/)licenses\//;
const ROUND_NAME = /(^|[-/_])(r\d+|round\d*|fixes|findings)([-/_]|$)/i;
const ROUND_TITLE = /\breview (findings|fixes|round)\b/i;
const FOREIGN_HASH = /\b(?=[0-9a-f]*\d)(?=[0-9a-f]*[a-f])[0-9a-f]{7,40}\b/;

/** The top-level area of a path: two segments, as `packages/node`. */
function areaOf(path) {
  return path.split('/').slice(0, 2).join('/');
}

/** Lines a reviewer must read: not copied, not a lockfile, not a license. */
export function readLines(files, copied) {
  return readFiles(files, copied).reduce((sum, f) => sum + f.added, 0);
}

/** Files a reviewer reads: not copied, not a lockfile, not a license. */
function readFiles(files, copied) {
  return files.filter((f) => !NOT_READ.test(f.path) && !copied.some((p) => f.path.startsWith(p)));
}

/** The shared areas a pull request touches beside product areas, among the files a reviewer reads. */
export function sharedBeside(files, shared, copied = []) {
  const areas = new Set(readFiles(files, copied).map((f) => areaOf(f.path)));
  const sharedAreas = [...areas].filter((a) => shared.some((p) => `${a}/`.startsWith(p)));
  return sharedAreas.length > 0 && sharedAreas.length < areas.size ? sharedAreas : [];
}

/** Every shape finding of one pull request. */
export function checkPr(pr, { copied = [], shared = SHARED } = {}) {
  const found = [];
  const add = (rule, reason) => found.push({ number: pr.number, rule, reason });
  const read = readLines(pr.files, copied);
  const copiedLines = pr.files.reduce((s, f) => s + f.added, 0) - read;
  if (ROUND_NAME.test(pr.head) || ROUND_TITLE.test(pr.title)) add('K1', `named by a review round: ${pr.head}`);
  const beside = sharedBeside(pr.files, shared, copied);
  if (beside.length > 0) add('K2', `changes ${beside.join(', ')} beside product code`);
  if (copiedLines > ADDED_MAX) add('K3', `${copiedLines} added lines under copied paths`);
  if (read > ADDED_MAX) add('K4', `${read} added lines to read, over ${ADDED_MAX}: name its concepts or a reading order`);
  const changed = pr.files.reduce((s, f) => s + f.added + f.removed, 0);
  if (changed <= TINY_MAX) add('K5', `${changed} changed lines alone`);
  if (FOREIGN_HASH.test(pr.title)) add('N6', 'the title names a commit hash');
  return found;
}

/** Every shape finding of a stack. */
export function checkStack(prs, options) {
  return prs.flatMap((pr) => checkPr(pr, options));
}

function gh(args) {
  return JSON.parse(execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }));
}

/** One pull request with its files, read through the gh CLI. */
function fetchPr(repo, number) {
  const pr = gh(['api', `repos/${repo}/pulls/${number}`]);
  const pages = gh(['api', '--paginate', '--slurp', `repos/${repo}/pulls/${number}/files`]);
  const files = pages.flat().map((f) => ({ path: f.filename, added: f.additions, removed: f.deletions }));
  return { number, title: pr.title, head: pr.head.ref, files };
}

function listArg(argv, name) {
  const at = argv.indexOf(name);
  return at >= 0 ? argv[at + 1].split(',').filter(Boolean) : undefined;
}

function main(argv) {
  const repoAt = argv.indexOf('--repo');
  const valued = new Set(['--repo', '--copied', '--shared']);
  const numbers = argv.filter((a, i) => /^\d+$/.test(a) && !valued.has(argv[i - 1]));
  const prs = argv.includes('--stdin')
    ? JSON.parse(readFileSync(0, 'utf8'))
    : numbers.map((n) => fetchPr(argv[repoAt + 1], Number(n)));
  const found = checkStack(prs, { copied: listArg(argv, '--copied') ?? [], shared: listArg(argv, '--shared') ?? SHARED });
  if (argv.includes('--json')) return console.log(JSON.stringify(found, null, 2));
  for (const f of found) console.log(`#${f.number}  ${f.rule}  ${f.reason}`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv.slice(2));
