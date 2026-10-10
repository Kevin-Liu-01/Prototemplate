#!/usr/bin/env node
/* oxlint-disable no-console -- a report printed to stdout. */
/**
 * Checks that this machine can run the repository's tools from a fresh
 * clone. It reads Node at the .nvmrc major, pnpm at package.json's packageManager,
 * installed dependencies, the Chrome for Testing build playwright-core
 * launches (or CHROME_PATH), Python 3 with requirements.txt's packages, and,
 * as optional, ffmpeg and ffprobe (build:motion, films) and the HyperFrames
 * CLI (films). Each missing item prints the command that fixes it.
 *
 * Usage:
 *   node scripts/doctor.mjs   (pnpm doctor)
 *
 * Exit 0 when every required item is present, 1 when one is missing.
 * Optional items never fail the run.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ROOT } from './lib/root.mjs';
import { helpIfAsked } from './lib/help.mjs';

helpIfAsked(import.meta.url);

/** The first line a command prints, or undefined when it cannot run. */
function run(command, args) {
  try {
    return execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim().split('\n')[0];
  } catch {
    return undefined;
  }
}

let missing = 0;
function report(required, name, found, fix) {
  if (found) return console.log(`  ok       ${name}: ${found}`);
  if (required) missing += 1;
  console.log(`  ${required ? 'MISSING ' : 'optional'} ${name}: ${fix}`);
}

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const nvmrc = existsSync(join(ROOT, '.nvmrc')) ? readFileSync(join(ROOT, '.nvmrc'), 'utf8').trim() : '';
const nodeMajor = process.versions.node.split('.')[0];
report(true, 'node', !nvmrc || nodeMajor === nvmrc.split('.')[0] ? `v${process.versions.node}` : undefined, `v${process.versions.node} runs here; .nvmrc asks for ${nvmrc} (nvm use, or install Node ${nvmrc})`);

const wantPnpm = /^pnpm@(.+)$/.exec(pkg.packageManager ?? '')?.[1];
const pnpm = run('pnpm', ['--version']);
report(true, 'pnpm', pnpm && (!wantPnpm || pnpm === wantPnpm) ? pnpm : undefined, pnpm ? `${pnpm} is installed; package.json asks for ${wantPnpm} (corepack enable, or npm i -g pnpm@${wantPnpm})` : `not found (corepack enable, or npm i -g pnpm@${wantPnpm})`);
report(true, 'dependencies', existsSync(join(ROOT, 'node_modules/next/package.json')) ? 'node_modules is installed' : undefined, 'run pnpm install --frozen-lockfile');

let chrome;
try {
  /* imported here, not at the top, so a clone without node_modules still gets its report */
  const { chromium } = await import('playwright-core');
  const path = process.env.CHROME_PATH ?? chromium.executablePath();
  chrome = existsSync(path) ? path : undefined;
} catch {
  chrome = undefined;
}
report(true, 'Chrome for Testing', chrome, 'run pnpm exec playwright-core install chromium, or set CHROME_PATH');

const python = run('python3', ['--version']);
report(true, 'python3', python, 'install Python 3 (python.org, or your package manager)');
if (python) {
  const modules = [['PIL', 'Pillow'], ['fontTools', 'fonttools'], ['brotli', 'brotli'], ['numpy', 'numpy']];
  for (const [module, name] of modules) {
    const version = run('python3', ['-c', `import ${module}; print(getattr(${module}, '__version__', getattr(${module}, 'version', 'present')))`]);
    report(true, `python ${name}`, version, 'run pip install -r requirements.txt');
  }
}

report(false, 'ffmpeg', run('ffmpeg', ['-version']), 'install ffmpeg for pnpm build:motion and the film scripts (brew install ffmpeg, apt install ffmpeg)');
report(false, 'ffprobe', run('ffprobe', ['-version']), 'comes with ffmpeg');
report(false, 'HyperFrames CLI', run('hyperframes', ['--version']), 'install it for the films in motion/ (see the gt-films skill)');

console.log(`\ndoctor: ${missing === 0 ? 'ready' : `${missing} required item${missing === 1 ? '' : 's'} missing`}`);
process.exit(missing === 0 ? 0 : 1);
