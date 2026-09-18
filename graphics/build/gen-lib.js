'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const SP = path.resolve(ROOT, '..');

// Pixel size of a PNG or a WebP (VP8, VP8L or VP8X) from its header.
function imageSize(file) {
  const b = fs.readFileSync(file);
  if (b.toString('ascii', 1, 4) === 'PNG') return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = b.toString('ascii', 12, 16);
    if (chunk === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
    if (chunk === 'VP8L') { const bits = b.readUInt32LE(21); return { w: 1 + (bits & 0x3fff), h: 1 + ((bits >> 14) & 0x3fff) }; }
    if (chunk === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
  }
  throw new Error(`imageSize: ${file} is not a PNG or WebP`);
}
function readJSON(rel, fallback) { try { return JSON.parse(fs.readFileSync(path.join(SP, rel), 'utf8')); } catch (e) { return fallback; } }

// Screenshots (device px = 2x CSS px unless noted)
const SHOTS = {
  newIntro: { file: 'shots/hi/intro.webp', dpr: 5 },
  newIntroFull: { file: 'shots/new/intro-full.png', dpr: 2 },
  newIntroJa: { file: 'shots/hi/intro-ja.webp', dpr: 3 },
  newQuick: { file: 'shots/hi/quickstart.webp', dpr: 4 },
  newQuickFull: { file: 'shots/new/quickstart-full.png', dpr: 2 },
  newSwitch: { file: 'shots/new/intro-switcher-open.png', dpr: 2 },
  newLight: { file: 'shots/new/intro-light-1440.png', dpr: 2 },
  newReact: { file: 'shots/new/react-overview-1440.png', dpr: 2 },
  newReactQuick: { file: 'shots/new/react-quickstart-1440.png', dpr: 2 },
  newKey: { file: 'shots/hi/key-concepts.webp', dpr: 3 },
  newAgents: { file: 'shots/hi/coding-agents.webp', dpr: 3 },
  newMobile: { file: 'shots/new/intro-mobile-390.png', dpr: 3 },
  newTablet: { file: 'shots/new/intro-tablet-768.png', dpr: 2 },
  newLaptop: { file: 'shots/new/intro-laptop-1024.png', dpr: 2 },
  oldIntro: { file: 'shots/hi/old-intro.webp', dpr: 5 },
  reactRef: { file: 'shots/hi/react-ref.webp', dpr: 4 },
  newIntroLight: { file: 'shots/hi/intro-light.webp', dpr: 4 },
  newAbout: { file: 'shots/hi/intro-about.webp', dpr: 4 }, // the Introduction page scrolled 717px, so the About section's three cards sit at y 302
  newIntroZh: { file: 'shots/hi/intro-zh.webp', dpr: 4 }, // the live site's Chinese Introduction, fully translated
  sidebarScroll: { file: 'shots/hi/ref-sidebar-scroll.webp', dpr: 4 },
  dropdown: { file: 'shots/hi/sidebar-dropdown-open.webp', dpr: 4 },
  langMenu: { file: 'shots/hi/lang-menu.webp', dpr: 4 },
  oldIntroFull: { file: 'shots/old/old-intro-full.png', dpr: 2 },
  oldQuick: { file: 'shots/old/old-quickstart-1440.png', dpr: 2 },
  oldQuickFull: { file: 'shots/old/old-quickstart-full.png', dpr: 2 },
};
for (const k of Object.keys(SHOTS)) {
  const f = path.join(SP, SHOTS[k].file);
  if (fs.existsSync(f)) { const s = imageSize(f); SHOTS[k].cssW = s.w / SHOTS[k].dpr; SHOTS[k].cssH = s.h / SHOTS[k].dpr; }
  else { SHOTS[k].missing = true; SHOTS[k].cssW = 1440; SHOTS[k].cssH = 900; }
}

const BG = {
  blue16: 'bg/blue/u16-A.webp', blue25: 'bg/blue/u25-A.webp',
  blue25light: 'bg/blue/u25-light.webp',
  u10: 'bg/user/u10.webp', u11: 'bg/user/u11.webp', u16: 'bg/user/u16.webp', u17: 'bg/user/u17.webp', u18: 'bg/user/u18.webp', u19: 'bg/user/u19.webp', u20: 'bg/user/u20.webp', u25: 'bg/user/u25.webp', u26: 'bg/user/u26.webp', u27: 'bg/user/u27.webp', u28: 'bg/user/u28.webp', u29: 'bg/user/u29.webp', u30: 'bg/user/u30.webp', u31: 'bg/user/u31.webp', u32: 'bg/user/u32.webp', u33: 'bg/user/u33.webp', u34: 'bg/user/u34.webp', u35: 'bg/user/u35.webp', u36: 'bg/user/u36.webp', u37: 'bg/user/u37.webp', u38: 'bg/user/u38.webp', u39: 'bg/user/u39.webp', u40: 'bg/user/u40.webp', u41: 'bg/user/u41.webp', u42: 'bg/user/u42.webp', u43: 'bg/user/u43.webp', u44: 'bg/user/u44.webp', u45: 'bg/user/u45.webp', u46: 'bg/user/u46.webp', u47: 'bg/user/u47.webp', u48: 'bg/user/u48.webp', u49: 'bg/user/u49.webp', u50: 'bg/user/u50.webp', u51: 'bg/user/u51.webp', u52: 'bg/user/u52.webp', u53: 'bg/user/u53.webp', u54: 'bg/user/u54.webp', u55: 'bg/user/u55.webp', u56: 'bg/user/u56.webp', u57: 'bg/user/u57.webp', u58: 'bg/user/u58.webp', u59: 'bg/user/u59.webp',
  // The remaining keys in the add() calls (silk*, ab1*, navy*) are retired backgrounds; ASSIGN
  // below the visuals maps every visual onto one of the exports above.
};

// ---- icons ----
// heroicons is a devDependency of the Prototemplate root (pnpm install at the repo root)
const HERO_DIR = path.resolve(ROOT, '../../node_modules/heroicons/24/solid');
const HERO_MINI = path.resolve(ROOT, '../../node_modules/heroicons/20/solid');
const missingIcons = new Set();
function ico(name, size = 16, cls = '') {
  let file = path.join(HERO_DIR, name + '.svg');
  if (!fs.existsSync(file)) file = path.join(HERO_MINI, name + '.svg');
  if (!fs.existsSync(file)) { missingIcons.add(name); file = path.join(HERO_DIR, 'sparkles.svg'); }
  let svg = fs.readFileSync(file, 'utf8').trim();
  svg = svg.replace(/\s(width|height)="[^"]*"/g, '').replace('<svg', `<svg width="${size}" height="${size}" class="ico ${cls}"`);
  return svg;
}
function svgFile(rel, size = 16, cls = '') {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) return ico('sparkles', size, cls);
  let svg = fs.readFileSync(file, 'utf8').trim();
  svg = svg.replace(/\s(width|height)="[^"]*"/g, '').replace(/\sclass="[^"]*"/, '').replace(/\sstyle="[^"]*"/, '').replace('<svg', `<svg width="${size}" height="${size}" class="svgf ${cls}"`);
  return svg;
}

