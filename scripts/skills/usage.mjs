#!/usr/bin/env node
/* oxlint-disable no-console -- a report printed to stdout. */
/**
 * Counts how often each skill loaded in Claude Code sessions on this machine.
 * It reads the Skill tool calls (input.skill) and the slash commands (/<slug>) in the
 * session transcripts under ~/.claude/projects, subagents included, within
 * the last --days days. Local only: it never runs in a build, and it prints
 * skill names and counts, never a line of transcript text (transcripts hold
 * pasted keys).
 *
 * pnpm skills:usage prints every curated skill (skills/<slug>) with its
 * counts, then, with --all, every other skill that loaded. pnpm skills:stale
 * (--stale) lists the curated skills that never loaded in the window and the
 * skill scripts whose header still reads "Last real run: none": the cut list
 * of P2, decided thirty days after distribution lands.
 *
 * Usage:
 *   node scripts/skills/usage.mjs [--days 30] [--dir <projects dir>] [--all] [--json] [--stale]
 *
 * --dir defaults to CLAUDE_PROJECTS, then ~/.claude/projects. Exit 0, or 2
 * when the folder is missing.
 */
import { closeSync, existsSync, openSync, readFileSync, readSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

import { ROOT } from '../lib/root.mjs';
import { helpIfAsked } from '../lib/help.mjs';

helpIfAsked(import.meta.url);

const argv = process.argv.slice(2);
const flag = (name) => {
  const at = argv.indexOf(name);
  return at >= 0 ? argv[at + 1] : undefined;
};
const DAYS = Number(flag('--days') ?? 30);
const DIR = resolve(flag('--dir') ?? process.env.CLAUDE_PROJECTS ?? join(homedir(), '.claude/projects'));
const ALL = argv.includes('--all');
const JSON_OUT = argv.includes('--json');
const STALE = argv.includes('--stale');
const CUTOFF = Date.now() - DAYS * 86_400_000;

if (!existsSync(DIR)) {
  console.error(`skills:usage: no transcripts at ${DIR}; pass --dir or set CLAUDE_PROJECTS`);
  process.exit(2);
}

const TOOL = Buffer.from('"name":"Skill"');
const SLASH = Buffer.from('<command-name>/');
const NAME = /^[A-Za-z0-9][A-Za-z0-9:_-]{0,80}$/;
/** slug -> { calls, typed, sessions: Set, last } */
const usage = new Map();

function record(slug, kind, session, at) {
  if (!NAME.test(slug)) return;
  const row = usage.get(slug) ?? { calls: 0, typed: 0, sessions: new Set(), last: '' };
  row[kind] += 1;
  row.sessions.add(session);
  if (at > row.last) row.last = at;
  usage.set(slug, row);
}

/** Reads one matching transcript line: the Skill calls in an assistant turn, or a typed slash command. */
function readLine(text, session) {
  let entry;
  try {
    entry = JSON.parse(text);
  } catch {
    return;
  }
  const at = typeof entry.timestamp === 'string' ? entry.timestamp : '';
  if (!at || Date.parse(at) < CUTOFF) return;
  const content = entry.message?.content;
  if (entry.type === 'assistant' && Array.isArray(content)) {
    for (const part of content) {
      if (part?.type === 'tool_use' && part.name === 'Skill' && typeof part.input?.skill === 'string') record(part.input.skill, 'calls', session, at);
    }
  } else if (entry.type === 'user') {
    const body = typeof content === 'string' ? content : Array.isArray(content) ? content.map((p) => (typeof p?.text === 'string' ? p.text : '')).join('') : '';
    for (const m of body.matchAll(/<command-name>\/([^<\s]+)<\/command-name>/g)) record(m[1], 'typed', session, at);
  }
}

/** Streams a transcript in 4 MB chunks and decodes only the lines that hold a needle. */
function scanFile(file, session) {
  const fd = openSync(file, 'r');
  const chunk = Buffer.alloc(4 << 20);
  let carry = Buffer.alloc(0);
  for (;;) {
    const n = readSync(fd, chunk, 0, chunk.length, null);
    if (n === 0) break;
    let buf = Buffer.concat([carry, chunk.subarray(0, n)]);
    const end = buf.lastIndexOf(10);
    carry = end < 0 ? buf : Buffer.from(buf.subarray(end + 1));
    if (end < 0) continue;
    buf = buf.subarray(0, end);
    if (buf.indexOf(TOOL) < 0 && buf.indexOf(SLASH) < 0) continue;
    for (const needle of [TOOL, SLASH]) {
      let from = 0;
      for (let hit = buf.indexOf(needle, from); hit >= 0; hit = buf.indexOf(needle, from)) {
        const start = buf.lastIndexOf(10, hit) + 1;
        let stop = buf.indexOf(10, hit);
        if (stop < 0) stop = buf.length;
        /* a line holding both needles is read once, from the first */
        if (needle === TOOL || buf.subarray(start, stop).indexOf(TOOL) < 0) readLine(buf.toString('utf8', start, stop), session);
        from = stop + 1;
      }
    }
  }
  if (carry.length > 0 && (carry.indexOf(TOOL) >= 0 || carry.indexOf(SLASH) >= 0)) readLine(carry.toString('utf8'), session);
  closeSync(fd);
}

/** Every .jsonl under the folder modified inside the window. */
function transcripts(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) transcripts(abs, out);
    else if (entry.name.endsWith('.jsonl') && statSync(abs).mtimeMs >= CUTOFF) out.push(abs);
  }
  return out;
}

