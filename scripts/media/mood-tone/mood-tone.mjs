#!/usr/bin/env node
/* oxlint-disable no-console -- a build script reporting to stdout. */
/**
 * Cuts the artifact pictures' tone grids to the house standard and writes
 * the manifest the lint reads (docs/ARTIFACT-PICTURES.md).
 *
 * Usage: node scripts/media/mood-tone/mood-tone.mjs <sources dir> [--set deck|plate]
 *                                             [--out <dir>] [--preview <dir>] [--check]
 *
 * - `deck` (the default) cuts the brand deck's ten mood pictures into
 *   deck/shots/tone at 1600 by 900, measured over the full sheet.
 * - `plate` cuts the plate port's five field pictures into public/brand/mood,
 *   measured over the part of each picture the field shows at 1440 by 900.
 *   These recipes are gt-cloud's (apps/dashboard/scripts/mood-tone), so the
 *   two repos hold the same files.
 * - `--out` writes the grids and the manifest to another folder.
 * - `--preview` also writes each grid screened at 1 px cells as a PNG.
 * - `--check` cuts into a temporary folder and exits 1 unless every grid and
 *   the manifest equal the committed files byte for byte.
 *
 * The sources are the original scans and photographs. They are large and are
 * not committed; SOURCES names each file's origin and the sha256 of the copy
 * the committed grids were cut from, and the wrapper refuses a source whose
 * sha256 differs. The pixel
 * work runs in mood_tone.py beside this file (python3 with Pillow), which
 * reads standard.json's fixed settings, solves each picture's black and white
 * points, and prints one manifest entry per picture. This script writes those
 * entries to manifest.json as { view, pictures }.
 */

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ROOT } from '../../lib/root.mjs';
import { helpIfAsked } from '../../lib/help.mjs';

helpIfAsked(import.meta.url);

const HERE = dirname(fileURLToPath(import.meta.url));
const STANDARD = JSON.parse(readFileSync(join(HERE, 'standard.json'), 'utf8'));

/**
 * Where each source file came from and the sha256 of the copy the committed
 * grids were cut from. The first five are gt-cloud's sources, with the same
 * hashes. README.md beside this file has the same table with the pixel sizes.
 */
export const SOURCES = {
  'earth.jpg': {
    url: 'https://commons.wikimedia.org/wiki/File:Blue_Marble_Western_Hemisphere.jpg',
    sha256: '4564966126c338326d57347ec87cf2f8dee60d07dafb8b4f6482cb2a8244d71d',
  },
  'rosetta.jpg': {
    url: 'https://commons.wikimedia.org/wiki/File:Rosetta_Stone.JPG',
    sha256: 'ab849e48eca5e8cf5bb2466b83e04b13d7da1c427652f3c57fda09311869c388',
  },
  'calligraphy.jpg': {
    url: 'https://commons.wikimedia.org/wiki/File:Ahmed_Karahisari_-_Karalama_%28calligraphy_exercise%29_-_Google_Art_Project.jpg',
    sha256: '7e4d0092230d4251933580bcd26c8e1b6d5b1b0006e9c980439480eea70df1aa',
  },
  'met-327385-DP293245.jpg': {
    url: 'https://images.metmuseum.org/CRDImages/an/original/DP293245.jpg',
    sha256: 'fa975c43b50532786b5f7c57edb1b6e105496f8a1e9a92465d7fa896fa183aec',
  },
  'alexandreis-p69.jpg': {
    url: 'https://commons.wikimedia.org/wiki/File:Alexandreis_with_gloss_-_in_Latin_-_DPLA_-_98b56ea1ebec780d88ec0bdfa6750159_%28page_69%29.jpg',
    sha256: '9b84d0a5a2c53d90c3014fe9f71619d864f960645a3e232a42b481496f446ae3',
  },
  'lighthouse.jpg': {
    url: 'https://commons.wikimedia.org/wiki/File:Louisbourg_Lighthouse,_waves_breaking_in_a_fall_storm_1.jpg',
    sha256: '1dfb1e670e2de3fb09723f52e2aa6fe8bb29d26f7b4fac556d46aac84fe83361',
  },
  'devanagari.jpg': {
    url: 'https://commons.wikimedia.org/wiki/File:Prashna_Upanishad_sample_manuscript_page,_Sanskrit,_Devanagari_script.jpg',
    sha256: '5f8077777cb1eb181b422b59c02959cd0249265f89c441a12d0c5491412585ef',
  },
  'cable.png': {
    url: 'https://commons.wikimedia.org/wiki/File:1901_Eastern_Telegraph_cables.png',
    sha256: '9ab9d44eb7332b2d9352f446083a6f2f3ece75eb3d1a3ebc263f6cb39756df51',
  },
  'wave.jpg': {
    url: 'https://commons.wikimedia.org/wiki/File:Tsunami_by_hokusai_19th_century.jpg',
    sha256: '30c170260de393f51bd592adacc6f0714b60f157c09744e9c5b6d46e6a613718',
  },
  'compass.jpg': {
    url: "https://commons.wikimedia.org/wiki/File:1748_Bowen_Mariner%27s_Compass_and_Armillary_Sphere_-_Geographicus_-_CircleofWinds-bowen-1747.jpg",
    sha256: '9b656f50affeec8cf569548aaf79ac9fa6531c07a3e4f407ef2e0730d6d6077f',
  },
};

