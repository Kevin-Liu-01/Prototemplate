#!/usr/bin/env node
/* oxlint-disable no-console -- a lint reporting to stdout. */
/**
 * Holds the artifact pictures to the standard (docs/ARTIFACT-PICTURES.md,
 * scripts/mood-tone/standard.json). Pure Node, no dependencies.
 *
 * Usage: node scripts/lint-pictures.mjs [--root <dir>]
 *
 * Two manifests are checked, each written by scripts/mood-tone/mood-tone.mjs
 * beside its grids:
 *
 *   deck/shots/tone/manifest.json   the brand deck's mood slides
 *   public/brand/mood/manifest.json the plate port's field pictures
 *
 * For each manifest it fails when a grid file has no entry or an entry has
 * no file, a grid's sha256 or byte count differs from its entry, a grid is
 * not an 8-bit gray JPEG of its entry's size, an entry's house settings or
 * quality are off the standard, a grid is off its placement's size or over
 * the cap, an entry's region stats are outside its kind's window, `writing`
 * is not an allowed value, or text lines are declared anything but
 * 'artistic'. It also fails when:
 *
 *   - the plate registry (src/components/plate/brand/moodPictures.ts) and
 *     its manifest disagree on names, src or placement;
 *   - a deck mood slide does not name a manifest picture, a manifest
 *     picture has no slide, a slide shows a bitmap instead of its grid, or
 *     the built deck (public/brand-deck.html) inlines other bytes;
 *   - the /craft transition demo's grids, disc or screen differ from the
 *     deck's grids and the standard;
 *   - a retired name appears as a picture name, a file, a registry key, a
 *     mood token (mood-<name>) under deck/, src/ or the built deck, or a
 *     string literal in the picture code;
 *   - a screen constant differs from the standard: the picture cell 1, the
 *     tone floor 10, the loop's gamma 1 and bias 0, the 8x8 Bayer matrix and
 *     its threshold (m + 0.5) / 64, and the picture ink and opacity per
 *     theme, in the plate, the deck engine and the /craft demo.
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PATHS = {
  standard: 'scripts/mood-tone/standard.json',
  cutter: 'scripts/mood-tone/mood_tone.py',
  deckGrids: 'deck/shots/tone',
  deckShots: 'deck/shots',
  deckSlides: 'deck/slides',
  deckHead: 'deck/parts/head.html',
  deckTail: 'deck/parts/tail.html',
  builtDeck: 'public/brand-deck.html',
  plateGrids: 'public/brand/mood',
  registry: 'src/components/plate/brand/moodPictures.ts',
  fieldStack: 'src/components/plate/brand/FieldStack.tsx',
  pictureField: 'src/components/plate/lib/picture-field.ts',
  plateDither: 'src/components/plate/lib/dither.ts',
  plateCss: 'src/components/plate/plate.css',
  sharedDither: 'src/lib/dither.ts',
  craftDemo: 'src/app/craft/TransitionDemo.tsx',
  craftCss: 'src/app/craft/craft.css',
  craftGrids: 'public/craft',
};

/** Where the retired names may not appear as mood tokens, and where they may not appear as string literals. */
const TOKEN_SCAN = ['deck', 'src'];
const LITERAL_SCAN = ['src/components/plate', 'src/app/craft', 'deck/slides', 'deck/parts'];
const NAME_SCAN = ['deck', 'public/brand', 'public/craft', 'src/components/plate', 'src/app/craft'];
const TEXT_FILE = /\.(ts|tsx|js|mjs|cjs|css|html|md|mdx|json|txt)$/;

/** The 8x8 Bayer matrix by its recursive construction: M(2n) = [[4M, 4M + 2], [4M + 3, 4M + 1]]. */
export function bayer8() {
  let m = [[0]];
  while (m.length < 8) {
    const n = m.length;
    const next = Array.from({ length: 2 * n }, () => new Array(2 * n).fill(0));
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const v = 4 * m[y][x];
        next[y][x] = v;
        next[y][x + n] = v + 2;
        next[y + n][x] = v + 3;
        next[y + n][x + n] = v + 1;
      }
    }
    m = next;
  }
  return m.flat();
}

