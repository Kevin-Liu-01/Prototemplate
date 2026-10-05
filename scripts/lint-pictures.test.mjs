// Tests for scripts/lint-pictures.mjs: the repository passes, and each kind
// of defect in a fixture copy of the picture files is reported.
//
// Usage: pnpm test:pictures (node --test scripts/lint-pictures.test.mjs)
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { bayer8, jpegFrame, lintPictures, parseRegistry, PATHS } from './lint-pictures.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURE_PATHS = [
  'scripts/mood-tone',
  PATHS.deckGrids,
  PATHS.deckSlides,
  PATHS.deckHead,
  PATHS.deckTail,
  PATHS.plateGrids,
  PATHS.registry,
  PATHS.fieldStack,
  PATHS.pictureField,
  PATHS.plateDither,
  PATHS.plateCss,
  PATHS.sharedDither,
  PATHS.craftDemo,
  PATHS.craftCss,
  PATHS.craftGrids,
];

const fixtures = [];
after(() => {
  for (const dir of fixtures) rmSync(dir, { recursive: true, force: true });
});

/** A copy of the files the lint reads, without the built deck. */
function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'lint-pictures-'));
  fixtures.push(root);
  for (const rel of FIXTURE_PATHS) cpSync(join(ROOT, rel), join(root, rel), { recursive: true });
  return root;
}

function editText(root, rel, from, to) {
  const file = join(root, rel);
  const text = readFileSync(file, 'utf8');
  assert.ok(text.includes(from), `${rel} should contain ${from}`);
  writeFileSync(file, text.replace(from, to));
}

function editManifest(root, dir, name, edit) {
  const file = join(root, dir, 'manifest.json');
  const manifest = JSON.parse(readFileSync(file, 'utf8'));
  const entry = manifest.pictures.find((e) => e.name === name);
  assert.ok(entry, `${dir} has ${name}`);
  edit(entry, manifest);
  writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
}

/** Asserts that some problem contains every one of `parts`. */
function reports(problems, ...parts) {
  assert.ok(
    problems.some((p) => parts.every((part) => p.includes(part))),
    `expected a problem with ${parts.join(' + ')}, got:\n${problems.join('\n')}`
  );
}

describe('the repository', () => {
  test('meets the standard', () => {
    assert.deepEqual(lintPictures(ROOT), []);
  });

  test('a fixture copy meets the standard', () => {
    assert.deepEqual(lintPictures(fixture()), []);
  });
});

describe('helpers', () => {
  test('bayer8 is the recursive 8x8 matrix, a permutation of 0..63', () => {
    const m = bayer8();
    assert.deepEqual(m.slice(0, 8), [0, 32, 8, 40, 2, 34, 10, 42]);
    assert.deepEqual([...m].sort((a, b) => a - b), Array.from({ length: 64 }, (_, i) => i));
  });

  test('jpegFrame reads a grid as 8-bit gray at its size', () => {
    const frame = jpegFrame(readFileSync(join(ROOT, PATHS.plateGrids, 'mood-earth.jpg')));
    assert.deepEqual(frame, { precision: 8, height: 1350, width: 2400, components: 1 });
    assert.equal(jpegFrame(Buffer.from('not a jpeg')), null);
  });

  test('parseRegistry reads names, src and placement', () => {
    const { names, entries } = parseRegistry(readFileSync(join(ROOT, PATHS.registry), 'utf8'));
    assert.deepEqual(names, ['earth', 'rosetta', 'calligraphy', 'tablet', 'gloss']);
    assert.deepEqual(entries.earth, { src: '/brand/mood/mood-earth.jpg', placement: { kind: 'disc', cx: 450.1, cy: 450.1, r: 399.5 } });
    assert.deepEqual(entries.gloss.placement, { kind: 'cover', focusX: 1, focusY: 0.5 });
  });
});

