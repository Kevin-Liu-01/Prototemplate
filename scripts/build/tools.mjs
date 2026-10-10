// Builds docs/TOOLS.md, the index /docs/tools serves: every pnpm command in
// package.json with the first sentence of the opening comment of the file it
// runs, grouped by its prefix, then every script a skill bundles
// (skills/<slug>/scripts/) and the environment the tools read. The file is
// committed, so the site builds from it alone.
//
// A command that runs no file of its own (a chain, next, oxlint) takes its
// line from DESCRIBE below; any other command takes it from its file, so a
// new script is described by writing its opening comment.
//
// Usage:
//   node scripts/build/tools.mjs           write docs/TOOLS.md
//   node scripts/build/tools.mjs --check   exit 1 when docs/TOOLS.md is stale
// --check is skipped, with a printed line, when VERCEL is set or there is no
// .git, as build-updated's check is: the committed file stands.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { ROOT } from '../lib/root.mjs';
import { helpIfAsked } from '../lib/help.mjs';

helpIfAsked(import.meta.url);

const OUT_REL = 'docs/TOOLS.md';
const CHECK = process.argv.includes('--check');
/* the longest line a table cell takes before it is cut at a word */
const MAX_SENTENCE = 280;

/** The groups, in reading order, each with the script-name test that files a command under it. */
const GROUPS = [
  ['Site', (name) => ['dev', 'build', 'start'].includes(name)],
  ['Setup', (name) => name === 'doctor'],
  ['Lints', (name) => name.startsWith('lint:')],
  ['Tests', (name) => name.startsWith('test:')],
  ['Checks and captures', (name) => name.startsWith('check:') || name.startsWith('capture:')],
  ['Generators', (name) => name.startsWith('build:') || name.startsWith('gen:') || name === 'mood-tone'],
  ['Skills', (name) => name.startsWith('skills:')],
  ['Graphics', (name) => name.startsWith('graphics:')],
];

/** Lines for the commands whose file says nothing usable, or that run no file of their own. */
const DESCRIBE = {
  dev: 'Starts the dev server on port 3005.',
  build: 'Runs the key-shape scan and the static lints that guard a deploy, checks src/lib/updated.ts, then builds the site with next build.',
  start: 'Serves the production build.',
  'lint:code': 'Runs oxlint with the gt-ui plugin (scripts/lint/oxlint-plugins/gt-ui.ts) over the live surfaces under src/.',
  'lint:static': 'Runs every lint and test that needs no running server; the gate CI and each lane run.',
  'lint:all': 'Runs lint:static, then the live lints against PT_BASE (default http://localhost:3005).',
  'lint:lines': 'Renders the pages it is given and audits the hairlines they draw: doubled lines from two owners, missing seams between sections and two owners on one seam.',
  'lint:lines:shell': 'Audits the shell routes at PT_BASE the same way, and holds every chrome border to its three line tokens.',
  'graphics:serve': 'Serves graphics/ on port 8765 for the illustration toolchain (docs/GRAPHICS.md).',
  'graphics:gen': 'Writes the illustration pages from graphics/build/manifest.json.',
  'graphics:render': 'Renders the illustrations through agent-browser (docs/GRAPHICS.md).',
};

/** The environment every browser tool and generator reads (P3: flag, then variable, then a default). */
const ENVIRONMENT = [
  ['PT_BASE', 'The base URL for the live lints, the page check and the captures; CAPTURE_BASE and REDESIGN_BASE are older names for it.', '`http://localhost:3005`'],
  ['CHROME_PATH', 'The Chrome for Testing binary the browser tools launch.', "playwright-core's `chromium.executablePath()`"],
  ['GT_CLOUD', 'A gt-cloud checkout, for the tools that compare with it (lint:copies notes).', 'none'],
  ['MOTION_DIR', 'The motion folder build:motion reads.', '`<repo>/motion`'],
  ['PT_DENYLIST', 'The private term list lint:public reads; skipped under VERCEL or CI.', 'none'],
];

