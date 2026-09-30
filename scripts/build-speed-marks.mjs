// Builds the speed marks under public/marks: the race-type set for General
// Translation (wide letters, a forward slant, one horizontal cut through the
// letters, speed bars into the first letter), every file one color in
// currentColor with a tight viewBox, so the marks page inlines them and the
// deck embeds them.
//
//   bar-monogram.svg            GT from ten rectangles under a 12 degree skew,
//                               the G's stem combed into three speed bars, one
//                               8-unit cut through both letters; the cut is
//                               applied to the geometry, so the file is plain
//                               polygons with no mask and no id
//   bar-monogram-lockup.svg     the monogram over the name in Michroma,
//                               letter-spaced to the monogram's width
//   bar-monogram-dithered.svg   the monogram rasterised to square cells and
//                               printed through the 8 by 8 Bayer screen against
//                               a density that is 1 across the left third and
//                               falls to a floor at the right edge; one path of
//                               unit squares in cell units
//   bar-monogram-ascii.svg/.txt the same grid at a monospace cell's aspect,
//                               one @ per printed cell
//   plate-inverted.svg          GT in Orbitron cut out of a slanted plate with
//                               a hazard-striped end; one evenodd path
//   double-cut.svg              GENERAL TRANSLATION in Anybody at width 150,
//                               black, upright, with two thin cuts (a mask)
//   livery-stack.svg            GENERAL over TRANSLATION in Anybody italics,
//                               a cut through each line and one slash across
//                               both (a mask)
//
// The faces are the static instances scripts/fetch-google-faces.py stores under
// public/fonts/google (Michroma 400, Orbitron 900, Anybody at width 150 in
// 900, 900 italic and 500 italic); fontkit turns the strings into outlines, so
// the site never loads these fonts. Usage: pnpm build:marks
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as fontkit from 'fontkit';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FONTS = join(ROOT, 'public/fonts/google');
const OUT = join(ROOT, 'public/marks');
mkdirSync(OUT, { recursive: true });

const SVG_NS = 'http://www.w3.org/2000/svg';
const round = (n) => (Math.round(n * 10) / 10).toString().replace(/\.0$/, '');
/* rounds every number in a path or points string to one decimal */
const tidy = (s) => s.replace(/-?\d+(?:\.\d+)?(?:e-?\d+)?/g, (m) => round(Number(m)));
const svg = (viewBox, label, inner, extra = '') =>
  `<svg xmlns="${SVG_NS}" viewBox="${viewBox}" fill="currentColor" role="img" aria-label="${label}"${extra}>${inner}</svg>\n`;
const write = (name, text) => {
  writeFileSync(join(OUT, name), text);
  console.log(`${name.padEnd(30)} ${String(Buffer.byteLength(text)).padStart(7)} B`);
};

/* ---------- type ---------- */

const faces = {
  michroma: fontkit.openSync(join(FONTS, 'michroma-400.woff2')),
  orbitron: fontkit.openSync(join(FONTS, 'orbitron-900.woff2')),
  anybody: fontkit.openSync(join(FONTS, 'anybody-150-900.woff2')),
  anybodyItalic: fontkit.openSync(join(FONTS, 'anybody-150-900-italic.woff2')),
  anybodyItalicMedium: fontkit.openSync(join(FONTS, 'anybody-150-500-italic.woff2')),
};

/**
 * A string as outlines: the path data with the baseline at y and the first
 * glyph's origin at x, the advance width (letter spacing included), the cap
 * height in the same units and the union bbox of the glyph outlines.
 */
function type(font, text, size, { x = 0, y = 0, spacing = 0 } = {}) {
  const k = size / font.unitsPerEm;
  const run = font.layout(text);
  let pen = x;
  const parts = [];
  const box = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  run.glyphs.forEach((glyph, i) => {
    const pos = run.positions[i];
    const path = glyph.path.scale(k, -k).translate(pen + pos.xOffset * k, y - pos.yOffset * k);
    const d = path.toSVG();
    if (d) {
      parts.push(d);
      const b = path.bbox;
      box.minX = Math.min(box.minX, b.minX);
      box.minY = Math.min(box.minY, b.minY);
      box.maxX = Math.max(box.maxX, b.maxX);
      box.maxY = Math.max(box.maxY, b.maxY);
    }
    pen += pos.xAdvance * k + spacing;
  });
  return { d: tidy(parts.join('')), width: pen - x - spacing, cap: font.capHeight * k, box };
}