// ---- primitives ----
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const px = (n) => `${Math.round(n * 100) / 100}px`;

// A crop of a screenshot placed at stage position (x,y), showing rect (CSS px of the page) at scale s.
const PAD = 12; // CSS px of page shown around a component inside its cutout
const MIN_TEXT = 26; // smallest text allowed on the 1600px stage after zoom-to-fit (the size of a label chip); audit.js enforces it
// pad: number, or {t,r,b,l}; full-page crops get none. clip: a page rect the padded cutout may not leave.
const padOf = (rect, o = {}) => { const full = rect.w >= 1400 || rect.h >= 880; const p = o.pad != null ? o.pad : (full ? 0 : PAD); return typeof p === 'number' ? { t: p, r: p, b: p, l: p } : Object.assign({ t: PAD, r: PAD, b: PAD, l: PAD }, p); };
const padded = (rect, o = {}, bounds) => { const p = padOf(rect, o); let x1 = rect.x - p.l, y1 = rect.y - p.t, x2 = rect.x + rect.w + p.r, y2 = rect.y + rect.h + p.b;
  if (bounds) { x1 = Math.max(0, x1); y1 = Math.max(0, y1); x2 = Math.min(bounds.w, x2); y2 = Math.min(bounds.h, y2); }
  if (o.clip) { const c = o.clip; x1 = Math.max(x1, c.x); y1 = Math.max(y1, c.y); x2 = Math.min(x2, c.x + c.w); y2 = Math.min(y2, c.y + c.h); }
  return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 }; };
