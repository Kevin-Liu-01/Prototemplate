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
// It records every logo picture it writes (the mark's and both lockups'
// PNGs) in scripts/lint/logo.json at the current LOGO.d, as pnpm build:logo
// does, so a rebuilt kit leaves no stale pin for pnpm lint:logo; a logo
// picture the manifest does not list fails the build until it is listed.
//
// Usage:
//   node scripts/build/brand-kit.mjs --from <kit folder> [--zip <kit zip>] [--root <checkout>]
// Requires: cwebp (brew install webp) and sips (macOS).
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { ROOT as REPO_ROOT } from '../lib/root.mjs';
import { helpIfAsked } from '../lib/help.mjs';
import { loadLogo, recordGenerated, sha256 } from '../lib/logo-lock.mjs';

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
/** the guide sheets: the page's key, the kit path, and its PDF beside it when there is one */
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

rmSync(OUT, { recursive: true, force: true });
for (const dir of ['svg', 'png', 'color', 'sheets']) mkdirSync(join(OUT, dir), { recursive: true });

const size = (file) => statSync(file).size;
if (ZIP) copyFileSync(ZIP, join(OUT, ZIP_NAME));
function copy(src, rel) {
  const from = join(FROM, src);
  if (!existsSync(from)) throw new Error(`brand-kit: the kit has no ${src}`);
  copyFileSync(from, join(OUT, rel));
  return { file: rel, bytes: size(join(OUT, rel)) };
}

function dims(file) {
  const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file], { encoding: 'utf8' });
  const n = (key) => Number(out.match(new RegExp(`${key}: (\\d+)`))[1]);
  return { width: n('pixelWidth'), height: n('pixelHeight') };
}

const logos = TYPES.map(([key, folder, stem]) => ({
  key,
  svg: Object.fromEntries(SVG_COLORS.map((c) => [c, copy(`logo/${folder}/svg/${stem}-${c}.svg`, `svg/${stem}-${c}.svg`)])),
  png: Object.fromEntries(
    PNG_COLORS.map((c) => [c, copy(`logo/transparent/${folder}/${stem}-${c}-on-transparent-1024.png`, `png/${stem}-${c}-on-transparent-1024.png`)])
  ),
}));

/* every logo picture written, pinned at the current LOGO.d */
const { LOGO } = await loadLogo(ROOT);
const pictures = logos.filter((l) => !l.key.startsWith('wordmark')).flatMap((l) => Object.values(l.png).map((f) => `public/brand/kit/${f.file}`));
recordGenerated(ROOT, pictures, sha256(LOGO.d));

const color = COLOR_FILES.map((name) => copy(`color/${name}`, `color/${name}`));

const sheets = SHEETS.map(([key, src]) => {
  const from = join(FROM, src);
  const rel = `sheets/${key}.webp`;
  const source = dims(from);
  const width = Math.min(source.width, MAX_SHEET);
  const height = Math.round((source.height * width) / source.width);
  execFileSync('cwebp', ['-quiet', '-q', '80', '-m', '6', '-resize', String(width), String(height), from, '-o', join(OUT, rel)]);
  const pdf = src.replace(/\.png$/, '.pdf');
  return { key, file: rel, bytes: size(join(OUT, rel)), width, height, pdf: existsSync(join(FROM, pdf)) ? pdf : null };
});

/** what the zip holds, counted from the folder: files per top-level folder */
function count(dir) {
  const out = execFileSync('find', [join(FROM, dir), '-type', 'f'], { encoding: 'utf8' });
  return out.split('\n').filter(Boolean).length;
}

const manifest = {
  zip: ZIP ? { name: ZIP_NAME, bytes: size(ZIP), url: `/brand/kit/${ZIP_NAME}` } : null,
  folders: Object.fromEntries(['logo', 'frames', 'color', 'type', 'guides', 'motion'].map((d) => [d, count(d)])),
  logos,
  color,
  sheets,
};
writeFileSync(join(OUT, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

const total = [...logos.flatMap((l) => [...Object.values(l.svg), ...Object.values(l.png)]), ...color, ...sheets].reduce((sum, f) => sum + f.bytes, 0);
console.log(
  `brand-kit: wrote public/brand/kit (${(total / 1024).toFixed(0)} KB)${manifest.zip ? `, zip ${manifest.zip.bytes} bytes` : ''}; recorded ${pictures.length} logo pictures in scripts/lint/logo.json`
);