/** The frame header of a baseline or progressive JPEG: precision, size and component count; null when there is none. */
export function jpegFrame(bytes) {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let i = 2;
  while (i + 4 <= bytes.length) {
    if (bytes[i] !== 0xff) return null;
    const marker = bytes[i + 1];
    if (marker === 0xff) {
      i += 1;
      continue;
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd8)) {
      i += 2;
      continue;
    }
    if (marker === 0xda || marker === 0xd9) return null;
    const length = bytes.readUInt16BE(i + 2);
    const isFrame = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isFrame && i + 10 <= bytes.length) {
      return {
        precision: bytes[i + 4],
        height: bytes.readUInt16BE(i + 5),
        width: bytes.readUInt16BE(i + 7),
        components: bytes[i + 9],
      };
    }
    i += 2 + length;
  }
  return null;
}

const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
/** Source text without block comments and whole-line // comments, so a constant or a threshold quoted in a comment never passes for code. */
export const stripComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const hex6 = (value) => {
  const v = String(value ?? '').trim().toLowerCase();
  return /^#[0-9a-f]{3}$/.test(v) ? `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}` : v;
};
const near = (a, b) => typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) < 1e-9;

/** A numeric constant `name = <number or a / b>` in a JS, TS or Python source; undefined when absent. */
export function constNumber(text, name) {
  const m = text.match(new RegExp(`(?:const|var|let)\\s+${name}\\s*(?::[^=]+)?=\\s*(-?[\\d.]+)(?:\\s*\\/\\s*(-?[\\d.]+))?\\s*;`));
  if (!m) return undefined;
  return m[2] === undefined ? Number(m[1]) : Number(m[1]) / Number(m[2]);
}

/** The body of the first rule whose selector is exactly `selector`; '' when absent. */
export function cssBlock(text, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = new RegExp(`(^|\\n)\\s*${escaped}\\s*\\{([^}]*)\\}`).exec(text);
  return m ? m[2] : '';
}

/** A custom property's value in a rule body; undefined when absent. */
export function cssVar(block, name) {
  const m = block.match(new RegExp(`${name}\\s*:\\s*([^;]+);`));
  return m ? m[1].trim() : undefined;
}

/** The numbers of the array literal assigned to `name`; [] when absent. */
function arrayNumbers(text, name, open = '[', close = ']') {
  const found = new RegExp(`\\b${name}\\b[^=\\n]*=\\s*\\${open}`).exec(text);
  if (!found) return [];
  const start = found.index + found[0].length - 1;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === open) depth++;
    else if (text[i] === close && --depth === 0) return (text.slice(start, i + 1).match(/\d+/g) ?? []).map(Number);
  }
  return [];
}

/** The PictureName union and each MOOD_PICTURES entry's src and placement. */
export function parseRegistry(text) {
  const union = text.match(/export type PictureName\s*=([^;]+);/);
  const names = union ? [...union[1].matchAll(/'([^']+)'/g)].map((m) => m[1]) : [];
  const at = text.indexOf('export const MOOD_PICTURES');
  const entries = {};
  if (at >= 0) {
    const body = text.slice(at);
    for (const m of body.matchAll(/^ {2}'?([\w-]+)'?: \{\s*src: '([^']+)',\s*placement: \{([^}]*)\}/gm)) {
      const placement = {};
      for (const p of m[3].matchAll(/(\w+): (?:'([^']*)'|(-?[\d.]+))/g)) {
        placement[p[1]] = p[2] !== undefined ? p[2] : Number(p[3]);
      }
      entries[m[1]] = { src: m[2], placement };
    }
  }
  return { names, entries };
}

