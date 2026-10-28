// Tests for src/lib/vote/mark-file.ts: an uploaded SVG loses scripts,
// handlers, foreignObject and outside references, its background rect and
// its colors, keeps near-white knockouts as holes, and gets a viewBox cut to
// its ink; a PNG must decode and have a fully transparent pixel, through
// every filter, bit depth and interlacing. Loaded through Node's type
// stripping.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { deflateSync } from 'node:zlib';

import { importTs } from '../lint/seo.mjs';

const { checkPng, detectKind, normalizeSvg, parsePath, toneOf } = await importTs(new URL('../../src/lib/vote/mark-file.ts', import.meta.url));

const svg = (body, attrs = 'viewBox="0 0 100 100"') => `<svg xmlns="http://www.w3.org/2000/svg" ${attrs}>${body}</svg>`;
const viewBoxOf = (out) => /viewBox="([^"]+)"/.exec(out.svg)?.[1];

test('scripts, handlers, foreignObject, text and outside references are removed', () => {
  const out = normalizeSvg(
    svg(
      '<script>alert(1)</script><rect x="10" y="10" width="20" height="20" onclick="alert(1)" fill="red"/>' +
        '<foreignObject><div>x</div></foreignObject><text x="0" y="0">Name</text><title>Name</title>' +
        '<use href="https://example.com/a.svg#x"/><image href="data:image/png;base64,AAAA"/>' +
        '<path d="M40 40h10v10z" fill="url(https://example.com/x)" style="fill:blue"/>'
    )
  );
  assert.ok(!('error' in out));
  for (const banned of ['script', 'onclick', 'foreignObject', 'text', 'title', 'Name', 'image', 'example.com', 'alert']) {
    assert.ok(!out.svg.includes(banned), banned);
  }
});