/** A cover grid: 1600 by 900 under the cover cap. */
const COVER = { width: 1600, height: 900, cap: STANDARD.file.capBytes.cover };
/** The disc grid: 2400 by 1350, because the field draws the earth at about 2x. */
const DISC = { width: 2400, height: 1350, cap: STANDARD.file.capBytes.disc };

/**
 * The view each set is measured in. The deck's mood slide shows the whole
 * 1600 by 900 sheet. The plate's field is 1440 by 900 with the ramp from x
 * 806.4 to 1072, and the earth's disc is 1.7 times the height across with
 * its left limb five sevenths of the way along the ramp
 * (src/components/plate/brand/FieldStack.tsx).
 */
const VIEWS = {
  deck: { width: 1600, height: 900, rampStart: 0, rampEnd: 0, discDiameter: 900, discLimbShare: 0 },
  plate: { width: 1440, height: 900, rampStart: 806.4, rampEnd: 1072, discDiameter: 1.7 * 900, discLimbShare: 5 / 7 },
};

const centred = { kind: 'cover', focusX: 0.5, focusY: 0.5 };

/**
 * Crop boxes are left, top, right, bottom in the source scaled to
 * `onLongSide` px on its long side. A `disc` crop finds the lit disc on its
 * black ground and puts its centre and radius on the grid. A `subject` crop
 * finds the object on a light studio ground, fits its height to `fillHeight`
 * of the grid at `centreX`, `centreY`, and darkens the ground to black.
 */