function listFiles(root, rel) {
  const abs = join(root, rel);
  if (!existsSync(abs)) return [];
  const out = [];
  for (const name of readdirSync(abs)) {
    if (name === 'node_modules' || name === '.next' || name.startsWith('.')) continue;
    const child = join(rel, name);
    if (statSync(join(root, child)).isDirectory()) out.push(...listFiles(root, child));
    else out.push(child);
  }
  return out;
}

/** Lints one manifest and its grids against the standard. */
function lintManifest(root, dir, standard, problems) {
  const file = join(dir, 'manifest.json');
  const say = (message) => problems.push(`${file}: ${message}`);
  if (!existsSync(join(root, file))) {
    say('missing; run scripts/mood-tone/mood-tone.mjs');
    return null;
  }
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(join(root, file), 'utf8'));
  } catch (error) {
    say(`not JSON: ${error.message}`);
    return null;
  }
  const pictures = Array.isArray(manifest.pictures) ? manifest.pictures : [];
  if (!manifest.view || !Array.isArray(manifest.pictures)) say('needs { view, pictures }');
  const retired = Object.keys(standard.writing.retired);
  const { tone, file: fileStd, windows, writing } = standard;
  const seen = new Set();
  for (const e of pictures) {
    const at = (message) => say(`${e.name}: ${message}`);
    if (seen.has(e.name)) at('appears twice');
    seen.add(e.name);
    if (retired.includes(e.name)) at(`a retired picture (${standard.writing.retired[e.name]})`);
    if (e.file !== `mood-${e.name}.jpg`) at(`file ${e.file} should be mood-${e.name}.jpg`);
    const gridPath = join(root, dir, e.file ?? '');
    if (!e.file || !existsSync(gridPath)) {
      at(`its grid ${join(dir, e.file ?? '?')} does not exist`);
    } else {
      const bytes = readFileSync(gridPath);
      if (sha256(bytes) !== e.sha256) at('the grid\'s sha256 differs from the manifest; cut it again with mood-tone.mjs, never by hand');
      if (bytes.length !== e.bytes) at(`the grid is ${bytes.length} bytes and the manifest says ${e.bytes}`);
      const frame = jpegFrame(bytes);
      if (!frame) at('the grid is not a JPEG');
      else {
        if (frame.components !== 1 || frame.precision !== 8) at(`the grid has ${frame.components} components at ${frame.precision} bits; a tone grid is 8-bit gray (mode ${fileStd.mode})`);
        if (frame.width !== e.width || frame.height !== e.height) at(`the grid is ${frame.width} by ${frame.height} and the manifest says ${e.width} by ${e.height}`);
      }
    }
    const h = e.house ?? {};
    if (h.blur !== tone.blur) at(`blur ${h.blur}, the standard is ${tone.blur}`);
    if (h.gamma !== tone.gamma) at(`gamma ${h.gamma}, the standard is ${tone.gamma}`);
    if (h.autocontrastCutoff !== tone.autocontrastCutoff) at(`autocontrast cutoff ${h.autocontrastCutoff}, the standard is ${tone.autocontrastCutoff}`);
    if (e.quality !== fileStd.quality && e.quality !== fileStd.fallbackQuality) at(`quality ${e.quality}, the standard is ${fileStd.quality} or ${fileStd.fallbackQuality} over the cap`);
    const sizeKind = e.placement?.kind === 'disc' ? 'disc' : 'cover';
    const [w, hgt] = fileStd.sizes[sizeKind];
    if (e.width !== w || e.height !== hgt) at(`a ${sizeKind} grid is ${w} by ${hgt}, this one is ${e.width} by ${e.height}`);
    if (!(e.bytes <= fileStd.capBytes[sizeKind])) at(`${e.bytes} bytes is over the ${fileStd.capBytes[sizeKind]} byte cap`);
    if (!['scene', 'marks'].includes(e.kind)) at(`kind ${e.kind} is not scene or marks`);
    if (!['red', 'gray'].includes(e.channel)) at(`channel ${e.channel} is not red or gray`);
    const r = e.region ?? {};
    if (e.kind === 'scene') {
      const win = windows.scene;
      if (!(r.mean >= win.mean[0] && r.mean <= win.mean[1])) at(`mean ${r.mean} is outside the scene window ${win.mean.join(' to ')}`);
      if (!(r.std >= win.std[0] && r.std <= win.std[1])) at(`std ${r.std} is outside the scene window ${win.std.join(' to ')}`);
      if (!(r.whiteShare >= win.whiteShareMin)) at(`${r.whiteShare} at white is under the scene minimum ${win.whiteShareMin}`);
      if (!(r.blackShare >= win.blackShareMin)) at(`${r.blackShare} at the floor is under the scene minimum ${win.blackShareMin}`);
    } else if (e.kind === 'marks') {
      const win = windows.marks;
      if (!(r.mean <= win.meanMax)) at(`mean ${r.mean} is over the marks maximum ${win.meanMax}`);
      if (!(r.blackShare >= win.blackShareMin)) at(`${r.blackShare} at the floor is under the marks minimum ${win.blackShareMin}`);
      if (!(r.whiteShare >= win.whiteShareMin)) at(`${r.whiteShare} at white is under the marks minimum ${win.whiteShareMin}`);
    }
    if (!writing.allowed.includes(e.writing)) at(`writing '${e.writing}' is not one of ${writing.allowed.join(', ')}`);
    if (e.textLines > 0 && e.writing !== 'artistic') at(`${e.textLines} text lines, so writing must be 'artistic' and a person checks it against rule 1`);
    if ((e.placement?.kind === 'disc' || e.crop?.kind === 'disc') && !(e.disc && e.disc.r > 0)) at('a disc needs its fitted disc { cx, cy, r }');
  }
  for (const rel of listFiles(root, dir)) {
    const name = rel.slice(dir.length + 1);
    if (name === 'manifest.json' || name.startsWith('README')) continue;
    if (!pictures.some((e) => e.file === name)) problems.push(`${rel}: no manifest entry; every grid is cut by mood-tone.mjs`);
  }
  return { view: manifest.view ?? {}, pictures };
}