describe('grids and manifests', () => {
  test('a grid changed after the cut', () => {
    const root = fixture();
    const file = join(root, PATHS.deckGrids, 'mood-wave.jpg');
    const bytes = readFileSync(file);
    bytes[bytes.length - 3] ^= 0xff;
    writeFileSync(file, bytes);
    reports(lintPictures(root), 'wave', 'sha256');
  });

  test('a grid with no entry, and an entry with no grid', () => {
    const root = fixture();
    cpSync(join(root, PATHS.deckGrids, 'mood-wave.jpg'), join(root, PATHS.deckGrids, 'mood-extra.jpg'));
    rmSync(join(root, PATHS.plateGrids, 'mood-gloss.jpg'));
    const problems = lintPictures(root);
    reports(problems, 'mood-extra.jpg', 'no manifest entry');
    reports(problems, 'gloss', 'does not exist');
  });

  test('a color grid', () => {
    const root = fixture();
    // SOI, then a baseline frame header: 8 bits, 900 by 1600, three components
    const color = Buffer.from([0xff, 0xd8, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x03, 0x84, 0x06, 0x40, 0x03]);
    writeFileSync(join(root, PATHS.deckGrids, 'mood-cable.jpg'), color);
    reports(lintPictures(root), 'cable', '3 components');
  });

  test('house settings and quality off the standard', () => {
    const root = fixture();
    editManifest(root, PATHS.deckGrids, 'rosetta', (e) => {
      e.house.gamma = 1;
      e.house.blur = 0.6;
      e.quality = 90;
    });
    const problems = lintPictures(root);
    reports(problems, 'rosetta', 'gamma 1,');
    reports(problems, 'rosetta', 'blur 0.6');
    reports(problems, 'rosetta', 'quality 90');
  });

  test('a grid off its placement size, and over the cap', () => {
    const root = fixture();
    editManifest(root, PATHS.plateGrids, 'earth', (e) => {
      e.width = 1600;
      e.height = 900;
      e.bytes = 600000;
    });
    const problems = lintPictures(root);
    reports(problems, 'earth', 'a disc grid is 2400 by 1350');
    reports(problems, 'earth', 'over the 573440 byte cap');
  });

  test('region stats outside the windows', () => {
    const root = fixture();
    editManifest(root, PATHS.deckGrids, 'lighthouse', (e) => {
      e.region.mean = 0.5;
      e.region.std = 0.2;
    });
    editManifest(root, PATHS.deckGrids, 'compass', (e) => {
      e.region.blackShare = 0.3;
      e.region.mean = 0.4;
    });
    const problems = lintPictures(root);
    reports(problems, 'lighthouse', 'mean 0.5', 'scene window');
    reports(problems, 'lighthouse', 'std 0.2', 'scene window');
    reports(problems, 'compass', 'marks minimum 0.5');
    reports(problems, 'compass', 'marks maximum 0.35');
  });

  test('writing must be allowed, and text lines must be artistic', () => {
    const root = fixture();
    editManifest(root, PATHS.deckGrids, 'gloss', (e) => {
      e.writing = 'none';
    });
    editManifest(root, PATHS.deckGrids, 'earth', (e) => {
      e.writing = 'prose';
    });
    const problems = lintPictures(root);
    reports(problems, 'gloss', 'text lines', "'artistic'");
    reports(problems, 'earth', "writing 'prose'");
  });
});

describe('retired names', () => {
  test('a retired entry, file, registry key, slide token, literal and built deck', () => {
    const root = fixture();
    editManifest(root, PATHS.plateGrids, 'tablet', (e) => {
      e.name = 'dictionary';
    });
    cpSync(join(root, PATHS.plateGrids, 'mood-gloss.jpg'), join(root, PATHS.craftGrids, 'mood-johnson.jpg'));
    editText(root, PATHS.registry, '  gloss: {', "  'oed-volumes': {\n    src: '/brand/mood/mood-oed-volumes.jpg',\n    placement: { kind: 'cover', focusX: 1, focusY: 0.5 },\n  },\n  gloss: {");
    editText(root, `${PATHS.deckSlides}/06-mood-earth.html`, '<!-- mood earth -->', '<!-- mood earth, after mood-johnson -->');
    editText(root, PATHS.craftDemo, "const EARTH_SRC = '/craft/mood-earth.jpg';", "const EARTH_SRC = '/craft/mood-earth.jpg';\nconst OLD = 'dictionary';");
    writeFileSync(join(root, PATHS.builtDeck), '<section class="slide mood s-mood s-mood-dictionary"></section>');
    const problems = lintPictures(root);
    reports(problems, 'dictionary: a retired picture');
    reports(problems, 'public/craft/mood-johnson.jpg', "retired picture's file");
    reports(problems, PATHS.registry, 'oed-volumes has no entry');
    reports(problems, '06-mood-earth.html', 'mood-johnson names a retired picture');
    reports(problems, PATHS.craftDemo, "'dictionary' names a retired picture");
    reports(problems, PATHS.builtDeck, 'run pnpm build:deck');
  });
});

