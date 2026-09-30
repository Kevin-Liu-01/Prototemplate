#!/usr/bin/env node
/* oxlint-disable no-console -- a build script reporting to stdout. */
/**
 * Writes the docs' transition demo grids from the deck's mood pictures.
 *
 * Usage: node scripts/mood-cells.mjs
 * Reads deck/shots/mood-earth.jpg and deck/shots/mood-rosetta.jpg, the
 * deck's two-tone 1600 by 900 files whose cells are 2 by 2 px squares,
 * and writes public/craft/mood-<name>-cells.png: 800 by 450 8-bit gray
 * PNGs with one pixel per deck cell, 255 where the cell's mean gray is
 * over 127 and 0 otherwise. The pixel work runs in python3 with Pillow
 * through child_process, as the dashboard's generator did. The PNGs are
 * committed; the site never runs this at build time.
 */

import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const FILE_WIDTH = 1600;
const FILE_HEIGHT = 900;
/** File px per grid cell: one grid cell per deck cell. */
const STRIDE = 2;
/** A cell is lit when its mean gray is over this; a two-tone file's cells sit well clear of it on both sides. */
const LIT_OVER = 127;
const PICTURES = ['earth', 'rosetta'];

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const shotsDir = join(root, 'deck/shots');
const outDir = join(root, 'public/craft');

/** Decodes the JPEG, sums each stride by stride block, writes the gray PNG, prints `w h lit`. */
const CELLS_PY = `
import sys
from PIL import Image
src, out, stride, lit_over = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
im = Image.open(src).convert('L')
assert im.size == (${FILE_WIDTH}, ${FILE_HEIGHT}), im.size
file_w = im.size[0]
w, h = file_w // stride, im.size[1] // stride
gray = im.tobytes()
cells = bytearray(w * h)
lit_sum = lit_over * stride * stride
lit = 0
for gy in range(h):
    for gx in range(w):
        s = 0
        for dy in range(stride):
            row = (gy * stride + dy) * file_w + gx * stride
            s += sum(gray[row:row + stride])
        if s > lit_sum:
            cells[gy * w + gx] = 255
            lit += 1
Image.frombytes('L', (w, h), bytes(cells)).save(out, optimize=True)
print(w, h, lit)
`;

/** The width, height, bit depth and colour type of a PNG's IHDR. */
function readIhdr(file) {
  const bytes = readFileSync(file);
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    depth: bytes[24],
    colour: bytes[25],
  };
}

mkdirSync(outDir, { recursive: true });
console.log('decoder and writer: python3 with Pillow');

for (const name of PICTURES) {
  const source = join(shotsDir, `mood-${name}.jpg`);
  const out = join(outDir, `mood-${name}-cells.png`);
  const run = spawnSync('python3', ['-c', CELLS_PY, source, out, String(STRIDE), String(LIT_OVER)]);
  if (run.status !== 0) {
    throw new Error(`python3 with Pillow is required to cut ${source}: ${run.stderr.toString()}`);
  }
  const [width, height, lit] = run.stdout.toString().trim().split(/\s+/).map(Number);
  const ihdr = readIhdr(out);
  const expected = { width: FILE_WIDTH / STRIDE, height: FILE_HEIGHT / STRIDE, depth: 8, colour: 0 };
  for (const key of Object.keys(expected)) {
    if (ihdr[key] !== expected[key]) {
      throw new Error(`${out}: ${key} ${ihdr[key]}, ${expected[key]} expected`);
    }
  }
  const size = statSync(out).size;
  console.log(
    `${name}: ${width}x${height}, ${((lit / (width * height)) * 100).toFixed(2)}% lit, ${size} bytes -> ${out}`
  );
}