/** Lints the plate registry against the plate manifest. */
function lintRegistry(text, plate, standard, problems) {
  const retired = Object.keys(standard.writing.retired);
  const say = (message) => problems.push(`${PATHS.registry}: ${message}`);
  const { names, entries } = parseRegistry(text);
  const keys = Object.keys(entries);
  const manifestNames = plate.pictures.map((e) => e.name);
  for (const name of new Set([...names, ...keys, ...manifestNames])) {
    if (retired.includes(name)) say(`${name} is a retired picture (${standard.writing.retired[name]})`);
    if (!names.includes(name)) say(`${name} is not in PictureName`);
    if (!keys.includes(name)) say(`${name} has no MOOD_PICTURES entry`);
    if (!manifestNames.includes(name)) say(`${name} has no entry in ${PATHS.plateGrids}/manifest.json`);
  }
  for (const e of plate.pictures) {
    const reg = entries[e.name];
    if (!reg) continue;
    if (reg.src !== `/brand/mood/${e.file}`) say(`${e.name}: src ${reg.src} should be /brand/mood/${e.file}`);
    const p = reg.placement;
    if (p.kind !== e.placement.kind) say(`${e.name}: placement kind ${p.kind}, the manifest says ${e.placement.kind}`);
    else if (p.kind === 'cover') {
      if (!near(p.focusX, e.placement.focusX) || !near(p.focusY, e.placement.focusY)) {
        say(`${e.name}: focus ${p.focusX}, ${p.focusY}, the manifest says ${e.placement.focusX}, ${e.placement.focusY}`);
      }
    } else if (p.kind === 'disc') {
      for (const k of ['cx', 'cy', 'r']) {
        if (!near(p[k], e.disc?.[k])) say(`${e.name}: disc ${k} ${p[k]}, the manifest's fitted disc says ${e.disc?.[k]}`);
      }
    }
  }
}

