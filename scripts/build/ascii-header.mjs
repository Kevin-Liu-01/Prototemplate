#!/usr/bin/env node
/* oxlint-disable no-console -- a generator reporting what it wrote. */
/**
 * Writes the dot-matrix header to public/marks/ascii: the General
 * Translation globe and the name on two lines, sampled onto one grid of
 * round dots, as the terminal header Kevin sent on 2026-11-25 draws them.
 *
 * The globe is the logo's own path (public/brand/gt-globe-logo.svg) and the
 * name is set in Katagami Text 400 from the self-hosted font, with the
 * lockup's tracking and the font's kerning, so nothing is drawn by hand. A
 * cell takes a dot when enough of its samples fall inside the outline. The
 * letters are thickened across only (name.spread), so their verticals take
 * 2 dots and their horizontals 1, as the reference's letters do. Every
 * number is in scripts/build/ascii-header.json.
 *
 * It writes:
 *   gt-ascii-header.svg         dots in currentColor on no ground
 *   gt-ascii-header-dark.svg    white dots on ink
 *   gt-ascii-header-light.svg   ink dots on paper
 *   gt-ascii-header-dark.png    the dark one at png.pitch pixels a dot
 *   gt-ascii-header-light.png   the light one at png.pitch pixels a dot
 *   gt-ascii-header.txt         the grid as plain ASCII for a terminal, two
 *                               rows of dots a line (: both, ' top, . bottom)
 * and prints the grid's agreement with the reference's dot grid.
 *
 * Usage:
 *   node scripts/build/ascii-header.mjs           (pnpm build:ascii-header)
 *   node scripts/build/ascii-header.mjs --check   exit 1 when a written file differs from what this writes
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

import * as fontkit from 'fontkit';

import { helpIfAsked } from '../lib/help.mjs';
import { ROOT } from '../lib/root.mjs';

helpIfAsked(import.meta.url);

const CHECK = process.argv.includes('--check');
const OUT = 'public/marks/ascii';
const C = JSON.parse(readFileSync(join(ROOT, 'scripts/build/ascii-header.json'), 'utf8'));
const S = C.samples;

/* ---------- outlines as polygons ---------- */

/** Flattens a cubic or quadratic segment from p0 into the polygon, 16 steps. */
function curve(poly, p0, ctrl, end) {
  for (let i = 1; i <= 16; i++) {
    const t = i / 16;
    const u = 1 - t;
    if (ctrl.length === 2) {
      const [a, b] = ctrl;
      poly.push([u * u * u * p0[0] + 3 * u * u * t * a[0] + 3 * u * t * t * b[0] + t * t * t * end[0], u * u * u * p0[1] + 3 * u * u * t * a[1] + 3 * u * t * t * b[1] + t * t * t * end[1]]);
    } else {
      const [a] = ctrl;
      poly.push([u * u * p0[0] + 2 * u * t * a[0] + t * t * end[0], u * u * p0[1] + 2 * u * t * a[1] + t * t * end[1]]);
    }
  }
}

/** The contours of an SVG path of absolute M, L, H, V, C, Q and Z, mapped through `map`. */
function svgContours(d, map) {
  const tokens = d.match(/[A-Za-z]|-?\d*\.?\d+(?:e-?\d+)?/g);
  const contours = [];
  let poly = null;
  let p = [0, 0];
  let cmd = '';
  let i = 0;
  const num = () => Number(tokens[i++]);
  while (i < tokens.length) {
    if (/[A-Za-z]/.test(tokens[i])) cmd = tokens[i++];
    if (cmd !== cmd.toUpperCase()) throw new Error(`ascii-header: relative command ${cmd} in the globe's path`);
    if (cmd === 'Z') {
      poly = null;
      continue;
    }
    if (cmd === 'M') {
      p = [num(), num()];
      poly = [p];
      contours.push(poly);
      cmd = 'L';
    } else if (cmd === 'L') {
      p = [num(), num()];
      poly.push(p);
    } else if (cmd === 'H') {
      p = [num(), p[1]];
      poly.push(p);
    } else if (cmd === 'V') {
      p = [p[0], num()];
      poly.push(p);
    } else if (cmd === 'C') {
      const a = [num(), num()];
      const b = [num(), num()];
      const e = [num(), num()];
      curve(poly, p, [a, b], e);
      p = e;
    } else if (cmd === 'Q') {
      const a = [num(), num()];
      const e = [num(), num()];
      curve(poly, p, [a], e);
      p = e;
    } else throw new Error(`ascii-header: command ${cmd} in the globe's path`);
  }
  return contours.map((c) => c.map(map));
}