function crop(shotKey, rect0, o = {}) {
  const sh = SHOTS[shotKey]; const s = o.s || 1;
  const rect = padded(rect0, o, { w: sh.cssW, h: sh.cssH });
  const w = rect.w * s, h = rect.h * s;
  const style = [
    `left:${px(o.x || 0)}`, `top:${px(o.y || 0)}`, `width:${px(w)}`, `height:${px(h)}`,
    `background-image:url(/${sh.file})`, `background-size:${px(sh.cssW * s)} ${px(sh.cssH * s)}`,
    `background-position:${px(-rect.x * s)} ${px(-rect.y * s)}`,
    o.r != null ? `border-radius:${px(o.r)}` : '', o.border === false ? 'border:none' : '', o.shadow === false ? 'box-shadow:none' : '',
    o.filter ? `filter:${o.filter}` : '', o.opacity != null ? `opacity:${o.opacity}` : '', o.style || '',
  ].filter(Boolean).join(';');
  return `<div class="crop ${o.cls || ''}" data-rect="${rect.x},${rect.y},${rect.w},${rect.h}" style="${style}">${o.inner || ''}</div>`;
}
// Highlight box in page coords relative to a crop origin (ox,oy) and scale s.
function hl(origin, s, rect, o = {}) {
  const x = origin.x + (rect.x - origin.rx) * s, y = origin.y + (rect.y - origin.ry) * s;
  const w = rect.w * s, h = rect.h * s; const color = o.color || 'blue';
  const pad = o.pad != null ? o.pad : 4;
  let html = `<div class="hl ${color} ${o.dashed ? 'dashed' : ''} ${o.fill ? 'fill' : ''}" style="left:${px(x - pad)};top:${px(y - pad)};width:${px(w + pad * 2)};height:${px(h + pad * 2)};${o.style || ''}"></div>`;
  if (o.label) {
    const pos = o.labelPos || 'above';
    let lx = x - pad, ly = y - pad - 62;
    if (pos === 'below') { ly = y + h + pad + 8; }
    if (pos === 'right') { lx = x + w + pad + 18; ly = y - pad + (h + pad * 2) / 2 - 27; }
    if (pos === 'left') { lx = x - pad - 18; ly = y - pad + (h + pad * 2) / 2 - 27; }
    if (pos === 'inside') { lx = x - pad + 8; ly = y - pad + 8; }
    if (pos === 'insideBottom') { lx = x - pad + 8; ly = y + h + pad - 62; }
    lx += o.labelDx || 0; ly += o.labelDy || 0;
    html += tag(o.label, o.icon, lx, ly, color, pos === 'left' ? 'anchor-right' : '', o.num);
  }
  return html;
}
function tag(text, icon, x, y, color = 'blue', cls = '', num) {
  return `<div class="tag ${color} ${cls}" style="left:${px(x)};top:${px(y)}">${num != null ? `<span class="num">${num}</span>` : ''}${icon ? ico(icon, 28) : ''}<span>${text}</span></div>`;
}
function dot(x, y, n, color = 'blue', size = 44) {
  return `<div class="dot ${color}" style="left:${px(x - size / 2)};top:${px(y - size / 2)};width:${px(size)};height:${px(size)};font-size:${px(size * 0.5)}">${n != null ? n : ''}</div>`;
}
function text(x, y, html, cls = '', style = '') { return `<div class="txt ${cls}" style="left:${px(x)};top:${px(y)};${style}">${html}</div>`; }
function panel(x, y, w, h, inner = '', cls = '', style = '') { return `<div class="panel ${cls}" style="left:${px(x)};top:${px(y)};width:${px(w)};height:${px(h)};${style}">${inner}</div>`; }
function line(x1, y1, x2, y2, o = {}) {
  const color = o.color || 'rgba(0,120,255,.9)'; const w = o.w || 3;
  return `<svg class="ln" style="left:0;top:0" width="1600" height="900" viewBox="0 0 1600 900"><path d="M${x1} ${y1} L${x2} ${y2}" stroke="${color}" stroke-width="${w}" fill="none" stroke-dasharray="${o.dash || 'none'}"/>${o.end ? `<circle cx="${x2}" cy="${y2}" r="5" fill="${color}"/>` : ''}${o.start ? `<circle cx="${x1}" cy="${y1}" r="5" fill="${color}"/>` : ''}</svg>`;
}
function elbow(x1, y1, x2, y2, o = {}) {
  const color = o.color || 'rgba(0,120,255,.9)'; const mx = o.mx != null ? o.mx : (x1 + x2) / 2;
  return `<svg class="ln" width="1600" height="900" viewBox="0 0 1600 900"><path d="M${x1} ${y1} L${mx} ${y1} L${mx} ${y2} L${x2} ${y2}" stroke="${color}" stroke-width="${o.w || 3}" fill="none"/>${o.end !== false ? `<circle cx="${x2}" cy="${y2}" r="5" fill="${color}"/>` : ''}${o.start ? `<circle cx="${x1}" cy="${y1}" r="5" fill="${color}"/>` : ''}</svg>`;
}
function title(t, sub, o = {}) {
  const x = o.x != null ? o.x : 64, y = o.y != null ? o.y : 52;
  return `<div class="title" style="left:${px(x)};top:${px(y)};max-width:${px(o.maxW || 900)}">${o.tagText ? `<div class="figtag">${o.tagText}</div>` : ''}<h1>${t}</h1>${sub ? `<p>${sub}</p>` : ''}</div>`;
}
function caption(x, y, t, cls = '') { return `<div class="cap ${cls}" style="left:${px(x)};top:${px(y)}">${t}</div>`; }
function badge(x, y, t, cls = '') { return `<div class="badge ${cls}" style="left:${px(x)};top:${px(y)}">${t}</div>`; }