/** Lints the deck's mood slides against the deck manifest. */
function lintSlides(root, deck, problems) {
  const used = new Set();
  const names = deck.pictures.map((e) => e.name);
  for (const rel of listFiles(root, PATHS.deckSlides)) {
    const text = readFileSync(join(root, rel), 'utf8');
    const slide = rel.match(/\/\d\d-mood-([a-z-]+)\.html$/);
    for (const m of text.matchAll(/data-tone="shots\/tone\/([^"]+)"/g)) {
      const entry = deck.pictures.find((e) => e.file === m[1]);
      if (!entry) problems.push(`${rel}: data-tone names ${m[1]}, which is not in ${PATHS.deckGrids}/manifest.json`);
      else used.add(entry.name);
    }
    if (/<img[^>]*class="[^"]*mood-img/.test(text)) problems.push(`${rel}: a mood slide shows a bitmap; it screens its tone grid on <canvas class="mood-img" data-tone>`);
    if (slide) {
      if (!names.includes(slide[1])) problems.push(`${rel}: ${slide[1]} is not a picture in ${PATHS.deckGrids}/manifest.json`);
      else if (!text.includes(`<canvas class="mood-img" data-tone="shots/tone/mood-${slide[1]}.jpg"`)) {
        problems.push(`${rel}: needs <canvas class="mood-img" data-tone="shots/tone/mood-${slide[1]}.jpg">`);
      }
    }
  }
  for (const e of deck.pictures) {
    if (!used.has(e.name)) problems.push(`${PATHS.deckGrids}/manifest.json: ${e.name} is on no mood slide`);
    if (e.placement?.kind !== 'cover' || !near(e.placement.focusX, 0.5) || !near(e.placement.focusY, 0.5)) {
      problems.push(`${PATHS.deckGrids}/manifest.json: ${e.name}: the deck engine draws a centred cover, so the placement is cover at focus 0.5, 0.5`);
    }
  }
  const v = deck.view;
  if (v.width !== 1600 || v.height !== 900 || v.rampStart !== 0 || v.rampEnd !== 0) {
    problems.push(`${PATHS.deckGrids}/manifest.json: the deck view is the 1600 by 900 sheet with no ramp`);
  }
  for (const rel of listFiles(root, PATHS.deckShots)) {
    if (/^deck\/shots\/mood-[^/]+\.(jpg|png)$/.test(rel)) problems.push(`${rel}: a pre-screened mood file; a mood picture is its tone grid under ${PATHS.deckGrids}`);
  }
  // the built deck inlines each grid with its bytes untouched
  if (existsSync(join(root, PATHS.builtDeck))) {
    const built = readFileSync(join(root, PATHS.builtDeck), 'utf8');
    const inlined = [...built.matchAll(/data-tone="data:image\/jpeg;base64,([^"]+)"/g)].map((m) => sha256(Buffer.from(m[1], 'base64')));
    const unknown = inlined.filter((sha) => !deck.pictures.some((e) => e.sha256 === sha)).length;
    if (unknown || inlined.length !== used.size || /data-tone="shots\//.test(built)) {
      problems.push(`${PATHS.builtDeck}: its inlined tone grids differ from ${PATHS.deckGrids} (${inlined.length} inlined, ${unknown} unknown); run pnpm build:deck`);
    }
  }
}