describe('the plate registry', () => {
  test('a placement, a src and a name that differ from the manifest', () => {
    const root = fixture();
    editText(root, PATHS.registry, 'r: 399.5', 'r: 398.2');
    editText(root, PATHS.registry, "src: '/brand/mood/mood-rosetta.jpg'", "src: '/brand/mood/rosetta.jpg'");
    editText(root, PATHS.registry, "placement: { kind: 'cover', focusX: 0.6, focusY: 0.5 }", "placement: { kind: 'cover', focusX: 0.5, focusY: 0.5 }");
    editText(root, PATHS.registry, "  | 'gloss';", ';');
    const problems = lintPictures(root);
    reports(problems, 'earth: disc r 398.2');
    reports(problems, 'rosetta: src /brand/mood/rosetta.jpg');
    reports(problems, 'calligraphy: focus 0.5, 0.5');
    reports(problems, 'gloss is not in PictureName');
  });
});

describe('the deck slides', () => {
  test('a slide on a missing grid, a bitmap slide, an unused grid and a two-tone file', () => {
    const root = fixture();
    const slide = `${PATHS.deckSlides}/80-mood-wave.html`;
    editText(root, slide, 'data-tone="shots/tone/mood-wave.jpg"', 'data-tone="shots/tone/mood-surf.jpg"');
    editText(
      root,
      `${PATHS.deckSlides}/91-mood-compass.html`,
      '<canvas class="mood-img" data-tone="shots/tone/mood-compass.jpg"',
      '<img class="mood-img" src="shots/mood-compass-light.jpg" alt=""><canvas class="mood-img" data-tone="shots/tone/mood-compass.jpg"'
    );
    cpSync(join(root, PATHS.deckGrids, 'mood-wave.jpg'), join(root, PATHS.deckShots, 'mood-wave.jpg'));
    const problems = lintPictures(root);
    reports(problems, slide, 'mood-surf.jpg, which is not in');
    reports(problems, slide, 'needs <canvas class="mood-img" data-tone="shots/tone/mood-wave.jpg">');
    reports(problems, 'wave is on no mood slide');
    reports(problems, '91-mood-compass.html', 'shows a bitmap');
    reports(problems, 'deck/shots/mood-wave.jpg', 'pre-screened');
  });

  test('a built deck whose inlined grids are stale', () => {
    const root = fixture();
    const stale = Buffer.from('a grid from an older cut').toString('base64');
    writeFileSync(join(root, PATHS.builtDeck), `<canvas class="mood-img" data-tone="data:image/jpeg;base64,${stale}"></canvas>`);
    reports(lintPictures(root), PATHS.builtDeck, '1 inlined, 1 unknown', 'run pnpm build:deck');
  });

  test('a deck picture placed off centre', () => {
    const root = fixture();
    editManifest(root, PATHS.deckGrids, 'tablet', (e) => {
      e.placement.focusX = 0;
    });
    reports(lintPictures(root), 'tablet', 'centred cover');
  });
});

