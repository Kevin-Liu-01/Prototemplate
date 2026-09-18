'use strict';
// v2: labels only (no titles, captions or descriptions); black-and-white artboard 1 backgrounds only.
const L = require('./gen-lib.js');
const { crop, hl, tag, dot, text, panel, line, elbow, badge, stage, ico, svgFile, px, PAD, padded } = L;
const PW = (r, s, pad) => (r.w + 2 * (pad != null ? pad : PAD)) * s, PH = (r, s, pad) => (r.h + 2 * (pad != null ? pad : PAD)) * s;
const FOOTER_CLIP = { x: 0, y: 704, w: 290, h: 143 }, PREFS_CLIP = { x: 0, y: 845, w: 290, h: 55 }, SIDEFOOT_CLIP = { x: 0, y: 704, w: 290, h: 196 }, ROW_CLIP = { x: 0, y: 704, w: 290, h: 41 };

const N = { sidebar:{x:0,y:0,w:290,h:900}, logo:{x:19,y:20,w:172,h:30}, switcher:{x:19,y:71,w:254,h:54},
  groupGet:{x:19,y:145,w:88,h:19}, groupFw:{x:19,y:277,w:94,h:19}, groupPf:{x:19,y:654,w:69,h:19}, groupInt:{x:19,y:817,w:91,h:19},
  itemIntro:{x:19,y:168,w:254,h:31}, itemKey:{x:19,y:198,w:254,h:31}, itemAgents:{x:19,y:229,w:254,h:31}, itemReact:{x:19,y:300,w:254,h:31},
  footerLinks:{x:11,y:706,w:270,h:138}, prefs:{x:11,y:847,w:270,h:45}, themeBL:{x:249,y:858,w:32,h:32}, footerRowDash:{x:11,y:713,w:270,h:31},
  header:{x:1068,y:12,w:356,h:46}, themeTR:{x:1113,y:19,w:32,h:32}, demo:{x:1320,y:19,w:97,h:32},
  h1short:{x:310,y:80,w:420,h:37}, subtitle:{x:310,y:129,w:746,h:24}, lastUpdated:{x:310,y:177,w:146,h:16}, copy:{x:909,y:169,w:147,h:32}, metaRule:{x:310,y:218,w:746,h:1},
  h2Rule:{x:310,y:324,w:746,h:1}, cards:{x:310,y:400,w:746,h:417}, italicNote:{x:310,y:838,w:746,h:27},
  toc:{x:1090,y:74,w:330,h:130}, headerStrip:{x:290,y:0,w:1150,h:60}, sidebarTop:{x:0,y:0,w:290,h:135}, contentTop:{x:310,y:60,w:746,h:330} };
const NQ = { tipNote:{x:310,y:446,w:746,h:116}, h2:{x:310,y:589,w:746,h:52}, toc:{x:1090,y:74,w:330,h:450} };
const O = { sidebar:{x:0,y:0,w:290,h:900}, toggle:{x:243,y:17,w:30,h:30}, star:{x:3,y:64,w:286,h:40}, switcher:{x:19,y:117,w:254,h:58},
  itemIntro:{x:19,y:233,w:254,h:36}, prefs:{x:3,y:847,w:286,h:53}, search:{x:310,y:14,w:240,h:36}, demo:{x:1307,y:14,w:101,h:36},
  headerLine:{x:290,y:56,w:1150,h:2}, headerStrip:{x:290,y:0,w:1150,h:60}, subtitleShort:{x:310,y:142,w:600,h:28},
  cardsRow2Right:{x:690,y:494,w:420,h:150}, launch:{x:310,y:692,w:820,h:190}, toc:{x:1160,y:105,w:270,h:135}, sidebarTop:{x:0,y:0,w:290,h:180}, ruleStrip:{x:640,y:44,w:420,h:24} };
const OQ = { h2:{x:310,y:590,w:820,h:32}, toc:{x:1160,y:105,w:280,h:530} };
const org = (x, y, rect) => ({ x, y, rx: rect.x, ry: rect.y });
const chipStyle = (size) => `display:inline-flex;align-items:center;gap:10px;height:${px(size + 18)};padding:0 12px;border-radius:7px;background:rgba(9,9,11,.88);border:1px solid rgba(63,63,70,.9);box-shadow:0 6px 18px rgba(0,0,0,.45);font:600 ${size}px/1 'Inter';letter-spacing:-.012em;white-space:nowrap`;
const label = (x, y, t, size = 28, color = 'var(--text)') => `<div class="txt" style="left:${px(x)};top:${px(y)};${chipStyle(size)};color:${color}">${t}</div>`;
const iconLabel = (x, y, ic, t, size = 28, iconColor = '#60a5fa') => `<div class="txt" style="left:${px(x)};top:${px(y)};${chipStyle(size)};color:var(--text)">${ico(ic, size + 1).replace('class="ico ', `style="fill:${iconColor}" class="ico `)}<span>${t}</span></div>`;
const xLabel = (x, y, t, size = 28, w) => `<div class="txt" style="left:${px(x)};top:${px(y)};display:flex;align-items:center;gap:12px;font:600 ${size}px/1.2 'Inter';letter-spacing:-.015em;${w ? `width:${px(w)};white-space:normal` : 'white-space:nowrap'}"><span style="display:inline-grid;place-items:center;width:36px;height:36px;border-radius:50%;background:rgba(240,82,79,.16);color:#f0524f;flex:none">${ico('x-mark', 20)}</span><span>${t}</span></div>`;
const plabel = (ic, t, muted = false) => `<div class="plabel ${muted ? 'muted' : ''}">${ico(ic, 34)}<span>${t}</span></div>`;

const V = [];
const add = (id, area, name, bg, why, html, o = {}) => V.push({ id, area, name, bg, why, html, ...o });

// =============== AREA A ===============
add('A1-zones-overlay', 'A', 'Zones overlay', 'silk1', 'The real page with the four zones boxed and labelled; the reader verifies the claim against the product.', () => {
  const s = 0.86, X = 181, Y = 63, o = org(X, Y, { x: 0, y: 0 }); let h = '';
  h += crop('newIntro', { x: 0, y: 0, w: 1440, h: 900 }, { x: X, y: Y, s });
  h += hl(o, s, N.sidebar, { label: 'Navigation', icon: 'bars-3', labelPos: 'left', pad: 3 });
  h += hl(o, s, N.header, { label: 'Actions', icon: 'cursor-arrow-rays', labelPos: 'above' });
  h += hl(o, s, N.footerLinks, { label: 'Links', icon: 'link', labelPos: 'left' });
  h += hl(o, s, N.prefs, { label: 'Preferences', icon: 'adjustments-horizontal', labelPos: 'left' });
  h += hl(o, s, N.themeTR, { color: 'white', dashed: true, pad: 3 });
  h += hl(o, s, N.themeBL, { color: 'white', dashed: true, pad: 3, label: 'Theme toggle ×2', labelPos: 'below', labelDx: -60 });
  return h.replace('<div class="tag white', '<div class="tag dark');
});

add('A2-wireframe-map', 'A', 'Wireframe map', 'silk2', 'The page as a wireframe with its levels of organization pulled out and tied to where they live: sections in the switcher, groups and pages in the sidebar, headings in the contents rail.', () => {
  let h = ''; const p = 0.58, X = 420, Y = 190; h += wireframePage(X, Y, p, 1);
  const wx = (x) => X + x * p, wy = (y) => Y + y * p;
  const lead = (pts, color = 'rgba(0,120,255,.85)') => `<svg class="ln" width="1600" height="900" viewBox="0 0 1600 900"><polyline points="${pts.map(q => q.map(v => Math.round(v * 10) / 10).join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="2.25"/><circle cx="${pts[pts.length - 1][0]}" cy="${pts[pts.length - 1][1]}" r="5" fill="${color}"/></svg>`;
  const LX = 64, TAG = 62;
  const sec = { x: 19, y: 71, w: 255, h: 480 }, sS = 0.56, secY = 150;
  h += tag('Sections', 'squares-2x2', LX, secY - TAG); h += crop('dropdown', sec, { x: LX, y: secY, s: sS });
  h += lead([[LX + PW(sec, sS), secY + 30], [X - 30, secY + 30], [X - 30, wy(98)], [wx(19), wy(98)]]);
  const grp = { x: 0, y: 135, w: 290, h: 330 }, sG = 0.6, grpY = secY + PH(sec, sS) + 96;
  h += tag('Groups and pages', 'bars-3', LX, grpY - TAG); h += crop('newIntro', grp, { x: LX, y: grpY, s: sG });
  h += lead([[LX + PW(grp, sG), grpY + PH(grp, sG) / 2], [X - 30, grpY + PH(grp, sG) / 2], [X - 30, wy(300)], [wx(19), wy(300)]]);
  const RX = X + 1440 * p + 60, tocS = 0.72, tocY = wy(74);
  h += tag('Headings', 'list-bullet', RX, tocY - TAG); h += crop('newIntro', N.toc, { x: RX, y: tocY, s: tocS });
  h += lead([[RX, tocY + PH(N.toc, tocS) / 2], [wx(1420), tocY + PH(N.toc, tocS) / 2]]);
  return h;
}, { wash: 0 });

add('A3-exploded-layers', 'A', 'Exploded layers', 'silk3', 'The quiet details pulled out of the page and tied back to where they sit: the theme toggle in both places, the italic last-updated line, the split copy-page button, the star count and the language switcher.', () => {
  const s = 0.62, X = 640, Y = 171, o = org(X, Y, { x: 0, y: 0 }); let h = '';
  h += crop('newIntro', { x: 0, y: 0, w: 1440, h: 900 }, { x: X, y: Y, s, opacity: .92 });
  const STAR = { x: 1156, y: 19, w: 78, h: 32 }, LANG = { x: 11, y: 856, w: 151, h: 36 };
  [N.themeTR, N.themeBL, N.lastUpdated, N.copy, STAR, LANG].forEach(r => { h += hl(o, s, r, { color: 'white', dashed: true, pad: 3 }); });
  const c = 'rgba(96,165,250,.85)'; const P = (d) => `<svg class="ln" width="1600" height="900" viewBox="0 0 1600 900"><path d="${d}" stroke="${c}" stroke-width="2.25" fill="none"/></svg>`;
  const py0 = (r) => Y + r.y * s, pcx = (r) => X + (r.x + r.w / 2) * s, pcy = (r) => Y + (r.y + r.h / 2) * s, pyb = (r) => Y + (r.y + r.h) * s;
  const LX = 64, TAG = 62; let y = 122;
  const tS = 1.8, tw = PW(N.themeTR, tS, 10), th = PH(N.themeTR, tS, 10);
  h += tag('Theme toggle ×2', null, LX, y); y += TAG;
  h += crop('newIntro', N.themeTR, { x: LX, y, s: tS, r: 8, pad: 10 }); h += crop('newIntro', N.themeBL, { x: LX + tw + 16, y, s: tS, r: 8, pad: 10 });
  h += P(`M${LX + 2 * tw + 16} ${y + th / 2} L600 ${y + th / 2} L600 146 L${pcx(N.themeTR)} 146 L${pcx(N.themeTR)} ${py0(N.themeTR) - 8}`); h += dot(pcx(N.themeTR), py0(N.themeTR) - 8, null, 'blue', 8);
  h += P(`M${LX + tw + 8} ${y + th} L${LX + tw + 8} ${y + th + 22} L600 ${y + th + 22} L600 748 L${pcx(N.themeBL)} 748 L${pcx(N.themeBL)} ${pyb(N.themeBL) + 8}`); h += dot(pcx(N.themeBL), pyb(N.themeBL) + 8, null, 'blue', 8);
  y += th + 40;
  const lS = 1.5, lw = PW(N.lastUpdated, lS), lh = PH(N.lastUpdated, lS);
  h += tag('Last updated · italic', null, LX, y); y += TAG; h += crop('newIntro', N.lastUpdated, { x: LX, y, s: lS });
  h += P(`M${LX + lw} ${y + lh / 2} L616 ${y + lh / 2} L616 ${pcy(N.lastUpdated)} L${X - 6} ${pcy(N.lastUpdated)}`); h += dot(X - 6, pcy(N.lastUpdated), null, 'blue', 8);
  y += lh + 40;
  const cS = 1.5, cw = PW(N.copy, cS), chh = PH(N.copy, cS);
  h += tag('Copy page · split button', null, LX, y); y += TAG; h += crop('newIntro', N.copy, { x: LX, y, s: cS });
  h += P(`M${LX + cw} ${y + chh / 2} L588 ${y + chh / 2} L588 162 L${pcx(N.copy)} 162 L${pcx(N.copy)} ${py0(N.copy) - 8}`); h += dot(pcx(N.copy), py0(N.copy) - 8, null, 'blue', 8);
  y += chh + 40;
  const sS = 1.6, sw = PW(STAR, sS), shh = PH(STAR, sS), gS = 1.4, gw = PW(LANG, gS), gh = PH(LANG, gS);
  h += tag('Star count', 'star', LX, y); h += crop('newIntro', STAR, { x: LX, y: y + TAG, s: sS });
  h += P(`M${LX + sw / 2} ${y + TAG + shh} L${LX + sw / 2} ${y + TAG + shh + 22} L576 ${y + TAG + shh + 22} L576 130 L${pcx(STAR)} 130 L${pcx(STAR)} ${py0(STAR) - 8}`); h += dot(pcx(STAR), py0(STAR) - 8, null, 'blue', 8);
  const GX = LX + 244; h += tag('Language', 'language', GX, y); h += crop('newIntro', LANG, { x: GX, y: y + TAG, s: gS });
  h += P(`M${GX + gw} ${y + TAG + gh / 2} L616 ${y + TAG + gh / 2} L616 ${pcy(LANG)} L${X - 6} ${pcy(LANG)}`); h += dot(X - 6, pcy(LANG), null, 'blue', 8);
  return h;
});
add('A4-reading-path', 'A', 'Reading path', 'silk4', 'A numbered path over the muted page: orient, navigate, read, choose, act.', () => {
  const s = 0.86, X = 181, Y = 63; let h = '';
  h += crop('newIntro', { x: 0, y: 0, w: 1440, h: 900 }, { x: X, y: Y, s, filter: 'grayscale(1) brightness(.72)' });
  const P = [[105, 98], [146, 183], [420, 98], [400, 500], [1368, 35]].map(([x, y]) => [X + x * s, Y + y * s]);
  const d = `M${P[0][0]} ${P[0][1]} C ${P[0][0]} ${P[0][1] + 60}, ${P[1][0] - 30} ${P[1][1] - 40}, ${P[1][0]} ${P[1][1]} C ${P[1][0] + 120} ${P[1][1]}, ${P[2][0] - 120} ${P[2][1] + 40}, ${P[2][0]} ${P[2][1]} C ${P[2][0] + 20} ${P[2][1] + 200}, ${P[3][0] - 40} ${P[3][1] - 120}, ${P[3][0]} ${P[3][1]} C ${P[3][0] + 500} ${P[3][1] - 60}, ${P[4][0] - 200} ${P[4][1] + 300}, ${P[4][0]} ${P[4][1]}`;
  h += `<svg class="ln" width="1600" height="900" viewBox="0 0 1600 900"><path d="${d}" fill="none" stroke="#0078FF" stroke-width="3" stroke-linecap="round" stroke-dasharray="1 9"/><path d="${d}" fill="none" stroke="rgba(0,120,255,.35)" stroke-width="1.5"/></svg>`;
  const words = ['Orient', 'Navigate', 'Read', 'Choose', 'Act'];
  P.forEach((p, i) => { h += dot(p[0], p[1], i + 1, 'blue', 56); h += tag(words[i], null, i === 4 ? p[0] - 38 : p[0] + 38, p[1] - 27, 'dark', i === 4 ? 'anchor-right' : ''); });
  return h;
});