/** Lints the screen constants in the plate, the deck engine and the /craft demo. */
function lintScreen(root, standard, plate, deck, problems) {
  const { screen } = standard;
  const read = (rel) => (existsSync(join(root, rel)) ? stripComments(readFileSync(join(root, rel), 'utf8')) : null);
  const need = (rel) => {
    const text = read(rel);
    if (text === null) problems.push(`${rel}: missing`);
    return text ?? '';
  };
  const expect = (rel, what, got, want) => {
    if (typeof want === 'number' ? !near(got, want) : got !== want) problems.push(`${rel}: ${what} is ${got}, the standard is ${want}`);
  };
  const canonical = bayer8();
  const matrix = (rel, got, label) => {
    if (got.length !== 64 || got.some((v, i) => v !== canonical[i])) problems.push(`${rel}: ${label} is not the 8x8 Bayer matrix`);
  };
  const threshold = (rel, text, pattern) => {
    if (!pattern.test(text)) problems.push(`${rel}: the Bayer threshold (m + 0.5) / 64 is missing`);
  };
  const loopOptions = (rel, text) => {
    const block = (text.match(/const LOOP_OPTIONS[^=]*=\s*\{([^}]*)\}/) ?? [])[1] ?? '';
    expect(rel, 'LOOP_OPTIONS gamma', Number((block.match(/gamma:\s*([\d.]+)/) ?? [])[1]), 1);
    expect(rel, 'LOOP_OPTIONS bias', Number((block.match(/bias:\s*(-?[\d.]+)/) ?? [])[1]), 0);
  };
  const ink = (rel, block, inkVar, opacityVar, theme, label) => {
    expect(rel, `${label} ${inkVar}`, hex6(cssVar(block, inkVar)), hex6(screen[theme].ink));
    expect(rel, `${label} ${opacityVar}`, Number(cssVar(block, opacityVar)), screen[theme].opacity);
  };

  // the plate's field
  const stack = need(PATHS.fieldStack);
  expect(PATHS.fieldStack, 'PICTURE_SCALE', constNumber(stack, 'PICTURE_SCALE'), screen.cellCssPx);
  loopOptions(PATHS.fieldStack, stack);
  const ratio = constNumber(stack, 'DISC_DIAMETER_RATIO');
  const share = constNumber(stack, 'DISC_LIMB_RAMP_SHARE');
  if (!near(ratio * plate.view.height, plate.view.discDiameter) || !near(share, plate.view.discLimbShare)) {
    problems.push(`${PATHS.plateGrids}/manifest.json: the view's disc (${plate.view.discDiameter} across, limb at ${plate.view.discLimbShare}) differs from FieldStack's DISC_DIAMETER_RATIO and DISC_LIMB_RAMP_SHARE`);
  }
  expect(PATHS.pictureField, 'TONE_FLOOR', constNumber(need(PATHS.pictureField), 'TONE_FLOOR'), screen.toneFloor);
  const css = need(PATHS.plateCss);
  ink(PATHS.plateCss, cssBlock(css, '.brand-field-stack'), '--tc-picture-ink', '--field-picture-opacity', 'light', 'light');
  ink(PATHS.plateCss, cssBlock(css, ":root[data-theme='dark'] .brand-field-stack"), '--tc-picture-ink', '--field-picture-opacity', 'dark', 'dark');
  for (const rel of [PATHS.plateDither, PATHS.sharedDither]) {
    const text = need(rel);
    matrix(rel, arrayNumbers(text, 'BAYER_8'), 'BAYER_8');
    threshold(rel, text, /\(BAYER_8\[[^\]]+\]!?\[[^\]]+\]!? \+ 0\.5\) \/ 64/);
  }
  const cutter = need(PATHS.cutter);
  matrix(PATHS.cutter, arrayNumbers(cutter, 'BAYER_8', '(', ')'), 'BAYER_8');
  threshold(PATHS.cutter, cutter, /\(BAYER_8\[y\]\[x\] \+ 0\.5\) \* 255 \/ 64/);
  const floorInCutter = /toneFloor/.test(cutter);
  if (!floorInCutter) problems.push(`${PATHS.cutter}: the cutter does not read screen.toneFloor`);

  // the deck engine
  const tail = need(PATHS.deckTail);
  expect(PATHS.deckTail, 'MOOD_CELL_PX', constNumber(tail, 'MOOD_CELL_PX'), screen.cellCssPx);
  expect(PATHS.deckTail, 'MOOD_TONE_FLOOR', constNumber(tail, 'MOOD_TONE_FLOOR'), screen.toneFloor);
  const b4 = arrayNumbers(tail, 'B4');
  const q = arrayNumbers(tail, 'Q');
  const engine = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) engine.push(b4[(r % 4) * 4 + (c % 4)] * 4 + q[Math.floor(r / 4) * 2 + Math.floor(c / 4)]);
  }
  matrix(PATHS.deckTail, b4.length === 16 && q.length === 4 ? engine : [], 'bayer8 (B4 and Q)');
  threshold(PATHS.deckTail, tail, /\(bayer8\([^)]*\) \+ 0\.5\) \/ 64/);
  const head = need(PATHS.deckHead);
  ink(PATHS.deckHead, cssBlock(head, ':root'), '--mood-ink', '--mood-opacity', 'light', 'light');
  ink(PATHS.deckHead, cssBlock(head, ':root[data-theme="dark"]'), '--mood-ink', '--mood-opacity', 'dark', 'dark');
  expect(PATHS.deckHead, 'light --paper', hex6(cssVar(cssBlock(head, ':root'), '--paper')), hex6(screen.light.ground));
  expect(PATHS.deckHead, 'dark --paper', hex6(cssVar(cssBlock(head, ':root[data-theme="dark"]'), '--paper')), hex6(screen.dark.ground));

  // the /craft transition demo: the deck's grids on a plate that is dark in both themes
  const demo = need(PATHS.craftDemo);
  expect(PATHS.craftDemo, 'CELL', constNumber(demo, 'CELL'), screen.cellCssPx);
  expect(PATHS.craftDemo, 'TONE_FLOOR', constNumber(demo, 'TONE_FLOOR'), screen.toneFloor);
  expect(PATHS.craftDemo, 'PICTURE_OPACITY', constNumber(demo, 'PICTURE_OPACITY'), screen.dark.opacity);
  loopOptions(PATHS.craftDemo, demo);
  ink(PATHS.craftCss, cssBlock(need(PATHS.craftCss), '.ptc-plate.is-transition'), '--ptc-picture-ink', '--ptc-picture-opacity', 'dark', 'transition plate');
  const used = new Set();
  for (const m of demo.matchAll(/const \w+_SRC = '\/craft\/([^']+)'/g)) {
    used.add(m[1]);
    const entry = deck.pictures.find((e) => e.file === m[1]);
    const rel = `${PATHS.craftGrids}/${m[1]}`;
    if (!entry) problems.push(`${PATHS.craftDemo}: /craft/${m[1]} is not a deck grid in ${PATHS.deckGrids}/manifest.json`);
    else if (!existsSync(join(root, rel))) problems.push(`${rel}: missing; copy it from ${PATHS.deckGrids}`);
    else if (sha256(readFileSync(join(root, rel))) !== entry.sha256) problems.push(`${rel}: differs from ${PATHS.deckGrids}/${m[1]}; it is a byte copy`);
  }
  if (!used.size) problems.push(`${PATHS.craftDemo}: no /craft grid sources found`);
  for (const rel of listFiles(root, PATHS.craftGrids)) {
    const name = rel.slice(PATHS.craftGrids.length + 1);
    if (/^mood-/.test(name) && !used.has(name)) problems.push(`${rel}: not a grid the transition demo reads`);
  }
  const earth = deck.pictures.find((e) => e.name === 'earth');
  const disc = demo.match(/const DISC = \{\s*cx:\s*([\d.]+),\s*cy:\s*([\d.]+),\s*r:\s*([\d.]+)\s*\}/);
  if (!disc || !earth?.disc) problems.push(`${PATHS.craftDemo}: DISC or the deck earth's fitted disc is missing`);
  else if (!near(Number(disc[1]), earth.disc.cx) || !near(Number(disc[2]), earth.disc.cy) || !near(Number(disc[3]), earth.disc.r)) {
    problems.push(`${PATHS.craftDemo}: DISC ${disc[1]}, ${disc[2]}, ${disc[3]} differs from the deck earth's fitted disc ${earth.disc.cx}, ${earth.disc.cy}, ${earth.disc.r}`);
  }
}