/** The contours of a fontkit path, mapped through `map`. */
function glyphContours(path, map) {
  const contours = [];
  let poly = null;
  let p = [0, 0];
  for (const { command, args } of path.commands) {
    if (command === 'moveTo') {
      p = [args[0], args[1]];
      poly = [p];
      contours.push(poly);
    } else if (command === 'lineTo') {
      p = [args[0], args[1]];
      poly.push(p);
    } else if (command === 'bezierCurveTo') {
      const e = [args[4], args[5]];
      curve(poly, p, [[args[0], args[1]], [args[2], args[3]]], e);
      p = e;
    } else if (command === 'quadraticCurveTo') {
      const e = [args[2], args[3]];
      curve(poly, p, [[args[0], args[1]]], e);
      p = e;
    }
  }
  return contours.map((c) => c.map(map));
}

/** A shape: its contours and their bounding box, for the nonzero test. */
function shape(contours) {
  const xs = contours.flat().map((q) => q[0]);
  const ys = contours.flat().map((q) => q[1]);
  return { contours, box: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)] };
}

/** True when (x, y) is inside the shape by the nonzero rule. */
function inside(sh, x, y) {
  const [x0, y0, x1, y1] = sh.box;
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  let wind = 0;
  for (const poly of sh.contours) {
    for (let k = 0, n = poly.length; k < n; k++) {
      const [ax, ay] = poly[k];
      const [bx, by] = poly[(k + 1) % n];
      if (ay <= y) {
        if (by > y && (bx - ax) * (y - ay) - (x - ax) * (by - ay) > 0) wind++;
      } else if (by <= y && (bx - ax) * (y - ay) - (x - ax) * (by - ay) < 0) wind--;
    }
  }
  return wind !== 0;
}

/* ---------- layout, in dots ---------- */

const M = C.margin;
const N = C.name;
const capTop0 = M + (C.mark.size - (N.lineGap + N.cap)) / 2;

/* the globe: the logo's viewBox scaled to mark.size dots */
const logoSvg = readFileSync(join(ROOT, 'public/brand/gt-globe-logo.svg'), 'utf8');
const [vx, vy, vw] = logoSvg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
const logoD = logoSvg.match(/ d="([^"]+)"/)[1];
const k = C.mark.size / vw;
const globe = shape(svgContours(logoD, ([x, y]) => [M + (x - vx) * k, M + (y - vy) * k]));

/** The share of a cell's samples that `hit` accepts. */
function coverage(c, r, hit) {
  let n = 0;
  for (let j = 0; j < S; j++)
    for (let i = 0; i < S; i++) {
      if (hit(c + (i + 0.5) / S, r + (j + 0.5) / S)) n++;
    }
  return n / (S * S);
}

/* the name: Katagami Text, cap height name.cap dots, its baselines at whole dots */
const font = fontkit.openSync(join(ROOT, N.font));
const em = N.cap / font.capHeight;
const nameX = M + C.mark.size + N.gap;

/**
 * One glyph as dots, its origin at x = phase within column 0 and its
 * baseline at row `base`: the cells from its left ink to its right ink,
 * thickened across by name.spread, and how many cells it half covers.
 */