add('A5-four-corners', 'A', 'Four corners', 'silk1', 'One crop per zone, labelled by what you do there: navigate in the sidebar, act in the header, adjust or leave in the footer, read in the content column.', () => {
  let h = ''; const G = 84, TAG = 62;
  const nav = { x: 0, y: 0, w: 290, h: 330 }, sN = 1.0, navX = 100, navY = 150;
  h += tag('Navigate', 'bars-3', navX, navY - TAG);
  h += crop('newIntro', nav, { x: navX, y: navY, s: sN, pad: 0 });
  const sH = 2.0, hdrX = navX + PW(nav, sN, 0) + G, hdrY = navY + (PH(nav, sN, 0) - PH(N.header, sH)) / 2;
  h += tag('Act', 'cursor-arrow-rays', hdrX, hdrY - TAG);
  h += crop('newIntro', N.header, { x: hdrX, y: hdrY, s: sH, pad: { l: 12, r: 8 } });
  const content = { x: 310, y: 60, w: 1130, h: 400 }, sC = 0.63, conX = hdrX, conY = navY + PH(nav, sN, 0) + 108;
  h += tag('Read', 'document-text', conX, conY - TAG);
  h += crop('newIntro', content, { x: conX, y: conY, s: sC });
  const foot = { x: 11, y: 706, w: 270, h: 186 }, sF = 1.25, footX = navX, footY = conY + (PH(content, sC) - PH(foot, sF)) / 2;
  h += tag('Adjust or leave', 'link', footX, footY - TAG);
  h += crop('newIntro', foot, { x: footX, y: footY, s: sF, clip: SIDEFOOT_CLIP });
  return h;
});

add('B1-redline-pass', 'B', 'Redline pass', 'silk2', 'The old page with every deleted element struck in red and numbered, and a legend beside it.', () => {
  const s = 0.72, X = 64, Y = 117, o = org(X, Y, { x: 0, y: 0 }); let h = '';
  h += crop('oldIntro', { x: 0, y: 0, w: 1440, h: 900 }, { x: X, y: Y, s });
  const items = [[O.search, 'Search → icon', 'magnifying-glass', 4], [O.star, 'GitHub banner', 'star', 4], [O.toggle, 'Collapse toggle', 'view-columns', 4], [O.headerLine, 'Header rule', 'minus', 2]];
  const LX = 1150, LY = 318;
  items.forEach(([r, t, ic, pad], i) => {
    h += hl(o, s, r, { color: 'red', fill: true, pad });
    h += dot(X + (r.x + r.w) * s + 4, Y + (r.y + r.h / 2) * s, i + 1, 'red', 56);
    h += tag(t, ic, LX, LY + i * 74, 'red', '', i + 1);
  });
  h += `<div class="badge" style="left:${px(LX)};top:${px(LY - 96)};border-color:rgba(240,82,79,.6);color:#f0524f">${ico('minus-circle', 24)} 4 removed above the fold</div>`;
  return h;
});


add('B2-before-after-split', 'B', 'Before / after split', 'silk3', 'Old and new at the same scale; deletions in red, the replacement row in blue.', () => {
  const s = 0.52, Y = 216; let h = '';
  const oL = org(44, Y, { x: 0, y: 0 }), oR = org(807, Y, { x: 0, y: 0 });
  h += badge(44, 156, 'Before'); h += badge(807, 156, 'After');
  h += crop('oldIntro', { x: 0, y: 0, w: 1440, h: 900 }, { x: 44, y: Y, s }); h += crop('newIntro', { x: 0, y: 0, w: 1440, h: 900 }, { x: 807, y: Y, s });
  h += hl(oL, s, O.search, { color: 'red', fill: true, pad: 3 }); h += hl(oL, s, O.star, { color: 'red', fill: true, pad: 2 }); h += hl(oL, s, O.toggle, { color: 'red', fill: true, pad: 3 }); h += hl(oL, s, O.headerLine, { color: 'red', fill: true, pad: 2 });
  h += hl(oR, s, N.header, { pad: 3, label: 'Five controls, one row', icon: 'cursor-arrow-rays', labelPos: 'below', labelDx: -240 });
  return h;
});

add('B3-the-pile', 'B', 'The pile', 'silk4', 'The deleted pieces cut out of the old page, braced together into the single row that replaced them.', () => {
  let h = '';
  // crops in one column at modest scales, labels in one column beside them, the brace in its own gutter; total width stays under 1440 so zoom-to-fit does not shrink the type
  const rows = [[O.search, 1.3, 'Search', 'icon'], [O.star, 1.3, 'GitHub banner', '1.1k pill'], [O.toggle, 2.0, 'Collapse toggle', 'removed'], [O.ruleStrip, 1.0, 'Header rule', 'removed']];
  const CX = 64, GAP = 44, CHIP = 46, widest = Math.max(...rows.map(([r, s]) => PW(r, s))), LX = CX + widest + 32;
  let y = 150; const top = y;
  rows.forEach(([r, s, k, v]) => { const hh = PH(r, s); h += crop('oldIntro', r, { x: CX, y, s }); h += `<div class="txt" style="left:${px(LX)};top:${px(y + hh / 2 - CHIP / 2)};${chipStyle(28)};color:var(--text)"><span style="display:inline-grid;place-items:center;width:30px;height:30px;border-radius:50%;background:rgba(240,82,79,.18);color:#f0524f">${ico('x-mark', 18)}</span><span>${k}</span><span style="font:500 28px 'Geist Mono';color:var(--muted);letter-spacing:.01em">→ ${v}</span></div>`; y += Math.max(hh, CHIP) + GAP; });
  const bottom = y - GAP, bx = LX + 500, mid = (top + bottom) / 2;
  // a brace gathers the pile and points into the one row that replaced it
  h += `<svg class="ln" width="1600" height="900" viewBox="0 0 1600 900"><path d="M${bx} ${top} Q${bx + 22} ${top} ${bx + 22} ${top + 22} L${bx + 22} ${mid - 22} Q${bx + 22} ${mid} ${bx + 44} ${mid} Q${bx + 22} ${mid} ${bx + 22} ${mid + 22} L${bx + 22} ${bottom - 22} Q${bx + 22} ${bottom} ${bx} ${bottom}" stroke="rgba(250,250,250,.75)" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M${bx + 44} ${mid} L${bx + 84} ${mid}" stroke="rgba(96,165,250,.9)" stroke-width="3"/><circle cx="${bx + 84}" cy="${mid}" r="5" fill="rgba(96,165,250,.9)"/></svg>`;
  const sH = 1.0, hx = bx + 100, hy = mid - PH(N.header, sH) / 2;
  h += tag('One row instead of four', null, hx, hy - 70);
  h += crop('newIntro', N.header, { x: hx, y: hy, s: sH });
  return h;
});
add('B4-peel-the-layers', 'B', 'Peel the layers', 'silk1', 'Extra lines, links and buttons as translucent layers lifted off the new page, each called out in red; the page itself in blue.', () => {
  let h = ''; const s = 0.46;
  const layers = [[640, 168, 'oldIntro', .28, '− extra lines'], [600, 218, 'oldIntro', .42, '− extra links'], [560, 268, 'oldIntro', .6, '− extra buttons'], [520, 318, 'newIntro', 1, '= the page']];
  layers.forEach(([x, y, shot, op]) => { h += crop(shot, { x: 0, y: 0, w: 1440, h: 900 }, { x, y, s, opacity: op }); });
  // right-aligned labels of one width, so every line starts at the same x and
  // meets its layer a fixed distance below that layer's top edge
  const LX = 64, LW = 260, CH = 44;
  layers.forEach(([x, y, , , k], i) => { const sub = i < 3; const cy = y + 46;
    h += `<div class="txt" style="left:${px(LX)};top:${px(cy - CH / 2)};width:${px(LW)};display:flex;justify-content:flex-end"><div style="${chipStyle(26)};color:${sub ? 'var(--red)' : 'var(--blue2)'}">${k}</div></div>`;
    h += line(LX + LW + 16, cy, x - 6, cy, { color: sub ? 'rgba(240,82,79,.9)' : 'rgba(96,165,250,.9)', end: true, w: 3 }); });
  return h;
});
add('B5-header-strip', 'B', 'Header strip', 'silk2', 'Where the old top band’s controls went: the search field became the ⌘K icon, the GitHub banner became the star pill, and the sidebar toggle went away because the sidebar now stays.', () => {
  let h = ''; const s = 0.95, X = 96, band = { x: 0, y: 0, w: 1440, h: 110 }, y1 = 168, y2 = 592;
  h += badge(X, y1 - 54, 'Before'); h += crop('oldIntro', band, { x: X, y: y1, s, pad: 0 });
  h += badge(X, y2 - 54, 'After'); h += crop('newIntro', band, { x: X, y: y2, s, pad: 0 });
  const o1 = org(X, y1, band), o2 = org(X, y2, band);
  const SEARCH_ICON = { x: 1072, y: 19, w: 32, h: 32 }, STAR = { x: 1156, y: 19, w: 78, h: 32 };
  h += hl(o1, s, O.search, { color: 'red', fill: true, pad: 3 }); h += hl(o1, s, O.star, { color: 'red', fill: true, pad: 3 }); h += hl(o1, s, O.toggle, { color: 'red', fill: true, pad: 3 });
  h += hl(o2, s, SEARCH_ICON, { pad: 3 }); h += hl(o2, s, STAR, { pad: 3 });
  const c = 'rgba(96,165,250,.9)'; const P = (d) => `<svg class="ln" width="1600" height="900" viewBox="0 0 1600 900"><path d="${d}" stroke="${c}" stroke-width="2.25" fill="none"/></svg>`;
  const b1 = y1 + band.h * s + 6, t2 = y2 - 8, cx = (r) => X + (r.x + r.w / 2) * s;
  h += P(`M${cx(O.search)} ${b1} L${cx(O.search)} 392 L${cx(SEARCH_ICON)} 392 L${cx(SEARCH_ICON)} ${t2}`); h += dot(cx(SEARCH_ICON), t2, null, 'blue', 8);
  h += tag('Search field → ⌘K icon', 'magnifying-glass', cx(O.search) + 20, 392 - 27);
  const starX = X + 40 * s; h += P(`M${starX} ${b1} L${starX} 488 L${cx(STAR)} 488 L${cx(STAR)} ${t2}`); h += dot(cx(STAR), t2, null, 'blue', 8);
  h += tag('GitHub banner → star pill', 'star', starX + 20, 488 - 27);
  h += line(cx(O.toggle), b1, cx(O.toggle), 300, { color: 'rgba(240,82,79,.9)' }); h += tag('Toggle → gone', 'view-columns', 170, 300, 'red');
  return h;
});
// =============== AREA C ===============
add('C1-nav-census', 'C', 'Navigation census', 'silk3', 'Every navigation or control surface numbered on both pages.', () => {
  let h = ''; const s = 0.5, Y = 216;
  h += badge(44, 136, 'Before · 6 surfaces'); h += badge(807, 136, 'After · 3 surfaces');
  h += crop('oldIntro', { x: 0, y: 0, w: 1440, h: 900 }, { x: 44, y: Y, s }); h += crop('newIntro', { x: 0, y: 0, w: 1440, h: 900 }, { x: 807, y: Y, s });
  const oL = org(44, Y, { x: 0, y: 0 }), oR = org(807, Y, { x: 0, y: 0 });
  // each marker sits on its own corner of the surface (l/r × t/m/b) so the 56px dots never touch
  const mark = (ox, r, a, n) => dot(ox + (a[0] === 'l' ? r.x : r.x + r.w) * s, Y + (a[1] === 't' ? r.y : a[1] === 'b' ? r.y + r.h : r.y + r.h / 2) * s, n, 'blue', 56);
  [[O.search, 1, 'rt'], [O.star, 2, 'lt'], [O.switcher, 3, 'rb'], [{ x: 19, y: 207, w: 254, h: 720 }, 4, 'lm'], [O.toc, 5, 'rt'], [O.prefs, 6, 'lb']].forEach(([r, n, a]) => { h += hl(oL, s, r, { pad: 2, style: 'border-width:1.5px;box-shadow:none' }); h += mark(44, r, a, n); });
  [[N.sidebar, 1, 'rt'], [N.header, 2, 'rt'], [N.toc, 3, 'rb']].forEach(([r, n, a]) => { h += hl(oR, s, r, { pad: 2, style: 'border-width:1.5px;box-shadow:none' }); h += mark(807, r, a, n); });
  return h;
});