/** Lints the retired names: no file, mood token or picture-code literal carries one. */
function lintRetired(root, standard, problems) {
  const retired = Object.keys(standard.writing.retired);
  if (!retired.length) return;
  const alt = retired.map((n) => n.replace(/[-]/g, '\\-')).join('|');
  const token = new RegExp(`mood-(${alt})\\b`);
  const literal = new RegExp(`(['"\`])(${alt})\\1`);
  const named = new RegExp(`(^|[-_.])(${alt})([-_.]|$)`, 'i');
  for (const rel of new Set(NAME_SCAN.flatMap((dir) => listFiles(root, dir)))) {
    const base = rel.split('/').pop();
    if (named.test(base)) problems.push(`${rel}: a retired picture's file`);
  }
  const scanned = [...new Set(TOKEN_SCAN.flatMap((dir) => listFiles(root, dir)))].filter((rel) => TEXT_FILE.test(rel));
  if (existsSync(join(root, PATHS.builtDeck))) scanned.push(PATHS.builtDeck);
  for (const rel of scanned) {
    const text = readFileSync(join(root, rel), 'utf8');
    const hit = text.match(token);
    if (hit) {
      const line = text.slice(0, hit.index).split('\n').length;
      problems.push(`${rel}:${line}: ${hit[0]} names a retired picture${rel === PATHS.builtDeck ? '; run pnpm build:deck' : ''}`);
    }
    if (LITERAL_SCAN.some((dir) => rel.startsWith(`${dir}/`))) {
      const lit = text.match(literal);
      if (lit) problems.push(`${rel}:${text.slice(0, lit.index).split('\n').length}: ${lit[0]} names a retired picture`);
    }
  }
}

