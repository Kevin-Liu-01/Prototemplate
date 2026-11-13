// Copies the brand kit's zip, previews and small files into public/brand/kit
// and writes public/brand/kit/manifest.json, which the brand kit section on
// /brand reads for every file's name and size. The site serves the zip
// (about 25 MB with the fonts and the frames) from public/brand/kit, so
// commit a new zip only when the kit changes.
//
// From the unzipped kit folder it takes the transparent SVGs of the mark,
// both lockups and both wordmarks in five colours, the 1024 px transparent
// PNGs in ink and white, the palette files, and each guide sheet cut to
// WebP at 1800 px wide at most. With --zip it copies the zip in as well,
// and the page's download button links it; without --zip the page names no
// zip and shows no button.
//
// Every picture it writes is held by the logo lock, since /brand shows
// them all: the mark's, both lockups' and both wordmarks' 1024 px PNGs in
// ink and white (ten files) and the seven guide sheets. It records each one
// in scripts/lint/logo.json, at the bytes it wrote and the current LOGO.d,
// as pnpm build:logo does, so a rebuilt kit leaves no stale
// pin for pnpm lint:logo. It works out every file first and checks each
// picture is listed under "generated" or "checked" there; one that is
// not stops it before it deletes or writes anything. Then it copies and
// cuts, then records, then writes the manifest.
//
// Usage:
//   node scripts/build/brand-kit.mjs --from <kit folder> [--zip <kit zip>] [--root <checkout>]
// Requires: cwebp (brew install webp) and sips (macOS).
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { ROOT as REPO_ROOT } from '../lib/root.mjs';
import { helpIfAsked } from '../lib/help.mjs';
import { loadLogo, readManifest, recordGenerated, sha256, unlisted, unlistedMessage } from '../lib/logo-lock.mjs';

helpIfAsked(import.meta.url);

function arg(name) {
  const at = process.argv.indexOf(name);
  return at > 0 ? process.argv[at + 1] : undefined;
}

const FROM = arg('--from');
const ZIP = arg('--zip');
const ROOT = arg('--root') ? resolve(arg('--root')) : REPO_ROOT;
/** the zip's name in public/brand/kit and in the download */
const ZIP_NAME = 'General-Translation-brand-kit.zip';
if (!FROM || !existsSync(join(FROM, 'README.md'))) {
  console.error('brand-kit: pass --from <the unzipped kit folder, the one holding README.md>');
  process.exit(1);
}

const OUT = join(ROOT, 'public/brand/kit');
/** the logo types the page shows, as the kit names its folders and files; the wordmarks hold no globe */
const TYPES = [
  ['mark', 'mark', 'gt-mark'],
  ['lockup-stacked', 'lockup-stacked', 'gt-lockup-stacked'],
  ['lockup-horizontal', 'lockup-horizontal', 'gt-lockup-horizontal'],
  ['wordmark', 'wordmark', 'gt-wordmark'],
  ['wordmark-stacked', 'wordmark', 'gt-wordmark-stacked'],
];
const SVG_COLORS = ['ink', 'white', 'accent', 'accent-lift', 'currentcolor'];
const PNG_COLORS = ['ink', 'white'];
const COLOR_FILES = ['colors.css', 'colors.json', 'colors.ase'];
/** the guide sheets: the page's key and the kit path (its PDF sits beside it when there is one) */
const SHEETS = [
  ['brand-sheet', 'guides/brand-sheet.png'],
  ['clear-space', 'guides/clear-space.png'],
  ['minimum-size', 'guides/minimum-size.png'],
  ['variant-sheet', 'guides/variant-sheet.png'],
  ['type-spec', 'type/type-spec.png'],
  ['color-sheet', 'color/color-sheet.png'],
  ['frames-sheet', 'frames/frames-sheet.png'],
];

/** the widest a sheet's WebP is cut: 1800 px, twice the 900 px it shows at */
const MAX_SHEET = 1800;

function fail(message) {
  console.error(`brand-kit: ${message}`);
  process.exit(1);
}

const size = (file) => statSync(file).size;

function dims(file) {
  const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file], { encoding: 'utf8' });
  const n = (key) => Number(out.match(new RegExp(`${key}: (\\d+)`))[1]);
  return { width: n('pixelWidth'), height: n('pixelHeight') };
}

/* ---- what it will write, worked out before anything is written ---- */

/** [kit file, path under public/brand/kit] for every file copied as it is */
const copies = [];
function planCopy(src, rel) {
  const from = join(FROM, src);
  if (!existsSync(from)) fail(`the kit has no ${src}`);
  copies.push([from, rel]);
  return rel;
}