/* ---------- the bar monogram ---------- */

const SKEW = Math.tan((12 * Math.PI) / 180);
/* the ten rectangles, in the upright space: x, y, w, h; the speed bars overlap the stem by two units */
const MONOGRAM_RECTS = [
  [0, 40, 30, 120], // G stem
  [0, 40, 190, 30], // G top
  [0, 130, 190, 30], // G bottom
  [160, 100, 30, 60], // G right stem
  [100, 100, 90, 30], // G chin
  [-20, 40, 22, 30], // bar, top
  [-80, 82, 82, 36], // bar, middle
  [-50, 130, 52, 30], // bar, bottom
  [225, 40, 170, 30], // T crossbar
  [283, 40, 34, 120], // T stem
];
const CUT = [96, 104];

/* a rectangle under the skew, minus the cut: one or two parallelograms as path data */
function skewedPieces([x, y, w, h]) {
  const spans = [
    [y, Math.min(y + h, CUT[0])],
    [Math.max(y, CUT[1]), y + h],
  ].filter(([a, b]) => b > a);
  return spans
    .map(([y1, y2]) => {
      const p = [
        [x - SKEW * y1, y1],
        [x + w - SKEW * y1, y1],
        [x + w - SKEW * y2, y2],
        [x - SKEW * y2, y2],
      ];
      return 'M' + p.map(([px, py]) => `${round(px)} ${round(py)}`).join('L') + 'Z';
    })
    .join('');
}
const MONOGRAM_D = MONOGRAM_RECTS.map(skewedPieces).join('');
/* the outline's box in the skewed space: the middle bar's tail is the left edge, the crossbar's end the right */
const MONO = { x: -80 - SKEW * 118, y: 40, right: 395 - SKEW * 40, bottom: 160 };
MONO.w = MONO.right - MONO.x;
MONO.h = MONO.bottom - MONO.y;
MONO.cx = MONO.x + MONO.w / 2;

write(
  'bar-monogram.svg',
  svg(
    `${round(MONO.x - 4)} ${MONO.y - 4} ${round(MONO.w + 8)} ${MONO.h + 8}`,
    'The bar monogram: GT with the G combed into speed bars and one cut through both letters',
    `<path d="${MONOGRAM_D}"/>`
  )
);

/* ---------- the lockup: the name under the monogram, letter-spaced to its width ---------- */

{
  const size = 24;
  const gap = 46;
  const baseline = MONO.bottom + gap + faces.michroma.capHeight * (size / faces.michroma.unitsPerEm);
  const plain = type(faces.michroma, 'GENERAL TRANSLATION', size);
  const gaps = 'GENERAL TRANSLATION'.length - 1;
  const spacing = Math.max(0, (MONO.w - plain.width) / gaps);
  const spaced = type(faces.michroma, 'GENERAL TRANSLATION', size, { spacing });
  const name = type(faces.michroma, 'GENERAL TRANSLATION', size, { x: MONO.cx - spaced.width / 2, y: baseline, spacing });
  write(
    'bar-monogram-lockup.svg',
    svg(
      `${round(MONO.x - 4)} ${MONO.y - 4} ${round(MONO.w + 8)} ${round(baseline - MONO.y + 12)}`,
      'The bar monogram over the name General Translation, letter-spaced to the monogram width',
      `<path d="${MONOGRAM_D}"/><path d="${name.d}"/>`
    )
  );
}

/* ---------- the monogram through the screen: cells and characters ---------- */

const BAYER = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

/* whether a point of the skewed space lies in the monogram: inside a rectangle in the upright space and off the cut */
function inMonogram(px, py) {
  if (py >= CUT[0] && py < CUT[1]) return false;
  const ux = px + SKEW * py;
  return MONOGRAM_RECTS.some(([x, y, w, h]) => ux >= x && ux < x + w && py >= y && py < y + h);
}