const files = transcripts(DIR);
for (const file of files) scanFile(file, file.split('/').slice(-2).join('/'));

const curated = existsSync(join(ROOT, 'skills'))
  ? readdirSync(join(ROOT, 'skills')).filter((slug) => existsSync(join(ROOT, 'skills', slug, 'SKILL.md'))).sort()
  : [];
const rowOf = (slug) => {
  const row = usage.get(slug);
  return { slug, calls: row?.calls ?? 0, typed: row?.typed ?? 0, sessions: row?.sessions.size ?? 0, last: row?.last.slice(0, 10) ?? '' };
};

/** Skill scripts whose header says no real run has happened yet. */
function unrunScripts() {
  const out = [];
  for (const slug of curated) {
    const dir = join(ROOT, 'skills', slug, 'scripts');
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir).sort()) {
      if (/\.test\./.test(file)) continue;
      if (/Last real run: none/.test(readFileSync(join(dir, file), 'utf8').slice(0, 4000))) out.push(`skills/${slug}/scripts/${file}`);
    }
  }
  return out;
}

const header = `skills:usage: ${files.length} transcript${files.length === 1 ? '' : 's'} modified in the last ${DAYS} days under ${DIR}`;
if (STALE) {
  const unused = curated.filter((slug) => !usage.has(slug));
  const scripts = unrunScripts();
  if (JSON_OUT) {
    console.log(JSON.stringify({ days: DAYS, transcripts: files.length, unused, scripts }, null, 2));
  } else {
    console.log(header);
    console.log(`\nCurated skills with no load in ${DAYS} days (${unused.length} of ${curated.length}):`);
    for (const slug of unused) console.log(`  ${slug}`);
    console.log(`\nSkill scripts still at "Last real run: none" (${scripts.length}):`);
    for (const rel of scripts) console.log(`  ${rel}`);
  }
  process.exit(0);
}

const rows = curated.map(rowOf);
const others = [...usage.keys()].filter((slug) => !curated.includes(slug)).sort((a, b) => usage.get(b).calls + usage.get(b).typed - (usage.get(a).calls + usage.get(a).typed));
if (JSON_OUT) {
  console.log(JSON.stringify({ days: DAYS, transcripts: files.length, curated: rows, others: ALL ? others.map(rowOf) : undefined }, null, 2));
  process.exit(0);
}
console.log(header);
const line = (r) => `  ${r.slug.padEnd(28)} ${String(r.calls).padStart(6)} ${String(r.typed).padStart(6)} ${String(r.sessions).padStart(9)}  ${r.last || '-'}`;
console.log(`\n  ${'curated skill'.padEnd(28)} ${'calls'.padStart(6)} ${'typed'.padStart(6)} ${'sessions'.padStart(9)}  last`);
for (const r of rows) console.log(line(r));
if (ALL && others.length > 0) {
  console.log(`\n  ${'other skill'.padEnd(28)} ${'calls'.padStart(6)} ${'typed'.padStart(6)} ${'sessions'.padStart(9)}  last`);
  for (const slug of others) console.log(line(rowOf(slug)));
}