const CSS = `
@font-face{font-family:'Inter';src:url(/fonts/Inter-Variable.ttf) format('truetype');font-weight:100 900;font-style:normal}
@font-face{font-family:'Geist Mono';src:url(/fonts/GeistMono-Variable.ttf) format('truetype');font-weight:100 900}
:root{--bg:#09090b;--surface:rgba(9,9,11,.86);--surface2:#111216;--border:#27272a;--border2:#3f3f46;--text:#fafafa;--muted:#a1a1aa;--dim:#71717a;--blue:#0078FF;--blue2:#60a5fa;--red:#f0524f;--green:#34d399;--amber:#fbbf24}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#111216}
body{width:var(--W);height:var(--H);overflow:hidden;font-family:'Inter',system-ui,sans-serif;color:var(--text);-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
.stage{position:relative;width:var(--W);height:var(--H);overflow:hidden;background:#111216 center/auto calc(var(--H) * 2) no-repeat;image-rendering:pixelated}
.stage>*,.stage>.center>*{position:absolute}
/* the ground keeps its pixels square at 2x (the export is 1920 wide, drawn 3200 wide, so every dot is a crisp 2px square with its aspect kept); everything on it resamples smoothly */
.stage *{image-rendering:auto}
.stage .ln{position:absolute;left:0;top:0;pointer-events:none;overflow:visible}
.vignette{left:0;top:0;width:100%;height:100%;background:radial-gradient(120% 90% at 50% 40%,rgba(9,9,11,0) 40%,rgba(9,9,11,.55) 100%)}
.wash{left:0;top:0;width:100%;height:100%;background:rgba(9,9,11,.35)}
.crop{position:absolute;background-repeat:no-repeat;background-color:#09090b;border:1px solid var(--border2);border-radius:8px;box-shadow:0 30px 70px rgba(0,0,0,.6),0 2px 8px rgba(0,0,0,.5);overflow:hidden}
.crop.flat{box-shadow:none}
.crop.noborder{border:none}
.hl{position:absolute;border:2.5px solid var(--blue);border-radius:6px;box-shadow:0 0 0 4px rgba(0,120,255,.22);pointer-events:none}
.hl.red{border-color:var(--red);box-shadow:0 0 0 4px rgba(240,82,79,.2)}
.hl.red.fill{background:rgba(240,82,79,.14)}
.hl.blue.fill{background:rgba(0,120,255,.12)}
.hl.white{border-color:rgba(250,250,250,.85);box-shadow:none}
.hl.dashed{border-style:dashed}
.hl.thin{border-width:2.5px;box-shadow:none}
.tag{position:absolute;display:inline-flex;align-items:center;gap:10px;height:54px;padding:0 18px;border-radius:8px;background:var(--blue);color:#fff;font:600 30px/1 'Inter';letter-spacing:-.005em;white-space:nowrap;box-shadow:0 6px 20px rgba(0,0,0,.45)}
.tag.red{background:var(--red)}
.tag.dark{background:#18181b;border:1px solid var(--border2);color:var(--text)}
.tag.white{background:#fafafa;color:#09090b}
.tag.anchor-right{transform:translateX(-100%)}
.tag .ico{width:24px;height:24px;fill:currentColor;flex:none}
.tag .num{display:inline-grid;place-items:center;width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,.22);font-size:28px;font-weight:700;margin-left:-6px}
.dot{position:absolute;display:grid;place-items:center;border-radius:50%;background:var(--blue);color:#fff;font:700 13px/1 'Inter';box-shadow:0 0 0 4px rgba(9,9,11,.9),0 6px 16px rgba(0,0,0,.5)}
.dot.red{background:var(--red)}
.dot.white{background:#fafafa;color:#09090b}
.dot.small{box-shadow:0 0 0 2px rgba(9,9,11,.85)}
.txt{position:absolute}
.title{position:absolute}
.title h1{font:600 34px/1.12 'Inter';letter-spacing:-0.028em;color:var(--text)}
.title p{margin-top:10px;font:400 28px/1.4 'Inter';color:var(--muted);max-width:760px}
.title .figtag{font:500 26px/1 'Geist Mono';letter-spacing:.06em;color:var(--blue2);margin-bottom:12px}
.cap{position:absolute;font:400 28px/1.4 'Inter';color:var(--muted);max-width:560px}
.cap strong{color:var(--text);font-weight:600}
.cap.center{text-align:center}
.badge{position:absolute;display:inline-flex;align-items:center;gap:10px;padding:0 16px;height:50px;border-radius:8px;background:#18181b;border:1px solid var(--border2);color:var(--text);font:500 30px/1 'Inter';white-space:nowrap}
.badge.mono{font:500 26px/1 'Geist Mono';letter-spacing:.04em}
.badge .ico{fill:currentColor;width:24px;height:24px}
.panel{position:absolute;background:transparent;border:none;border-radius:12px}
.panel.solid,.panel.soft{background:transparent}
.panel h3{font:600 15px/1.2 'Inter';letter-spacing:-0.01em;color:var(--text)}
.panel p{font:400 13.5px/1.5 'Inter';color:var(--muted)}
.plabel{position:absolute;left:18px;top:6px;display:flex;align-items:center;gap:12px;font:600 32px/1 'Inter';letter-spacing:-.01em;color:var(--text)}
.plabel .ico{width:34px;height:34px;fill:var(--blue2)}
.plabel.muted{color:var(--muted)}
.plabel.muted .ico{fill:var(--dim)}
.ico{display:inline-block;vertical-align:middle;fill:currentColor}
.svgf{display:inline-block;vertical-align:middle}
.list{position:absolute;display:flex;flex-direction:column;gap:18px}
.list .row{display:flex;align-items:center;gap:14px}
.list .row .ico{width:26px;height:26px;flex:none}
.list .row .k{font:600 27px/1.2 'Inter';color:var(--text)}
.list .row .v{font:400 22px/1.35 'Inter';color:var(--muted)}
.mono{font-family:'Geist Mono';font-weight:500;letter-spacing:.04em}
.wire{position:absolute;border:1px solid rgba(250,250,250,.16);background:rgba(250,250,250,.04);border-radius:4px}
.wire.blue{border-color:rgba(0,120,255,.9);background:rgba(0,120,255,.16)}
.wire.bar{border:none;background:rgba(250,250,250,.14);border-radius:3px}
.wire.bar.dim{background:rgba(250,250,250,.07)}
.strike{position:relative}
.strike::after{content:'';position:absolute;left:-2%;right:-2%;top:52%;height:3px;background:var(--red);border-radius:2px;transform:rotate(-1.5deg)}
.ruler{position:absolute;border-left:3px solid var(--blue2)}
.ruler::before,.ruler::after{content:'';position:absolute;left:-9px;width:18px;height:3px;background:var(--blue2)}
.ruler::before{top:0}.ruler::after{bottom:0}
.rulerh{position:absolute;border-top:3px solid var(--blue2)}
.rulerh::before,.rulerh::after{content:'';position:absolute;top:-9px;height:18px;width:3px;background:var(--blue2)}
.rulerh::before{left:0}.rulerh::after{right:0}
.measure{position:absolute;font:500 28px/1 'Geist Mono';color:var(--blue2);letter-spacing:.03em;white-space:nowrap;padding:6px 9px;border-radius:6px;background:rgba(9,9,11,.85);transform:translateY(calc(-50% + 6px))}
.pill{display:inline-flex;align-items:center;gap:10px;padding:0 20px;height:52px;border-radius:999px;font:500 28px/1 'Inter'}
`;