/* the share of a grid cell inside the monogram, 4 by 4 samples per cell; cellW by cellH in mark units */
function coverage(cols, rows, cellW, cellH) {
  const out = new Float32Array(cols * rows);
  const S = 4;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let hit = 0;
      for (let sy = 0; sy < S; sy++) {
        for (let sx = 0; sx < S; sx++) {
          const px = MONO.x + (c + (sx + 0.5) / S) * cellW;
          const py = MONO.y + (r + (sy + 0.5) / S) * cellH;
          if (inMonogram(px, py)) hit++;
        }
      }
      out[r * cols + c] = hit / (S * S);
    }
  }
  return out;
}

/* density 1 across the first third of the width, then a straight fall to the floor at the right edge */
function density(c, cols, floor) {
  const t = Math.min(1, Math.max(0, (c / (cols - 1) - 0.33) / 0.67));
  return 1 - t * (1 - floor);
}
const lit = (cover, dens, c, r) => cover > 0.5 && dens > (BAYER[r % 8][c % 8] + 0.5) / 64;

{
  const cols = 240;
  const cellW = MONO.w / cols;
  const rows = Math.round(MONO.h / cellW);
  const cellH = MONO.h / rows;
  const cover = coverage(cols, rows, cellW, cellH);
  let d = '';
  let count = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (lit(cover[r * cols + c], density(c, cols, 0.18), c, r)) {
        d += `M${c} ${r}h1v1h-1z`;
        count++;
      }
    }
  }
  write(
    'bar-monogram-dithered.svg',
    svg(
      `0 0 ${cols} ${rows}`,
      'The bar monogram printed as dither cells, solid at the left and thinning to the right',
      `<path d="${d}"/>`,
      ' shape-rendering="crispEdges"'
    )
  );
  console.log(`  dithered: ${cols} by ${rows} cells, ${count} printed`);
}

{
  const cols = 160;
  const charAspect = 0.6;
  const cellW = MONO.w / cols;
  const cellH = cellW / charAspect;
  const rows = Math.round(MONO.h / cellH);
  const cover = coverage(cols, rows, cellW, MONO.h / rows);
  const lines = [];
  for (let r = 0; r < rows; r++) {
    let line = '';
    for (let c = 0; c < cols; c++) line += lit(cover[r * cols + c], density(c, cols, 0.18), c, r) ? '@' : ' ';
    lines.push(line);
  }
  const text = lines.map((l) => l.replace(/\s+$/, '')).join('\n') + '\n';
  write('bar-monogram-ascii.txt', text);
  /* the characters as SVG text: a 10 unit line, a 6 unit cell, the line forced to the grid width whatever monospace face draws it */
  const unit = 10;
  const w = cols * unit * charAspect;
  const h = rows * unit;
  const tspans = lines
    .map((l, i) => `<tspan x="0" y="${(i + 0.8) * unit}" textLength="${w}" lengthAdjust="spacing">${l.replace(/ /g, ' ')}</tspan>`)
    .join('');
  write(
    'bar-monogram-ascii.svg',
    svg(
      `0 0 ${w} ${h}`,
      'The bar monogram as at signs, solid at the left and dithering away to the right',
      `<text font-family="ui-monospace, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace" font-size="${unit}" xml:space="preserve">${tspans}</text>`
    )
  );
  console.log(`  ascii: ${cols} columns, ${rows} lines`);
}

/* ---------- the plate: GT cut out of a slanted plate with a hazard end ---------- */

