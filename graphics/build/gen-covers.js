'use strict';
// The blog covers, social cards and the one diagram that carried the General Translation mark outside the docs set.
// usage: node graphics/build/gen-covers.js   (after gen-visuals.js; it adds its pages to build/manifest.json)
// Grounds come from cover-grounds.py; the mark with the name is lockup J (public/brand/gt-globe-lockup.svg).
const L = require('./gen-lib.js');
const { fs, path, ROOT, SP, px, esc } = L;

const PUB = path.resolve(SP, '..', 'public');
const LOCKUP = fs.readFileSync(path.join(PUB, 'brand/gt-globe-lockup.svg'), 'utf8').trim();
const LOGO = fs.readFileSync(path.join(PUB, 'brand/gt-globe-logo.svg'), 'utf8').trim();
const LOCKUP_VIEW = LOCKUP.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
const CAP_UNITS = 1430; // Katagami Text's cap height in the lockup's units (gt-globe-lockup.json)
const CAP_EM = 1430 / 2048;

// lockup J with the name at the given cap height, its top-left at x, y
function lockup(x, y, cap, color = '#ffffff') {
  const k = cap / CAP_UNITS; const w = LOCKUP_VIEW[2] * k, h = LOCKUP_VIEW[3] * k;
  const svg = LOCKUP.replace('<svg ', `<svg width="${w.toFixed(2)}" height="${h.toFixed(2)}" `);
  return { w, h, html: `<div class="txt lockup" style="left:${px(x)};top:${px(y)};width:${w.toFixed(2)}px;height:${h.toFixed(2)}px;color:${color}">${svg}</div>` };
}
const lockupSize = (cap) => ({ w: LOCKUP_VIEW[2] * cap / CAP_UNITS, h: LOCKUP_VIEW[3] * cap / CAP_UNITS });
const logo = (size, color) => `<span style="display:inline-flex;width:${size}px;height:${size}px;color:${color}">${LOGO.replace('<svg ', `<svg width="${size}" height="${size}" `)}</span>`;
const ground = (name, W, H) => `<div class="ground" style="left:0;top:0;width:${W}px;height:${H}px;background:url(/bg/covers/${name}.png) center/100% 100% no-repeat;image-rendering:pixelated"></div>`;
const word = (x, y, size, text, o = {}) => `<div class="txt" style="left:${px(x)};top:${px(y)};${o.w ? `width:${px(o.w)};` : ''}font:500 ${size}px/${o.lh || 1} 'Katagami Text';letter-spacing:0;color:${o.color || '#ffffff'};text-align:${o.align || 'left'};white-space:${o.wrap ? 'normal' : 'nowrap'}">${esc(text)}</div>`;

// a centred flex row; line-height 1 puts the line box's centre within 0.015em of Katagami Text's cap band centre
const row = (W, cy, h, gap, items) => `<div class="txt" style="left:0;top:${px(cy - h / 2)};width:${W}px;height:${px(h)};display:flex;align-items:center;justify-content:center;gap:${gap}px">${items.join('')}</div>`;
const name = (text, size) => `<span style="font:500 ${size}px/1 'Katagami Text';letter-spacing:0;color:#fff;white-space:nowrap">${esc(text)}</span>`;
const lockupInline = (cap) => { const s = lockupSize(cap); return `<span style="display:inline-flex;color:#fff">${LOCKUP.replace('<svg ', `<svg width="${s.w.toFixed(2)}" height="${s.h.toFixed(2)}" `)}</span>`; };

const pages = [];
function add(id, name, why, w, h, body) { pages.push({ id, name, why, w, h, body }); }

// The supporting-open-source-software cover: the program as the title, lockup J under it.
add('P1-open-source', 'Open source cover', 'The open-source grants cover: the title on the blue gem smoke screened in four blues, lockup J under it.', 1600, 900, (W, H) => {
  const cap = 40, s = lockupSize(cap);
  return ground('open-source-blue', W, H) + word(0, 300, 168, 'Open Source', { w: W, align: 'center' }) + lockup((W - s.w) / 2, 560, cap).html;
});
// Fumadocs grantee cover.
add('P2-fumadocs', 'Fumadocs cover', 'The Fumadocs grantee cover: the Fumadocs mark and name on the fire gem smoke, lockup J under them.', 1600, 900, (W, H) => {
  const cap = 34, s = lockupSize(cap);
  return ground('fire', W, H) + row(W, 330, 170, 48, [`<img src="/shots/logos/fumadocs.png" style="width:150px;height:150px">`, name('Fumadocs', 150)]) + lockup((W - s.w) / 2, 590, cap).html;
});
// Fuma Nama post social card.
add('P3-fuma-nama-og', 'Fuma Nama social card', 'The social card of the Fuma Nama post: its title in two lines on the fire gem smoke, lockup J under it.', 1600, 840, (W, H) => {
  const cap = 34, s = lockupSize(cap);
  return ground('fire', W, H) + word(120, 210, 96, 'Fuma Nama: The philosophy of an open-sourceror', { w: W - 240, align: 'center', wrap: true, lh: 1.08 }) + lockup((W - s.w) / 2, 560, cap).html;
});
// Cuelume grantee cover and its social card.
const cuelume = (W, H, cy, ly) => { const cap = 34, s = lockupSize(cap); const mh = 168, mw = Math.round(168 * 152 / 145);
  return ground('green', W, H) + row(W, cy, 190, 44, [`<img src="/shots/logos/cuelume-mark.png" style="width:${mw}px;height:${mh}px">`, name('Cuelume', 168)]) + lockup((W - s.w) / 2, ly, cap).html; };