describe('the screen constants', () => {
  test('the plate field', () => {
    const root = fixture();
    editText(root, PATHS.fieldStack, 'const PICTURE_SCALE = 1;', 'const PICTURE_SCALE = 2;');
    editText(root, PATHS.fieldStack, 'gamma: 1,\n  bias: 0,', 'gamma: 1.2,\n  bias: 0,');
    editText(root, PATHS.pictureField, 'export const TONE_FLOOR = 10;', 'export const TONE_FLOOR = 8;');
    editText(root, PATHS.plateCss, '--field-picture-opacity: 0.62;', '--field-picture-opacity: 0.5;');
    editText(root, PATHS.plateCss, '--tc-picture-ink: #070707;', '--tc-picture-ink: #111111;');
    const problems = lintPictures(root);
    reports(problems, PATHS.fieldStack, 'PICTURE_SCALE is 2');
    reports(problems, PATHS.fieldStack, 'LOOP_OPTIONS gamma is 1.2');
    reports(problems, PATHS.pictureField, 'TONE_FLOOR is 8');
    reports(problems, PATHS.plateCss, 'dark --field-picture-opacity is 0.5');
    reports(problems, PATHS.plateCss, 'light --tc-picture-ink is #111111');
  });

  test('the Bayer matrix and threshold', () => {
    const root = fixture();
    editText(root, PATHS.plateDither, '[0, 32, 8, 40, 2, 34, 10, 42]', '[32, 0, 8, 40, 2, 34, 10, 42]');
    editText(root, PATHS.sharedDither, '(BAYER_8[y]![x]! + 0.5) / 64', 'BAYER_8[y]![x]! / 64');
    editText(root, PATHS.deckTail, 'var Q = [0, 2, 3, 1];', 'var Q = [0, 1, 2, 3];');
    const problems = lintPictures(root);
    reports(problems, PATHS.plateDither, 'not the 8x8 Bayer matrix');
    reports(problems, PATHS.sharedDither, 'threshold');
    reports(problems, PATHS.deckTail, 'bayer8 (B4 and Q) is not the 8x8 Bayer matrix');
  });

  test('the deck engine and its tokens', () => {
    const root = fixture();
    editText(root, PATHS.deckTail, 'var MOOD_CELL_PX = 1;', 'var MOOD_CELL_PX = 2;');
    editText(root, PATHS.deckTail, 'var MOOD_TONE_FLOOR = 10;', 'var MOOD_TONE_FLOOR = 0;');
    editText(root, PATHS.deckHead, '--mood-ink: #ffffff; --mood-opacity: 0.62;', '--mood-ink: #f2f2f0; --mood-opacity: 0.62;');
    editText(root, PATHS.deckHead, '--mood-opacity: 0.7;', '--mood-opacity: 1;');
    const problems = lintPictures(root);
    reports(problems, PATHS.deckTail, 'MOOD_CELL_PX is 2');
    reports(problems, PATHS.deckTail, 'MOOD_TONE_FLOOR is 0');
    reports(problems, PATHS.deckHead, 'dark --mood-ink is #f2f2f0');
    reports(problems, PATHS.deckHead, 'light --mood-opacity is 1');
  });

  test('the /craft transition demo', () => {
    const root = fixture();
    editText(root, PATHS.craftDemo, 'const CELL = 1;', 'const CELL = 2;');
    editText(root, PATHS.craftDemo, 'const DISC = { cx: 420.1, cy: 450.1, r: 409.4 };', 'const DISC = { cx: 420, cy: 450, r: 410 };');
    editText(root, PATHS.craftCss, '--ptc-picture-opacity: 0.62;', '--ptc-picture-opacity: 1;');
    const grid = join(root, PATHS.craftGrids, 'mood-rosetta.jpg');
    writeFileSync(grid, readFileSync(join(root, PATHS.deckGrids, 'mood-wave.jpg')));
    const problems = lintPictures(root);
    reports(problems, PATHS.craftDemo, 'CELL is 2');
    reports(problems, PATHS.craftDemo, 'DISC 420, 450, 410');
    reports(problems, PATHS.craftCss, '--ptc-picture-opacity is 1');
    reports(problems, 'public/craft/mood-rosetta.jpg', 'byte copy');
  });
});