{
  const W = 320;
  const H = 120;
  const R = 12;
  const K = Math.tan((14 * Math.PI) / 180);
  const skew = ([x, y]) => [x - K * y + K * H, y]; // the skew about the plate's bottom edge, so x stays positive
  /* the plate outline as points, the corners in twelve steps each */
  const corner = (cx, cy, from) => {
    const pts = [];
    for (let i = 0; i <= 12; i++) {
      const a = from + (i / 12) * (Math.PI / 2);
      pts.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]);
    }
    return pts;
  };
  const plate = [
    ...corner(W - R, R, -Math.PI / 2),
    ...corner(W - R, H - R, 0),
    ...corner(R, H - R, Math.PI / 2),
    ...corner(R, R, Math.PI),
  ];
  /* Sutherland-Hodgman against the convex plate polygon */
  const clip = (subject, poly) => {
    let output = subject;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i];
      const b = poly[(i + 1) % poly.length];
      const input = output;
      output = [];
      const inside = ([x, y]) => (b[0] - a[0]) * (y - a[1]) - (b[1] - a[1]) * (x - a[0]) >= 0;
      const meet = (p, q) => {
        const d1 = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
        const d2 = (b[0] - a[0]) * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0]);
        const t = d1 / (d1 - d2);
        return [p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])];
      };
      for (let j = 0; j < input.length; j++) {
        const p = input[j];
        const q = input[(j + 1) % input.length];
        if (inside(q)) {
          if (!inside(p)) output.push(meet(p, q));
          output.push(q);
        } else if (inside(p)) output.push(meet(p, q));
      }
      if (output.length === 0) return [];
    }
    return output;
  };
  /* the plate's winding is clockwise in screen space; the clip wants the same orientation as the edge test above */
  const orient = (poly) => {
    let area = 0;
    for (let i = 0; i < poly.length; i++) {
      const [x1, y1] = poly[i];
      const [x2, y2] = poly[(i + 1) % poly.length];
      area += x1 * y2 - x2 * y1;
    }
    return area >= 0 ? poly : [...poly].reverse();
  };
  const plateCcw = orient(plate);
  /* the hazard band: bars 9 wide on an 18 period, rotated 35 degrees, over the right 74 units of the plate */
  const band = [
    [246, 0],
    [W, 0],
    [W, H],
    [246, H],
  ];
  const stripes = [];
  const ang = (-35 * Math.PI) / 180;
  const dx = Math.cos(ang);
  const dy = Math.sin(ang);
  for (let n = -12; n <= 24; n++) {
    const s = n * 18;
    /* a bar along the direction (dx, dy) rotated by 90 degrees: the bar runs along (-dy, dx) */
    const ox = 283 + s * dx;
    const oy = 60 + s * dy;
    const len = 200;
    const bar = [
      [ox - dy * len, oy + dx * len],
      [ox + dy * len, oy - dx * len],
      [ox + dy * len + dx * 9, oy - dx * len + dy * 9],
      [ox - dy * len + dx * 9, oy + dx * len + dy * 9],
    ];
    const inBand = clip(orient(bar), orient(band));
    if (inBand.length < 3) continue;
    const inPlate = clip(orient(inBand), plateCcw);
    if (inPlate.length >= 3) stripes.push(inPlate);
  }
  const poly = (pts) => 'M' + pts.map(([x, y]) => `${round(x)} ${round(y)}`).join('L') + 'Z';
  const skewed = (pts) => pts.map(skew);
  const gt = type(faces.orbitron, 'GT', 90, { x: 30, y: 92 });
  /* the letters under the same skew: the outlines are drawn under a matrix rather than re-pointed, so the mask holds
     them; the plate carries the stripes as holes of one evenodd path, and the mask cuts the letters out of it */
  const m = `matrix(1 0 ${round(-K)} 1 ${round(K * H)} 0)`;
  const maskId = 'sm-plate-cut';
  const mx = -20;
  const my = -20;
  const mw = W + K * H + 40;
  const mh = H + 40;
  const body =
    `<defs><mask id="${maskId}" maskUnits="userSpaceOnUse" x="${mx}" y="${my}" width="${round(mw)}" height="${mh}">` +
    `<rect x="${mx}" y="${my}" width="${round(mw)}" height="${mh}" fill="#fff"/>` +
    `<path transform="${m}" d="${gt.d}" fill="#000"/></mask></defs>` +
    `<g mask="url(#${maskId})"><path fill-rule="evenodd" d="${poly(skewed(plate))}${stripes.map((s) => poly(skewed(s))).join('')}"/></g>`;
  write(
    'plate-inverted.svg',
    svg(`-4 -6 ${round(W + K * H + 8)} ${H + 12}`, 'GT cut out of a slanted plate with a hazard-striped end', body)
  );
}

/* ---------- the double cut: the name wide and upright, two thin cuts ---------- */

