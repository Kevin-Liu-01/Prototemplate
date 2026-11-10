'use strict';
// The blog covers, social cards and the one diagram that carried the retired GT monogram outside the docs set.
// usage: node graphics/build/gen-covers.js   (after gen-visuals.js; it adds its pages to build/manifest.json)
// Each page is the published cover with its mark removed (cover-grounds.py) and the globe logo seated where the mark was.
const L = require('./gen-lib.js');
const { fs, path, ROOT, SP, px } = L;

const PUB = path.resolve(SP, '..', 'public');
const LOGO = fs.readFileSync(path.join(PUB, 'brand/gt-globe-logo.svg'), 'utf8').trim();

// mark: the old monogram's box in source px (x0, y0, x1, y1, inclusive). The globe takes the mark's height and keeps
// its gap to the word after it (align 'right'), or takes its centre where it stands alone (align 'center').
const COVERS = [
  ['P1-open-source', 'Open source cover', 'The open-source grants cover.', 'open-source', 960, 540, [205, 233, 323, 307], 'right', '#ffffff'],
  ['P2-fumadocs', 'Fumadocs cover', 'The Fumadocs grantee cover.', 'fumadocs', 960, 540, [349, 434, 408, 471], 'right', '#ffffff'],
  ['P3-fuma-nama-og', 'Fuma Nama social card', 'The social card of the Fuma Nama post.', 'fuma-nama-og', 960, 504, [355, 404, 409, 437], 'right', '#ffffff'],
  ['P4-cuelume', 'Cuelume cover', 'The Cuelume grantee cover.', 'cuelume', 1920, 1080, [682, 805, 808, 884], 'right', '#ffffff'],
  ['P4-cuelume-og', 'Cuelume social card', 'The Cuelume grantee social card.', 'cuelume-og', 1920, 1008, [693, 772, 811, 846], 'right', '#ffffff'],
  ['P5-slash', 'Slash partnership cover', 'The Slash partnership cover.', 'slash', 1024, 537, [630, 229, 754, 307], 'center', '#ffffff'],
  ['P6-rewriting-docs-spine', 'Docs spine', 'The three docs page types, each answering one question from the user.', 'spine', 1920, 1080, [890, 160, 933, 186], 'right', '#19191c'],
];

const pages = COVERS.map(([id, name, why, ground, sw, sh, [x0, y0, x1, y1], align, color]) => {
  const W = 1600, H = Math.round(W * sh / sw), k = W / sw;
  const d = (y1 - y0 + 1) * k, cy = (y0 + y1 + 1) / 2 * k;
  const left = align === 'right' ? (x1 + 1) * k - d : (x0 + x1 + 1) / 2 * k - d / 2;
  const body = `<div class="ground" style="left:0;top:0;width:${W}px;height:${H}px;background:url(/bg/covers/${ground}.png) center/100% 100% no-repeat;image-rendering:pixelated"></div>`
    + `<div class="txt" style="left:${px(left)};top:${px(cy - d / 2)};width:${px(d)};height:${px(d)};color:${color}">${LOGO.replace('<svg ', `<svg width="${d.toFixed(2)}" height="${d.toFixed(2)}" `)}</div>`;
  return { id, name, why, w: W, h: H, body, src: { ground, w: sw, h: sh, mark: [x0, y0, x1, y1] } };
});

fs.mkdirSync(path.join(ROOT, 'visuals'), { recursive: true });
for (const p of pages) fs.writeFileSync(path.join(ROOT, 'visuals', `${p.id}.html`), L.stage(null, p.body, { w: p.w, h: p.h, title: p.name, vignette: false, fit: 0 }));
const mf = path.join(ROOT, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(mf, 'utf8')).filter((m) => m.area !== 'P');
for (const p of pages) manifest.push({ id: p.id, area: 'P', name: p.name, bg: null, why: p.why, w: p.w, h: p.h, animated: false, src: p.src });
fs.writeFileSync(mf, JSON.stringify(manifest, null, 2));
console.log(`wrote ${pages.length} cover pages`);