/** The first sentence of a file's opening comment (//, /* *\/, # or a Python docstring), or undefined. */
function openingSentence(file) {
  if (!existsSync(file)) return undefined;
  const words = [];
  let docstring = false;
  for (const raw of readFileSync(file, 'utf8').split('\n')) {
    const line = raw.trim();
    if (line.startsWith('#!') || line.includes('oxlint-disable') || line === "'use strict';") continue;
    if (line.startsWith('"""')) {
      words.push(line.replace(/"""/g, ''));
      if (line.length > 3 && line.endsWith('"""')) break;
      docstring = !docstring;
      if (!docstring) break;
      continue;
    }
    if (docstring) {
      if (line.endsWith('"""')) break;
      words.push(line);
      continue;
    }
    if (/^(\/\/|\/\*|\*|#)/.test(line)) {
      words.push(line.replace(/^(\/\*\*?|\*\/|\*|\/\/|#)\s?/, '').replace(/\s*\*\/$/, ''));
      continue;
    }
    if (line === '' && words.length === 0) continue;
    break;
  }
  const text = words.join(' ').replace(/\s+/g, ' ').replace(/\s*—\s*/g, ', ').trim();
  if (!text || /^usage\b/i.test(text)) return undefined;
  /* a sentence ends at a stop that follows a word, not a list number ("1.") */
  const sentence = /^(.+?[^\s\d][.!?])(\s|$)/.exec(text)?.[1] ?? text;
  if (sentence.length <= MAX_SENTENCE) return sentence;
  return `${sentence.slice(0, sentence.lastIndexOf(' ', MAX_SENTENCE)).replace(/[,;:]$/, '')} ...`;
}

/** The file a command runs: the first `node <file>` or `python3 <file>` argument, or a bare script path. */
function fileOf(command) {
  const m = /(?:node(?: --test)?|python3)\s+([^\s&]+\.(?:mjs|js|py))/.exec(command) ?? /^([\w./-]+\.sh)\b/.exec(command);
  return m?.[1];
}

const cell = (s) => s.replace(/\|/g, '\\|');

/* script names pnpm runs as its own command when called bare; these are called through `pnpm run` */
const PNPM_BUILTINS = new Set(['doctor']);

/** What the Runs column shows: the files and flags after node or python3, or the command itself, shortened. */
function runsOf(command) {
  const m = /^(?:node(?: --test)?|python3)\s+([^&]+?)\s*$/.exec(command);
  const text = m ? m[1] : command;
  return `\`${text.length > 60 ? `${text.slice(0, 57)}...` : text}\``;
}

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const scripts = Object.entries(pkg.scripts ?? {});
const filed = new Set();
const missing = [];
const sections = GROUPS.map(([title, test]) => {
  const rows = scripts.filter(([name]) => test(name)).sort(([a], [b]) => a.localeCompare(b, 'en'));
  for (const [name] of rows) filed.add(name);
  return [title, rows];
});
const unfiled = scripts.filter(([name]) => !filed.has(name));
if (unfiled.length > 0) sections.push(['Other', unfiled]);

const lines = [
  '# Tools',
  '',
  'Every command this repository runs, by `pnpm <name>` (`pnpm run doctor`, since a bare `pnpm doctor` is a command of pnpm itself), and the scripts the skills bundle. Skills, documents and the `/skills` install line name these commands, never a script path, so a script can move without breaking them. Run any script with `--help` for its full usage.',
  '',
  `This file is written by \`pnpm build:tools\` from \`package.json\` and the opening comment of each file a command runs; \`pnpm lint:tools\` fails while it is stale. To change a line, edit that comment, or \`DESCRIBE\` in \`scripts/build/tools.mjs\` for a command that runs no file of its own.`,
  '',
];
for (const [title, rows] of sections) {
  if (rows.length === 0) continue;
  lines.push(`## ${title}`, '', '| Command | What it does | Runs |', '| --- | --- | --- |');
  for (const [name, command] of rows) {
    const file = fileOf(command);
    const what = DESCRIBE[name] ?? (file ? openingSentence(join(ROOT, file)) : undefined);
    if (!what) missing.push(name);
    const runs = runsOf(command);
    lines.push(`| \`pnpm ${PNPM_BUILTINS.has(name) ? 'run ' : ''}${name}\` | ${cell(what ?? 'No description: add an opening comment to the file.')} | ${cell(runs)} |`);
  }
  lines.push('');
}

lines.push(
  '## Skill scripts',
  '',
  'Each skill carries the scripts its procedure calls, self-contained so an installed copy runs on its own. Run one from a checkout with `node skills/<slug>/scripts/<file>`; `pnpm test:skill-scripts` runs their offline tests.',
  '',
  '| Skill | Script | What it does |',
  '| --- | --- | --- |'
);
const skillsDir = join(ROOT, 'skills');
for (const slug of existsSync(skillsDir) ? readdirSync(skillsDir).sort() : []) {
  const dir = join(skillsDir, slug, 'scripts');
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir).sort()) {
    if (/\.test\./.test(file) || !/\.(mjs|js|py|sh)$/.test(file)) continue;
    const what = openingSentence(join(dir, file));
    if (!what) missing.push(`${slug}/${file}`);
    lines.push(`| \`${slug}\` | \`${file}\` | ${cell(what ?? 'No description: add an opening comment to the file.')} |`);
  }
}
lines.push(
  '',
  '## Environment',
  '',
  'Each tool reads its setting from a flag first, then the variable, then the default. No tracked file names a machine path.',
  '',
  '| Variable | What it sets | Default |',
  '| --- | --- | --- |',
  ...ENVIRONMENT.map(([name, what, fallback]) => `| \`${name}\` | ${cell(what)} | ${fallback} |`),
  ''
);
const output = lines.join('\n');

const current = existsSync(join(ROOT, OUT_REL)) ? readFileSync(join(ROOT, OUT_REL), 'utf8') : '';
if (missing.length > 0) console.log(`build-tools: no opening sentence for ${missing.join(', ')}`);
if (CHECK) {
  const skip = process.env.VERCEL ? 'VERCEL is set' : existsSync(join(ROOT, '.git')) ? undefined : 'no git directory';
  if (skip) {
    console.log(`build-tools: check skipped: ${skip}; the committed ${OUT_REL} stands`);
    process.exit(0);
  }
  if (current !== output) {
    console.error(`build-tools: ${OUT_REL} is stale against package.json and the scripts; run pnpm build:tools`);
    process.exit(1);
  }
  console.log(`build-tools: ${OUT_REL} is current (${scripts.length} commands)`);
} else {
  if (current !== output) writeFileSync(join(ROOT, OUT_REL), output);
  console.log(`build-tools: ${scripts.length} commands -> ${OUT_REL}${current === output ? ' (unchanged)' : ''}`);
}