const logoFiles = TYPES.map(([key, folder, stem]) => ({
  key,
  svg: SVG_COLORS.map((c) => [c, planCopy(`logo/${folder}/svg/${stem}-${c}.svg`, `svg/${stem}-${c}.svg`)]),
  png: PNG_COLORS.map((c) => [c, planCopy(`logo/transparent/${folder}/${stem}-${c}-on-transparent-1024.png`, `png/${stem}-${c}-on-transparent-1024.png`)]),
}));
const colorFiles = COLOR_FILES.map((name) => planCopy(`color/${name}`, `color/${name}`));
const sheetCuts = SHEETS.map(([key, src]) => {
  const from = join(FROM, src);
  if (!existsSync(from)) fail(`the kit has no ${src}`);
  const source = dims(from);
  const width = Math.min(source.width, MAX_SHEET);
  const height = Math.round((source.height * width) / source.width);
  const pdf = src.replace(/\.png$/, '.pdf');
  return { key, from, rel: `sheets/${key}.webp`, width, height, pdf: existsSync(join(FROM, pdf)) ? pdf : null };
});

/** what the zip holds, counted from the folder: files per top-level folder */
function count(dir) {
  if (!existsSync(join(FROM, dir))) fail(`the kit has no ${dir}/ folder`);
  const out = execFileSync('find', [join(FROM, dir), '-type', 'f'], { encoding: 'utf8' });
  return out.split('\n').filter(Boolean).length;
}
const folders = Object.fromEntries(['logo', 'frames', 'color', 'type', 'guides', 'motion'].map((d) => [d, count(d)]));
if (ZIP && !existsSync(ZIP)) fail(`no zip at ${ZIP}`);

/* every picture it writes: the mark's, the lockups' and the wordmarks' PNGs and every sheet; /brand shows them all, so lint:logo holds each to the bytes recorded here (rule 5) */
const pictures = [
  ...logoFiles.flatMap((l) => l.png.map(([, rel]) => rel)),
  ...sheetCuts.map((s) => s.rel),
].map((rel) => `public/brand/kit/${rel}`);
const missing = unlisted(readManifest(ROOT), pictures);
if (missing.length) fail(`${missing.map(unlistedMessage).join('\n')}\nnothing was written`);
/* the tools and the logo the write step needs, checked before anything is deleted */
try {
  execFileSync('cwebp', ['-version'], { stdio: 'ignore' });
} catch {
  fail('cwebp is missing (brew install webp)\nnothing was written');
}
const { LOGO } = await loadLogo(ROOT);

/* ---- write: copy, cut, then record ---- */

rmSync(OUT, { recursive: true, force: true });
for (const dir of ['svg', 'png', 'color', 'sheets']) mkdirSync(join(OUT, dir), { recursive: true });
if (ZIP) copyFileSync(ZIP, join(OUT, ZIP_NAME));
for (const [from, rel] of copies) copyFileSync(from, join(OUT, rel));
for (const s of sheetCuts) {
  execFileSync('cwebp', ['-quiet', '-q', '80', '-m', '6', '-resize', String(s.width), String(s.height), s.from, '-o', join(OUT, s.rel)]);
}

recordGenerated(ROOT, pictures, sha256(LOGO.d));

const entry = (rel) => ({ file: rel, bytes: size(join(OUT, rel)) });
const logos = logoFiles.map((l) => ({
  key: l.key,
  svg: Object.fromEntries(l.svg.map(([c, rel]) => [c, entry(rel)])),
  png: Object.fromEntries(l.png.map(([c, rel]) => [c, entry(rel)])),
}));
const color = colorFiles.map(entry);
const sheets = sheetCuts.map((s) => ({ key: s.key, ...entry(s.rel), width: s.width, height: s.height, pdf: s.pdf }));

const manifest = {
  zip: ZIP ? { name: ZIP_NAME, bytes: size(ZIP), url: `/brand/kit/${ZIP_NAME}` } : null,
  folders,
  logos,
  color,
  sheets,
};
writeFileSync(join(OUT, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

const total = [...logos.flatMap((l) => [...Object.values(l.svg), ...Object.values(l.png)]), ...color, ...sheets].reduce((sum, f) => sum + f.bytes, 0);
console.log(
  `brand-kit: wrote public/brand/kit (${(total / 1024).toFixed(0)} KB)${manifest.zip ? `, zip ${manifest.zip.bytes} bytes` : ''}; recorded ${pictures.length} logo pictures in scripts/lint/logo.json`
);
