#!/usr/bin/env node
/* oxlint-disable no-console -- a test runner reporting to stdout. */
/**
 * Runs the offline test of every script a skill bundles: each
 * skills/<slug>/scripts/<name>.test.mjs with node --test, <name>.test.py
 * with python3 and <name>.test.sh with sh, from the checkout root. A test
 * builds its own fixtures and touches no network; a script's network smoke
 * stays manual, with its command written in the script's header.
 *
 * Usage:
 *   node scripts/skills/script-tests.mjs [--root <dir>] [<slug> ...]   (pnpm test:skill-scripts)
 *
 * Exit 0 when every test passes (or there is none), 1 when one fails.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { ROOT as REPO_ROOT } from '../lib/root.mjs';
import { helpIfAsked } from '../lib/help.mjs';

helpIfAsked(import.meta.url);

const argv = process.argv.slice(2);
const at = argv.indexOf('--root');
const ROOT = at >= 0 ? resolve(argv[at + 1]) : REPO_ROOT;
const only = argv.filter((arg, i) => !arg.startsWith('--') && argv[i - 1] !== '--root');
const RUNNERS = { mjs: [process.execPath, '--test'], py: ['python3'], sh: ['sh'] };

const skills = join(ROOT, 'skills');
const tests = [];
for (const slug of existsSync(skills) ? readdirSync(skills).sort() : []) {
  const dir = join(skills, slug, 'scripts');
  if ((only.length > 0 && !only.includes(slug)) || !existsSync(dir)) continue;
  for (const file of readdirSync(dir).sort()) {
    const ext = /\.test\.(mjs|py|sh)$/.exec(file)?.[1];
    if (ext) tests.push({ rel: `skills/${slug}/scripts/${file}`, ext });
  }
}

/* a runner started inside node --test would report to that parent instead of exiting on its own result */
const env = { ...process.env };
delete env.NODE_TEST_CONTEXT;

let failed = 0;
for (const { rel, ext } of tests) {
  const [command, ...args] = RUNNERS[ext];
  const run = spawnSync(command, [...args, rel], { cwd: ROOT, encoding: 'utf8', env });
  const ok = run.status === 0;
  if (!ok) failed += 1;
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${rel}`);
  if (!ok) console.log(`${run.stdout ?? ''}${run.stderr ?? ''}${run.error ? String(run.error) : ''}`.trimEnd().replace(/^/gm, '       '));
}
console.log(`test:skill-scripts: ${tests.length} test file${tests.length === 1 ? '' : 's'}, ${failed === 0 ? 'all pass' : `${failed} failed`}`);
process.exit(failed === 0 ? 0 : 1);