test('one ink: every fill and stroke becomes black, and the background rect goes', () => {
  const out = normalizeSvg(svg('<rect width="100" height="100" fill="#fff"/><circle cx="50" cy="50" r="20" fill="#e5352b" stroke="#00f" stroke-width="0"/>'));
  assert.equal(out.mode, 'flat');
  assert.ok(!out.svg.includes('<rect'));
  assert.match(out.svg, /<circle[^>]*fill="#000"/);
  assert.ok(!/#e5352b|#00f|#fff/.test(out.svg));
  assert.equal(viewBoxOf(out), '30 30 40 40');
});

test('a dark background behind a white mark goes, and the mark becomes the ink', () => {
  const out = normalizeSvg(svg('<rect width="100" height="100" fill="#111"/><path d="M20 20h30v30h-30z" fill="#fff"/>'));
  assert.equal(out.mode, 'flat');
  assert.ok(!out.svg.includes('<rect'));
  assert.match(out.svg, /<path[^>]*fill="#000"/);
  assert.equal(viewBoxOf(out), '20 20 30 30');
});

test('white shapes over dark ones stay holes through an internal mask', () => {
  const out = normalizeSvg(svg('<rect x="10" y="10" width="80" height="80" fill="#000"/><circle cx="50" cy="50" r="20" fill="white"/>'));
  assert.equal(out.mode, 'mask');
  assert.match(out.svg, /<mask id="pt-ink" maskUnits="userSpaceOnUse"/);
  assert.match(out.svg, /<rect x="10" y="10" width="80" height="80" fill="#fff" stroke="none"\/>/);
  assert.match(out.svg, /<circle[^>]*fill="#000"/);
  assert.match(out.svg, /fill="#000" mask="url\(#pt-ink\)"/);
  assert.equal(viewBoxOf(out), '10 10 80 80');
});

test('class rules and style attributes are inlined before the colors go', () => {
  const out = normalizeSvg(
    svg('<defs><style><![CDATA[.ring{fill:none;stroke:#333;stroke-width:4px}]]></style></defs><circle class="ring" cx="50" cy="50" r="30" stroke-linejoin="round"/><circle cx="50" cy="50" r="5" style="fill:#222"/>')
  );
  assert.match(out.svg, /<circle cx="50" cy="50" r="30"[^>]*fill="none" stroke="#000"/);
  assert.match(out.svg, /stroke-width="4px"/);
  assert.ok(!out.svg.includes('class='));
  assert.ok(!out.svg.includes('style'));
  /* the ring's stroke of 4 pads its box by 2 */
  assert.equal(viewBoxOf(out), '18 18 64 64');
});

test('transforms, arcs and cubic curves are measured exactly', () => {
  const moved = normalizeSvg(svg('<g transform="translate(10 20) scale(2)"><rect width="5" height="5"/></g>'));
  assert.equal(viewBoxOf(moved), '10 20 10 10');
  const arc = normalizeSvg(svg('<path d="M0 0 A10 10 0 0 1 20 0z"/>', 'viewBox="-50 -50 100 100"'));
  assert.equal(viewBoxOf(arc), '0 -10 20 10');
  const curve = normalizeSvg(svg('<path d="M0 0 C0 -10 10 -10 10 0z"/>', 'viewBox="-50 -50 100 100"'));
  assert.equal(viewBoxOf(curve), '0 -7.5 10 7.5');
  const rotated = normalizeSvg(svg('<rect x="-5" y="-5" width="10" height="10" transform="rotate(45)"/>', 'viewBox="-50 -50 100 100"'));
  const [x, , w] = viewBoxOf(rotated).split(' ').map(Number);
  assert.ok(Math.abs(x + 7.0711) < 0.01 && Math.abs(w - 14.1421) < 0.02, viewBoxOf(rotated));
});

test('strokes count to the last pixel: miter tips, round joins, bevels past the limit', () => {
  const chevron = (extra) => normalizeSvg(svg(`<polyline points="110,60 140,100 170,60" fill="none" stroke="#111" stroke-width="6" ${extra}/>`, 'viewBox="0 0 200 200"'));
  /* the 73.7 degree corner reaches 3 / sin(36.87) = 5 below its vertex */
  assert.equal(viewBoxOf(chevron('stroke-miterlimit="10"')), '107.6 58.2 64.8 46.8');
  assert.equal(viewBoxOf(chevron('stroke-linejoin="round"')), '107.6 58.2 64.8 44.8');
  assert.equal(viewBoxOf(chevron('stroke-miterlimit="1.5"')), '107.6 58.2 64.8 43.6');
});

test('caps: butt ends flat, round and square reach half a width past the end', () => {
  const line = (cap) => viewBoxOf(normalizeSvg(svg(`<line x1="0" y1="0" x2="10" y2="0" stroke="#000" stroke-width="2" stroke-linecap="${cap}"/>`)));
  assert.equal(line('butt'), '0 -1 10 2');
  assert.equal(line('round'), '-1 -1 12 2');
  assert.equal(line('square'), '-1 -1 12 2');
});

test('a smooth stroked curve pads by half its width, with no miter at a tangent joint', () => {
  const out = normalizeSvg(
    '<svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#c0)">' +
      '<path d="M10 5H40V35H10Z" fill="#0A0A0A"/><path d="M50 10C50 7 55 5 60 5C70 5 70 35 60 35" stroke="#0A0A0A" stroke-width="4" stroke-linecap="round"/>' +
      '</g><defs><clipPath id="c0"><rect width="120" height="40" fill="white"/></clipPath></defs></svg>'
  );
  assert.equal(viewBoxOf(out), '10 3 59.5 34');
  assert.match(out.svg, /<path d="M10 5H40V35H10Z" fill="#000" stroke="none"\/>/);
});

test('a clip path cuts the measured box', () => {
  const out = normalizeSvg(svg('<defs><clipPath id="c"><rect x="0" y="0" width="50" height="100"/></clipPath></defs><g clip-path="url(#c)"><rect x="20" y="20" width="60" height="60"/></g>'));
  assert.equal(viewBoxOf(out), '20 20 30 60');
});

test('hidden and transparent shapes do not count', () => {
  const out = normalizeSvg(svg('<rect x="0" y="0" width="5" height="5" opacity="0"/><rect x="0" y="90" width="5" height="5" fill-opacity="0"/><rect x="90" y="0" width="5" height="5" display="none"/><rect x="40" y="40" width="10" height="10"/>'));
  assert.equal(viewBoxOf(out), '40 40 10 10');
});

test('a use element keeps the canvas and still draws one ink', () => {
  const out = normalizeSvg(svg('<defs><path id="p" d="M0 0h10v10z" fill="red"/></defs><use href="#p" x="5"/><use xlink:href="#p" y="5"/>'));
  assert.equal(out.tight, false);
  assert.equal(viewBoxOf(out), '0 0 100 100');
  assert.match(out.svg, /<use href="#p"/);
  assert.ok(!out.svg.includes('red'));
});

test('a doctype with entities and a switch wrapper are handled', () => {
  const source = '<?xml version="1.0"?><!DOCTYPE svg [<!ENTITY ns "http://example.com/">]>' + svg('<switch><foreignObject requiredExtensions="&ns;"/><g><rect x="1" y="2" width="3" height="4"/></g></switch>');
  const out = normalizeSvg(source);
  assert.equal(viewBoxOf(out), '1 2 3 4');
  assert.ok(!out.svg.includes('example.com'));
});

test('unreadable files and empty drawings are refused', () => {
  assert.ok('error' in normalizeSvg('<html><body>x</body></html>'));
  assert.ok('error' in normalizeSvg('<svg><rect width="1" height="1"/>'));
  assert.ok('error' in normalizeSvg(svg('<rect width="10" height="10"/>', '')));
  assert.ok('error' in normalizeSvg(svg('<rect width="10" height="10" fill="none"/>')));
  assert.ok('error' in normalizeSvg(svg('') + svg('')));
});

test('a lone background-sized rect is the mark itself, not a background', () => {
  const out = normalizeSvg(svg('<rect width="100" height="100"/>'));
  assert.ok(!('error' in out));
  assert.equal(viewBoxOf(out), '0 0 100 100');
});

test('paints classify by lightness', () => {
  assert.equal(toneOf('#000'), 'ink');
  assert.equal(toneOf('#ffd400'), 'ink');
  assert.equal(toneOf('currentColor'), 'ink');
  assert.equal(toneOf('url(#g)'), 'ink');
  assert.equal(toneOf('#fff'), 'hole');
  assert.equal(toneOf('rgb(250, 250, 250)'), 'hole');
  assert.equal(toneOf('none'), null);
  assert.equal(toneOf('#0000'), null);
});

test('path data with compact arcs and implicit commands parses', () => {
  const g = parsePath('M10,10l5-5.5.5.5a1 1 0 011 1z');
  assert.ok(g);
  assert.equal(parsePath('M0 0 L'), null);
  assert.equal(parsePath('10 10'), null);
});

/* a PNG from rows of samples (each row an array of byte values), every row
   under the filter `filters[y % filters.length]`; CRCs are zero, which the check ignores */
function png({ width, height, depth = 8, colorType, rows, filters = [0], interlaced = false, chunks = [], bpp = 1 }) {
  const bytes = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  const u32 = (n) => [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  const chunk = (type, data) => bytes.push(...u32(data.length), ...[...type].map((c) => c.charCodeAt(0)), ...data, 0, 0, 0, 0);
  chunk('IHDR', [...u32(width), ...u32(height), depth, colorType, 0, 0, interlaced ? 1 : 0]);
  for (const [type, data] of chunks) chunk(type, data);
  const raw = [];
  let above = null;
  rows.forEach((row, y) => {
    const kind = filters[y % filters.length];
    raw.push(kind, ...row.map((x, i) => (x - predict(kind, row, above, i, bpp) + 256) & 255));
    above = row;
  });
  chunk('IDAT', [...deflateSync(Buffer.from(raw))]);
  chunk('IEND', []);
  return new Uint8Array(bytes);
}

function predict(kind, row, above, i, bpp) {
  const a = i >= bpp ? row[i - bpp] : 0;
  const b = above ? above[i] : 0;
  const c = above && i >= bpp ? above[i - bpp] : 0;
  if (kind === 1) return a;
  if (kind === 2) return b;
  if (kind === 3) return (a + b) >> 1;
  if (kind === 4) {
    const p = a + b - c;
    const [pa, pb, pc] = [Math.abs(p - a), Math.abs(p - b), Math.abs(p - c)];
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
  }
  return 0;
}

/* a 4x3 RGBA image, opaque white but for the pixels listed as [x, y] */
function rgba(clear = []) {
  return Array.from({ length: 3 }, (_, y) =>
    Array.from({ length: 4 }, (_, x) => [255, 255, 255, clear.some(([cx, cy]) => cx === x && cy === y) ? 0 : 255]).flat()
  );
}

test('a PNG must have a fully transparent pixel, under every filter', () => {
  for (const filters of [[0], [1], [2], [3], [4], [0, 1, 2, 3, 4]]) {
    const clear = png({ width: 4, height: 3, colorType: 6, rows: rgba([[3, 2]]), filters, bpp: 4 });
    assert.equal(detectKind(clear), 'png');
    assert.equal(checkPng(clear), null, `filters ${filters}`);
    const opaque = png({ width: 4, height: 3, colorType: 6, rows: rgba(), filters, bpp: 4 });
    assert.match(checkPng(opaque), /transparent/, `filters ${filters}`);
  }
  /* an alpha channel that is opaque everywhere is the white-background export the check exists for */
  assert.match(checkPng(png({ width: 1, height: 1, colorType: 4, rows: [[0, 255]], bpp: 2 })), /transparent/);
  assert.equal(checkPng(png({ width: 1, height: 1, colorType: 4, rows: [[0, 0]], bpp: 2 })), null);
  assert.equal(checkPng(png({ width: 1, height: 1, depth: 16, colorType: 6, rows: [[0, 0, 0, 0, 0, 0, 0, 0]], bpp: 8 })), null);
  assert.match(checkPng(png({ width: 1, height: 1, depth: 16, colorType: 6, rows: [[0, 0, 0, 0, 0, 0, 0, 1]], bpp: 8 })), /transparent/);
});

test('a PNG without alpha counts its tRNS color as transparent', () => {
  /* a 1-bit palette: pixels 0 1 1 1 1 1 1 1 0 */
  const palette = (alphas) => png({ width: 9, height: 1, depth: 1, colorType: 3, rows: [[0b01111111, 0b00000000]], chunks: [['PLTE', [0, 0, 0, 255, 255, 255]], ['tRNS', alphas]] });
  assert.equal(checkPng(palette([0])), null);
  assert.equal(checkPng(palette([255, 0])), null);
  /* an index past the tRNS entries is opaque */
  assert.match(checkPng(palette([255])), /transparent/);
  assert.match(checkPng(palette([255, 128])), /transparent/);
  assert.match(checkPng(png({ width: 1, height: 1, colorType: 2, rows: [[1, 2, 3]], bpp: 3 })), /transparent/);
  assert.equal(checkPng(png({ width: 1, height: 1, colorType: 2, rows: [[1, 2, 3]], bpp: 3, chunks: [['tRNS', [0, 1, 0, 2, 0, 3]]] })), null);
  assert.match(checkPng(png({ width: 1, height: 1, colorType: 2, rows: [[1, 2, 4]], bpp: 3, chunks: [['tRNS', [0, 1, 0, 2, 0, 3]]] })), /transparent/);
  assert.equal(checkPng(png({ width: 2, height: 1, depth: 4, colorType: 0, rows: [[0x5a]], chunks: [['tRNS', [0, 0xa]]] })), null);
});

test('an interlaced PNG is read pass by pass', () => {
  /* 3x3 under Adam7, one scanline per entry: pass 1 holds (0,0), pass 4 (2,0),
     pass 5 (0,2) (2,2), pass 6 two lines of (1,0) and (1,2), pass 7 row 1; passes 2 and 3 are empty */
  const rows = (clearAt) =>
    [[[0, 0]], [[2, 0]], [[0, 2], [2, 2]], [[1, 0]], [[1, 2]], [[0, 1], [1, 1], [2, 1]]].map((line) =>
      line.flatMap(([x, y]) => [9, 9, 9, x === clearAt[0] && y === clearAt[1] ? 0 : 255])
    );
  assert.equal(checkPng(png({ width: 3, height: 3, colorType: 6, rows: rows([1, 2]), interlaced: true, bpp: 4 })), null);
  assert.match(checkPng(png({ width: 3, height: 3, colorType: 6, rows: rows([-1, -1]), interlaced: true, bpp: 4 })), /transparent/);
});

test('a broken or empty PNG is refused', () => {
  const good = png({ width: 4, height: 3, colorType: 6, rows: rgba([[0, 0]]), bpp: 4 });
  assert.match(checkPng(good.subarray(0, 40)), /cut short|not a PNG|no pixels/);
  assert.match(checkPng(png({ width: 0, height: 3, colorType: 6, rows: [], bpp: 4 })), /no pixels/);
  assert.match(checkPng(png({ width: 1, height: 1, depth: 3, colorType: 6, rows: [[0]], bpp: 4 })), /not a PNG/);
  assert.match(checkPng(png({ width: 4, height: 3, colorType: 6, rows: rgba([[0, 0]]), filters: [7], bpp: 4 })), /could not be read/);
  assert.match(checkPng(png({ width: 9000, height: 9000, colorType: 6, rows: [[0]], bpp: 4 })), /too many pixels/);
  assert.equal(detectKind(new TextEncoder().encode('\uFEFF<?xml version="1.0"?>\n<svg viewBox="0 0 1 1"></svg>')), 'svg');
  assert.equal(detectKind(new TextEncoder().encode('GIF89a')), null);
});
