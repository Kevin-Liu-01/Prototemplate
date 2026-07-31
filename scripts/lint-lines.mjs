// Geometric line lint — "lines must be the one line."
//
// Renders a page and audits the ACTUAL drawn hairlines:
//   1. DOUBLE lines: two parallel 1-2px lines from DIFFERENT owners within
//      1..4px of each other, overlapping most of their run — the double-
//      border bug class. Same-owner pairs are exempt (the brand's doubled
//      rail draws both strokes from one element on purpose), as are the
//      known thread/instrument devices.
//   2. MISSING seams: adjacent top-level sections whose shared boundary has
//      no horizontal line spanning the column within 3px.
//
// Usage: node scripts/lint-lines.mjs [url] [--theme dark|light] [--report]
import { chromium } from 'playwright-core';

const EXEC =
  '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const positional = process.argv.slice(2).filter((a, i, all) => !a.startsWith('--') && all[i - 1] !== '--theme');
const url = positional[0] ?? 'http://localhost:3006/d/toolchain?chrome=0';
const theme = process.argv.includes('--theme')
  ? process.argv[process.argv.indexOf('--theme') + 1]
  : 'dark';
const reportOnly = process.argv.includes('--report');

/** class fragments whose lines are deliberate multi-stroke devices */
const ALLOW = [
  'thread',
  'shell-rail',
  'stack-rail',
  'trace-rail',
  'tcpv-def',
  'tc-eg',
  'tc-hatch',
  'lang-sw', // the sentence-width measuring instrument draws guide boxes
  'lang-rm', // the re-measure instrument: bright extents drawn on faint axes
  'tc-tab-bar', // the active-tab accent deliberately rides the tabs seam
  'is-marquee', // marquee rows fade under a mask-image the audit can't see
];

const browser = await chromium.launch({ executablePath: EXEC, headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 4200 } });
if (theme === 'dark')
  await ctx.addInitScript(() => localStorage.setItem('gt-theme', 'dark'));
const page = await ctx.newPage();
await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(3000);