add('C2-accordion-anatomy', 'C', 'Accordion anatomy', 'silk4', 'The new sidebar enlarged with a label for each part.', () => {
  let h = ''; const s = 0.9, X = 200, Y = 45; const o = org(X, Y, { x: 0, y: 0 });
  h += crop('newIntro', N.sidebar, { x: X, y: Y, s });
  const calls = [[N.switcher, 'Section switcher', 'squares-2x2'], [N.itemIntro, 'Active item', 'cursor-arrow-rays'], [N.groupFw, 'Group heading', 'bars-3'], [N.footerLinks, 'Footer links', 'link'], [N.prefs, 'Preferences', 'adjustments-horizontal']];
  calls.forEach(([r, k, ic], i) => { const yy = Y + (r.y + r.h / 2) * s; const ty = 150 + i * 150; h += hl(o, s, r, { pad: 3, style: 'box-shadow:none' }); h += elbow(X + (r.x + r.w) * s + 8, yy, 556, ty + 23, { mx: 500, color: 'rgba(96,165,250,.7)' }); h += iconLabel(570, ty, ic, k); });
  return h;
});

add('C3-persistence-strip', 'C', 'Persistence strip', 'silk1', 'Three consecutive pages; the sidebar stays, only the active marker moves.', () => {
  let h = ''; const s = 0.32, FW = PW({ w: 1440 }, s), FH = PH({ h: 900 }, s), G = 34, X0 = (1600 - (3 * FW + 2 * G)) / 2; const frames = [['newIntro', N.itemIntro, 'Introduction'], ['newKey', N.itemKey, 'Key concepts'], ['newAgents', N.itemAgents, 'Using coding agents']];
  frames.forEach(([k, r, cap], i) => { const X = X0 + i * (FW + G), Y = 297; h += crop(k, { x: 0, y: 0, w: 1440, h: 900 }, { x: X, y: Y, s }); const o = org(X, Y, { x: 0, y: 0 }); h += hl(o, s, N.sidebar, { color: 'white', dashed: true, pad: 1, style: 'box-shadow:none;border-width:1.5px;border-color:rgba(250,250,250,.5)' }); h += hl(o, s, r, { pad: 2, style: 'box-shadow:none' }); h += tag(cap, null, X, Y + FH + 16, 'dark'); if (i < 2) h += `<div class="txt" style="left:${px(X + FW + (G - 24) / 2)};top:${px(Y + FH / 2 - 12)};color:var(--blue2)">${ico('arrow-long-right', 24)}</div>`; });
  return h;
});

add('C4-sidebars-side-by-side', 'C', 'Sidebars side by side', 'silk2', 'The two sidebars at the same scale with bracketed labels.', () => {
  let h = ''; const s = 0.9, Y = 70; const XL = 460, XR = 880;
  h += crop('oldIntro', O.sidebar, { x: XL, y: Y, s }); h += crop('newIntro', N.sidebar, { x: XR, y: Y, s });
  h += badge(XL, 10, 'Before'); h += badge(XR, 10, 'After');
  const oL = org(XL, Y, { x: 0, y: 0 }), oR = org(XR, Y, { x: 0, y: 0 });
  [[O.star, 'GitHub banner', 0], [O.toggle, 'Collapse toggle', -30], [O.switcher, 'Switcher under the banner', 14], [O.itemIntro, '36px rows', 0], [O.prefs, 'Preferences', 0]].forEach(([r, k, dy]) => { h += hl(oL, s, r, { color: 'red', pad: 2, label: k, labelPos: 'left', labelDx: r === O.toggle ? -(O.toggle.x * s) + 2 : 0, labelDy: dy, style: 'box-shadow:none;border-width:1.5px' }); });
  [[N.switcher, 'Switcher first'], [N.itemIntro, '31px rows · active bar'], [N.footerLinks, 'Footer links'], [N.prefs, 'Preferences']].forEach(([r, k]) => { h += hl(oR, s, r, { pad: 2, label: k, labelPos: 'right', style: 'box-shadow:none;border-width:1.5px' }); });
  return h;
});

add('C5-one-tree', 'C', 'One tree', 'silk3', 'The sidebar drawn as the tree it is, mapped onto the real crop.', () => {
  let h = ''; const s = 0.84, X = 1200, Y = 72; h += crop('newIntro', N.sidebar, { x: X, y: Y, s }); const o = org(X, Y, { x: 0, y: 0 });
  const groups = [['Get Started', 3, { x: 19, y: 145, w: 254, h: 115 }], ['Frameworks', 11, { x: 19, y: 277, w: 254, h: 360 }], ['Platform', 4, { x: 19, y: 654, w: 254, h: 146 }], ['Integrations', 5, { x: 19, y: 817, w: 254, h: 80 }]];
  const rootX = 150, rootY = 450; h += `<div class="txt" style="left:${px(rootX - 60)};top:${px(rootY - 25)}"><div class="badge" style="position:static;height:50px;padding:0 18px;font:600 26px 'Inter';border-color:var(--blue);color:var(--text)">${ico('book-open', 24)}&nbsp;Docs</div></div>`;
  groups.forEach(([k, n, r], i) => { const gy = 200 + i * 130; const gx = 420; h += elbow(rootX + 60, rootY, gx - 4, gy + 12, { mx: 320, color: 'rgba(96,165,250,.7)', end: true }); h += label(gx, gy - 11, `${k}&nbsp;<span style="font:500 26px 'Geist Mono';color:var(--muted);letter-spacing:.02em">${n} pages</span>`); for (let j = 0; j < n; j++) h += `<div class="wire bar dim" style="left:${px(gx + 380 + (j % 6) * 22)};top:${px(gy + 4 + Math.floor(j / 6) * 22)};width:14px;height:14px;border-radius:3px;background:rgba(96,165,250,.35)"></div>`; h += hl(o, s, r, { pad: 3, style: 'box-shadow:none;border-width:2.5px' }); h += elbow(gx + 530, gy + 12, X + r.x * s - 6, Y + (r.y + r.h / 2) * s, { mx: 1100, color: 'rgba(96,165,250,.5)', end: true }); });
  return h;
});

// =============== AREA D ===============
add('D1-type-specimen', 'D', 'Type specimen', 'silk5', 'Real type from the page at 110–220%, labelled by role.', () => {
  let h = '';
  const rows = [[N.h1short, 1.6, 'Heading · 600'], [N.subtitle, 1.1, 'Summary · 400 muted'], [N.lastUpdated, 2.2, 'Meta · italic'], [N.italicNote, 1.1, 'Aside · italic'], [N.groupFw, 2, 'Group heading · 600 small', { b: 4 }]];
  let y = 236; rows.forEach(([r, s, k, pd]) => { const hh = pd ? (r.h + PAD + (pd.b != null ? pd.b : PAD)) * s : PH(r, s); h += crop('newIntro', r, { x: 64, y, s, cls: 'flat', style: 'border-color:rgba(63,63,70,.6)', pad: pd }); h += tag(k, null, 960, y + hh / 2 - 27, 'dark'); y += hh + 22; });
  h += badge(64, y + 2, 'Before'); h += crop('oldIntro', O.subtitleShort, { x: 64, y: y + 54, s: 1.1, cls: 'flat', style: 'border-color:rgba(63,63,70,.6)' }); h += tag('One weight, one grey', null, 960, y + 54 + PH(O.subtitleShort, 1.1) / 2 - 27, 'dark');
  return h;
});

add('D2-alignment', 'D', 'Alignment', 'silk4', 'Top-aligned rows against the real centre-aligned switcher and footer rows.', () => {
  let h = '';
  h += panel(64, 150, 720, 600, plabel('x-circle', 'Top-aligned', true));
  h += panel(816, 150, 720, 600, plabel('check-circle', 'Centre-aligned'));
  [[290], [420]].forEach(([y]) => { h += `<div class="wire" style="left:120px;top:${px(y)};width:64px;height:64px;border-radius:10px;border-color:rgba(250,250,250,.4);background:rgba(250,250,250,.06)"></div>`; h += `<div class="wire bar" style="left:204px;top:${px(y + 2)};width:260px;height:16px;background:rgba(250,250,250,.5)"></div>`; h += `<div class="wire bar dim" style="left:204px;top:${px(y + 30)};width:180px;height:12px"></div>`; h += `<div style="position:absolute;left:100px;top:${px(y)};width:640px;border-top:1.5px dashed #f0524f"></div>`; h += `<div class="measure" style="left:600px;top:${px(y - 16)};color:#f0524f">top edge</div>`; });
  h += crop('newIntro', N.switcher, { x: 872, y: 270, s: 1.5 }); h += `<div style="position:absolute;left:852px;top:${px(270 + PH(N.switcher, 1.5) / 2)};width:600px;border-top:1.5px dashed #60a5fa"></div>`; h += `<div class="measure" style="left:1310px;top:${px(270 + PH(N.switcher, 1.5) / 2 - 14)}">centre line</div>`;
  h += crop('newIntro', N.footerRowDash, { x: 872, y: 440, s: 1.5, clip: ROW_CLIP }); h += `<div style="position:absolute;left:852px;top:${px(440 + PH(N.footerRowDash, 1.5) / 2)};width:600px;border-top:1.5px dashed #60a5fa"></div>`; h += `<div class="measure" style="left:1310px;top:${px(440 + PH(N.footerRowDash, 1.5) / 2 - 14)}">centre line</div>`;
  return h;
});

add('D3-icons-not-lists', 'D', 'Icons, not lists', 'silk1', 'The old paragraph-and-links against the new eight-card grid.', () => {
  let h = '';
  h += badge(64, 307, 'Before'); h += crop('oldIntro', O.launch, { x: 64, y: 365, s: 0.9 });
  h += badge(900, 217, 'After'); h += crop('newIntro', N.cards, { x: 900, y: 275, s: 0.84 });
  return h;
});

add('D4-rules-and-space', 'D', 'Rules and space', 'silk2', 'The two 1px rules and the measured spacing at the top of the page.', () => {
  let h = ''; const s = 1.25, X = 330, Y = 243; h += crop('newIntro', N.contentTop, { x: X, y: Y, s }); const o = org(X, Y, N.contentTop);
  h += hl(o, s, N.metaRule, { pad: 1, fill: true, style: 'box-shadow:none;border-width:1px', label: '1px rule', labelPos: 'left' });
  h += hl(o, s, N.h2Rule, { pad: 1, fill: true, style: 'box-shadow:none;border-width:1px', label: '1px rule', labelPos: 'left' });
  const rulers = [[117, 129, '12'], [153, 169, '16'], [218, 243, '25'], [290, 324, '34']];
  const rx = X + 746 * s + 28;
  rulers.forEach(([a, b, tt]) => { const y1 = Y + (a - N.contentTop.y) * s, y2 = Y + (b - N.contentTop.y) * s; h += `<div class="ruler" style="left:${px(rx)};top:${px(y1)};height:${px(y2 - y1)}"></div>`; h += `<div class="measure" style="left:${px(rx + 14)};top:${px((y1 + y2) / 2 - 6)}">${tt} px</div>`; });
  return h;
});

