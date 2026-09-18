#!/usr/bin/env node
// Audit the generated visuals in a real browser: every visible text must be at least MIN_TEXT px on the
// 1600px stage after zoom-to-fit (declared size × fit scale), and content boxes should not overlap.
// usage: node graphics/build/audit.js [id ...]   — needs the graphics server (pnpm graphics:serve) and agent-browser.
// Text under the floor fails the run (exit 1); overlaps are listed as warnings because some are deliberate
// (a label sitting on the crop it names). Pass --strict to fail on overlaps too.
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path');
const { MIN_TEXT } = require('./gen-lib.js');
const BASE = process.env.GRAPHICS_URL || 'http://127.0.0.1:8765/build/visuals';
const args = process.argv.slice(2); const strict = args.includes('--strict');
const ids = args.filter(a => !a.startsWith('--'));
const all = fs.readdirSync(path.join(__dirname, 'visuals')).filter(f => f.endsWith('.html')).map(f => f.slice(0, -5)).sort();
const list = ids.length ? ids : all;
const env = Object.assign({ AGENT_BROWSER_SESSION: 'gtdocs' }, process.env);
const ab = (...a) => execFileSync('agent-browser', a, { env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

// runs inside the page; crops are screenshots so their own pixels are not text
const PROBE = `(() => {
  const z = (window.__centerDelta && window.__centerDelta.z) || 1, FLOOR = ${MIN_TEXT};
  const texts = [], seen = new Set();
  document.querySelectorAll('.center *').forEach(el => {
    if (el.closest('.crop')) return;
    const direct = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (!direct) return;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) return;
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) return;
    const fs = parseFloat(cs.fontSize), eff = Math.round(fs * z * 10) / 10;
    const t = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').slice(0, 30);
    const key = t + '|' + fs; if (seen.has(key)) return; seen.add(key);
    if (eff < FLOOR - 0.25) texts.push({ t, fs, eff });
  });
  const boxes = [...document.querySelectorAll('.center .crop, .center .txt, .center .tag, .center .badge, .center .measure, .center .cap')].filter(el => {
    const cs = getComputedStyle(el); return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) !== 0;
  }).map(el => { const r = el.getBoundingClientRect(); return { el, n: ((el.className || '').split(' ')[0] + ' ' + (el.textContent || '').trim().slice(0, 22)).trim(), l: r.left, r: r.right, t: r.top, b: r.bottom }; }).filter(b => b.r - b.l > 0 && b.b - b.t > 0);
  const overlaps = [];
  for (let a = 0; a < boxes.length; a++) for (let b = a + 1; b < boxes.length; b++) {
    const A = boxes[a], B = boxes[b];
    if (A.el.contains(B.el) || B.el.contains(A.el)) continue;
    const ox = Math.min(A.r, B.r) - Math.max(A.l, B.l), oy = Math.min(A.b, B.b) - Math.max(A.t, B.t);
    if (ox > 1 && oy > 1) overlaps.push(A.n + ' <> ' + B.n + ' (' + Math.round(ox) + 'x' + Math.round(oy) + ')');
  }
  const st = document.querySelector('.stage').getBoundingClientRect(); let off = 0;
  boxes.forEach(b => { if (b.l < st.left - 1 || b.r > st.right + 1 || b.t < st.top - 1 || b.b > st.bottom + 1) off++; });
  return JSON.stringify({ z, texts, overlaps, off });
})()`;

let failed = 0, warned = 0;
for (const id of list) {
  const url = `${BASE}/${id}.html`;
  let res;
  try {
    ab('open', url); ab('set', 'viewport', '1600', '900', '1'); ab('wait', '--fn', 'window.__centered === true');
    const out = ab('eval', PROBE).trim().split('\n').pop();
    res = JSON.parse(JSON.parse(out));
  } catch (e) { console.log(`${id.padEnd(28)} ERROR ${String(e.message || e).split('\n')[0]}`); failed++; continue; }
  const bad = res.texts.length, ov = res.overlaps.length;
  const flag = bad ? 'FAIL' : (ov || res.off) ? 'warn' : 'ok  ';
  console.log(`${id.padEnd(28)} ${flag} z=${res.z}${bad ? `  ${bad} text(s) under ${MIN_TEXT}px` : ''}${ov ? `  ${ov} overlap(s)` : ''}${res.off ? `  ${res.off} box(es) off the stage` : ''}`);
  res.texts.forEach(t => console.log(`    ${String(t.eff).padStart(5)}px eff (${t.fs}px declared)  ${t.t}`));
  res.overlaps.slice(0, 12).forEach(o => console.log(`    overlap: ${o}`));
  if (bad) failed++; if (ov || res.off) warned++;
  if (strict && (ov || res.off)) failed++;
}
console.log(`\n${list.length} visuals audited: ${failed} failing, ${warned} with warnings (floor ${MIN_TEXT}px effective)`);
process.exit(failed ? 1 : 0);