function glyphDots(g, phase, base, rows) {
  const sh = shape(glyphContours(g.path, ([x, y]) => [phase + x * em, base - y * em]));
  const hit = (x, y) => inside(sh, x, y) || inside(sh, x - N.spread, y) || inside(sh, x + N.spread, y);
  const c0 = Math.floor(sh.box[0] - N.spread);
  const c1 = Math.ceil(sh.box[2] + N.spread);
  const cells = [];
  let blur = 0;
  for (let r = 0; r < rows; r++)
    for (let c = c0; c < c1; c++) {
      const v = coverage(c, r, hit);
      blur += Math.min(v, 1 - v);
      if (v >= N.threshold) cells.push([c, r]);
    }
  return { cells, blur, left: Math.min(...cells.map((q) => q[0])), right: Math.max(...cells.map((q) => q[0])) };
}

/**
 * Each glyph is sampled at the phase (a quarter dot apart) that leaves the
 * fewest half covered cells, so a stem lands on whole dots, then placed on
 * a whole column at its pen position, pushed right where it would come
 * within name.space empty columns of the glyph before it.
 */
const nameCells = [];
N.lines.forEach((text, li) => {
  const base = capTop0 + N.cap + li * N.lineGap;
  const rows = Math.ceil(base + 4);
  const run = font.layout(text, ['kern']);
  let pen = 0;
  let line0 = null;
  let prevRight = -Infinity;
  run.glyphs.forEach((g, gi) => {
    const at = pen + run.positions[gi].xOffset;
    pen += run.positions[gi].xAdvance + N.trackingEm * font.unitsPerEm;
    if (!g.path.commands.length) return;
    const best = [0, 0.25, 0.5, 0.75].map((phase) => ({ phase, ...glyphDots(g, phase, base, rows) })).reduce((m, o) => (o.blur < m.blur - 1e-9 ? o : m));
    /* the line's first ink sits at nameX */
    if (line0 === null) line0 = nameX - best.left - (at * em - best.phase);
    let shift = Math.round(line0 + at * em - best.phase);
    if (shift + best.left <= prevRight + N.space) shift = prevRight + N.space + 1 - best.left;
    prevRight = shift + best.right;
    for (const [c, r] of best.cells) nameCells.push([c + shift, r]);
  });
});

const width = Math.max(...nameCells.map((q) => q[0])) + 1 + M;
const height = M * 2 + C.mark.size;

/* ---------- the grid ---------- */

const inGlobe = (x, y) => inside(globe, x, y);
const grid = [];
for (let r = 0; r < height; r++) {
  const row = [];
  for (let c = 0; c < width; c++) row.push(c < nameX - N.gap ? coverage(c, r, inGlobe) >= C.mark.threshold : false);
  grid.push(row);
}
for (const [c, r] of nameCells) grid[r][c] = true;

/* ---------- agreement with the reference ---------- */

if (C.reference.length) {
  const ref = C.reference;
  let same = 0;
  let total = 0;
  let markSame = 0;
  let markTotal = 0;
  for (let r = 0; r < ref.length; r++)
    for (let c = 0; c < ref[r].length; c++) {
      const want = ref[r][c] === '#';
      const got = grid[M + r]?.[M + c] ?? false;
      if (want || got) {
        total++;
        if (want === got) same++;
        if (c < C.mark.size) {
          markTotal++;
          if (want === got) markSame++;
        }
      }
    }
  console.log(`ascii-header: dots agree with the reference in ${same} of ${total} lit cells (${Math.round((100 * same) / total)}%), the globe in ${markSame} of ${markTotal} (${Math.round((100 * markSame) / markTotal)}%)`);
}

/* ---------- a grayscale PNG of the dots ---------- */

const hexGray = (hex) => parseInt(hex.slice(1, 3), 16);

const CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let i = 0; i < 8; i++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function chunk(type, data) {
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  let c = 0xffffffff;
  for (const b of body) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  const out = Buffer.alloc(body.length + 8);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE((c ^ 0xffffffff) >>> 0, body.length + 4);
  return out;
}