add('D5-quickstart-pages', 'D', 'Intro Quickstarts, before and after', 'u50', 'The Introduction page’s Quickstarts section, old and new, at the same scale: eight centred logo tiles under a command line, versus eight cards with a solid icon, a name and one line each.', () => {
  let h = ''; const s = 0.9; const oldR = { x: 300, y: 200, w: 840, h: 460 }, newR = { x: 300, y: 300, w: 770, h: 530 };
  const wL = PW(oldR, s), wR = PW(newR, s), gap = 56, x0 = (1600 - (wL + gap + wR)) / 2; const yL = (900 - PH(oldR, s)) / 2 + 20, yR = (900 - PH(newR, s)) / 2 + 20;
  h += badge(x0, yL - 62, 'Before'); h += crop('oldIntro', oldR, { x: x0, y: yL, s });
  h += badge(x0 + wL + gap, yR - 62, 'After'); h += crop('newIntro', newR, { x: x0 + wL + gap, y: yR, s });
  return h;
});

// =============== AREA E ===============
add('E1-hover-mask', 'E', 'TOC slide (animated)', 'u52', 'The Fumadocs table of contents on the Next.js quickstart, recorded live while scrolling: the active marker slides down the rail, an SVG path applied as a CSS mask. Delivered as GIF and MP4 as well as a still.', () => {
  let h = ''; const s = 1.45; const r = { x: 1090, y: 74, w: 330, h: 450 }; const X = (1600 - PW(r, s)) / 2, Y = (900 - PH(r, s)) / 2;
  h += panel(X - 60, Y - 60, PW(r, s) + 120, PH(r, s) + 120, '', 'soft');
  h += crop('newQuick', r, { x: X, y: Y, s, cls: 'flat', style: 'border-color:rgba(63,63,70,.7)' });
  return h;
}, { animated: true });

add('E2-solid-vs-outline', 'E', 'Solid vs outline', 'silk1', 'The old outline glyphs beside the solid glyphs the new docs use.', () => {
  let h = '';
  const pairs = [['icons/old/02-outline-icon.svg', 'globe-alt', 'globe'], ['icons/old/08-outline-search-k.svg', 'magnifying-glass', 'search'], ['icons/old/04-outline-english-us.svg', 'language', 'language'], ['icons/old/09-outline-copy-page.svg', 'document-duplicate', 'copy'], ['icons/old/16-outline-icon.svg', 'code-bracket-square', 'code file'], ['icons/old/17-outline-icon.svg', 'code-bracket', 'braces'], ['icons/old/00-outline-collapse-sidebar.svg', 'view-columns', 'sidebar']];
  h += panel(64, 150, 720, 600, plabel('x-circle', 'Outline', true)); h += panel(816, 150, 720, 600, plabel('check-circle', 'Solid'));
  pairs.forEach(([oldf, newn, lab], i) => { const col = i % 4, row = Math.floor(i / 4); const by = 150 + 100 + row * 200; const bx = 112 + col * 156, nx = 864 + col * 156; h += `<div class="txt" style="left:${px(bx - 18)};top:${px(by)};width:156px;text-align:center"><div style="display:grid;place-items:center;margin:0 auto;width:120px;height:120px;border-radius:14px;border:1px solid var(--border2);background:#0c0c0f;color:#d4d4d8">${svgFile(oldf, 58)}</div><div style="margin-top:10px;font:400 28px 'Inter';color:var(--muted)">${lab}</div></div>`; h += `<div class="txt" style="left:${px(nx - 18)};top:${px(by)};width:156px;text-align:center"><div style="display:grid;place-items:center;margin:0 auto;width:120px;height:120px;border-radius:14px;border:1px solid var(--border2);background:#0c0c0f;color:#fafafa">${ico(newn, 46)}</div><div style="margin-top:10px;font:400 28px 'Inter';color:var(--muted)">${lab}</div></div>`; });
  return h;
});

add('E3-corners', 'E', 'Corners', 'silk2', 'Real buttons and fields at 160–220%, plus a radius scale with the pill struck out.', () => {
  let h = '';
  h += badge(100, 188, 'Before'); h += crop('oldIntro', O.demo, { x: 100, y: 246, s: 2.2, cls: 'flat', r: 10, style: 'border-color:rgba(63,63,70,.6)', pad: 8 }); h += crop('oldIntro', O.search, { x: 100 + PW(O.demo, 2.2) + 24, y: 246, s: 1.6, cls: 'flat', r: 10, style: 'border-color:rgba(63,63,70,.6)' });
  h += badge(100, 408, 'After'); h += crop('newIntro', N.demo, { x: 100, y: 466, s: 2.2, cls: 'flat', r: 10, style: 'border-color:rgba(63,63,70,.6)', pad: 8 }); h += crop('newIntro', N.copy, { x: 100 + PW(N.demo, 2.2) + 24, y: 466, s: 1.6, cls: 'flat', r: 10, style: 'border-color:rgba(63,63,70,.6)' });
  h += panel(880, 150, 656, 600, plabel('swatch', 'Radius'));
  [[4, 'controls'], [6, 'buttons · fields'], [8, 'cards'], [12, 'panels'], [999, 'pills']].forEach(([r, k], i) => { const y = 150 + 78 + i * 88; const bad = r === 999; h += `<div style="position:absolute;left:920px;top:${px(y)};width:220px;height:66px;border-radius:${px(Math.min(r, 33))};border:1.5px solid ${bad ? '#f0524f' : 'var(--border2)'};background:${bad ? 'rgba(240,82,79,.08)' : '#0c0c0f'}"></div>`; h += `<div class="txt" style="left:1170px;top:${px(y + 6)}"><div class="mono" style="font-size:26px;color:${bad ? '#f0524f' : 'var(--text)'}">${bad ? '9999' : r} px</div><div style="font:500 26px 'Inter';color:var(--muted);margin-top:4px">${k}</div></div>`; if (bad) h += `<div class="txt" style="left:1350px;top:${px(y + 16)};color:#f0524f">${ico('x-circle', 26)}</div>`; });
  return h;
});

add('E4-micro-ui', 'E', 'Flags, not emojis', 'silk3', 'The language menu with its custom matte flag SVGs beside the same list drawn with emoji flags, which are glossy and change from platform to platform.', () => {
  let h = '';
  const names = ['English (GB)', 'English (US)', 'Español', 'Français', 'Italiano', 'Русский', '中文', '日本語'], flags = ['🇬🇧', '🇺🇸', '🇪🇸', '🇫🇷', '🇮🇹', '🇷🇺', '🇨🇳', '🇯🇵'];
  const EX = 300, EY = 200;
  h += tag('Emoji', null, EX, EY - 62, 'dark');
  h += `<div class="txt" style="left:${px(EX)};top:${px(EY)};width:340px;padding:10px;border-radius:12px;background:#0c0c0f;border:1px solid var(--border2)">${names.map((n, i) => `<div style="display:flex;align-items:center;gap:18px;height:54px;padding:0 14px;border-radius:8px;font:500 22px/1 'Inter';color:#fafafa;${i === 1 ? 'background:rgba(250,250,250,.08)' : ''}"><span style="font-size:32px;line-height:1">${flags[i]}</span><span>${n}</span></div>`).join('')}</div>`;
  const MX = 820, mS = 1.5, menu = { x: 0, y: 548, w: 290, h: 352 };
  h += tag('Custom SVGs', null, MX, EY - 62);
  h += crop('langMenu', menu, { x: MX, y: EY, s: mS });
  return h;
});
add('E6-sidebar-mask', 'E', 'Sidebar mask (animated)', 'u58', 'The React reference sidebar recorded live: clicking from Configuration down through the Components children, the blue thumb sliding along the rail and through the bend where the tree nests. Delivered as MP4 and GIF as well as a still.', () => {
  let h = ''; const s = 1.15; const r = { x: 0, y: 60, w: 290, h: 644 }; const X = (1600 - PW(r, s)) / 2, Y = (900 - PH(r, s)) / 2;
  h += crop('reactRef', r, { x: X, y: Y, s, cls: 'flat', style: 'border-color:rgba(63,63,70,.7)' });
  return h;
}, { animated: true });

add('E5-localized', 'E', 'Localized', 'u56', 'The same Introduction page in English and Japanese at the same scale. Dashed guides run across both: title, first sidebar item, header actions and the language row sit on the same lines, so spacing, alignment and order hold across languages.', () => {
  let h = ''; const s = 0.52, gap = 32; const x0 = (1600 - (1440 * s * 2 + gap)) / 2; const Y = (900 - 900 * s) / 2 + 10;
  h += tag('English (US)', 'language', x0, Y - 62, 'dark'); h += crop('newIntro', { x: 0, y: 0, w: 1440, h: 900 }, { x: x0, y: Y, s });
  h += tag('日本語', 'language', x0 + 1440 * s + gap, Y - 62, 'dark'); h += crop('newIntroJa', { x: 0, y: 0, w: 1440, h: 900 }, { x: x0 + 1440 * s + gap, y: Y, s });
  [35, 80, 168, 856].forEach((y) => { const yy = Y + y * s; h += `<div style="position:absolute;left:${px(x0 - 28)};top:${px(yy)};width:${px(1440 * s * 2 + gap + 56)};border-top:1px dashed rgba(0,120,255,.75)"></div>`; });
  return h;
});

// =============== AREA F ===============
const HIT = ['Eyebrow text', 'Random extraneous explanatory text', 'Over-rounded boxes', 'Non-solid icons', 'Variable spacing not attached to importance of content', 'Non-localized docs (!)', 'Multiple navigation elements spread across the page', 'Sidebars that seem to expand infinitely', 'Sidebars that change when you click something', 'Sidebars where you lose your place'];

add('F1-hit-list', 'F', 'Hit list', 'u57', 'The ten anti-patterns as a two-column list with solid x-marks.', () => {
  let h = ''; h += panel(64, 110, 1472, 610, '', 'soft');
  HIT.forEach((k, i) => { const col = Math.floor(i / 5), row = i % 5; h += xLabel(64 + 40 + col * 760, 110 + 56 + row * 104, k, 28, 680); });
  return h;
});

add('F2-spot-the-antipatterns', 'F', 'Spot the anti-patterns', 'silk1', 'An illustrative generic mock with numbered red callouts; labelled as a mock.', () => {
  let h = ''; const X = 64, Y = 96, W = 800, H = 704;
  // the mock is drawn at label scale (nothing under 27px) and cropped to its hero so it still fits beside the legend
  h += `<div style="position:absolute;left:${px(X)};top:${px(Y)};width:${px(W)};height:${px(H)};border-radius:36px;background:linear-gradient(160deg,#141826,#0e1018);border:1px solid rgba(120,140,255,.35);box-shadow:0 0 0 1px rgba(120,140,255,.15),0 0 80px rgba(90,110,255,.25);overflow:hidden">
    <div style="position:absolute;left:44px;top:40px;font:600 27px 'Inter';letter-spacing:.2em;text-transform:uppercase;background:linear-gradient(90deg,#8b5cf6,#38bdf8);-webkit-background-clip:text;background-clip:text;color:transparent">✦ Documentation</div>
    <div style="position:absolute;left:44px;top:84px;font:700 58px 'Inter';letter-spacing:-.025em;color:#fff">Ship docs faster</div>
    <div style="position:absolute;left:44px;top:170px;display:flex;gap:12px"><span class="pill" style="background:linear-gradient(90deg,#7c3aed,#2563eb);color:#fff">New</span><span class="pill" style="background:rgba(56,189,248,.15);color:#7dd3fc;border:1px solid rgba(56,189,248,.4)">AI-ready</span><span class="pill" style="background:rgba(250,250,250,.08);color:#ddd">v2.0</span></div>
    <div style="position:absolute;left:44px;top:250px;width:712px;height:196px;border-radius:26px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12)">
      <div style="position:absolute;left:20px;top:20px;width:672px;height:156px;border-radius:20px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12)">
        <div style="position:absolute;left:20px;top:20px;width:632px;height:116px;border-radius:16px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);display:flex;align-items:center;gap:22px;padding:0 24px;color:#cbd5e1">
          ${svgFile('icons/old/02-outline-icon.svg', 34)} ${svgFile('icons/old/08-outline-search-k.svg', 34)} ${svgFile('icons/old/09-outline-copy-page.svg', 34)} ${svgFile('icons/old/16-outline-icon.svg', 34)} ${svgFile('icons/old/17-outline-icon.svg', 34)}
          <span style="margin-left:auto;font:400 27px 'Inter';color:#94a3b8;white-space:nowrap">Everything you need</span>
        </div>
      </div>
    </div>
    <div style="position:absolute;left:44px;top:478px;width:712px;font:400 27px/1.5 'Inter';color:#a1a1aa">Our platform enables developers to seamlessly integrate powerful translation capabilities into any application with a unified, developer-first experience.</div>
    <div style="position:absolute;left:44px;top:614px;display:inline-flex;align-items:center;gap:10px;height:56px;padding:0 28px;border-radius:999px;background:linear-gradient(90deg,#6d28d9,#0ea5e9);color:#fff;font:600 27px 'Inter';box-shadow:0 0 30px rgba(56,189,248,.5)">${ico('sparkles', 24)} Copy for AI</div>
    <div style="position:absolute;right:-60px;bottom:-70px;width:300px;height:300px;border-radius:50%;background:radial-gradient(circle at 35% 35%,rgba(167,139,250,.9),rgba(59,130,246,.5) 45%,rgba(14,165,233,0) 70%);filter:blur(3px)"></div>
  </div>`;
  // callouts straddle the mock's left edge (or sit on the thing they point at) so none covers copy
  [[X - 10, Y + 53, 1], [X + 44, Y + 250, 2], [X + 405, Y + 348, 3], [X - 10, Y + 498, 4], [X - 10, Y + 196, 5]].forEach(([x, y, n]) => { h += dot(x, y, n, 'red', 56); });
  ['Eyebrow text', 'Over-rounded boxes', 'Non-solid icons', 'Extraneous explanatory text', 'Spacing unrelated to importance'].forEach((k, i) => { const y = 250 + i * 72; h += dot(904 + 28, y + 23, i + 1, 'red', 56); h += label(904 + 72, y, k); });
  h += `<div class="txt mono" style="left:${px(X)};top:${px(Y + H + 20)};font-size:27px;color:var(--muted)">Illustrative mock — not a real product</div>`;
  return h;
});
add('F3-dont-do', 'F', 'Don’t / Do', 'silk2', 'Three real pairs cropped from old and new.', () => {
  let h = '';
  h += `<div class="badge" style="left:64px;top:145px;border-color:rgba(240,82,79,.6);color:#f0524f">${ico('x-circle', 24)} Don’t</div>`;
  h += `<div class="badge" style="left:830px;top:145px;border-color:rgba(0,120,255,.7);color:#60a5fa">${ico('check-circle', 24)} Do</div>`;
  h += crop('oldIntro', O.sidebarTop, { x: 64, y: 203, s: 1, pad: 0 }); h += crop('newIntro', N.sidebarTop, { x: 830, y: 203, s: 1, pad: 0 });
  h += crop('oldIntro', O.subtitleShort, { x: 64, y: 423, s: 1.15, cls: 'flat' }); h += crop('newIntro', { x: 310, y: 129, w: 600, h: 64 }, { x: 830, y: 423, s: 1.15, cls: 'flat' });
  h += crop('oldIntro', O.cardsRow2Right, { x: 64, y: 603, s: 0.9 }); h += crop('newIntro', { x: 310, y: 608, w: 560, h: 209 }, { x: 830, y: 603, s: 0.62 });
  return h;
});