const DECK = [
  {
    // NASA Earth Observatory, Blue Marble Next Generation, Western Hemisphere,
    // Reto Stöckli, 2007, public domain. The reference picture.
    name: 'earth',
    source: 'earth.jpg',
    ...COVER,
    crop: { kind: 'disc', centre: [420, 450], radius: 410, limbOver: 24 },
    channel: 'red',
    invert: false,
    kind: 'scene',
    writing: 'none',
    placement: centred,
  },
  {
    // The Rosetta Stone, British Museum; photograph by Hans Hillewaert, CC BY-SA 4.0.
    name: 'rosetta',
    source: 'rosetta.jpg',
    ...COVER,
    crop: { kind: 'box', onLongSide: 1800, box: [0, 300, 1539, 1166] },
    channel: 'gray',
    invert: false,
    kind: 'scene',
    writing: 'artistic',
    placement: centred,
  },
  {
    // The Metropolitan Museum of Art 1988.433.1, a proto-cuneiform account of
    // malt and barley, about 3100 to 2900 BC; Open Access photograph DP293245, CC0.
    name: 'tablet',
    source: 'met-327385-DP293245.jpg',
    ...COVER,
    crop: {
      kind: 'subject',
      centreX: 0.27,
      centreY: 0.47,
      fillHeight: 0.62,
      mask: { bright: 150, saturation: 0.12, feather: 2 },
    },
    channel: 'gray',
    invert: false,
    kind: 'scene',
    writing: 'artistic',
    placement: centred,
  },
  {
    // Ahmed Karahisari, Karalama (calligraphy exercise), 16th century, public domain.
    name: 'calligraphy',
    source: 'calligraphy.jpg',
    ...COVER,
    crop: { kind: 'box', onLongSide: 1800, box: [310, 475, 1030, 880] },
    channel: 'gray',
    invert: true,
    kind: 'marks',
    writing: 'artistic',
    placement: centred,
  },
  {
    // Louisbourg Lighthouse, waves breaking in a fall storm; Ken Heaton, CC BY-SA 4.0.
    name: 'lighthouse',
    source: 'lighthouse.jpg',
    ...COVER,
    crop: { kind: 'box', onLongSide: 1800, box: [300, 330, 1800, 1174] },
    channel: 'red',
    invert: false,
    kind: 'scene',
    writing: 'none',
    placement: centred,
  },
  {
    // A Prashna Upanishad manuscript page in Devanagari; Ms Sarah Welch, CC BY-SA 4.0.
    name: 'devanagari',
    source: 'devanagari.jpg',
    ...COVER,
    crop: { kind: 'box', onLongSide: 1800, box: [187, 0, 1613, 803] },
    channel: 'gray',
    invert: true,
    kind: 'marks',
    writing: 'artistic',
    placement: centred,
  },
  {
    // Fol. 31r of the Boston Public Library's glossed Alexandreis (MS f Med. 23,
    // France, about 1250), page 69 of the library's scan at 6696 by 10057, public domain.
    name: 'gloss',
    source: 'alexandreis-p69.jpg',
    ...COVER,
    crop: { kind: 'box', onLongSide: 10057, box: [1300, 3471, 5081, 5598] },
    channel: 'gray',
    invert: true,
    kind: 'marks',
    writing: 'artistic',
    placement: centred,
  },
  {
    // The Eastern Telegraph Company's chart of its submarine cables, 1901, public domain.
    name: 'cable',
    source: 'cable.png',
    ...COVER,
    crop: { kind: 'box', onLongSide: 1800, box: [500, 470, 1060, 785] },
    channel: 'gray',
    invert: true,
    kind: 'marks',
    writing: 'artistic',
    placement: centred,
  },
  {
    // Katsushika Hokusai, The Great Wave off Kanagawa, about 1831, public domain.
    name: 'wave',
    source: 'wave.jpg',
    ...COVER,
    crop: { kind: 'box', onLongSide: 1800, box: [0, 90, 1800, 1102] },
    channel: 'red',
    invert: true,
    kind: 'scene',
    writing: 'artistic',
    placement: centred,
  },
  {
    // Emanuel Bowen, A Circle of Winds (the mariner's compass), 1748, public domain.
    name: 'compass',
    source: 'compass.jpg',
    ...COVER,
    crop: { kind: 'box', onLongSide: 1800, box: [40, 90, 1040, 652] },
    channel: 'red',
    invert: true,
    kind: 'marks',
    writing: 'artistic',
    placement: centred,
  },
];

/** gt-cloud's dashboard recipes, for the plate port's copy of its grids. */
const PLATE = [
  {
    name: 'earth',
    source: 'earth.jpg',
    ...DISC,
    crop: { kind: 'disc', centre: [675, 675], radius: 600, limbOver: 24 },
    channel: 'red',
    invert: false,
    kind: 'scene',
    writing: 'none',
    placement: { kind: 'disc' },
  },
  {
    name: 'rosetta',
    source: 'rosetta.jpg',
    ...COVER,
    crop: { kind: 'box', onLongSide: 1800, box: [-260, 300, 1279, 1166] },
    channel: 'gray',
    invert: false,
    kind: 'scene',
    writing: 'artistic',
    placement: { kind: 'cover', focusX: 0, focusY: 0.5 },
  },
  {
    name: 'calligraphy',
    source: 'calligraphy.jpg',
    ...COVER,
    crop: { kind: 'box', onLongSide: 1800, box: [310, 475, 1030, 880] },
    channel: 'gray',
    invert: true,
    kind: 'marks',
    writing: 'artistic',
    placement: { kind: 'cover', focusX: 0.6, focusY: 0.5 },
  },
  {
    name: 'tablet',
    source: 'met-327385-DP293245.jpg',
    ...COVER,
    crop: {
      kind: 'subject',
      centreX: 0.5,
      centreY: 0.5,
      fillHeight: 1.25,
      mask: { bright: 150, saturation: 0.12, feather: 4 },
    },
    channel: 'gray',
    invert: false,
    kind: 'scene',
    writing: 'artistic',
    placement: { kind: 'cover', focusX: 0.5, focusY: 0.5 },
  },
  {
    name: 'gloss',
    source: 'alexandreis-p69.jpg',
    ...COVER,
    crop: { kind: 'box', onLongSide: 10057, box: [2063, 5433, 5081, 7131] },
    channel: 'gray',
    invert: true,
    kind: 'marks',
    writing: 'artistic',
    placement: { kind: 'cover', focusX: 1, focusY: 0.5 },
  },
];

