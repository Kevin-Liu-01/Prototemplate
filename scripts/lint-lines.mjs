// Geometric line lint — "lines must be the one line."
//
// Renders a page and audits the ACTUAL drawn hairlines, reconstructed from
// computed CSS (borders, outlines, spread-only shadows, thin filled boxes,
// exposed-ground strips and absolutely positioned pseudo rules):
//   1. DOUBLE lines: two parallel 1-2px lines from DIFFERENT owners within
//      1..4px of each other, overlapping most of their run — the double-
//      border bug class. Same-owner pairs are exempt (the brand's doubled
//      rail draws both strokes from one element on purpose), as are the
//      named devices in ALLOW. A stroke another opaque box paints over is
//      not drawn, so it cannot double anything: pairs are checked for
//      visibility with elementsFromPoint before they count.
//   2. MISSING seams: adjacent top-level sections whose shared boundary has
//      no horizontal line spanning the column within 3px (page mode only).
//   3. JUNCTIONS: two owners drawing the same seam, coincident (gap under
//      1px). Reported apart from doubles because the fix is different: one
//      owner keeps the line, the other drops its side (the ownership table
//      in DESIGN.md, "Line law for chrome").
//   4. BORDER ROLES (shell mode): every visible border in chrome draws one of
//      three tokens, --pt-hair (structural), --pt-hair-soft (rows) or
//      --pt-edge (frames). --pt-ink is allowed only on an element in an
//      active state (.is-on, .is-active, .is-editing, .is-solid,
//      aria-pressed, aria-current, aria-selected, aria-expanded,
//      focus-within), because active states draw their border in ink by
//      design (the search pill while its palette is open is one). Outlines
//      are rings: the three roles, ink (focus and active rings) or paper (a
//      ring on an ink plate).
//      The deck's own document uses the unprefixed names (--hair, --edge);
//      the roles are read from whichever the document defines.
//
// Page mode (the original):
//   node scripts/lint-lines.mjs [url ...] [--theme dark|light] [--report]
//   Audits every URL at 1440 and 1280 in one theme, over the whole document.
//
// Shell mode (pnpm lint:lines:shell, directive 8.9):
//   node scripts/lint-lines.mjs --shell [--base http://localhost:3005]
//     [--only /docs] [--width 1440] [--theme dark] [--jobs 3] [--report] [--json]
//   Walks /, /docs, /brand, /compare, /archive/<first slug>,
//   /directions/<first slug>, /skills, /skills/<first slug>, /d/production
//   and /deck (the iframe's document) at 1440, 1280 and 390 in both themes
//   against the dev server, and on each page audits the resting state, the
//   list toggled ([), the index panel (R), the search (Cmd K), and on / and
//   /deck the grid (G) and the book (B). Chrome is every element under a
//   shell root (.pt-viewer, .pt-corner, .pt-corner-layer, .pt-help, .pt-toast,
//   .pt-preview, or any pt- class) outside the content roots (.stage, the
//   flow sheet's children, .pt-page-body, .pt-root, .gv-article, .ar-doc);
//   in the deck's document everything outside .stage, .mini and .slide.
//   Fails on any double, any junction and any border color outside the
//   three roles where at least one owner is chrome. A state that did not
//   apply is an infrastructure failure (exit 2), never a pass.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright-core';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const EXEC =
  '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

const argv = process.argv.slice(2);
/* flags that take a value; the value is never a positional URL */
const VALUED = new Set(['--theme', '--base', '--only', '--width', '--state', '--jobs']);
const flag = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};
const positional = argv.filter((a, i, all) => !a.startsWith('--') && !VALUED.has(all[i - 1]));
const SHELL = argv.includes('--shell');
const reportOnly = argv.includes('--report');
const jsonOut = argv.includes('--json');

/* EVERY positional URL is audited — for years of shame, an earlier version
   silently audited only the first and blessed the rest. */
const urls = positional.length ? positional : ['http://localhost:3006/d/toolchain?chrome=0'];
for (const u of urls) {
  /* a URL with whitespace is a shell-quoting accident (zsh does not split
     unquoted vars) — refuse it rather than auditing a 404 */
  if (/\s/.test(u)) {
    console.error(`lint-lines: refusing URL with whitespace (quoting accident?): ${JSON.stringify(u)}`);
    process.exit(2);
  }
}
const theme = flag('--theme') ?? 'dark';

/**
 * Class fragments whose lines are deliberate multi-stroke devices. Every
 * entry names the device and why its parallel strokes are one drawing, so
 * the list can be audited by reading it. Anything not named here is strict.
 */