/** Every problem found under `root`, as `path: message` lines; [] when the pictures meet the standard. */
export function lintPictures(root) {
  const problems = [];
  const standardPath = join(root, PATHS.standard);
  if (!existsSync(standardPath)) return [`${PATHS.standard}: missing`];
  const standard = JSON.parse(readFileSync(standardPath, 'utf8'));
  const deck = lintManifest(root, PATHS.deckGrids, standard, problems) ?? { view: {}, pictures: [] };
  const plate = lintManifest(root, PATHS.plateGrids, standard, problems) ?? { view: {}, pictures: [] };
  if (existsSync(join(root, PATHS.registry))) lintRegistry(readFileSync(join(root, PATHS.registry), 'utf8'), plate, standard, problems);
  else problems.push(`${PATHS.registry}: missing`);
  lintSlides(root, deck, problems);
  lintScreen(root, standard, plate, deck, problems);
  lintRetired(root, standard, problems);
  return problems;
}

function main() {
  const at = process.argv.indexOf('--root');
  const root = at >= 0 ? resolve(process.argv[at + 1]) : resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const problems = lintPictures(root);
  if (problems.length) {
    console.error(`lint:pictures found ${problems.length} problem${problems.length === 1 ? '' : 's'} (docs/ARTIFACT-PICTURES.md):`);
    for (const p of problems) console.error(`  ${p}`);
    process.exit(1);
  }
  const count = (dir) => JSON.parse(readFileSync(join(root, dir, 'manifest.json'), 'utf8')).pictures.length;
  console.log(
    `lint:pictures clean: ${count(PATHS.deckGrids)} deck grids and ${count(PATHS.plateGrids)} plate grids meet the standard (${relative(process.cwd(), join(root, PATHS.standard)) || PATHS.standard})`
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