add('F4-bingo', 'F', 'The fix for each', 'silk3', 'The hit list as a 3×3 card where every anti-pattern is struck out and its replacement written under it.', () => {
  let h = ''; const pairs = [['Eyebrow text', 'Plain headings'], ['Extraneous explanatory text', 'One line each'], ['Over-rounded boxes', '6–8px corners'], ['Non-solid icons', 'Solid icons'], ['Non-localized docs', 'Localized docs'], ['Spacing unrelated to importance', 'Spacing that groups'], ['Navigation spread across the page', 'One accordion'], ['Sidebars that expand forever', 'A clear hierarchy'], ['Sidebars that lose your place', 'A sidebar that persists']];
  const cw = 330, ch = 210, gap = 14, X0 = (1600 - (cw * 3 + gap * 2)) / 2, Y0 = (900 - (ch * 3 + gap * 2)) / 2;
  pairs.forEach(([bad, good], i) => { const c = i % 3, r = Math.floor(i / 3); const x = X0 + c * (cw + gap), y = Y0 + r * (ch + gap);
    h += `<div style="position:absolute;left:${px(x)};top:${px(y)};width:${px(cw)};height:${px(ch)};border-radius:8px;background:rgba(9,9,11,.9);border:1px solid rgba(250,250,250,.14);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:0 24px;text-align:center"><span style="font:500 28px/1.25 'Inter';color:rgba(250,250,250,.6);text-decoration:line-through;text-decoration-color:var(--red);text-decoration-thickness:2.5px">${bad}</span><span style="font:600 30px/1.2 'Inter';letter-spacing:-.01em;color:#fafafa">${good}</span></div>`; });
  return h;
});
// =============== COVERS (isometric wire, dashed) ===============
const R = { page:{x:0,y:0,w:1440,h:900}, sidebar:{x:0,y:0,w:290,h:900}, content:{x:310,y:60,w:746,h:840}, header:{x:1068,y:12,w:356,h:46}, headerLight:{x:1081,y:12,w:343,h:46} /* the light capture's star pill is 13px narrower */, toc:{x:1090,y:74,w:330,h:130}, footer:{x:11,y:706,w:270,h:138}, prefs:{x:11,y:847,w:270,h:45}, switcher:{x:19,y:71,w:254,h:54}, h1:{x:310,y:80,w:420,h:37}, sub:{x:310,y:129,w:746,h:24}, meta:{x:310,y:169,w:746,h:49}, cards:{x:310,y:400,w:746,h:417} };
const SIDE_ITEMS = [168,198,229,300,330,361,392,422,453,483,514,544,575,605,677,707,738,768].map(y => ({ x: 31, y, w: 160, h: 31 }));
function iso(o) {
  const { s, cx, cy, kx = Math.cos(Math.PI / 6), ky = 0.5 } = o;
  const P = (x, y, z = 0) => [cx + (x - y) * kx * s, cy + (x + y) * ky * s - z * s];
  const f = (n) => Math.round(n * 100) / 100;
  const pts = (arr) => arr.map(p => `${f(p[0])},${f(p[1])}`).join(' ');
  const poly = (arr, attrs) => `<polygon points="${pts(arr)}" ${attrs}/>`;
  const rectOn = (r, z, attrs) => poly([P(r.x, r.y, z), P(r.x + r.w, r.y, z), P(r.x + r.w, r.y + r.h, z), P(r.x, r.y + r.h, z)], attrs);
  const line3 = (a, b, attrs) => { const A = P(...a), B = P(...b); return `<line x1="${f(A[0])}" y1="${f(A[1])}" x2="${f(B[0])}" y2="${f(B[1])}" ${attrs}/>`; };
  const planeMatrix = (z) => `matrix(${f(kx * s)} ${f(ky * s)} ${f(-kx * s)} ${f(ky * s)} ${f(cx)} ${f(cy - z * s)})`;
  const textOn = (x, y, z, str, size, attrs, rot = 0) => `<g transform="${planeMatrix(z)}"><text x="${x}" y="${y}" font-size="${size}" ${rot ? `transform="rotate(${rot} ${x} ${y})"` : ''} ${attrs}>${str}</text></g>`;
  const node = (x, y, z, r = 3.2, fill = '#0078FF') => { const A = P(x, y, z); return `<circle cx="${f(A[0])}" cy="${f(A[1])}" r="${r}" fill="${fill}"/>`; };
  const corners = (r, z) => [[r.x, r.y, z], [r.x + r.w, r.y, z], [r.x + r.w, r.y + r.h, z], [r.x, r.y + r.h, z]];
  const extrude = (r, z1, z2, attrs) => corners(r, z1).map(([x, y]) => line3([x, y, z1], [x, y, z2], attrs)).join('');
  return { P, poly, rectOn, line3, planeMatrix, textOn, node, corners, extrude, f };
}
const WIRE = 'fill="none" stroke="rgba(250,250,250,.88)" stroke-width="1.4" stroke-dasharray="7 6" stroke-linecap="round"';
const WIRE2 = 'fill="none" stroke="rgba(250,250,250,.55)" stroke-width="1.1" stroke-dasharray="5 5" stroke-linecap="round"';
const SOLID = 'fill="none" stroke="rgba(250,250,250,.9)" stroke-width="1.4"';
const FAINT = 'fill="none" stroke="rgba(250,250,250,.3)" stroke-width="1" stroke-dasharray="2.5 6"';
const BLUE = 'fill="none" stroke="#0078FF" stroke-width="1.7" stroke-dasharray="7 6" stroke-linecap="round"';
const BLUE_SOLID = 'fill="none" stroke="#0078FF" stroke-width="1.7"';
const SLAB = 'fill="rgba(9,9,11,.62)" stroke="rgba(250,250,250,.88)" stroke-width="1.4" stroke-dasharray="7 6"';
const SLAB_BLUE = 'fill="rgba(0,120,255,.10)" stroke="#0078FF" stroke-width="1.7" stroke-dasharray="7 6"';
const DASHWORD = (w = 1.5, color = '#fafafa', dash = '5 4') => `fill="none" stroke="${color}" stroke-width="${w}" stroke-dasharray="${dash}" stroke-linejoin="round" style="font-family:'Inter';font-weight:700;letter-spacing:-.035em"`;
const MONO = 'fill="rgba(250,250,250,.7)" style="font-family:Geist Mono,monospace;font-weight:500;letter-spacing:.06em"';
const svgWrap = (W, H, inner) => `<svg class="ln" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="left:0;top:0;overflow:visible">${inner}</svg>`;

const underlay = (W, H, cx, cy, rx, ry, a = .6) => `<div style="position:absolute;left:0;top:0;width:${W}px;height:${H}px;background:radial-gradient(${rx}px ${ry}px at ${cx}px ${cy}px, rgba(9,9,11,${a}) 0%, rgba(9,9,11,${a * .7}) 45%, rgba(9,9,11,0) 100%)"></div>`;
const screenWord = (x, y, str, size, attrs, anchor = 'start') => `<text x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}" ${attrs}>${str}</text>`;
// dashed word with a dark cut-out fill so it reads over the bright band
const WORD = (w = 2, color = '#fafafa', dash = '8 5', fill = 'rgba(9,9,11,.72)') => `fill="${fill}" stroke="${color}" stroke-width="${w}" stroke-dasharray="${dash}" stroke-linejoin="round" paint-order="fill stroke" style="font-family:'Inter';font-weight:700;letter-spacing:-.035em"`;
const KX = Math.cos(Math.PI / 6), KY = 0.5;
// true-isometric extras: thick slabs and upright text on vertical faces
function isoPlus(I, s, cx, cy) {
  const f = I.f;
  const slab3 = (r, z, th, o = {}) => { let out = '';
    const topA = o.top || SLAB, edge = o.edge || 'rgba(250,250,250,.6)', fillSide = o.side || 'rgba(9,9,11,.86)', dash = o.dash || '7 6', sw = o.sw || 1.3;
    const side = `fill="${fillSide}" stroke="${edge}" stroke-width="${sw}" stroke-dasharray="${dash}"`;
    out += I.poly([I.P(r.x + r.w, r.y, z - th), I.P(r.x + r.w, r.y + r.h, z - th), I.P(r.x + r.w, r.y + r.h, z), I.P(r.x + r.w, r.y, z)], side); // right face
    out += I.poly([I.P(r.x, r.y + r.h, z - th), I.P(r.x + r.w, r.y + r.h, z - th), I.P(r.x + r.w, r.y + r.h, z), I.P(r.x, r.y + r.h, z)], side); // front face
    out += I.rectOn(r, z, topA); return out; };
  // text on the front vertical face (plane y = y0): u along +x, v downward from z0
  const frontMatrix = (y0, z0) => `matrix(${f(KX * s)} ${f(KY * s)} 0 ${f(s)} ${f(cx - y0 * KX * s)} ${f(cy + y0 * KY * s - z0 * s)})`;
  const textFront = (x, y0, z0, str, size, attrs, anchor = 'start') => `<g transform="${frontMatrix(y0, z0)}"><text x="${x}" y="0" font-size="${size}" text-anchor="${anchor}" ${attrs}>${str}</text></g>`;
  // text on the right vertical face (plane x = x0): u along -y (reads left→right up the face), v downward
  const rightMatrix = (x0, z0) => `matrix(${f(KX * s)} ${f(-KY * s)} 0 ${f(s)} ${f(cx + x0 * KX * s)} ${f(cy + x0 * KY * s - z0 * s)})`;
  const textRight = (yFromFront, x0, z0, str, size, attrs, anchor = 'start') => `<g transform="${rightMatrix(x0, z0)}"><text x="${yFromFront}" y="0" font-size="${size}" text-anchor="${anchor}" ${attrs}>${str}</text></g>`;
  const grid = (x0, x1, y0, y1, step, attrs) => { let o = ''; for (let x = x0; x <= x1; x += step) o += I.line3([x, y0, 0], [x, y1, 0], attrs); for (let y = y0; y <= y1; y += step) o += I.line3([x0, y, 0], [x1, y, 0], attrs); return o; };
  return { slab3, textFront, textRight, grid };
}
const zonesWire = (I, z, blueNav = true) => { let g = '';
  g += I.rectOn(R.sidebar, z, blueNav ? 'fill="rgba(0,120,255,.16)" stroke="#0078FF" stroke-width="1.6" stroke-dasharray="7 6"' : WIRE2); SIDE_ITEMS.forEach(r => { g += I.line3([r.x, r.y + 15, z], [r.x + r.w, r.y + 15, z], `stroke="${blueNav ? 'rgba(0,120,255,.8)' : 'rgba(250,250,250,.5)'}" stroke-width="1.2"`); });
  g += I.rectOn(R.switcher, z, blueNav ? BLUE_SOLID : SOLID); g += I.rectOn(R.content, z, WIRE2); g += I.rectOn(R.h1, z, SOLID); g += I.line3([310, 218, z], [1056, 218, z], SOLID);
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) g += I.rectOn({ x: 310 + c * 190, y: 400 + r * 210, w: 178, h: 195 }, z, WIRE2);
  g += I.rectOn(R.header, z, SOLID); g += I.rectOn(R.toc, z, WIRE2); [112, 138, 170].forEach(y => { g += I.line3([1097, y + 12, z], [1330, y + 12, z], WIRE2); }); g += I.rectOn(R.footer, z, WIRE2); g += I.rectOn(R.prefs, z, SOLID);
  return g; };