const CENTER_SCRIPT = `<script>(function(){const st=document.querySelector('.stage');const W=st.clientWidth,H=st.clientHeight;const kids=[...st.children].filter(el=>!(el.classList.contains('vignette')||el.classList.contains('wash')));const wrap=document.createElement('div');wrap.className='center';wrap.style.cssText='position:absolute;left:0;top:0;width:'+W+'px;height:'+H+'px';kids.forEach(k=>wrap.appendChild(k));st.appendChild(wrap);function isContent(el){const tag=el.tagName.toLowerCase();if(tag==='svg')return !el.classList.contains('ln');const insvg=el.closest('svg');if(insvg){return insvg.classList.contains('ln')&&el.parentElement===insvg;}const cs=getComputedStyle(el);if(cs.visibility==='hidden'||cs.display==='none'||parseFloat(cs.opacity)===0)return false;return el.children.length===0||cs.backgroundImage!=='none'||cs.backgroundColor!=='rgba(0, 0, 0, 0)'||parseFloat(cs.borderTopWidth)>0||parseFloat(cs.borderLeftWidth)>0||cs.boxShadow!=='none'||cs.outlineStyle!=='none';}function run(){let l=1e9,t=1e9,r=-1e9,b=-1e9;wrap.querySelectorAll('*').forEach(el=>{if(!isContent(el))return;const rc=el.getBoundingClientRect();if(rc.width<=0||rc.height<=0)return;l=Math.min(l,rc.left);t=Math.min(t,rc.top);r=Math.max(r,rc.right);b=Math.max(b,rc.bottom);});if(r<l){window.__centered=true;return;}const sr=st.getBoundingClientRect();const bw=r-l,bh=b-t;const fit=parseFloat(st.dataset.fit||'0');let z=1;if(fit>0){z=Math.min(fit*W/bw,fit*H/bh);z=Math.max(0.8,Math.min(1,z));z=Math.round(z*1000)/1000;}const cx=(l+r)/2-sr.left,cy=(t+b)/2-sr.top;const dx=Math.round(W/2-z*cx),dy=Math.round(H/2-z*cy);wrap.style.transformOrigin='0 0';wrap.style.transform='translate('+dx+'px,'+dy+'px) scale('+z+')';window.__centerDelta={dx:dx,dy:dy,z:z,w:Math.round(bw),h:Math.round(bh)};window.__centered=true;}document.fonts.ready.then(run);})();</script>`;
function stage(bgKey, inner, o = {}) {
  const W = o.w || 1600, H = o.h || 900;
  const bgUrl = bgKey ? `/${BG[bgKey]}` : '';
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(o.title || 'visual')}</title><style>${CSS}\n:root{--W:${W}px;--H:${H}px}</style></head><body><div class="stage" data-fit="${o.fit != null ? o.fit : ''}" style="background-image:url(${bgUrl})">${o.wash ? `<div class="wash" style="background:rgba(9,9,11,${o.wash})"></div>` : ''}${o.vignette !== false ? '<div class="vignette"></div>' : ''}${inner}</div>${CENTER_SCRIPT}</body></html>`;
}

module.exports = { fs, path, ROOT, SP, SHOTS, BG, PAD, MIN_TEXT, padOf, padded, imageSize, ico, svgFile, crop, hl, tag, dot, text, panel, line, elbow, title, caption, badge, stage, px, esc, readJSON, missingIcons };
