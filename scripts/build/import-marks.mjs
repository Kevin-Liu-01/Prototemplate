#!/usr/bin/env node
/* oxlint-disable no-console -- a build step reporting to stdout. */
/**
 * Copies finished marks into public/marks/dynamic from a manifest kept
 * outside this repository. The manifest maps each local source folder of
 * the marks rounds to a public id, and it stays private because the local
 * folder names are working names. For each entry the script reads one SVG
 * (mark.svg, or the file the entry names) and its 16px cut (mark-16.svg)
 * when one sits beside it, and never any other file of the folder.
 *
 * Every file must already be a finished mark: one path in currentColor,
 * fill-rule nonzero or evenodd, viewBox 0 0 256 256, and nothing else.
 * The vote app's checker (src/lib/vote/mark-file.ts) reads it as well:
 * sanitizeSvg must accept it, parsePath must read its path data, and
 * normalizeSvg must find one ink with no holes painted in a second tone.
 * The script rewrites the header to the canonical one (so no label or
 * attribute of the source survives), rounds every coordinate to two
 * decimals, refuses a file over 8 KB, and prints each file's bytes and
 * drawn box, the `box` its catalog row in src/lib/marks.ts records.
 *
 * Usage:
 *   node scripts/build/import-marks.mjs [--manifest <file>] [--check]
 *   (pnpm import:marks)
 *
 *   --manifest  the private manifest (default ~/gt/prototemplate-work/marks-upgrade/import.json):
 *               { "base": "<folder>", "marks": [{ "id": "<public id>", "from": "<folder under base>", "file"?: "<svg name>" }] }
 *   --check     validates and prints, and writes nothing
 *
 * Exit 0 when every entry passes, 1 when one fails, 2 when the manifest is missing.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ROOT } from '../lib/root.mjs';
import { helpIfAsked } from '../lib/help.mjs';

helpIfAsked(import.meta.url);

/** Where the imported marks live, as a public folder and on disk. */
export const DYNAMIC_DIR = 'public/marks/dynamic';
export const MAX_BYTES = 8 * 1024;
const SIZE = 256;

const { normalizeSvg, parsePath, sanitizeSvg } = await import(new URL('../../src/lib/vote/mark-file.ts', import.meta.url).href);

/** The one header every mark file carries; `cut` adds nothing, since the 16px cuts are drawn as paths too. */
export function canonicalSvg(rule, d) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}" role="img" aria-label="General Translation"><path fill="currentColor" fill-rule="${rule}" d="${d}"/></svg>\n`;
}

/** The canonical file's shape: the header above, one path, and nothing else. */
export const CANONICAL = new RegExp(
  `^<svg xmlns="http://www\\.w3\\.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}" role="img" aria-label="General Translation"><path fill="currentColor" fill-rule="(nonzero|evenodd)" d="([^"<>]+)"/></svg>\\n?$`
);

const NUMBER = /[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g;

/** Path data with every number rounded to two decimals, in place, so the commands and separators stay. */
export function roundPath(d) {
  return d
    .replace(NUMBER, (n) => {
      const v = Math.round(Number(n) * 100) / 100;
      return String(Object.is(v, -0) ? 0 : v);
    })
    .replace(/\s+/g, ' ')
    .trim();
}

/** The drawn box of a canonical file, [x, y, w, h] at one decimal, as the vote checker's tight viewBox reads it. */
export function drawnBox(svg) {
  const out = normalizeSvg(svg);
  if ('error' in out || !out.tight) return null;
  const view = /viewBox="([^"]+)"/.exec(out.svg)?.[1]?.split(/\s+/).map(Number);
  if (!view || view.length !== 4 || view.some((v) => !Number.isFinite(v))) return null;
  return view.map((v) => Math.round(v * 10) / 10);
}

/**
 * A source file read as a finished mark: its fill rule and path data, or
 * the reason it fails. The source may carry any header (a label, a title);
 * only its one path crosses into the repository.
 */