// N1 Signage stack — four thick slabs rising; each front face carries an upright dashed word.
function coverSignage(W, H) {
  const k = W / 1600; const s = 0.40 * k; const cx = W * 0.49, cy = H * 0.36; const I = iso({ s, cx, cy }); const X = isoPlus(I, s, cx, cy); let g = '';
  const th = 170, Z = [0, 300, 600, 900]; const names = ['DOCS', 'NAVIGATION', 'CONTENT', 'ACTIONS'];
  g += X.grid(0, 1440, 0, 900, 180, FAINT);
  g += I.extrude(R.page, 0, Z[3] - th, FAINT);
  Z.forEach((z, i) => { const blue = i === 1;
    g += X.slab3(R.page, z, th, { top: blue ? 'fill="rgba(9,9,11,.8)" stroke="#0078FF" stroke-width="1.7" stroke-dasharray="7 6"' : 'fill="rgba(9,9,11,.8)" stroke="rgba(250,250,250,.9)" stroke-width="1.5" stroke-dasharray="7 6"', edge: blue ? '#0078FF' : 'rgba(250,250,250,.75)', side: blue ? 'rgba(4,30,64,.92)' : 'rgba(12,12,15,.94)' });
    if (i === 1) { g += I.rectOn(R.sidebar, z, 'fill="rgba(0,120,255,.18)" stroke="#0078FF" stroke-width="1.6" stroke-dasharray="7 6"'); SIDE_ITEMS.forEach(r => { g += I.line3([r.x, r.y + 15, z], [r.x + r.w, r.y + 15, z], 'stroke="rgba(0,120,255,.8)" stroke-width="1.2"'); }); g += I.rectOn(R.switcher, z, BLUE_SOLID); }
    if (i === 2) { g += I.rectOn(R.content, z, WIRE2); g += I.rectOn(R.h1, z, SOLID); g += I.line3([310, 218, z], [1056, 218, z], SOLID); for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) g += I.rectOn({ x: 310 + c * 190, y: 400 + r * 210, w: 178, h: 195 }, z, WIRE2); }
    if (i === 3) { g += I.rectOn(R.header, z, SOLID); g += I.rectOn(R.toc, z, WIRE2); g += I.rectOn(R.footer, z, WIRE2); g += I.rectOn(R.prefs, z, SOLID); }
    g += X.textFront(46, 900, z - 34, names[i], 128, WORD(blue ? 2.6 : 2.4, blue ? '#60a5fa' : '#fafafa', '10 5', 'rgba(9,9,11,.3)'));
    I.corners(R.page, z).forEach(([x, y]) => { g += I.node(x, y, z, 3, blue ? '#0078FF' : 'rgba(250,250,250,.9)'); });
    const A = I.P(1440, 0, z); g += `<text x="${I.f(A[0] + 18)}" y="${I.f(A[1] + 4)}" font-size="${11 * k}" ${MONO}>0${i + 1}</text>`; });
  return svgWrap(W, H, g);
}

// N2 Type wall — a tall upright wall of dashed type standing on the back edge of the page slab.
function coverTypeWall(W, H) {
  const k = W / 1600; const s = 0.38 * k; const cx = W * 0.44, cy = H * 0.52; const I = iso({ s, cx, cy }); const X = isoPlus(I, s, cx, cy); let g = '';
  const wallH = 760;
  g += X.grid(-180, 1620, 0, 1080, 180, FAINT);
  g += X.slab3(R.page, 0, 40, { top: 'fill="rgba(9,9,11,.62)" stroke="rgba(250,250,250,.9)" stroke-width="1.5" stroke-dasharray="7 6"', edge: 'rgba(250,250,250,.7)' });
  g += zonesWire(I, 0);
  // wall: vertical face along x at y=0, from z=0 to wallH
  g += I.poly([I.P(0, 0, 0), I.P(1440, 0, 0), I.P(1440, 0, wallH), I.P(0, 0, wallH)], 'fill="rgba(9,9,11,.82)" stroke="rgba(250,250,250,.9)" stroke-width="1.5" stroke-dasharray="7 6"');
  g += I.line3([0, 0, wallH], [0, 0, wallH + 160], FAINT); g += I.line3([1440, 0, wallH], [1440, 0, wallH + 160], FAINT);
  g += X.textFront(60, 0, wallH - 60, 'docs,', 330, WORD(3, '#fafafa', '11 5', 'rgba(9,9,11,.42)'));
  g += X.textFront(60, 0, wallH - 400, 'redesigned', 330, WORD(3, '#fafafa', '11 5', 'rgba(9,9,11,.42)'));
  [[0, 0], [1440, 0]].forEach(([x, y]) => { g += I.node(x, y, wallH, 3); g += I.node(x, y, 0, 3, 'rgba(250,250,250,.9)'); });
  I.corners(R.page, 0).forEach(([x, y]) => { g += I.node(x, y, 0, 2.5, 'rgba(250,250,250,.8)'); });
  return svgWrap(W, H, g);
}

// N3 Extruded zones — the page as a slab, each zone raised as a dark prism; the title upright on the slab's front face.
function coverExtruded(W, H) {
  const k = W / 1600; const s = 0.46 * k; const cx = W * 0.55, cy = H * 0.36; const I = iso({ s, cx, cy }); const X = isoPlus(I, s, cx, cy); let g = '';
  g += X.grid(-360, 1800, -360, 1260, 180, FAINT);
  g += X.slab3(R.page, 0, 120, { top: 'fill="rgba(9,9,11,.7)" stroke="rgba(250,250,250,.9)" stroke-width="1.5" stroke-dasharray="7 6"', edge: 'rgba(250,250,250,.75)' });
  const prisms = [[R.content, 120, false], [R.toc, 200, false], [R.header, 260, false], [R.footer, 300, false], [R.prefs, 360, false], [R.sidebar, 460, true]];
  prisms.sort((a, b) => (a[0].x + a[0].y) - (b[0].x + b[0].y)); // paint back to front
  prisms.forEach(([r, h, blue]) => { g += I.extrude(r, 0, h, blue ? 'stroke="rgba(0,120,255,.45)" stroke-width="1" stroke-dasharray="3 5"' : FAINT); g += X.slab3(r, h, h, { top: blue ? 'fill="rgba(0,120,255,.2)" stroke="#0078FF" stroke-width="1.7" stroke-dasharray="7 6"' : 'fill="rgba(9,9,11,.85)" stroke="rgba(250,250,250,.9)" stroke-width="1.4" stroke-dasharray="7 6"', edge: blue ? '#0078FF' : 'rgba(250,250,250,.7)', side: blue ? 'rgba(4,30,64,.92)' : 'rgba(12,12,15,.94)' }); });
  SIDE_ITEMS.forEach(r => { g += I.line3([r.x, r.y + 15, 460], [r.x + r.w, r.y + 15, 460], 'stroke="rgba(0,120,255,.8)" stroke-width="1.2"'); });
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) g += I.rectOn({ x: 310 + c * 190, y: 400 + r * 210, w: 178, h: 195 }, 120, WIRE2);
  g += X.textFront(40, 900, -18, 'REDESIGNED DOCS', 100, WORD(2.7, '#fafafa', '10 5', 'rgba(9,9,11,.45)'));
  return svgWrap(W, H, g);
}

// N4 Rising words — five thick slabs; the words are screen-aligned dashed type tied to each slab with a leader.
function coverRisingWords(W, H) {
  const k = W / 1600; const s = 0.34 * k; const cx = W * 0.685, cy = H * 0.515; const I = iso({ s, cx, cy }); const X = isoPlus(I, s, cx, cy); let g = '';
  const words = ['PREFERENCES', 'LINKS', 'CONTENT', 'ACTIONS', 'NAVIGATION'];
  const slab = { x: 0, y: 0, w: 1440, h: 420 }; const th = 50; const Z = words.map((_, i) => i * 250);
  g += X.grid(0, 1440, 0, 420, 180, FAINT); g += I.extrude(slab, 0, Z[4] - th, FAINT);
  words.forEach((w, i) => { const blue = i === 4; g += X.slab3(slab, Z[i], th, { top: blue ? 'fill="rgba(9,9,11,.8)" stroke="#0078FF" stroke-width="1.7" stroke-dasharray="7 6"' : 'fill="rgba(9,9,11,.78)" stroke="rgba(250,250,250,.9)" stroke-width="1.4" stroke-dasharray="7 6"', edge: blue ? '#0078FF' : 'rgba(250,250,250,.7)', side: blue ? 'rgba(4,30,64,.92)' : 'rgba(12,12,15,.94)' });
    if (blue) { SIDE_ITEMS.slice(0, 12).forEach(r => { g += I.line3([r.x, r.y - 120, Z[i]], [r.x + r.w, r.y - 120, Z[i]], 'stroke="rgba(0,120,255,.75)" stroke-width="1.2"'); }); }
    if (i === 2) for (let c = 0; c < 6; c++) g += I.rectOn({ x: 60 + c * 225, y: 90, w: 200, h: 240 }, Z[i], WIRE2);
    if (i === 3) { g += I.rectOn({ x: 60, y: 120, w: 700, h: 60 }, Z[i], SOLID); g += I.rectOn({ x: 60, y: 240, w: 1320, h: 60 }, Z[i], WIRE2); }
    if (i === 1) [60, 160, 260, 360].forEach(y => { g += I.line3([60, y, Z[i]], [900, y, Z[i]], WIRE2); });
    if (i === 0) { g += I.rectOn({ x: 60, y: 120, w: 560, h: 180 }, Z[i], WIRE2); g += I.rectOn({ x: 760, y: 120, w: 620, h: 180 }, Z[i], WIRE2); }
    const A = I.P(0, 420, Z[i] - th / 2); const tx = A[0] - 70 * k; g += `<line x1="${I.f(A[0] - 6)}" y1="${I.f(A[1])}" x2="${I.f(tx + 10)}" y2="${I.f(A[1])}" stroke="${blue ? '#0078FF' : 'rgba(250,250,250,.6)'}" stroke-width="1.3" stroke-dasharray="4 4"/>`;
    g += screenWord(I.f(tx), I.f(A[1] + 22 * k), w, 62 * k, WORD(blue ? 2.5 : 2.3, blue ? '#60a5fa' : '#fafafa', '10 5', 'rgba(9,9,11,.45)'), 'end');
    I.corners(slab, Z[i]).forEach(([x, y]) => { g += I.node(x, y, Z[i], 3, blue ? '#0078FF' : 'rgba(250,250,250,.9)'); }); });
  return svgWrap(W, H, g);
}

// N5 Scaffold — hollow wire pillars over the zones on a graph-paper ground; the title as big dashed type top-left.
function coverScaffold(W, H) {
  const k = W / 1600; const s = 0.38 * k; const cx = W * 0.70, cy = H * 0.50; const I = iso({ s, cx, cy }); const X = isoPlus(I, s, cx, cy); let g = '';
  g += X.grid(-540, 1980, -540, 1440, 180, FAINT);
  g += I.rectOn(R.page, 0, 'fill="rgba(9,9,11,.5)" stroke="rgba(250,250,250,.9)" stroke-width="1.5"');
  g += zonesWire(I, 0);
  const pillars = [[R.content, 260, false], [R.toc, 420, false], [R.header, 520, false], [R.footer, 560, false], [R.prefs, 640, false], [R.sidebar, 760, true]];
  pillars.sort((a, b) => (a[0].x + a[0].y) - (b[0].x + b[0].y));
  pillars.forEach(([r, h, blue]) => { const e = blue ? 'stroke="#0078FF" stroke-width="1.5" stroke-dasharray="6 5"' : 'stroke="rgba(250,250,250,.65)" stroke-width="1.1" stroke-dasharray="6 5"'; g += I.corners(r, 0).map(([x, y]) => I.line3([x, y, 0], [x, y, h], e)).join(''); [h * .5, h].forEach(z => { g += I.rectOn(r, z, `fill="${z === h ? (blue ? 'rgba(0,120,255,.22)' : 'rgba(9,9,11,.75)') : 'none'}" ${e}`); }); I.corners(r, h).forEach(([x, y]) => { g += I.node(x, y, h, 2.6, blue ? '#0078FF' : 'rgba(250,250,250,.9)'); }); });
  g += screenWord(64 * k, 200 * k, 'docs,', 176 * k, WORD(2.6, '#fafafa', '10 5', 'rgba(9,9,11,.5)'));
  g += screenWord(64 * k, 356 * k, 'redesigned', 176 * k, WORD(2.6, '#fafafa', '10 5', 'rgba(9,9,11,.5)'));
  return svgWrap(W, H, g);
}