{
  const size = 100;
  const name = type(faces.anybody, 'GENERAL TRANSLATION', size, { x: 0, y: 0 });
  const cap = name.cap;
  const cutH = cap * 0.07;
  const cuts = [0.4, 0.6].map((f) => -cap + cap * f);
  const b = name.box;
  const view = `${round(b.minX - 4)} ${round(b.minY - 4)} ${round(b.maxX - b.minX + 8)} ${round(b.maxY - b.minY + 8)}`;
  const maskId = 'sm-double-cut';
  const body =
    `<defs><mask id="${maskId}" maskUnits="userSpaceOnUse" x="${round(b.minX - 20)}" y="${round(b.minY - 20)}" width="${round(b.maxX - b.minX + 40)}" height="${round(b.maxY - b.minY + 40)}">` +
    `<rect x="${round(b.minX - 20)}" y="${round(b.minY - 20)}" width="${round(b.maxX - b.minX + 40)}" height="${round(b.maxY - b.minY + 40)}" fill="#fff"/>` +
    cuts.map((y) => `<rect x="${round(b.minX - 20)}" y="${round(y - cutH / 2)}" width="${round(b.maxX - b.minX + 40)}" height="${round(cutH)}" fill="#000"/>`).join('') +
    `</mask></defs><path mask="url(#${maskId})" d="${name.d}"/>`;
  write('double-cut.svg', svg(view, 'GENERAL TRANSLATION in a wide upright black face with two thin cuts through the line', body));
}

/* ---------- the livery stack: two italic lines to one width, a cut through each and a slash across both ---------- */

{
  const size1 = 150;
  const line1 = type(faces.anybodyItalic, 'GENERAL', size1, { x: 0, y: 0 });
  const spacing2 = 2;
  const probe = type(faces.anybodyItalicMedium, 'TRANSLATION', 100, { spacing: 0 });
  /* the second line's size so its width, with its spacing, matches the first */
  const gaps = 'TRANSLATION'.length - 1;
  const size2 = ((line1.width - spacing2 * gaps) / probe.width) * 100;
  const gap = 40;
  const y2 = faces.anybodyItalicMedium.capHeight * (size2 / faces.anybodyItalicMedium.unitsPerEm) + gap;
  const line2 = type(faces.anybodyItalicMedium, 'TRANSLATION', size2, { x: 0, y: y2, spacing: spacing2 });
  const minX = Math.min(line1.box.minX, line2.box.minX);
  const maxX = Math.max(line1.box.maxX, line2.box.maxX);
  const minY = Math.min(line1.box.minY, line2.box.minY);
  const maxY = Math.max(line1.box.maxY, line2.box.maxY);
  const cut1 = { y: -line1.cap / 2, h: line1.cap * 0.053 };
  const cut2 = { y: y2 - line2.cap / 2, h: line2.cap * 0.07 };
  const slashX = minX + (maxX - minX) * 0.57;
  const slashK = Math.tan((22 * Math.PI) / 180);
  const slashW = 9;
  const top = minY - 20;
  const bottom = maxY + 20;
  const slash = `M${round(slashX - slashK * top)} ${round(top)}L${round(slashX - slashK * top + slashW)} ${round(top)}L${round(slashX - slashK * bottom + slashW)} ${round(bottom)}L${round(slashX - slashK * bottom)} ${round(bottom)}Z`;
  const maskId = 'sm-livery-cut';
  const mx = round(minX - 20);
  const my = round(minY - 20);
  const mw = round(maxX - minX + 40);
  const mh = round(maxY - minY + 40);
  const body =
    `<defs><mask id="${maskId}" maskUnits="userSpaceOnUse" x="${mx}" y="${my}" width="${mw}" height="${mh}">` +
    `<rect x="${mx}" y="${my}" width="${mw}" height="${mh}" fill="#fff"/>` +
    `<rect x="${mx}" y="${round(cut1.y - cut1.h / 2)}" width="${mw}" height="${round(cut1.h)}" fill="#000"/>` +
    `<rect x="${mx}" y="${round(cut2.y - cut2.h / 2)}" width="${mw}" height="${round(cut2.h)}" fill="#000"/>` +
    `<path d="${slash}" fill="#000"/></mask></defs>` +
    `<g mask="url(#${maskId})"><path d="${line1.d}"/><path d="${line2.d}"/></g>`;
  const view = `${round(minX - 4)} ${round(minY - 4)} ${round(maxX - minX + 8)} ${round(maxY - minY + 8)}`;
  write('livery-stack.svg', svg(view, 'GENERAL over TRANSLATION in a wide black italic, one cut through each line and one slash across both', body));
  console.log(`  livery: line 2 at size ${round(size2)}`);
}