add('P4-cuelume', 'Cuelume cover', 'The Cuelume grantee cover: the Cuelume mark and name on a green screen of a glyphfield export, lockup J under them.', 1600, 900, (W, H) => cuelume(W, H, 380, 610));
add('P4-cuelume-og', 'Cuelume social card', 'The Cuelume grantee social card at 1.9:1, the cover recomposed for the shorter frame.', 1600, 840, (W, H) => cuelume(W, H, 350, 575));
// Slash partnership cover.
add('P5-slash', 'Slash partnership cover', 'The Slash partnership cover: the Slash logo, a times sign and lockup J on a gold screen of a glyphfield export.', 1600, 840, (W, H) => {
  const slashH = 116, slashW = slashH * 64 / 22;
  return ground('gold', W, H) + row(W, H / 2, 240, 56, [`<img src="/shots/logos/slash-logo.svg" style="width:${px(slashW)};height:${px(slashH)}">`, `<span style="font:400 64px/1 'Katagami Text';color:#fff">×</span>`, lockupInline(58)]);
});
// Rewriting docs: the spine diagram, rebuilt because its root chip drew the retired monogram.
add('P6-rewriting-docs-spine', 'Docs spine', 'The three docs page types, each answering one question from the user: Quickstart, Guides and Reference.', 1600, 900, (W, H) => {
  const cols = [[142, 'How do I set up this framework?', 'Quickstart', 'Orients the user with the fastest path to first success.', 'bolt'], [590, 'How do I complete this task?', 'Guides', 'Practical “how-to” guide to help the user complete a task or workflow.', 'book-open'], [1038, 'How do I see full behavior?', 'Reference', 'Complete and standardized descriptions of exactly how something works.', 'command-line']];
  const CW = 420, rootW = 196, rootH = 76, rootX = (W - rootW) / 2, rootY = 106, qY = 300, qH = 142, cY = 526, cH = 266;
  const ink = 'rgba(161,161,170,.95)';
  let h = `<div class="ground" style="left:0;top:0;width:${W}px;height:${H}px;background:url(/bg/user/u41.webp) center/auto ${H * 2}px no-repeat;image-rendering:pixelated"></div><div class="wash" style="background:rgba(9,9,11,.45)"></div>`;
  let d = `M${W / 2} ${rootY + rootH} V${qY - 14} M${cols[0][0] + CW / 2} ${qY - 14} V218 H${cols[2][0] + CW / 2} V${qY - 14}`;
  cols.forEach(([x]) => { d += ` M${x + CW / 2} ${qY + qH} V${cY - 14}`; });
  h += `<svg class="ln" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><path d="${d}" stroke="${ink}" stroke-width="3" fill="none"/>`;
  [qY, cY].forEach((y) => cols.forEach(([x]) => { const cx = x + CW / 2; h += `<path d="M${cx - 9} ${y - 16} L${cx + 9} ${y - 16} L${cx} ${y - 1} Z" fill="${ink}"/>`; }));
  h += `</svg>`;
  h += `<div class="txt" style="left:${px(rootX)};top:${px(rootY)};width:${px(rootW)};height:${px(rootH)};display:flex;align-items:center;justify-content:center;gap:14px;border-radius:8px;background:#fafafa;color:#09090b;font:500 32px/1 'Katagami Text'">${logo(36, '#09090b')}<span>User</span></div>`;
  cols.forEach(([x, q, t, body, icon]) => {
    h += `<div class="txt" style="left:${px(x)};top:${px(qY)};width:${px(CW)};height:${px(qH)};display:flex;align-items:center;justify-content:center;padding:0 36px;border-radius:8px;background:#fafafa;color:#09090b;font:400 32px/1.4 'Katagami Text';text-align:center;white-space:normal">“${esc(q)}”</div>`;
    h += `<div class="txt" style="left:${px(x)};top:${px(cY)};width:${px(CW)};height:${px(cH)};padding:30px 32px;border-radius:8px;background:#2f5ce0;color:#fff;overflow:hidden;white-space:normal">`
      + `<div style="position:absolute;right:26px;bottom:22px;opacity:.13">${L.ico(icon, 112)}</div>`
      + `<div style="position:relative;font:500 32px/1 'Katagami Text'">${esc(t)}</div><div style="position:relative;margin-top:22px;font:400 28px/1.5 'Katagami Text';color:rgba(255,255,255,.88)">${esc(body)}</div></div>`;
  });
  return h;
});

fs.mkdirSync(path.join(ROOT, 'visuals'), { recursive: true });
for (const p of pages) fs.writeFileSync(path.join(ROOT, 'visuals', `${p.id}.html`), L.stage(null, p.body(p.w, p.h), { w: p.w, h: p.h, title: p.name, vignette: false, fit: 0 }));
const mf = path.join(ROOT, 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(mf, 'utf8')).filter((m) => m.area !== 'P');
for (const p of pages) manifest.push({ id: p.id, area: 'P', name: p.name, bg: null, why: p.why, w: p.w, h: p.h, animated: false });
fs.writeFileSync(mf, JSON.stringify(manifest, null, 2));
if (L.missingIcons.size) console.log('MISSING ICONS', [...L.missingIcons].join(' '));
console.log(`wrote ${pages.length} cover pages`);