/** The dots at png.pitch pixels a dot, each pixel's share of its dot from a 4 by 4 sample, as an 8-bit grayscale PNG. */
function png(ground, ink) {
  const P = C.png.pitch;
  const w = width * P;
  const h = height * P;
  const cover = new Float32Array(w * h);
  const rad = (C.dot * P) / 2;
  for (const [c, r] of dots) {
    const cx = (c + 0.5) * P;
    const cy = (r + 0.5) * P;
    for (let y = Math.floor(cy - rad); y < Math.ceil(cy + rad); y++)
      for (let x = Math.floor(cx - rad); x < Math.ceil(cx + rad); x++) {
        let n = 0;
        for (let j = 0; j < 4; j++)
          for (let i = 0; i < 4; i++) {
            const dx = x + (i + 0.5) / 4 - cx;
            const dy = y + (j + 0.5) / 4 - cy;
            if (dx * dx + dy * dy <= rad * rad) n++;
          }
        cover[y * w + x] = Math.max(cover[y * w + x], n / 16);
      }
  }
  const raw = Buffer.alloc((w + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w + 1)] = 0;
    for (let x = 0; x < w; x++) raw[y * (w + 1) + 1 + x] = Math.round(ground + (ink - ground) * cover[y * w + x]);
  }
  const head = Buffer.alloc(13);
  head.writeUInt32BE(w, 0);
  head.writeUInt32BE(h, 4);
  head[8] = 8;
  head[9] = 0;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', head), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

/* ---------- outputs ---------- */

const dots = [];
grid.forEach((row, r) => row.forEach((on, c) => on && dots.push([c, r])));
const d = dots.map(([c, r]) => `M${c + 0.5} ${r + 0.5}h0`).join('');
const svg = (ground, ink) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="General Translation">` +
  (ground ? `<rect width="${width}" height="${height}" fill="${ground}"/>` : '') +
  `<path d="${d}" fill="none" stroke="${ink}" stroke-width="${C.dot}" stroke-linecap="round"/></svg>\n`;

const pairs = (top, bottom) => (top && bottom ? ':' : top ? "'" : bottom ? '.' : ' ');
const txt = [];
for (let r = 0; r < height; r += 2) {
  txt.push(grid[r].map((on, c) => pairs(on, grid[r + 1]?.[c] ?? false)).join('').trimEnd());
}
while (txt.length && !txt[0]) txt.shift();
while (txt.length && !txt[txt.length - 1]) txt.pop();
const indent = Math.min(...txt.filter(Boolean).map((l) => l.match(/^ */)[0].length));

const files = {
  'gt-ascii-header.svg': svg(null, 'currentColor'),
  'gt-ascii-header-dark.svg': svg(C.ground.dark, C.ground.light),
  'gt-ascii-header-light.svg': svg(C.ground.light, C.ground.dark),
  'gt-ascii-header.txt': `${txt.map((l) => l.slice(indent)).join('\n')}\n`,
};
const P = C.png.pitch;
files['gt-ascii-header-dark.png'] = png(hexGray(C.ground.dark), hexGray(C.ground.light));
files['gt-ascii-header-light.png'] = png(hexGray(C.ground.light), hexGray(C.ground.dark));

let stale = 0;
if (!CHECK) mkdirSync(join(ROOT, OUT), { recursive: true });
for (const [name, body] of Object.entries(files)) {
  const file = join(ROOT, OUT, name);
  if (CHECK) {
    if (!existsSync(file) || !readFileSync(file).equals(Buffer.from(body))) {
      console.error(`ascii-header: ${OUT}/${name} differs from what build:ascii-header writes`);
      stale++;
    }
    continue;
  }
  writeFileSync(file, body);
}
if (CHECK) process.exit(stale ? 1 : 0);
console.log(`ascii-header: wrote ${Object.keys(files).length} files to ${OUT}: ${width} by ${height} dots, ${dots.length} dots`);