const ALLOW = [
  'thread', // the doubled line (DESIGN.md §5): one path stroked twice carves two parallel hairlines by construction
  'shell-rail', // the page rails (DESIGN.md §3): the column's inner pair plus one wrapper pseudo at ±10px, drawn by one owner
  'stack-rail', // the dark band's stacked rails: the same doubled-rail device on the band's own root
  'trace-rail', // the dark band's traced rails: the doubled rail with a traveling pulse between the strokes
  'tcpv-def', // toolchain pricing definitions: a ruled term column whose rule sits beside the row rule on purpose
  'tc-eg', // paper foundry's example plates: a frame inside a ruled cell, both strokes one figure
  'tc-hatch', // the diagonal-hatch spacer (DESIGN.md §2): a hatch band under one hairline reads as stripes, not lines
  'lang-sw', // the sentence-width measuring instrument draws guide boxes
  'lang-rm', // the re-measure instrument: bright extents drawn on faint axes
  'tc-tab-bar', // the active-tab accent deliberately rides the tabs seam
  'is-marquee', // marquee rows fade under a mask-image the audit can't see
  'eh-chip', // orbiting locale chips sweep the hero; any parallelism is transient
  'tcb-term', // the band terminal wears the doubled frame: border + offset outline
  'lg-card', // lens-gate's refracting cards drift each frame; parallelism is transient
  'sheet', // the viewer shell's sheet mat: a 1px hair border (the structural role; a sheet is a large surface, not a framed image) inside a 1px paper gap inside a 1px hair-soft outline, the one sanctioned doubled line in chrome (the deck's own .sheet draws the same ring as two spread shadows)
  'thumb-frame', // the shell's active thumbnail frame: the edge border plus the 2px offset ink outline (the deck's .thumb-frame is the same device)
  'page-frame', // the shell's active book page frame: the same border plus offset outline pair
  'pt-preview', // the hover preview card: a paper mat with a hair-soft outline around a frame with an edge border, the sheet ring at 240px
];

/**
 * Where chrome ends and content begins, for the two documents the shell
 * mode audits. The roles name the custom properties to read, prefixed
 * first; `active` marks an element whose ink border is a state, not a seam.
 */
const SHELL_CHROME = {
  roots: '.pt-viewer, .pt-corner, .pt-corner-layer, .pt-help, .pt-toast, .pt-preview',
  prefix: 'pt-',
  content: '.stage, .sheet-flow .sheet > *, .pt-page-body, .pt-root, .gv-article, .ar-doc, iframe',
  tokens: {
    hair: ['--pt-hair', '--hair'],
    soft: ['--pt-hair-soft', '--hair-soft'],
    edge: ['--pt-edge', '--edge'],
    ink: ['--pt-ink', '--ink'],
    paper: ['--pt-paper', '--paper'],
  },
  active:
    '.is-on, .is-active, .is-editing, .is-solid, [aria-pressed="true"], [aria-current], [aria-selected="true"], [aria-expanded="true"]',
};

const DECK_CHROME = {
  ...SHELL_CHROME,
  roots: 'body',
  prefix: null,
  content: '.stage, .mini, .slide',
};

/* Page mode audits at two widths: media queries re-arrange the grammar, and
   a junction clean at 1440 can double or vanish at narrower layouts. */
const WIDTHS = [1440, 1280];

/* Shell mode adds the phone cut, where the list is an overlay and the
   toolbar takes two rows. */
const SHELL_WIDTHS = [1440, 1280, 390];
const SHELL_THEMES = ['dark', 'light'];
const BASE = (flag('--base') ?? 'http://localhost:3005').replace(/\/$/, '');

/**
 * The audit, run inside the document. Self-contained: Playwright serializes
 * the function, so it reads nothing but its argument.
 * cfg.ALLOW: the class fragments above. cfg.chrome: null in page mode, a
 * chrome config in shell mode (colors and junctions are then gated to
 * chrome, missing seams are skipped).
 */