const COVERS = [['H1-cover-signage', 'Cover · signage stack', coverSignage, 'silk1', 0, 'Four thick slabs rise from the ground: docs, navigation, content, actions. Each word stands upright on its slab’s front face, so it reads like a sign on a box rather than a skewed label.'], ['H2-cover-type-wall', 'Cover · type wall', coverTypeWall, 'silk2', 0, 'A tall wall of dashed type stands on the back edge of the page slab, with the wire layout lying at its foot. Letters stay upright on the wall face.'], ['H3-cover-extruded-zones', 'Cover · extruded zones', coverExtruded, 'silk3', 0, 'The page as a slab with every zone raised as a dark prism, navigation tallest and blue; a small upright title runs along the slab’s front edge.'], ['H4-cover-rising-words', 'Cover · rising words', coverRisingWords, 'silk4', 0, 'Five thick slabs rise like the tower you liked, but the words are screen-aligned dashed type tied to each slab with a leader, so every word is fully legible.'], ['H5-cover-scaffold', 'Cover · scaffold', coverScaffold, 'silk1', 0, 'Hollow wire pillars stand over each zone on a graph-paper ground, navigation in blue; the title is large dashed type in the top-left, upright and unskewed.']];
// EXPLODED COMPONENTS — the real components of the page hovering on glass panes above a ghost wireframe, 3/4 perspective; one-line title above.
function coverExploded(W, H, o = {}) {
  const k = W / 1600; const s = (o.s || 0.64) * k; const plateW = 1440 * s, plateH = 900 * s;
  const rotX = o.rotX != null ? o.rotX : 50, rotZ = o.rotZ != null ? o.rotZ : 0; const persp = 4000 * k;
  const light = !!o.light; const shot = `/${light ? L.SHOTS.newIntroLight.file : L.SHOTS.newIntro.file}`;
  // light mode: the page itself in its light theme (white panes, ink hairline); ground, ghost wireframe and shadows unchanged
  const paneBg = light ? '#ffffff' : '#09090b', ink = light ? '9,9,11' : '250,250,250', shadowA = .5;
  const HEADER = light ? R.headerLight : R.header;
  // inner padding (page px) around a crop: flat page-dark space inside the pane's border
  const comps = [
    { r: R.content, z: 34, blue: false, posts: false, pad: { l: 28, r: 28 } },
    { r: { x: 0, y: 0, w: 290, h: 700 }, z: 86, blue: true },
    { r: HEADER, z: 138, blue: false }, { r: R.toc, z: 138, blue: false },
    { r: R.footer, z: 190, blue: false, pad: { b: 2 } }, { r: R.prefs, z: 190, blue: false, pad: { b: 6, r: 14 }, dy: 2 },
  ];
  const boxOf = (c) => { const p = Object.assign({ t: 0, r: 0, b: 0, l: 0 }, c.pad || {}); return { x: c.r.x - p.l, y: c.r.y - p.t + (c.dy || 0), w: c.r.w + p.l + p.r, h: c.r.h + p.t + p.b, p }; };
  // ground: ghost wireframe of the page, plus soft contact shadows under each component
  let planes = `<div style="position:absolute;left:0;top:0;width:${plateW}px;height:${plateH}px;opacity:${light ? .98 : .92}">${wireframePage(0, 0, s, k, { ghost: true, light })}</div>`;
  comps.forEach((c) => { const b = boxOf(c); planes += `<div style="position:absolute;left:${b.x * s}px;top:${b.y * s}px;width:${b.w * s}px;height:${b.h * s}px;border-radius:${5 * k}px;background:${light ? 'rgba(9,9,11,.05)' : 'rgba(0,0,0,.35)'};border:1px dashed ${c.blue ? 'rgba(0,120,255,.45)' : (light ? 'rgba(9,9,11,.32)' : `rgba(${ink},.22)`)}"></div>`; });
  comps.forEach((c) => { const { r, z, blue, posts } = c; const b = boxOf(c); const zz = z * k; const pad = 8 * s;
    const border = blue ? 'rgba(0,120,255,.95)' : (light ? 'rgba(9,9,11,.22)' : `rgba(${ink},.34)`);
    // glass pane behind the crop
    let inner = `<div style="position:absolute;left:${b.x * s - pad}px;top:${b.y * s - pad}px;width:${b.w * s + pad * 2}px;height:${b.h * s + pad * 2}px;border-radius:${8 * k}px;background:${blue ? 'rgba(0,120,255,.07)' : `rgba(${ink},.035)`};border:1px solid ${blue ? 'rgba(0,120,255,.45)' : `rgba(${ink},.14)`};backdrop-filter:blur(2px)"></div>`;
    // the pane: page-dark box with the crop inset by its padding
    inner += `<div style="position:absolute;left:${b.x * s}px;top:${b.y * s}px;width:${b.w * s}px;height:${b.h * s}px;background:${paneBg};border:1px solid ${border};border-radius:${5 * k}px;overflow:hidden;box-shadow:0 ${zz * .35}px ${zz * .9}px rgba(0,0,0,${shadowA})${blue ? ', 0 0 0 3px rgba(0,120,255,.16)' : ''}"><div style="position:absolute;left:${b.p.l * s}px;top:${b.p.t * s}px;width:${r.w * s}px;height:${r.h * s}px;background:url(${shot}) ${-r.x * s}px ${-r.y * s}px / ${1440 * s}px ${900 * s}px no-repeat"></div></div>`;
    if (posts !== false) [[b.x, b.y + b.h, .34], [b.x + b.w, b.y + b.h, .34], [b.x, b.y, .18], [b.x + b.w, b.y, .18]].forEach(([cx, cy, a]) => { inner += `<div style="position:absolute;left:${cx * s}px;top:${cy * s}px;width:0;height:${zz}px;transform-origin:top;transform:rotateX(-90deg);border-left:1px dashed rgba(${blue ? '96,165,250' : ink},${a})"></div>`; });
    planes += `<div style="position:absolute;left:0;top:0;width:${plateW}px;height:${plateH}px;transform-style:preserve-3d;transform:translateZ(${zz}px)">${inner}</div>`; });
  const sx = (W - plateW) / 2 + (o.dx != null ? o.dx : 0) * k, sy = H * (o.cy || 0.60) - plateH / 2;
  const scene = `<div style="position:absolute;left:${sx}px;top:${sy}px;width:${plateW}px;height:${plateH}px;perspective:${persp}px;perspective-origin:50% 50%"><div style="position:absolute;inset:0;transform-style:preserve-3d;transform:rotateX(${rotX}deg) rotateZ(${rotZ}deg)">${planes}</div></div>`;
  const title = o.title === false ? '' : `<div style="position:absolute;left:${64 * k}px;top:${(o.titleTop || 84) * k}px;font:500 ${78 * k}px/1.02 'Inter';letter-spacing:-.036em;color:#fafafa;white-space:nowrap">Designing docs for <span style="color:#60a5fa">humans</span></div>`;
  return scene + title;
}
add('H1-cover-exploded', 'H', 'Cover · exploded components', 'silk5', 'The page taken apart in a three-quarter perspective: the real content column, navigation, actions and contents rail, and the links and preferences rows each hover on their own glass pane above a ghost wireframe of the page, held at their true positions by dashed posts. Straight-on perspective, no text, blue background.', () => coverExploded(1600, 900, { title: false, s: .9, cy: .52, dx: 0 }), { wash: .1 });
add('H1-cover-exploded-og', 'H', 'Cover · exploded components (OpenGraph 1200×630)', 'silk5', 'The exploded-components stack at OpenGraph size, straight on, on the blue-toned export.', () => coverExploded(1200, 630, { title: false, s: .9, cy: .52, dx: 0 }), { wash: .12, w: 1200, h: 630 });
add('H1-cover-exploded-og-light', 'H', 'OpenGraph · exploded components, light theme (1200×630)', 'blue25', 'The OpenGraph image with the docs in their light theme, on the same ground as the dark one.', () => coverExploded(1200, 630, { title: false, s: .9, cy: .52, dx: 0, light: true }), { wash: .12, w: 1200, h: 630 });
add('H1-cover-exploded-light', 'H', 'Cover · exploded components, light theme', 'blue25', 'The cover with the docs in their light theme: the same dark blue ground and scale as the header cover, the page panes and the wireframe they hover over in paper and ink.', () => coverExploded(1600, 900, { title: false, s: .9, cy: .52, dx: 0, light: true }), { wash: .1 });
// ===== Fleshed-out wireframe of the real page (flat), with real crops tied to the zones =====
function wireframePage(X, Y, p, k = 1, opts = {}) {
  const ghost = !!opts.ghost, light = !!opts.light;
  const ink = light ? '9,9,11' : '250,250,250';
  const d = (x, y, w, h, st) => `<div style="position:absolute;left:${px(X + x * p)};top:${px(Y + y * p)};width:${px(w * p)};height:${px(h * p)};${st}"></div>`;
  const bar = (x, y, w, h, a = .4, r = 3, c = ink) => d(x, y, w, h, `background:rgba(${c},${a});border-radius:${px(Math.min(r, h * p / 2))}`);
  const box = (x, y, w, h, a = .12, r = 8, fill = `rgba(${ink},.02)`) => d(x, y, w, h, `border:1px solid rgba(${ink},${a});border-radius:${px(r * p * 1.4)};background:${fill}`);
  const circ = (x, y, sz, a = .5, filled = false) => d(x, y, sz, sz, `border-radius:50%;${filled ? `background:rgba(${ink},${a})` : `border:1px solid rgba(${ink},${a})`}`);
  let h = '';
  h += d(0, 0, 1440, 900, light ? (ghost ? 'background:rgba(255,255,255,.95);border:1px solid rgba(9,9,11,.3);border-radius:6px' : 'background:rgba(255,255,255,.96);border:1px solid rgba(9,9,11,.22);border-radius:10px;box-shadow:0 40px 100px rgba(0,0,0,.4)') : ghost ? 'background:rgba(12,13,17,.8);border:1px solid rgba(250,250,250,.36);border-radius:6px' : 'background:rgba(15,16,20,.94);border:1px solid rgba(250,250,250,.16);border-radius:10px;box-shadow:0 40px 100px rgba(0,0,0,.6)');
  h += d(0, 0, 290, 900, `background:rgba(${ink},.025);border-right:1px solid rgba(${ink},.08);border-radius:10px 0 0 10px`);
  // sidebar: logo, switcher, groups, items, footer, prefs
  h += bar(19, 24, 22, 22, .6, 6); h += bar(49, 29, 112, 12, .55);
  h += box(19, 71, 254, 54, .16, 8, `rgba(${ink},.03)`); h += circ(33, 87, 22, .5, true); h += bar(67, 80, 82, 10, .7); h += bar(67, 96, 58, 8, .35); h += bar(252, 94, 8, 8, .3);
  [[145, 88], [277, 94], [654, 69]].forEach(([y, w]) => { h += bar(19, y + 4, w, 10, .8); });
  const items = [[168, 88], [198, 96], [229, 140], [300, 44], [330, 70], [361, 132], [392, 148], [422, 100], [453, 90], [483, 30], [514, 54], [544, 50], [575, 26], [605, 36], [677, 74]];
  items.forEach(([y, w], i) => { if (y > 880) return; if (i === 0) { h += d(19, y, 254, 31, 'background:rgba(0,120,255,.13);border-radius:5px'); h += d(19, y + 6, 2, 19, 'background:#0078FF;border-radius:1px'); } h += bar(31, y + 11, w, 8, i === 0 ? .95 : .34); });
  [713, 744, 775, 806].forEach((y, i) => { h += bar(23, y + 10, 12, 12, .5, 3); h += bar(43, y + 12, [72, 78, 50, 74][i], 8, .5); });
  h += bar(23, 868, 12, 12, .5, 3); h += bar(43, 870, 74, 8, .5); h += bar(125, 872, 8, 4, .4, 2); h += circ(253, 862, 24, .5, true);
  // header actions
  h += circ(1079, 27, 16, .55, true); h += circ(1121, 27, 16, .55, true);
  h += box(1166, 14, 72, 40, .3, 6, `rgba(${ink},.03)`); h += bar(1176, 27, 14, 14, .6, 4); h += bar(1196, 30, 30, 8, .6);
  h += box(1246, 19, 68, 32, .35, 6, `rgba(${ink},.03)`); h += bar(1260, 31, 40, 8, .7);
  h += d(1320, 19, 97, 32, `background:${light ? '#09090b' : '#fafafa'};border-radius:6px`); h += bar(1336, 31, 65, 8, .9, 3, light ? '250,250,250' : '9,9,11');
  // content
  h += bar(310, 82, 296, 30, .95, 4); h += bar(310, 132, 700, 13, .42); h += bar(310, 180, 134, 9, .32); h += box(909, 169, 147, 32, .3, 6); h += bar(924, 181, 12, 10, .55, 2); h += bar(944, 182, 60, 8, .6); h += bar(1030, 182, 8, 8, .35);
  h += bar(310, 218, 746, 1, .16, 0); h += bar(310, 245, 746, 10, .4); h += bar(310, 266, 512, 10, .4);
  h += bar(310, 324, 746, 1, .16, 0); h += bar(310, 340, 156, 18, .85, 4);
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) { const x = 310 + c * 190, y = 400 + r * 208; h += box(x, y, 178, 195, .13, 8, `rgba(${ink},.02)`); h += bar(x + 18, y + 22, 22, 22, .6, 5); h += bar(x + 18, y + 62, [70, 46, 66, 64, 52, 42, 92, 70][r * 4 + c], 10, .85); h += bar(x + 18, y + 84, 132, 8, .34); h += bar(x + 18, y + 100, 118, 8, .34); h += bar(x + 18, y + 116, 84, 8, .34); }
  h += bar(310, 842, 452, 10, .34); h += bar(770, 842, 96, 10, .9, 3, '96,165,250'); h += bar(874, 842, 182, 10, .34);
  // toc
  h += bar(1096, 82, 12, 12, .45, 3); h += bar(1114, 84, 82, 9, .45); h += d(1097, 112, 1, 84, `background:rgba(${ink},.14)`); h += d(1097, 112, 2, 26, 'background:#0078FF'); h += bar(1107, 120, 92, 9, .95, 3, '96,165,250'); h += bar(1107, 148, 170, 9, .4); h += bar(1107, 180, 40, 9, .4);
  // zones
  const zone = (r, extra = '') => d(r.x, r.y, r.w, r.h, `border:1.5px solid #0078FF;border-radius:${px(6 * p * 1.4)};background:rgba(0,120,255,.10);box-shadow:0 0 0 3px rgba(0,120,255,.15);${extra}`);
  if (!ghost) { h += zone({ x: 2, y: 2, w: 288, h: 896 }, 'border-radius:9px 0 0 9px'); h += zone(R.header); h += zone(R.footer); h += zone(R.prefs); }
  return h;
}
function coverWiremap(W, H, o = {}) {
  const light = !!o.light; const shot = light ? 'newIntroLight' : 'newIntro'; const HDR = light ? R.headerLight : R.header;
  const k = W / 1600; const withTitle = !!o.title; const cs = o.chipScale || 1;
  const p = (o.p || 0.6) * k; const X = (o.X != null ? o.X : 368) * k, Y = (withTitle ? 268 : (o.Y != null ? o.Y : 180)) * k; const LX = (o.leftX != null ? o.leftX : 90) * k, RX = (o.rightX != null ? o.rightX : 1280) * k; let h = '';
  h += wireframePage(X, Y, p, k, { light });
  const wx = (x) => X + x * p, wy = (y) => Y + y * p;
  const shotCrop = (r, x, y, sc, extra = {}) => crop(shot, r, Object.assign({ x, y, s: sc * k, r: 8, style: 'border-color:rgba(63,63,70,.9)' }, extra));
  const chip = (x, y, n, ic, t, numColor = 'blue') => { const y0 = y - (26 * cs - 26) * k; return (n != null ? dot(x + 13 * k * cs, y0 + 13 * k * cs, n, numColor, 26 * k * cs) : '') + `<div class="txt" style="left:${px(x + (n != null ? 36 : 0) * k * cs)};top:${px(y0)};display:inline-flex;align-items:center;gap:${px(9 * k * cs)};height:${px(26 * k * cs)};padding:0 ${px(11 * k * cs)};border-radius:${px(6 * k * cs)};background:rgba(9,9,11,.9);border:1px solid rgba(63,63,70,.9);font:600 ${px(14 * k * cs)}/1 'Inter';color:#fafafa;white-space:nowrap">${ic.startsWith('glyph:') ? `<span style="font-size:${px(15 * k * cs)};line-height:1;color:#60a5fa">${ic.slice(6)}</span>` : ico(ic, 14 * k * cs).replace('class="ico ', 'style="fill:#60a5fa" class="ico ')}<span>${t}</span></div>`; };
  const lead = (pts, color = 'rgba(0,120,255,.85)') => `<svg class="ln" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><polyline points="${pts.map(q => q.map(v => Math.round(v * 10) / 10).join(',')).join(' ')}" fill="none" stroke="${color}" stroke-width="1.5"/><circle cx="${pts[pts.length - 1][0]}" cy="${pts[pts.length - 1][1]}" r="3.5" fill="${color}"/></svg>`;
  const dy = withTitle ? 0 : -60 * k;
  // left column: navigation, links, preferences (real crops)
  const L1 = { x: LX, y: (270 + 0) * k + dy }; h += chip(L1.x, L1.y - 36 * k, null, 'bars-3', 'Navigation'); h += shotCrop({ x: 0, y: 0, w: 290, h: 330 }, L1.x, L1.y, 0.62); h += lead([[L1.x + PW({ w: 290 }, 0.62 * k), L1.y + 100 * k], [wx(2), L1.y + 100 * k]]);
  const L3 = { x: LX, y: 560 * k + dy }; h += chip(L3.x, L3.y - 36 * k, null, 'link', 'Links'); h += shotCrop(R.footer, L3.x, L3.y, 0.66, { clip: FOOTER_CLIP }); h += lead([[L3.x + PW(R.footer, 0.66 * k), L3.y + PH(R.footer, 0.66 * k) / 2], [X - 44 * k, L3.y + PH(R.footer, 0.66 * k) / 2], [X - 44 * k, wy(775)], [wx(11), wy(775)]]);
  const L4 = { x: LX, y: 740 * k + dy }; h += chip(L4.x, L4.y - 36 * k, null, 'adjustments-horizontal', 'Preferences'); h += shotCrop(R.prefs, L4.x, L4.y, 0.66, { clip: PREFS_CLIP }); h += lead([[L4.x + PW(R.prefs, 0.66 * k), L4.y + PH(R.prefs, 0.66 * k) / 2], [X - 28 * k, L4.y + PH(R.prefs, 0.66 * k) / 2], [X - 28 * k, wy(869)], [wx(11), wy(869)]]);
  // right column: actions, theme toggle ×2, contents rail, one card
  const R2 = { x: RX, y: 270 * k + dy }; h += chip(R2.x, R2.y - 36 * k, null, 'cursor-arrow-rays', 'Actions'); h += shotCrop(HDR, R2.x, R2.y, 0.72, { pad: { l: 12, r: 8 } }); h += lead([[R2.x, R2.y + PH(HDR, 0.72 * k) / 2], [RX - 36 * k, R2.y + PH(HDR, 0.72 * k) / 2], [RX - 36 * k, wy(35)], [wx(1424), wy(35)]]);
  const RT = { x: RX, y: 390 * k + dy }; h += chip(RT.x, RT.y - 36 * k, null, 'glyph:◐', 'Theme toggle ×2'); h += crop(shot, N.themeTR, { x: RT.x, y: RT.y, s: 1.1 * k, r: 8, pad: 10, style: 'border-color:rgba(63,63,70,.9)' }); h += crop(shot, N.themeBL, { x: RT.x + PW(N.themeTR, 1.1 * k, 10) + 12 * k, y: RT.y, s: 1.1 * k, r: 8, pad: 10, style: 'border-color:rgba(63,63,70,.9)' });
  const RC = { x: RX, y: 520 * k + dy }; h += chip(RC.x, RC.y - 36 * k, null, 'list-bullet', 'Contents rail'); h += shotCrop(R.toc, RC.x, RC.y, 0.72); h += lead([[RC.x, RC.y + PH(R.toc, 0.72 * k) / 2], [RX - 22 * k, RC.y + PH(R.toc, 0.72 * k) / 2], [RX - 22 * k, wy(140)], [wx(1420), wy(140)]], 'rgba(250,250,250,.45)');
  const RD = { x: RX, y: 700 * k + dy }; h += chip(RD.x, RD.y - 36 * k, null, 'squares-2x2', 'Content'); h += shotCrop({ x: 310, y: 400, w: 178, h: 195 }, RD.x, RD.y, 0.66, { pad: 6 }); h += lead([[RD.x, RD.y + PH({ h: 195 }, 0.66 * k) / 2], [RX - 22 * k, RD.y + PH({ h: 195 }, 0.66 * k) / 2], [RX - 22 * k, wy(560)], [wx(1056), wy(560)]], 'rgba(250,250,250,.45)');
  if (withTitle) h += `<div class="txt" style="left:${px(64 * k)};top:${px(92 * k)};font:500 ${px(78 * k)}/1.02 'Inter';letter-spacing:-.036em;color:#fafafa;white-space:nowrap">${o.title}</div>`;
  return withTitle ? `<div style="position:absolute;left:0;top:${px(-(o.shift != null ? o.shift : 18) * k)};width:${px(W)};height:${px(H)}">${h}</div>` : h;
}
add('H0-cover-final', 'H', 'Cover · wireframe map', 'silk1', 'The wireframe-map direction with no text: the fleshed-out wireframe of the real page with the four zones in blue, and real crops of the live docs tied to their zones, on the blue-toned export.', () => coverWiremap(1600, 900, { p: .66, X: 326, Y: 165, leftX: 64, rightX: 1300, chipScale: 26 / 14 }), { wash: .3 });
add('H0-cover-final-light', 'H', 'Cover · wireframe map, light theme', 'blue16', 'The wireframe-map direction with the docs in their light theme: paper plate, ink bars, light crops, the same blue-toned export.', () => coverWiremap(1600, 900, { p: .66, X: 326, Y: 165, leftX: 64, rightX: 1300, light: true, chipScale: 26 / 14 }), { wash: .3 });
function coverWiremapClean(W, H, light = false) { const k = W / 1600; const p = Math.min(W * 0.92 / 1440, H * 0.92 / 900); const X = (W - 1440 * p) / 2, Y = (H - 900 * p) / 2; return wireframePage(X, Y, p, k, { light }); }
add('H0-cover-final-og', 'H', 'OpenGraph · wireframe map, cleaned (1200×630)', 'blue16', 'The OpenGraph image: the wireframe of the real page alone, no crops, no labels, no numbers, the four zones in blue, on the blue-toned export. Nothing but the diagram.', () => coverWiremapClean(1200, 630), { wash: .25, w: 1200, h: 630 });
add('H0-cover-final-og-light', 'H', 'OpenGraph · wireframe map, light theme (1200×630)', 'blue16', 'The wireframe of the real page alone in its light theme, the four zones in blue, on the blue-toned export.', () => coverWiremapClean(1200, 630, true), { wash: .25, w: 1200, h: 630 });
// isometric explorations retired (kept in gen-visuals history)