const audit = await page.evaluate((ALLOW) => {
  const segs = [];
  const els = [];
  const label = (el) =>
    (typeof el.className === 'string' ? el.className : el.tagName)
      .split(' ')
      .slice(0, 2)
      .join('.');
  const visible = (color) => {
    const m = color.match(/rgba?\(([^)]+)\)/);
    if (!m) return color !== 'transparent';
    const parts = m[1].split(',').map(parseFloat);
    return (parts[3] ?? 1) > 0.05;
  };
  const pushBorders = (rect, cs, owner, elIdx) => {
    const sides = [
      ['Top', 'h', rect.top, rect.left, rect.right],
      ['Bottom', 'h', rect.bottom, rect.left, rect.right],
      ['Left', 'v', rect.left, rect.top, rect.bottom],
      ['Right', 'v', rect.right, rect.top, rect.bottom],
    ];
    for (const [side, orient, pos, from, to] of sides) {
      const w = parseFloat(cs[`border${side}Width`]);
      if (w >= 1 && w <= 2.5 && visible(cs[`border${side}Color`]) && to - from > 24)
        segs.push({ orient, pos: Math.round(pos * 2) / 2, from, to, owner, el: elIdx });
    }
  };
  document.querySelectorAll('body *').forEach((el) => {
    if (el.closest('svg') || el.closest('canvas')) return;
    const rect = el.getBoundingClientRect();
    if (rect.width < 4 && rect.height < 4) return;
    const owner = label(el);
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    if (parseFloat(cs.opacity) <= 0.05) return; // hover-woken devices rest invisible
    const elIdx = els.push(el) - 1;
    pushBorders(rect, cs, owner, elIdx);
    // thin filled boxes are lines too
    if (visible(cs.backgroundColor)) {
      if (rect.height <= 2.5 && rect.width > 24)
        segs.push({ orient: 'h', pos: Math.round((rect.top + rect.height / 2) * 2) / 2, from: rect.left, to: rect.right, owner, el: elIdx });
      if (rect.width <= 2.5 && rect.height > 24)
        segs.push({ orient: 'v', pos: Math.round((rect.left + rect.width / 2) * 2) / 2, from: rect.top, to: rect.bottom, owner, el: elIdx });
    }
    // absolutely-positioned pseudo rails/rules
    for (const pseudo of ['::before', '::after']) {
      const ps = getComputedStyle(el, pseudo);
      if (ps.content === 'none' || ps.position !== 'absolute') continue;
      if (parseFloat(ps.opacity) <= 0.05) continue;
      const t = parseFloat(ps.top), l = parseFloat(ps.left), r0 = parseFloat(ps.right), b0 = parseFloat(ps.bottom);
      const w = parseFloat(ps.width), h = parseFloat(ps.height);
      let left = Number.isFinite(l) ? rect.left + l : NaN;
      let top = Number.isFinite(t) ? rect.top + t : NaN;
      let width = Number.isFinite(w) ? w : Number.isFinite(l) && Number.isFinite(r0) ? rect.width - l - r0 : NaN;
      let height = Number.isFinite(h) ? h : Number.isFinite(t) && Number.isFinite(b0) ? rect.height - t - b0 : NaN;
      if (!Number.isFinite(left) && Number.isFinite(r0) && Number.isFinite(width)) left = rect.right - r0 - width;
      if (!Number.isFinite(top) && Number.isFinite(b0) && Number.isFinite(height)) top = rect.bottom - b0 - height;
      if (![left, top, width, height].every(Number.isFinite)) continue;
      // translateX(-50%) centering, the rails' anchor
      const tf = ps.transform;
      if (tf && tf !== 'none') {
        try {
          const m = new DOMMatrix(tf);
          left += m.e; top += m.f;
        } catch {}
      }
      // full-reach pseudos (-100vw insets) are CLIPPED by an ancestor in
      // the real render — clamp the reconstruction the same way
      let clipEl = el.parentElement;
      while (clipEl && getComputedStyle(clipEl).overflow.includes('visible')) clipEl = clipEl.parentElement;
      if (clipEl) {
        const cr = clipEl.getBoundingClientRect();
        const cl = Math.max(left, cr.left), ct = Math.max(top, cr.top);
        const crr = Math.min(left + width, cr.right), cb = Math.min(top + height, cr.bottom);
        left = cl; top = ct; width = Math.max(0, crr - cl); height = Math.max(0, cb - ct);
        if (width < 1 || height < 1) continue;
      }
      const prect = { top, bottom: top + height, left, right: left + width, width, height };
      const hostIdx = els.push(el) - 1;
      pushBorders(prect, ps, `${pseudo}${label(el)}`, hostIdx);
      if (visible(ps.backgroundColor)) {
        if (height <= 2.5 && width > 24) segs.push({ orient: 'h', pos: Math.round((top + height / 2) * 2) / 2, from: left, to: left + width, owner: `${pseudo}${label(el)}`, el: hostIdx });
        if (width <= 2.5 && height > 24) segs.push({ orient: 'v', pos: Math.round((left + width / 2) * 2) / 2, from: top, to: top + height, owner: `${pseudo}${label(el)}`, el: hostIdx });
      }
    }
  });

  const allowed = (owner) => ALLOW.some((frag) => owner.includes(frag));

  /* Coincident strokes (gap < 1) are only a bug if BOTH actually render:
     when one drawer is an ancestor of the other and an opaque background
     sits between them (including the descendant's own — backgrounds paint
     to the border box, under any translucent border), the lower stroke is
     hidden and no alpha stacks. */
  const opaqueBg = (node) => {
    const m = getComputedStyle(node).backgroundColor.match(/rgba?\(([^)]+)\)/);
    if (!m) return false;
    const parts = m[1].split(',').map(parseFloat);
    return (parts[3] ?? 1) >= 0.98;
  };
  const coveredCoincidence = (a, b) => {
    const A = els[a.el], B = els[b.el];
    if (!A || !B || A === B) return false;
    let inner = null, outer = null;
    if (A.contains(B)) { outer = A; inner = B; }
    else if (B.contains(A)) { outer = B; inner = A; }
    if (!outer) return false;
    const pos = a.pos, from = Math.max(a.from, b.from), to = Math.min(a.to, b.to);
    for (let n = inner; n && n !== outer; n = n.parentElement) {
      if (!opaqueBg(n)) continue;
      const r = n.getBoundingClientRect();
      const hit = a.orient === 'h'
        ? r.top <= pos + 1 && r.bottom >= pos - 1 && r.left <= from + 1 && r.right >= to - 1
        : r.left <= pos + 1 && r.right >= pos - 1 && r.top <= from + 1 && r.bottom >= to - 1;
      if (hit) return true;
    }
    return false;
  };

  // 1 · doubles: cross-owner parallel pairs 0..4px apart, 70%+ overlap.
  // gap 0 is the worst case, not an exemption: two coincident translucent
  // strokes stack alpha and render a brighter line than either alone.
  const doubles = [];
  const seen = new Set();
  for (const [orient, axisFrom] of [['h', 'from'], ['v', 'from']]) {
    const pool = segs.filter((s) => s.orient === orient && !allowed(s.owner));
    pool.sort((a, b) => a.pos - b.pos);
    for (let i = 0; i < pool.length; i++) {
      for (let j = i + 1; j < pool.length && pool[j].pos - pool[i].pos <= 4; j++) {
        const a = pool[i], b = pool[j];
        const gap = b.pos - a.pos;
        if (a.owner === b.owner) continue;
        const overlap = Math.min(a.to, b.to) - Math.max(a.from, b.from);
        const shorter = Math.min(a.to - a.from, b.to - b.from);
        if (overlap < shorter * 0.75 || overlap < 80) continue;
        if (gap < 1 && coveredCoincidence(a, b)) continue;
        const key = `${orient}:${Math.round(a.pos)}:${a.owner}|${b.owner}`;
        if (seen.has(key)) continue;
        seen.add(key);
        doubles.push({ orient, at: Math.round(a.pos), gap: +gap.toFixed(1), a: a.owner, b: b.owner, span: Math.round(overlap) });
      }
    }
  }

  // 2 · missing seams at section boundaries
  const sections = [...document.querySelectorAll('.tc-rail > section, [class*="-root"] > section')];
  sections.sort((x, y) => x.getBoundingClientRect().top - y.getBoundingClientRect().top);
  const missing = [];
  for (let i = 0; i + 1 < sections.length; i++) {
    const bottom = sections[i].getBoundingClientRect().bottom;
    const colW = sections[i].getBoundingClientRect().width;
    const hit = segs.some(
      (s) => s.orient === 'h' && Math.abs(s.pos - bottom) <= 3 && s.to - s.from >= Math.min(colW, 1100) * 0.5
    );
    if (!hit)
      missing.push({
        between: `${sections[i].id || label(sections[i])} → ${sections[i + 1].id || label(sections[i + 1])}`,
        at: Math.round(bottom),
      });
  }

  return { total: segs.length, doubles: doubles.slice(0, 40), missing };
}, ALLOW);

console.log(JSON.stringify(audit, null, 1));
await browser.close();
if (!reportOnly && (audit.doubles.length || audit.missing.length)) process.exit(1);