const auditDocument = (cfg) => {
  const ALLOW = cfg.ALLOW;
  const chrome = cfg.chrome;
  const segs = [];
  const els = [];
  /* parallel to els: is that element chrome */
  const chromeOf = [];
  const selfStacks = [];
  const invisibles = [];
  const colors = [];
  /* the first two classes name the owner; an element with none is named by its tag */
  const label = (el) =>
    (typeof el.className === 'string' && el.className.trim() ? el.className.trim() : el.tagName)
      .split(/\s+/)
      .slice(0, 2)
      .join('.');
  const visible = (color) => {
    const m = color.match(/rgba?\(([^)]+)\)/);
    if (!m) return color !== 'transparent';
    const parts = m[1].split(',').map(parseFloat);
    return (parts[3] ?? 1) > 0.05;
  };
  const alphaOf = (color) => {
    const m = color.match(/rgba?\(([^)]+)\)/);
    if (!m) return color === 'transparent' ? 0 : 1;
    return m[1].split(',').map(parseFloat)[3] ?? 1;
  };

  /* ---- chrome scope and the border roles ---- */
  const isChrome = (el) => {
    if (!chrome) return false;
    if (el.closest(chrome.content)) return false;
    if (el.closest(chrome.roots)) return true;
    return Boolean(chrome.prefix && typeof el.className === 'string' && new RegExp(`(^|\\s)${chrome.prefix}`).test(el.className));
  };
  /* a color string to [r, g, b, a]; computed colors are rgb()/rgba(), token values may be hex */
  const rgba = (str) => {
    if (!str) return null;
    const s = str.trim().toLowerCase();
    if (s === 'transparent') return [0, 0, 0, 0];
    let m = s.match(/^rgba?\(([^)]+)\)$/);
    if (m) {
      const p = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat);
      return [p[0], p[1], p[2], p[3] ?? 1];
    }
    m = s.match(/^#([0-9a-f]{3,8})$/);
    if (m) {
      let h = m[1];
      if (h.length === 3 || h.length === 4) h = h.split('').map((c) => c + c).join('');
      const n = parseInt(h.slice(0, 6), 16);
      const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255, a];
    }
    return null;
  };
  const sameColor = (a, b) =>
    Boolean(a && b) &&
    Math.abs(a[0] - b[0]) <= 2 &&
    Math.abs(a[1] - b[1]) <= 2 &&
    Math.abs(a[2] - b[2]) <= 2 &&
    Math.abs(a[3] - b[3]) <= 0.02;
  const readToken = (names) => {
    const root = getComputedStyle(document.documentElement);
    for (const name of names) {
      const v = root.getPropertyValue(name).trim();
      if (v) return rgba(v);
    }
    return null;
  };
  const ROLES = chrome
    ? Object.fromEntries(Object.entries(chrome.tokens).map(([role, names]) => [role, readToken(names)]))
    : null;
  const roleOf = (color) => {
    const c = rgba(color);
    for (const [role, value] of Object.entries(ROLES)) if (sameColor(c, value)) return role;
    return null;
  };
  /* an ink border is a state when the element, its parent or its grandparent
     is marked active or holds focus; no further, so an open panel does not
     excuse every rule inside it */
  const activeNear = (el) => {
    for (let n = el, d = 0; n && d < 3; n = n.parentElement, d++) {
      if (n.matches(chrome.active)) return true;
      if (n.matches(':focus-within')) return true;
    }
    return false;
  };
  const SEAM_ROLES = ['hair', 'soft', 'edge'];
  const RING_ROLES = ['hair', 'soft', 'edge', 'ink', 'paper'];
  const checkColors = (rect, cs, owner, el, isPseudo) => {
    if (!chrome || !el || !isChrome(el)) return;
    for (const side of ['Top', 'Bottom', 'Left', 'Right']) {
      const w = parseFloat(cs[`border${side}Width`]);
      const color = cs[`border${side}Color`];
      if (!(w >= 1) || !visible(color)) continue;
      const role = roleOf(color);
      if (SEAM_ROLES.includes(role)) continue;
      if (role === 'ink' && activeNear(el)) continue;
      colors.push({
        kind: 'border',
        owner: isPseudo ? `pseudo:${owner}` : owner,
        side: side.toLowerCase(),
        color,
        role: role ?? 'none',
        at: Math.round(side === 'Top' ? rect.top : side === 'Bottom' ? rect.bottom : side === 'Left' ? rect.left : rect.right),
      });
    }
    const ow = parseFloat(cs.outlineWidth);
    if (cs.outlineStyle !== 'none' && ow >= 1 && visible(cs.outlineColor)) {
      const role = roleOf(cs.outlineColor);
      if (!RING_ROLES.includes(role))
        colors.push({ kind: 'outline', owner, side: 'ring', color: cs.outlineColor, role: role ?? 'none', at: Math.round(rect.top) });
    }
  };

  /* Straight-run spans stop where the corner radius begins — arcs are not
     parallel to anything and must not extend a segment's overlap. */
  const radii = (cs) => ({
    tl: parseFloat(cs.borderTopLeftRadius) || 0,
    tr: parseFloat(cs.borderTopRightRadius) || 0,
    bl: parseFloat(cs.borderBottomLeftRadius) || 0,
    br: parseFloat(cs.borderBottomRightRadius) || 0,
  });
  const pushBorders = (rect, cs, owner, elIdx, edges) => {
    const rd = radii(cs);
    const sides = [
      ['Top', 'h', rect.top, rect.left + rd.tl, rect.right - rd.tr],
      ['Bottom', 'h', rect.bottom, rect.left + rd.bl, rect.right - rd.br],
      ['Left', 'v', rect.left, rect.top + rd.tl, rect.bottom - rd.bl],
      ['Right', 'v', rect.right, rect.top + rd.tr, rect.bottom - rd.br],
    ];
    for (const [side, orient, pos, from, to] of sides) {
      /* an edge a clipping ancestor removed from the render must not
         exist for the audit either */
      if (edges && edges[side.toLowerCase()] === false) continue;
      const w = parseFloat(cs[`border${side}Width`]);
      if (w >= 1 && w <= 2.5 && visible(cs[`border${side}Color`]) && to - from > 24)
        segs.push({ orient, pos: Math.round(pos * 2) / 2, from, to, owner, el: elIdx });
    }
    /* Outline rings are borders drawn outside the box. */
    const ow = parseFloat(cs.outlineWidth);
    if (cs.outlineStyle !== 'none' && ow >= 1 && ow <= 2.5 && visible(cs.outlineColor)) {
      const off = (parseFloat(cs.outlineOffset) || 0) + ow / 2;
      if (rect.width > 24) {
        segs.push({ orient: 'h', pos: Math.round((rect.top - off) * 2) / 2, from: rect.left, to: rect.right, owner: `outline:${owner}`, el: elIdx });
        segs.push({ orient: 'h', pos: Math.round((rect.bottom + off) * 2) / 2, from: rect.left, to: rect.right, owner: `outline:${owner}`, el: elIdx });
      }
      if (rect.height > 24) {
        segs.push({ orient: 'v', pos: Math.round((rect.left - off) * 2) / 2, from: rect.top, to: rect.bottom, owner: `outline:${owner}`, el: elIdx });
        segs.push({ orient: 'v', pos: Math.round((rect.right + off) * 2) / 2, from: rect.top, to: rect.bottom, owner: `outline:${owner}`, el: elIdx });
      }
    }
    /* box-shadow rings: `0 0 0 Npx color` spread-only shadows are borders
       by other means — same geometry as an outline at offset 0. */
    if (cs.boxShadow && cs.boxShadow !== 'none') {
      for (const shadow of cs.boxShadow.split(/\),\s*/)) {
        const m = shadow.match(/(-?[\d.]+)px\s+(-?[\d.]+)px\s+([\d.]+)px\s+([\d.]+)px/);
        if (!m) continue;
        const [, sx, sy, blur, spread] = m.map(Number);
        if (sx !== 0 || sy !== 0 || blur > 1.5 || spread < 1 || spread > 2.5) continue;
        const p = spread / 2;
        if (rect.width > 24) {
          segs.push({ orient: 'h', pos: Math.round((rect.top - p) * 2) / 2, from: rect.left, to: rect.right, owner: `shadow:${owner}`, el: elIdx });
          segs.push({ orient: 'h', pos: Math.round((rect.bottom + p) * 2) / 2, from: rect.left, to: rect.right, owner: `shadow:${owner}`, el: elIdx });
        }
        if (rect.height > 24) {
          segs.push({ orient: 'v', pos: Math.round((rect.left - p) * 2) / 2, from: rect.top, to: rect.bottom, owner: `shadow:${owner}`, el: elIdx });
          segs.push({ orient: 'v', pos: Math.round((rect.right + p) * 2) / 2, from: rect.top, to: rect.bottom, owner: `shadow:${owner}`, el: elIdx });
        }
      }
    }
  };
  /* Elements under a 3D transform (perspective stages, rotateY conveyors)
     have bounding boxes that are projections, not page lines — and elements
     under a mask-image fade in ways the geometry can't see. Skip both. */
  const skipMemo = new Map();
  const inSkipped = (el) => {
    for (let n = el; n && n !== document.body; n = n.parentElement) {
      let v = skipMemo.get(n);
      if (v === undefined) {
        const cs = getComputedStyle(n);
        v = cs.transform.startsWith('matrix3d') || (cs.maskImage && cs.maskImage !== 'none') || (cs.webkitMaskImage && cs.webkitMaskImage !== 'none');
        skipMemo.set(n, v);
      }
      if (v) return true;
    }
    return false;
  };
  document.querySelectorAll('body *').forEach((el) => {
    if (el.closest('svg') || el.closest('canvas')) return;
    const rect = el.getBoundingClientRect();
    if (rect.width < 4 && rect.height < 4) return;
    const owner = label(el);
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    if (parseFloat(cs.opacity) <= 0.05) return; // hover-woken devices rest invisible
    if (inSkipped(el)) return;
    const elIdx = els.push(el) - 1;
    const inChrome = isChrome(el);
    chromeOf[elIdx] = inChrome;
    /* Clamp every real element to its clipping ancestor before reading
       lines off it — the audit must see the geometry the eye does, not
       the layout box. Edges the clip removes are dropped outright. */
    let crect = rect;
    let edges = { top: true, bottom: true, left: true, right: true };
    {
      let clipAnc = el.parentElement;
      while (clipAnc && getComputedStyle(clipAnc).overflow.includes('visible')) clipAnc = clipAnc.parentElement;
      if (clipAnc) {
        const cr = clipAnc.getBoundingClientRect();
        edges = {
          top: rect.top >= cr.top - 0.5,
          bottom: rect.bottom <= cr.bottom + 0.5,
          left: rect.left >= cr.left - 0.5,
          right: rect.right <= cr.right + 0.5,
        };
        const top = Math.max(rect.top, cr.top);
        const bottom = Math.min(rect.bottom, cr.bottom);
        const left = Math.max(rect.left, cr.left);
        const right = Math.min(rect.right, cr.right);
        if (right - left < 1 || bottom - top < 1) return; // fully clipped away
        crect = { top, bottom, left, right, width: right - left, height: bottom - top };
      }
    }
    pushBorders(crect, cs, owner, elIdx, edges);
    checkColors(crect, cs, owner, el, false);
    // thin filled boxes are lines too — same clamped geometry
    if (visible(cs.backgroundColor)) {
      const tw = crect.right - crect.left;
      const th = crect.bottom - crect.top;
      if (th > 0 && th <= 2.5 && tw > 24)
        segs.push({ orient: 'h', pos: Math.round((crect.top + th / 2) * 2) / 2, from: crect.left, to: crect.right, owner, el: elIdx });
      if (tw > 0 && tw <= 2.5 && th > 24)
        segs.push({ orient: 'v', pos: Math.round((crect.left + tw / 2) * 2) / 2, from: crect.top, to: crect.bottom, owner, el: elIdx });
    }
    /* Exposed-ground strips: a big box with visible bg and a 1-2px padding
       reveal draws a LINE along that edge (the framed-row perimeter). It is
       a line like any other and must obey the one-stroke law — AND it must
       actually contrast with the page: an opaque strip within a few RGB
       steps of the root surface is a seam that exists geometrically but
       cannot be seen (the panel-on-ink bug class). */
    if (visible(cs.backgroundColor) && rect.width > 24 && rect.height > 24) {
      const bgA2 = alphaOf(cs.backgroundColor);
      /* the named devices (ALLOW) own their strips and stacks by design: the
         sheet mat's 1px paper gap is the ring's middle stroke, not a seam */
      const deviceOwner = ALLOW.some((frag) => owner.includes(frag));
      if (bgA2 >= 0.95 && (!chrome || inChrome) && !deviceOwner) {
        const own = cs.backgroundColor.match(/\d+/g)?.map(Number) ?? [];
        const rootBg = getComputedStyle(document.body).backgroundColor.match(/\d+/g)?.map(Number) ?? [];
        const hasStrip = ['Top', 'Bottom', 'Left', 'Right'].some((side) => {
          const p = parseFloat(cs[`padding${side}`]);
          const bw = parseFloat(cs[`border${side}Width`]) || 0;
          return p >= 1 && p <= 2.5 && bw < 1;
        });
        if (
          hasStrip && own.length >= 3 && rootBg.length >= 3 &&
          Math.abs(own[0] - rootBg[0]) + Math.abs(own[1] - rootBg[1]) + Math.abs(own[2] - rootBg[2]) < 45
        )
          invisibles.push({ owner, at: Math.round(rect.bottom), fill: cs.backgroundColor });
      }
      const pads = [
        ['Top', 'h', (p) => rect.top + p / 2, rect.left, rect.right],
        ['Bottom', 'h', (p) => rect.bottom - p / 2, rect.left, rect.right],
        ['Left', 'v', (p) => rect.left + p / 2, rect.top, rect.bottom],
        ['Right', 'v', (p) => rect.right - p / 2, rect.top, rect.bottom],
      ];
      for (const [side, orient, at, from, to] of pads) {
        const p = parseFloat(cs[`padding${side}`]);
        const bw = parseFloat(cs[`border${side}Width`]) || 0;
        /* A strip under a real border is the sanctioned mat-reveal sandwich
           (hairline edge, toned reveal, content) — only borderless-side
           strips are structural lines in their own right. */
        if (p >= 1 && p <= 2.5 && bw < 1 && to - from > 24)
          segs.push({ orient, pos: Math.round(at(p) * 2) / 2, from, to, owner: `ground:${owner}`, el: elIdx });
      }
      /* Self-stack: a translucent border over the element's own visible
         background (backgrounds paint to the border box) composites darker
         than either — the same line drawn twice by one element. */
      if ((!chrome || inChrome) && !deviceOwner) {
        for (const side of ['Top', 'Bottom', 'Left', 'Right']) {
          const bw = parseFloat(cs[`border${side}Width`]);
          const bc = cs[`border${side}Color`];
          const bgA = alphaOf(cs.backgroundColor);
          if (
            bw >= 1 && visible(bc) && alphaOf(bc) < 0.95 &&
            bgA >= 0.12 && bgA < 0.95 &&
            cs.backgroundClip !== 'padding-box' && cs.backgroundClip !== 'content-box'
          )
            selfStacks.push({
              owner,
              side: side.toLowerCase(),
              at: Math.round(side === 'Top' ? rect.top : side === 'Bottom' ? rect.bottom : side === 'Left' ? rect.left : rect.right),
              len: Math.round(side === 'Top' || side === 'Bottom' ? rect.width : rect.height),
            });
        }
      }
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
      chromeOf[hostIdx] = inChrome;
      pushBorders(prect, ps, `${pseudo}${label(el)}`, hostIdx);
      checkColors(prect, ps, `${pseudo}${label(el)}`, el, true);
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

  /* A stroke is drawn only where nothing opaque paints over it. Walking the
     hit stack from the top: reaching the drawer (or its subtree) means the
     stroke is on top; reaching an ancestor means nothing above hid it; an
     unrelated opaque box first means the stroke is under it (an overlay list
     over the toolbar, the index panel over the sheet). Sampled at three
     points of the shared run; points off the viewport count as visible. */
  const strokeVisibleAt = (s, x, y) => {
    const E = els[s.el];
    if (!E) return true;
    if (x < 0 || y < 0 || x >= window.innerWidth || y >= window.innerHeight) return true;
    for (const node of document.elementsFromPoint(x, y)) {
      if (node === E || E.contains(node) || node.contains(E)) return true;
      if (opaqueBg(node)) return false;
    }
    return true;
  };
  const bothVisible = (a, b) => {
    const from = Math.max(a.from, b.from), to = Math.min(a.to, b.to);
    const pos = (a.pos + b.pos) / 2;
    let seen = 0;
    for (const t of [0.25, 0.5, 0.75]) {
      const along = from + (to - from) * t;
      const [x, y] = a.orient === 'h' ? [along, pos] : [pos, along];
      if (strokeVisibleAt(a, x, y) && strokeVisibleAt(b, x, y)) seen++;
    }
    return seen >= 2;
  };

  // 1 · doubles: cross-owner parallel pairs 0..4px apart, 70%+ overlap.
  // gap 0 is the worst case, not an exemption: two coincident translucent
  // strokes stack alpha and render a brighter line than either alone. It is
  // reported as a junction (two owners meet on one seam); 1..4px pairs are
  // doubles. In shell mode a pair counts only when one owner is chrome.
  const doubles = [];
  const junctions = [];
  const seen = new Set();
  for (const orient of ['h', 'v']) {
    const pool = segs.filter((s) => s.orient === orient && !allowed(s.owner));
    pool.sort((a, b) => a.pos - b.pos);
    for (let i = 0; i < pool.length; i++) {
      for (let j = i + 1; j < pool.length && pool[j].pos - pool[i].pos <= 4; j++) {
        const a = pool[i], b = pool[j];
        const gap = b.pos - a.pos;
        if (a.owner === b.owner) continue;
        if (chrome && !chromeOf[a.el] && !chromeOf[b.el]) continue;
        const overlap = Math.min(a.to, b.to) - Math.max(a.from, b.from);
        const shorter = Math.min(a.to - a.from, b.to - b.from);
        if (overlap < shorter * 0.75 || overlap < 80) continue;
        if (gap < 1 && coveredCoincidence(a, b)) continue;
        if (!bothVisible(a, b)) continue;
        const key = `${orient}:${Math.round(a.pos)}:${a.owner}|${b.owner}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const hit = { orient, at: Math.round(a.pos), gap: +gap.toFixed(1), a: a.owner, b: b.owner, span: Math.round(overlap) };
        (gap < 1 ? junctions : doubles).push(hit);
      }
    }
  }

  // 2 · missing seams at section boundaries AND adjacent-row boundaries —
  // every junction between stacked blocks must carry one spanning line.
  // Page grammar only; the shell has no stacked sections.
  const missing = [];
  if (!chrome) {
    const needSeam = (el, next, kind) => {
      const r = el.getBoundingClientRect();
      if (r.height < 8 || r.width < 200) return;
      const hit = segs.some(
        (s) => s.orient === 'h' && Math.abs(s.pos - r.bottom) <= 3 && s.to - s.from >= Math.min(r.width, 1100) * 0.5
      );
      if (!hit)
        missing.push({
          kind,
          between: `${el.id || label(el)} → ${next.id || label(next)}`,
          at: Math.round(r.bottom),
        });
    };
    const sections = [...document.querySelectorAll('.tc-rail > section, [class*="-root"] > section')];
    sections.sort((x, y) => x.getBoundingClientRect().top - y.getBoundingClientRect().top);
    for (let i = 0; i + 1 < sections.length; i++) needSeam(sections[i], sections[i + 1], 'section');
    const BLOCKS = '.tc-row, .tc-hatch, .tc-band, .tc-delivery-band';
    for (const block of document.querySelectorAll(BLOCKS)) {
      const next = block.nextElementSibling;
      if (next && next.matches(BLOCKS)) needSeam(block, next, 'row');
    }
  }

  /* the same color drawn by the same owner on many rows is one finding */
  const colorKeys = new Set();
  const colorHits = colors.filter((c) => {
    const key = `${c.kind}:${c.owner}:${c.side}:${c.color}`;
    if (colorKeys.has(key)) return false;
    colorKeys.add(key);
    return true;
  });

  return {
    total: segs.length,
    doubles: doubles.slice(0, 40),
    junctions: junctions.slice(0, 40),
    colors: colorHits.slice(0, 40),
    missing,
    selfStacks: selfStacks.slice(0, 24),
    invisibles: invisibles.slice(0, 12),
    roles: ROLES,
  };
};

/** True when an audit carries anything that fails the run. */
const failing = (audit) => {
  /* chip-scale self-stacks (short edges) are reported but do not gate — the
     structural ones (long seams reading darker than their neighbours) do. */
  const structuralStacks = audit.selfStacks.filter((s) => s.len >= 120);
  return Boolean(
    audit.doubles.length ||
      audit.junctions.length ||
      audit.colors.length ||
      audit.missing.length ||
      structuralStacks.length ||
      audit.invisibles.length
  );
};

const browser = await chromium.launch({ executablePath: EXEC, headless: true });

/* ------------------------------------------------------------------ */
/* page mode                                                           */
/* ------------------------------------------------------------------ */

async function auditPageAt(url, width) {
  const ctx = await browser.newContext({ viewport: { width, height: 4200 } });
  await ctx.addInitScript((t) => localStorage.setItem('gt-theme', t), theme);
  const page = await ctx.newPage();
  const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
  /* an error page audits clean at ~1 line — that is a blessing nobody asked
     for. HTTP failures fail the audit loudly. */
  if (resp && resp.status() >= 400) {
    console.error(`lint-lines: HTTP ${resp.status()} for ${url}`);
    process.exit(2);
  }
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(3000);
  const audit = await page.evaluate(auditDocument, { ALLOW, chrome: null });
  await ctx.close();
  return audit;
}

async function runPageMode() {
  let failed = false;
  const out = {};
  for (const url of urls) {
    const per = {};
    for (const width of WIDTHS) {
      const audit = await auditPageAt(url, width);
      delete audit.roles;
      per[width] = audit;
      if (failing(audit)) failed = true;
    }
    if (urls.length === 1) Object.assign(out, per);
    else out[url] = per;
  }
  console.log(JSON.stringify(out, null, 1));
  return failed;
}

/* ------------------------------------------------------------------ */
/* shell mode                                                          */
/* ------------------------------------------------------------------ */

/**
 * The first slug a registry file declares, read from its source so the route
 * list follows the data: the archive's first `entry('<slug>'`, the first
 * `slug: '<slug>'` of src/lib/directions.ts (the first exploration), the
 * first `id: '<slug>'` after the SKILLS array opens in the generated
 * src/lib/skills.ts (the categories above it carry ids of their own).
 */
function firstSlug(file, pattern, from) {
  let text = readFileSync(join(ROOT, file), 'utf8');
  if (from) {
    const at = text.indexOf(from);
    if (at < 0) {
      console.error(`lint-lines: ${from} not found in ${file}`);
      process.exit(2);
    }
    text = text.slice(at);
  }
  const slug = text.match(pattern)?.[1];
  if (!slug) {
    console.error(`lint-lines: no slug matching ${pattern} in ${file}`);
    process.exit(2);
  }
  return slug;
}

/**
 * The routes directive 8.9 names, and the states each is driven through:
 * the gallery, the docs, the brand book, the compare rig, the first archived
 * version, the first exploration's page under /directions, the skills index
 * and the first skill's page, the shipped direction's corner, and the deck.
 */
function shellRoutes() {
  const archive = firstSlug('src/lib/archive.ts', /entry\('([^']+)'/);
  const direction = firstSlug('src/lib/directions.ts', /slug: '([^']+)'/);
  const skill = firstSlug('src/lib/skills.ts', /id: '([^']+)'/, 'export const SKILLS');
  return [
    { path: '/', states: ['list', 'index', 'search', 'grid', 'book'] },
    { path: '/docs', states: ['list', 'index', 'search'] },
    { path: '/brand', states: ['list', 'index', 'search'] },
    { path: '/compare', states: ['list', 'index', 'search'] },
    { path: `/archive/${archive}`, states: ['list', 'index', 'search'] },
    { path: `/directions/${direction}`, states: ['list', 'index', 'search'] },
    { path: '/skills', states: ['list', 'index', 'search'] },
    { path: `/skills/${skill}`, states: ['list', 'index', 'search'] },
    { path: '/d/production', states: ['list', 'index'], corner: true },
    { path: '/deck', states: ['list', 'index', 'grid', 'book'], deck: true },
  ];
}

/** What the document shows right now; the driver verifies every state against it. */
const probeState = () => {
  const shell = document.querySelector('.pt-viewer');
  const deck = document.querySelector('.viewer');
  /* the mode the toolbar's seg says is on: the shell's option text (Slides, Grid, Book; a route may reword the first), the deck's data-mode */
  const segOn = document.querySelector('.pt-toolbar .pt-seg .pt-ib.is-on');
  const deckOn = document.querySelector('.toolbar [data-mode].is-on');
  const mode = deckOn ? deckOn.dataset.mode ?? null : segOn ? (segOn.textContent ?? '').trim().toLowerCase() : null;
  return {
    theme: document.documentElement.dataset.theme ?? null,
    kind: shell ? 'shell' : deck ? 'deck' : document.querySelector('.pt-corner') ? 'corner' : 'none',
    sb: shell ? shell.dataset.sb ?? null : deck ? (deck.classList.contains('no-sb') ? '0' : '1') : null,
    overlay: Boolean(document.querySelector('.pt-sb.is-overlay, .viewer.sb-open')),
    panel: Boolean(document.querySelector('.pt-panel.is-on, .panel-r.is-on')),
    /* the open search layer (Search.tsx mounts .pt-search-card only while open; the toolbar's .pt-search-btn is always there) */
    search: Boolean(document.querySelector('.pt-search-card[role="dialog"], [class*="pt-palette"], [data-pt-search]')),
    mode,
    grid: mode === 'grid' || Boolean(document.querySelector('.pt-grid, .viewer.is-overview')),
    book: mode === 'book' || Boolean(document.querySelector('.pt-book, .sheet-flow, .gv-flow, .viewer .book:not([hidden])')),
    help: Boolean(document.querySelector('.pt-help, .help:not([hidden])')),
  };
};

/** Send one key. The top document gets a real key press; the deck's iframe gets the same event dispatched on its document. */
async function press(target, key, deck) {
  if (!deck) {
    await target.page().keyboard.press(key);
    return;
  }
  const [, mod, k] = key.match(/^(?:(Meta|Control)\+)?(.+)$/);
  await target.evaluate(
    ([kk, m]) => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: kk, bubbles: true, cancelable: true, metaKey: m === 'Meta', ctrlKey: m === 'Control' })
      );
    },
    [k, mod ?? null]
  );
}

async function settle(target, ms) {
  await target.page().waitForTimeout(ms);
}

/**
 * Drive one route at one width in one theme through its states, auditing
 * each. Returns { [state]: audit } plus the probes; a state that did not
 * apply is recorded under `unapplied` and fails the run with exit 2.
 */
async function auditShellRoute(route, width, themeName) {
  const height = width <= 600 ? 844 : 900;
  const ctx = await browser.newContext({ viewport: { width, height } });
  await ctx.addInitScript((t) => {
    try {
      localStorage.setItem('gt-theme', t);
      localStorage.setItem('gt-deck-theme', t);
    } catch {}
  }, themeName);
  const page = await ctx.newPage();
  const url = `${BASE}${route.path}`;
  const resp = await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  if (!resp || resp.status() >= 400) {
    console.error(`lint-lines: HTTP ${resp ? resp.status() : 'none'} for ${url}`);
    process.exit(2);
  }
  let target = page.mainFrame();
  let deck = false;
  if (route.deck) {
    await page.waitForSelector('iframe, .pt-viewer', { timeout: 60000 });
    const iframe = await page.$('iframe');
    if (iframe) {
      const frame = await iframe.contentFrame();
      if (!frame) {
        console.error(`lint-lines: the deck iframe at ${url} has no document`);
        process.exit(2);
      }
      await frame.waitForSelector('.viewer', { timeout: 60000 });
      target = frame;
      deck = true;
    }
  } else {
    await page.waitForSelector(route.corner ? '.pt-corner' : '.pt-viewer', { timeout: 60000 });
  }
  await target.evaluate(() => document.fonts.ready);
  await settle(target, 1200);

  /* the theme: the key is set before load; a document that read another key
     is toggled with D once it agrees on what it shows (a document that has
     not stamped the attribute yet is given a moment, never toggled blind),
     and every probe records the theme the audit ran in */
  let probe = await target.evaluate(probeState);
  if (probe.theme === null) {
    await settle(target, 400);
    probe = await target.evaluate(probeState);
  }
  if (probe.theme !== null && probe.theme !== themeName) {
    await press(target, 'd', deck);
    await settle(target, 400);
    probe = await target.evaluate(probeState);
  }
  if (probe.theme !== themeName) {
    console.error(`lint-lines: ${url} at ${width} shows theme ${probe.theme}, wanted ${themeName}`);
    process.exit(2);
  }

  const cfg = { ALLOW, chrome: deck ? DECK_CHROME : SHELL_CHROME };
  const results = {};
  const unapplied = [];
  const audit = async (name) => {
    const state = await target.evaluate(probeState);
    const found = await target.evaluate(auditDocument, cfg);
    results[name] = { ...found, probe: state };
    return state;
  };

  await audit('rest');
  const narrow = width <= 900;

  for (const state of route.states) {
    if (state === 'list') {
      /* [ toggles the list: at a wide width the column closes; at or below
         900px, and on a direction page, it opens as the overlay */
      const opens = narrow || Boolean(route.corner);
      await press(target, '[', deck);
      await settle(target, 500);
      const p = await audit(opens ? 'list-open' : 'list-closed');
      const ok = opens ? p.overlay || (narrow && p.sb !== '0') : p.sb === '0';
      if (!ok) unapplied.push('list');
      await press(target, opens ? 'Escape' : '[', deck);
      await settle(target, 400);
    } else if (state === 'index') {
      await press(target, 'r', deck);
      await settle(target, 500);
      const p = await audit('index');
      if (!p.panel) unapplied.push('index');
      await press(target, 'Escape', deck);
      await settle(target, 400);
      const after = await target.evaluate(probeState);
      if (after.panel) {
        await press(target, 'r', deck);
        await settle(target, 400);
      }
    } else if (state === 'search') {
      await press(target, 'Meta+k', deck);
      await settle(target, 500);
      const p0 = await target.evaluate(probeState);
      /* the search bar (directive 8.3); until it lands Cmd K opens the index panel with the filter focused */
      const name = p0.search ? 'search' : p0.panel ? 'search-as-index' : 'search';
      const p = await audit(name);
      if (!p.search && !p.panel) unapplied.push('search');
      await press(target, 'Escape', deck);
      await settle(target, 400);
      const after = await target.evaluate(probeState);
      if (after.search || after.panel) {
        await press(target, 'Escape', deck);
        await settle(target, 300);
      }
    } else if (state === 'grid' || state === 'book') {
      await press(target, state === 'grid' ? 'g' : 'b', deck);
      await settle(target, 700);
      const p = await audit(state);
      if (!p[state]) unapplied.push(state);
      /* Escape returns to the default mode */
      await press(target, 'Escape', deck);
      await settle(target, 600);
    }
  }

  await ctx.close();
  return { results, unapplied, deck };
}

/** Run tasks with at most `n` in flight. */
async function pool(tasks, n) {
  const results = new Array(tasks.length);
  let next = 0;
  const worker = async () => {
    while (next < tasks.length) {
      const i = next++;
      results[i] = await tasks[i]();
    }
  };
  await Promise.all(Array.from({ length: Math.min(n, tasks.length) }, worker));
  return results;
}

async function runShellMode() {
  const only = flag('--only');
  const widthFlag = flag('--width');
  const themeFlag = flag('--theme');
  const routes = shellRoutes().filter((r) => !only || r.path.includes(only));
  /* pages driven at once; --jobs 1 keeps a loaded machine to one browser page */
  const jobs = Number(flag('--jobs') ?? 3);
  if (!Number.isInteger(jobs) || jobs < 1) {
    console.error(`lint-lines: --jobs wants a positive integer, got ${flag('--jobs')}`);
    process.exit(2);
  }
  const widths = widthFlag ? [Number(widthFlag)] : SHELL_WIDTHS;
  const themes = themeFlag ? [themeFlag] : SHELL_THEMES;
  if (routes.length === 0) {
    console.error(`lint-lines: --only ${only} matches no route`);
    process.exit(2);
  }

  const out = {};
  let audits = 0;
  let bad = 0;
  let broken = 0;
  const tasks = [];
  for (const route of routes)
    for (const themeName of themes)
      for (const width of widths)
        tasks.push(async () => {
          const { results, unapplied } = await auditShellRoute(route, width, themeName);
          const key = `${width}/${themeName}`;
          out[route.path] ??= {};
          out[route.path][key] = results;
          for (const [state, audit] of Object.entries(results)) {
            audits++;
            if (failing(audit)) {
              bad++;
              const lines = [];
              for (const d of audit.junctions) lines.push(`  junction ${d.orient}@${d.at} gap ${d.gap}: ${d.a} | ${d.b} (${d.span}px)`);
              for (const d of audit.doubles) lines.push(`  double ${d.orient}@${d.at} gap ${d.gap}: ${d.a} | ${d.b} (${d.span}px)`);
              for (const c of audit.colors) lines.push(`  color ${c.kind} ${c.side} of ${c.owner} @${c.at}: ${c.color} (${c.role})`);
              for (const s of audit.selfStacks.filter((x) => x.len >= 120)) lines.push(`  self-stack ${s.side} of ${s.owner} @${s.at} (${s.len}px)`);
              for (const s of audit.invisibles) lines.push(`  invisible seam ${s.owner} @${s.at} on ${s.fill}`);
              console.error(`${route.path} ${key} ${state}: ${lines.length} finding(s)`);
              for (const line of lines) console.error(line);
            }
          }
          for (const state of unapplied) {
            broken++;
            console.error(`${route.path} ${key}: state "${state}" did not apply (audited whatever showed)`);
          }
        });
  await pool(tasks, jobs);

  if (jsonOut || reportOnly) console.log(JSON.stringify(out, null, 1));
  console.error(
    `lint:lines:shell — ${audits} audit(s) over ${routes.length} route(s), ${widths.length} width(s), ${themes.length} theme(s): ${bad} with findings, ${broken} state(s) unapplied`
  );
  if (broken && !reportOnly) {
    await browser.close();
    process.exit(2);
  }
  return bad > 0;
}

const failed = SHELL ? await runShellMode() : await runPageMode();
await browser.close();
if (!reportOnly && failed) process.exit(1);