const ASSIGN = {"A1-zones-overlay": "u20", "A2-wireframe-map": "u11", "A3-exploded-layers": "u17", "A4-reading-path": "u19", "A5-four-corners": "u26", "B1-redline-pass": "u27", "B2-before-after-split": "u28", "B3-the-pile": "u33", "B4-peel-the-layers": "u34", "B5-header-strip": "u36", "C1-nav-census": "u37", "C2-accordion-anatomy": "u39", "C3-persistence-strip": "u40", "C4-sidebars-side-by-side": "u41", "C5-one-tree": "u44", "D1-type-specimen": "u45", "D2-alignment": "u47", "D3-icons-not-lists": "u48", "D4-rules-and-space": "u49", "D5-quickstart-pages": "u50", "E1-hover-mask": "u52", "E2-solid-vs-outline": "u53", "E3-corners": "u54", "E4-micro-ui": "u55", "E5-localized": "u56", "E6-sidebar-mask": "u58", "F1-hit-list": "u57", "F2-spot-the-antipatterns": "u18", "F3-dont-do": "u32", "F4-bingo": "u46", "H0-cover-final": "blue16", "H0-cover-final-og": "blue16", "H1-cover-exploded": "blue25", "H1-cover-exploded-og": "blue25", "H1-cover-exploded-light": "blue25", "H1-cover-exploded-og-light": "blue25", "H0-cover-final-light": "blue16", "H0-cover-final-og-light": "blue16"};
const BG_WASH = 0.64; // background shown at 36% over #09090b
V.forEach(v => { if (ASSIGN[v.id]) v.bg = ASSIGN[v.id]; if (!L.BG[v.bg]) throw new Error(`${v.id}: background ${v.bg} is not in BG; add the visual to ASSIGN`); if (v.area !== 'H') v.wash = Math.max(v.wash || 0, BG_WASH); }); // covers keep their own light wash
// =============== write ===============
const outDir = L.path.join(L.ROOT, 'visuals'); L.fs.mkdirSync(outDir, { recursive: true });
const manifest = [];
for (const v of V) {
  const html = stage(v.bg, v.html(), { w: v.w || 1600, h: v.h || 900, title: v.name, wash: v.wash, vignette: v.vignette, fit: v.area === 'H' ? 0 : (v.fit != null ? v.fit : 0.9) });
  L.fs.writeFileSync(L.path.join(outDir, v.id + '.html'), html);
  manifest.push({ id: v.id, area: v.area, name: v.name, bg: v.bg, why: v.why, w: v.w || 1600, h: v.h || 900, animated: !!v.animated });
}
L.fs.writeFileSync(L.path.join(L.ROOT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log('wrote', V.length, 'visuals');
if (L.missingIcons.size) console.log('MISSING ICONS:', [...L.missingIcons].join(', '));