export function readMark(source) {
  if (!sanitizeSvg(source).svg) return { error: 'the vote checker refuses it' };
  const body = source.replace(/<\?xml[^>]*>/, '').trim();
  const root = /^<svg\b([^>]*)>([\s\S]*)<\/svg>$/.exec(body);
  if (!root) return { error: 'it is not one svg element' };
  if (!/\bviewBox="0 0 256 256"/.test(root[1])) return { error: 'its viewBox is not 0 0 256 256' };
  const inner = root[2].trim();
  const path = /^<path\b([^>]*)\/>$/.exec(inner);
  if (!path) return { error: 'it holds something other than one path' };
  const attrs = Object.fromEntries([...path[1].matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
  const extra = Object.keys(attrs).filter((name) => !['fill', 'fill-rule', 'd', 'shape-rendering'].includes(name));
  if (extra.length) return { error: `its path carries ${extra.join(', ')}` };
  if (attrs.fill !== 'currentColor') return { error: 'its path is not filled in currentColor' };
  const rule = attrs['fill-rule'] ?? 'nonzero';
  if (rule !== 'nonzero' && rule !== 'evenodd') return { error: `its fill rule is ${rule}` };
  if (!attrs.d || !parsePath(attrs.d)) return { error: 'its path data does not parse' };
  const normal = normalizeSvg(source);
  if ('error' in normal) return { error: normal.error };
  if (normal.mode !== 'flat') return { error: 'it paints holes in a second tone' };
  return { rule, d: roundPath(attrs.d) };
}

/** One file through the checks and into the canonical form: { svg, bytes, box } or { error }. */
export function importFile(source) {
  const mark = readMark(source);
  if ('error' in mark) return mark;
  const svg = canonicalSvg(mark.rule, mark.d);
  const bytes = Buffer.byteLength(svg);
  if (bytes > MAX_BYTES) return { error: `it is ${bytes} bytes, over ${MAX_BYTES}` };
  const box = drawnBox(svg);
  if (!box) return { error: 'its drawn box cannot be measured' };
  return { svg, bytes, box };
}

const expand = (p) => (p.startsWith('~/') ? join(homedir(), p.slice(2)) : resolve(p));

function main() {
  const argv = process.argv.slice(2);
  const at = argv.indexOf('--manifest');
  const manifestPath = expand(at >= 0 ? argv[at + 1] : '~/gt/prototemplate-work/marks-upgrade/import.json');
  const check = argv.includes('--check');
  if (!existsSync(manifestPath)) {
    console.error('import:marks: the manifest is missing; pass --manifest <file>');
    process.exit(2);
  }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const base = expand(manifest.base);
  const outDir = join(ROOT, DYNAMIC_DIR);
  if (!check) mkdirSync(outDir, { recursive: true });
  let failed = 0;
  const seen = new Set();
  for (const entry of manifest.marks) {
    const { id } = entry;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || seen.has(id)) {
      console.log(`  FAIL ${id}: the id is not lowercase kebab, or it repeats`);
      failed += 1;
      continue;
    }
    seen.add(id);
    const folder = join(base, entry.from);
    const name = entry.file ?? 'mark.svg';
    const files = [[`${id}.svg`, join(folder, name)]];
    if (name === 'mark.svg' && existsSync(join(folder, 'mark-16.svg'))) files.push([`${id}-16.svg`, join(folder, 'mark-16.svg')]);
    for (const [out, from] of files) {
      if (!existsSync(from)) {
        console.log(`  FAIL ${out}: the source file is missing`);
        failed += 1;
        continue;
      }
      const result = importFile(readFileSync(from, 'utf8'));
      if ('error' in result) {
        console.log(`  FAIL ${out}: ${result.error}`);
        failed += 1;
        continue;
      }
      if (!check) writeFileSync(join(outDir, out), result.svg);
      console.log(`  ${check ? 'ok' : 'wrote'} ${out}  ${result.bytes} B  box [${result.box.join(', ')}]`);
    }
  }
  console.log(`import:marks: ${failed === 0 ? 'pass' : `${failed} failed`}, ${seen.size} marks`);
  process.exit(failed === 0 ? 0 : 1);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