const SETS = {
  deck: { pictures: DECK, outDir: join(ROOT, 'deck/shots/tone') },
  plate: { pictures: PLATE, outDir: join(ROOT, 'public/brand/mood') },
};

/** Throws unless every source of `pictures` is in SOURCES and its file's sha256 matches. */
function checkSources(pictures, sourcesDir) {
  for (const file of new Set(pictures.map((p) => p.source))) {
    const known = SOURCES[file];
    if (!known) throw new Error(`mood-tone: ${file} has no entry in SOURCES`);
    const path = join(sourcesDir, file);
    if (!existsSync(path)) throw new Error(`mood-tone: ${path} is missing; download it from ${known.url}`);
    const sha = createHash('sha256').update(readFileSync(path)).digest('hex');
    if (sha !== known.sha256) {
      throw new Error(`mood-tone: ${path} is not the copy the grids were cut from (sha256 ${sha}, expected ${known.sha256})`);
    }
  }
}

/** Runs the cutter on one set and returns the manifest it describes. */
export function cut({ set, sourcesDir, outDir, previewDir }) {
  checkSources(SETS[set].pictures, sourcesDir);
  const recipe = {
    standard: STANDARD,
    sourcesDir,
    outDir,
    ...(previewDir ? { previewDir } : {}),
    view: VIEWS[set],
    pictures: SETS[set].pictures,
  };
  const run = spawnSync('python3', [join(HERE, 'mood_tone.py')], {
    input: JSON.stringify(recipe),
    maxBuffer: 1 << 24,
  });
  if (run.status !== 0) {
    throw new Error(`mood-tone: the cutter failed (python3 with Pillow is required): ${run.stderr.toString()}`);
  }
  const pictures = run.stdout
    .toString()
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line));
  const manifest = { view: VIEWS[set], pictures };
  writeFileSync(join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

/** The names of the files a check compares: every grid and the manifest. */
function cutFiles(dir) {
  return readdirSync(dir)
    .filter((file) => /^mood-[a-z-]+\.jpg$/.test(file) || file === 'manifest.json')
    .sort();
}

function main() {
  const args = process.argv.slice(2);
  const flag = (name) => {
    const at = args.indexOf(name);
    return at >= 0 ? args[at + 1] : undefined;
  };
  const sourcesArg = args[0];
  const set = flag('--set') ?? 'deck';
  if (!sourcesArg || sourcesArg.startsWith('--') || !SETS[set]) {
    console.error(
      'usage: node scripts/media/mood-tone/mood-tone.mjs <sources dir> [--set deck|plate] [--out <dir>] [--preview <dir>] [--check]'
    );
    process.exit(2);
  }
  const sourcesDir = resolve(sourcesArg);
  const check = args.includes('--check');
  const committed = SETS[set].outDir;
  const outDir = check ? mkdtempSync(join(tmpdir(), 'mood-tone-')) : resolve(flag('--out') ?? committed);
  const previewArg = flag('--preview');
  try {
    const manifest = cut({ set, sourcesDir, outDir, previewDir: previewArg ? resolve(previewArg) : undefined });
    for (const entry of manifest.pictures) {
      const { mean, std, whiteShare, blackShare } = entry.region;
      console.log(
        `${entry.name}: ${entry.kind}, levels ${entry.levels.black} to ${entry.levels.white}, mean ${mean}, std ${std}, white ${whiteShare}, floor ${blackShare}, ${entry.textLines} text lines, ${entry.bytes} bytes at q${entry.quality}`
      );
    }
    if (!check) {
      console.log(`mood-tone: ${manifest.pictures.length} grids and manifest.json -> ${outDir}`);
      return;
    }
    const want = cutFiles(committed);
    const got = cutFiles(outDir);
    const differ = [...new Set([...want, ...got])].filter((file) => {
      if (!want.includes(file) || !got.includes(file)) return true;
      return !readFileSync(join(committed, file)).equals(readFileSync(join(outDir, file)));
    });
    if (differ.length) {
      console.error(`mood-tone --check: ${differ.join(', ')} differ from ${committed}`);
      process.exitCode = 1;
      return;
    }
    console.log(`mood-tone --check: ${got.length} files equal ${committed} byte for byte`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  } finally {
    if (check) rmSync(outDir, { recursive: true, force: true });
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
