'use strict';
// The blog covers, social cards and the one diagram that carried the retired GT monogram outside the docs set.
// usage: node graphics/build/gen-covers.js   (after gen-visuals.js; it adds its pages to build/manifest.json)
// Each page is the published cover with the old mark and its words lifted off (cover-grounds.py), then the globe logo
// and the same words set back as one group on the page's centre line (the spine's in its chip), the globe on the words' cap-height middle.
const L = require('./gen-lib.js');
const { fs, path, ROOT, SP, px } = L;

const PUB = path.resolve(SP, '..', 'public');
const LOGO = fs.readFileSync(path.join(PUB, 'brand/gt-globe-logo.svg'), 'utf8').trim();
const COVERS = [
  ['P1-open-source', 'Open source cover', 'The open-source grants cover.', 'open-source'],
  ['P2-fumadocs', 'Fumadocs cover', 'The Fumadocs grantee cover.', 'fumadocs'],
  ['P3-fuma-nama-og', 'Fuma Nama social card', 'The social card of the Fuma Nama post.', 'fuma-nama-og'],
  ['P4-cuelume', 'Cuelume cover', 'The Cuelume grantee cover.', 'cuelume'],
  ['P4-cuelume-og', 'Cuelume social card', 'The Cuelume grantee social card.', 'cuelume-og'],
  ['P5-slash', 'Slash partnership cover', 'The Slash partnership cover.', 'slash'],
  ['P6-rewriting-docs-spine', 'Docs spine', 'The three docs page types, each answering one question from the user.', 'spine', 'group'],
];

// The globe takes the old mark's height and its gap to the words; positions stay on whole source pixels so the words keep their published pixels.
const pages = COVERS.map(([id, name, why, ground, centre = 'page']) => {
  const c = JSON.parse(fs.readFileSync(path.join(PUB, 'graphics/bg/covers', `${ground}.json`), 'utf8'));
  const W = 1600, H = Math.round(W * c.h / c.w), k = W / c.w;
  const [mx0, my0, mx1, my1] = c.mark, [wx, wy, ww, wh] = c.words, d = my1 - my0 + 1;
  const left = c.side === 'left';
  const gap = left ? wx - (mx1 + 1) : mx0 - (wx + ww);
  const cx = centre === 'page' ? c.w / 2 : left ? (mx0 + wx + ww) / 2 : (wx + mx1 + 1) / 2;
  const cy = left ? (c.cap[0] + c.cap[1] + 1) / 2 : (my0 + my1 + 1) / 2;
  const start = cx - (d + gap + ww) / 2;
  const wordX = Math.round(left ? start + d + gap : start), globeX = left ? wordX - gap - d : wordX + ww + gap;
  const body = `<div class="ground" style="left:0;top:0;width:${W}px;height:${H}px;background:url(/bg/covers/${ground}.png) center/100% 100% no-repeat;image-rendering:pixelated"></div>`
    + `<img class="txt" src="/bg/covers/${ground}-words.png" style="left:${px(wordX * k)};top:${px(wy * k)};width:${px(ww * k)};height:${px(wh * k)};image-rendering:pixelated">`
    + `<div class="txt" style="left:${px(globeX * k)};top:${px((cy - d / 2) * k)};width:${px(d * k)};height:${px(d * k)};color:${c.color}">${LOGO.replace('<svg ', `<svg width="${(d * k).toFixed(2)}" height="${(d * k).toFixed(2)}" `)}</div>`;
  return { id, name, why, w: W, h: H, body, src: { ground, w: c.w, h: c.h, group: c.group } };
});

fs.mkdirSync(path.join(ROOT, 'visuals'), { recursive: true });
for (const p of pages) fs.writeFileSync(path.join(ROOT, 'visuals', `${p.id}.html`), L.stage(null, p.body, { w: p.w, h: p.h, title: p.name, vignette: false, fit: 0 }));
const mf = path.join(ROOT, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(mf, 'utf8')).filter((m) => m.area !== 'P');
for (const p of pages) manifest.push({ id: p.id, area: 'P', name: p.name, bg: null, why: p.why, w: p.w, h: p.h, animated: false, src: p.src });
fs.writeFileSync(mf, JSON.stringify(manifest, null, 2));
console.log(`wrote ${pages.length} cover pages`);
