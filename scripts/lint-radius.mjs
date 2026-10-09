#!/usr/bin/env node
/* oxlint-disable no-console -- a lint reporting to stdout. */
/**
 * Holds the site's corners to one law: rounded controls, square shells
 * (DESIGN.md section 2, Corners). Kevin's toolbar is the reference (round
 * two, 2026-10-05): the search pill and the segmented control at 6px, the
 * key chip at 4px. src/components/viewer/tokens.css holds six radius
 * tokens; everything in the shell and the pages writes a corner through
 * them. Pure Node in static mode; --live drives the dev server with
 * playwright-core, as lint-type.mjs does, and reads its route list.
 *
 * Usage:
 *   node scripts/lint-radius.mjs [--report] [--root <dir>]
 *   node scripts/lint-radius.mjs --live [--base http://localhost:3005]
 *     [--only /brand] [--width 1440] [--report]
 *
 * Static mode reads src/**\/*.{css,tsx} minus the allowlist (ALLOW) and
 * prints `file:line RULE message`:
 *
 *   K1 token     every border-radius and border-*-radius (the logical
 *                longhands too) reads var(--pt-radius-<role>),
 *                calc(var(--pt-radius-<role>) - 1, 2 or 3px) (a concentric
 *                part) or inherit; each value of a shorthand the same
 *   K2 shell     a rule ending in a SHELL, ROWS or INNER selector sets
 *                var(--pt-radius-shell) and nothing else
 *   K3 control   a CONTROLS rule never sets the shell corner on all four
 *                corners; a NESTED or CHIPS rule reads the chip corner, and
 *                each one takes it somewhere; GROUPS are exempt (live L2
 *                reads their outer corners); EXCEPTIONS are named
 *   K4 source    no custom property outside tokens.css names a radius
 *   K5 TSX       no style={{ borderRadius }} but a radius token string, no
 *                Tailwind rounded class in a className string, template or
 *                cn()/clsx() call
 *   K6 pins      tokens.css defines the six role tokens at the pinned
 *                values (PINS) and no --pt-radius
 *
 * Escape hatch: `/* lint-radius: allow <reason> *\/` on the declaration's
 * line or the line above passes one K finding (H0 fails an empty reason).
 *
 * Live mode reads the rendered pages at 1440 and 390 in the dark theme,
 * with the R, Cmd K and ? overlays on /brand, one light pass on /brand,
 * and a hover pass on the toolbar's Index button and the count:
 *
 *   L1 shells    a SHELL or ROWS element computes a corner above 0
 *   L2 controls  a visible interactive element that draws a box (four
 *                visible border sides, or a ground of its own) computes a
 *                square corner that is not a group's interior corner; a
 *                group's end options compute the inner radius outside
 *   L3 values    a computed corner outside 0, 4, 5 and 6px, or 50% on a box
 *                that is not square (SPECIMENS and EXCEPTIONS aside)
 *   L4 clip      a picture reaches a rounded ancestor's corner with no clip
 *                between them and no concentric radius of its own
 *   L5 nested    (warning) a rounded box 1 to 3px inside a rounded
 *                ancestor's corner whose radius is not the ancestor's less
 *                the inset
 *
 * Exit 0 on a pass, 1 on failures, 2 on an infrastructure failure.
 * --report prints without failing.
 */

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { liveRoutes, parseCss, sourceFiles, stripComments, subjectOf } from './lint-type.mjs';
import { CHROME_PATH, seedTheme } from './site-pages.mjs';

export const TOKENS = 'src/components/viewer/tokens.css';

/** Kevin's toolbar, round two, 2026-10-05: changing a corner takes an edit here. */
export const PINS = {
  '--pt-radius-shell': '0',
  '--pt-radius-control': '6px',
  '--pt-radius-inner': 'calc(var(--pt-radius-control) - 1px)',
  '--pt-radius-chip': '4px',
  '--pt-radius-card': '6px',
  '--pt-radius-round': '50%',
};

const ROLES = ['shell', 'control', 'inner', 'chip', 'card', 'round'];

/** Files static mode skips, each with its reason. deck/ sits outside src/ and is never read. */
export const ALLOW = [
  { path: 'src/app/d/', reason: 'the /d/ directions are self-contained explorations with their own grammar' },
  { path: 'src/components/shared/StorySection.css', reason: 'mounted nowhere: a reference component the skills cite' },
  { path: 'src/components/shared/FeatureBento.css', reason: 'mounted nowhere: a reference component the skills cite' },
  { path: 'src/components/shared/LanguageWheel.css', reason: 'mounted nowhere: a reference component the skills cite' },
  { path: 'src/components/shared/HeroFieldSwitcher.css', reason: 'mounted only by the directions' },
  { path: 'src/components/shared/field-effects-menu.css', reason: 'mounted only by the directions' },
  { path: 'src/components/shared/diagrams/', reason: 'mounted only by the directions and the craft demos' },
  { path: 'src/components/try/', reason: 'mounted only by the directions and the craft demos' },
  { path: 'src/components/plate/', reason: "another session's code: the dashboard plate on Tailwind's --radius (rounded-md 6px, rounded-sm 4px)" },
  { path: 'src/app/craft/', reason: "another session's code: the craft article and its demos on /docs and /brand" },
  { path: 'src/app/present/', reason: 'the presenter: a full-screen HUD over a live deck with its own grammar' },
];

/** Structural surfaces: square (DESIGN.md section 2, Corners). */
export const SHELL = [
  // the viewer frame and its regions
  '.pt-viewer', '.pt-main', '.pt-stagewrap',
  // the sidebar column (the phone overlay included) and its scrim
  '.pt-sb', '.pt-sb-scrim',
  // the toolbar bar
  '.pt-toolbar',
  // the fixed sheet, its mat, its stage and its frame of rules and crosses; the reading page's scroll region and its column
  '.sheet', '.sheet-mat', '.sheet-flow', '.pt-flow-col', '.pt-sheet-stage', '.pt-sheet-frame', '.pt-sheet-rule', '.pt-sheet-cross',
  // the grid and book regions
  '.pt-grid', '.pt-book', '.pt-book-in',
  // the index panel's column and its scrim
  '.pt-panel', '.pt-panel-scrim',
  // the overlay layers (the palette and the help card inside them are popovers) and the /d/ corner's layer
  '.pt-search', '.pt-help', '.pt-corner-layer', '.pt-corner-scrim',
  // the progress track and its bar
  '.pt-progress',
  // scroll chrome
  '.pt-scroll::-webkit-scrollbar-thumb', '.pt-scroll-x::-webkit-scrollbar-thumb', 'html::-webkit-scrollbar-thumb',
  // the book page: the column, the head, its mast and panel, the contents, the parts, the dividers and the bands
  '.pt-book-col', '.pt-book-head', '.pt-book-mast', '.pt-book-panel', '.pt-book-toc', '.pt-book-part', '.pt-book-sec', '.pt-book-band', '.pt-hatch', '.sl-hatch', '.pt-feature-sec',
  // route roots and route frames: the gallery, a direction's sheet, the compare panes
  '.pt-root', '.gv-flow', '.dr-exhibit', '.dr-sheet-mat', '.dr-sheet', '.pt-cmp-panes', '.pt-cmp-pane', '.pt-cmp-seam',
];

/** Full-bleed list rows: they own their seams and never draw a box, so they stay square. */
export const ROWS = [
  '.pt-grp-head', '.pt-orow', '.pt-orow-fold', '.pt-nrow', '.pt-nest-head',
  '.pt-search-row', '.pt-surf', '.pt-rows > .pt-row', '.pt-book-toc a',
  '.gv-arow', '.sk-row', '.sk-pager-link', '.mk-field-item',
];

/** An input inside its field: the field draws the corner. */
export const INNER = ['.pt-filter input', '.pt-panel-filter input', '.pt-search-field input', '.pt-count-field'];

/** Controls and fields: never square. */
export const CONTROLS = [
  '.pt-ib', '.pt-seg', '.pt-search-btn', '.pt-count', '.pt-filter', '.pt-panel-filter', '.pt-search-field',
  '.pt-sheet-edge', '.pt-feature-cta', '.blog-github a', '.blog-spotlight-links a', '.ptb-film-badge', '.pt-cmd',
  'a.pt-sb-mark', '.blog-carousel-arrow',
  // the sidebar's pointer and current grounds: the control corner
  '.pt-sb-pill',
];

/** Controls set 2 to 7px inside a field: the chip corner. */
export const NESTED = ['.pt-filter-clear', '.pt-compare-seam::after'];

/** Groups whose interior corners stay square: the box reads control, its end options inner (the seg, the install field) or control (the corner stack). */
export const GROUPS = ['.pt-seg .pt-ib', '.pt-corner .pt-ib', '.pt-cmd .pt-cmd-copy', '.pt-cmd-copy'];

/** Chips, key caps, tags and inline code: the chip corner. */
export const CHIPS = [
  '.pt-search-kbd', '.pt-site-flag', '.ptb-pill', '.pt-compare-tag', '.aw-chip', '.blog-body code',
  '.ptd-book .ptd-body code', '.blog-spotlight-links img',
];

/** Shapes that belong to their subject. */
export const SPECIMENS = {
  '.mk-app-tile': "22%: the platform's app icon shape",
  '.mk-tab': 'square: a browser tab mock',
  '.lct-flag': "the locale tag's flag print, BRAND.md's locale-tag device as the toolchain direction draws it (src/app/d/toolchain), 1px",
};

/** Named corners outside the tokens, each with its reason (K3 and L3 accept them). */
export const EXCEPTIONS = { '.pt-ib.is-solid': '8px, Present, DESIGN.md section 15' };

const HATCH = /lint-radius:\s*allow\b(.*?)(\*\/|$)/;
const RADIUS_PROP = /^border-(?:(?:top|bottom)-(?:left|right)-|(?:start|end)-(?:start|end)-)?radius$/;
const TOKEN_FORM = new RegExp(`^(var\\(--pt-radius-(${ROLES.join('|')})\\)|calc\\(var\\(--pt-radius-(${ROLES.join('|')})\\) - [123]px\\)|inherit)$`);

/** The allowlist entry covering a file, or null. */
export function allowedRadiusFile(rel) {
  return ALLOW.find((entry) => (entry.path.endsWith('/') ? rel.startsWith(entry.path) : rel === entry.path)) ?? null;
}

/** True when a selector item ends with `entry` at a compound boundary (lint-type's rule). */
export function endsWithEntry(selector, entry) {
  const s = entry.includes('::') ? selector : selector.replace(/::?(before|after|first-line|first-letter|marker|placeholder)$/, '');
  if (s === entry) return true;
  if (!s.endsWith(entry)) return false;
  const before = s[s.length - entry.length - 1];
  return /[\s>+~]/.test(before) || (entry.startsWith('.') && /[\w)\]]/.test(before));
}

const endsIn = (selector, list) => list.some((entry) => endsWithEntry(selector, entry));

/** The hatches of a file: line number to reason ('' for an empty reason). */
function hatches(text) {
  const out = new Map();
  text.split('\n').forEach((line, i) => {
    const m = line.match(HATCH);
    if (m) out.set(i + 1, m[1].replace(/\*\/.*$/, '').trim());
  });
  return out;
}

/** Splits a value on whitespace and `/` outside parentheses. */
export function radiusParts(value) {
  const out = [];
  let depth = 0;
  let cur = '';
  for (const c of value) {
    if (c === '(') depth++;
    if (c === ')') depth--;
    if (depth === 0 && (/\s/.test(c) || c === '/')) {
      if (cur) out.push(cur);
      cur = '';
    } else cur += c;
  }
  if (cur) out.push(cur);
  return out;
}

/** The role a radius part reads: 'shell', 'chip', ... ('concentric' for a calc), 'inherit', or null. */
function roleOf(part) {
  const m = part.match(TOKEN_FORM);
  if (!m) return null;
  if (part === 'inherit') return 'inherit';
  return m[2] ?? 'concentric';
}

/**
 * The problems of one stylesheet, as { line, rule, message }. `rel` decides
 * the tokens-file exemptions. `seen` collects, per NESTED and CHIPS entry,
 * whether some rule takes the chip corner (K3's repository half).
 */
export function lintRadiusCss(rel, source, seen = new Map()) {
  const problems = [];
  const isTokens = rel === TOKENS;
  const hatch = hatches(source);
  const hatched = (line) => (hatch.has(line) ? hatch.get(line) : hatch.has(line - 1) ? hatch.get(line - 1) : null);
  const report = (line, rule, message) => {
    const reason = hatched(line);
    if (reason === null) problems.push({ line, rule, message });
    else if (reason === '') problems.push({ line, rule: 'H0', message: `the lint-radius hatch needs a reason (it covers ${rule})` });
  };
  for (const r of parseCss(source)) {
    const sel = r.selectors.join(', ');
    const radii = r.decls.filter((d) => RADIUS_PROP.test(d.prop));
    for (const d of r.decls) {
      /* K4: one source for a corner */
      if (d.prop.startsWith('--') && /radius/i.test(d.prop) && !isTokens) {
        report(d.line, 'K4', `${d.prop} names a radius outside ${TOKENS}; read a --pt-radius-<role> token`);
      }
    }
    for (const d of radii) {
      const v = d.value.replace(/\s*!important$/, '').trim();
      const parts = radiusParts(v);
      const roles = parts.map(roleOf);
      /* K1: a token form, every value */
      if (roles.some((x) => x === null)) {
        report(d.line, 'K1', `${sel} ${d.prop}: ${v}; read var(--pt-radius-shell|control|inner|chip|card|round), calc(var(--pt-radius-<role>) - 1 to 3px) or inherit`);
        continue;
      }
      const allShell = roles.every((x) => x === 'shell');
      for (const item of r.selectors) {
        /* K2: shells, rows and inner inputs are square */
        if (endsIn(item, [...SHELL, ...ROWS, ...INNER]) && !allShell) {
          report(d.line, 'K2', `${item} is a shell, a row or an input inside its field: ${d.prop} reads var(--pt-radius-shell)`);
        }
        /* K3: controls never square; nested controls and chips read the chip corner */
        if (endsIn(item, GROUPS) || Object.keys(EXCEPTIONS).some((e) => endsWithEntry(item, e))) continue;
        const control = endsIn(item, CONTROLS);
        const fourCorners = d.prop === 'border-radius';
        if (control && allShell && fourCorners) report(d.line, 'K3', `${item} is a control: it never takes the shell corner (var(--pt-radius-control))`);
        for (const entry of [...NESTED, ...CHIPS]) {
          if (!endsWithEntry(item, entry)) continue;
          if (roles.every((x) => x === 'chip')) seen.set(entry, true);
          else report(d.line, 'K3', `${item} ${NESTED.includes(entry) ? 'is a control inside a field' : 'is a chip'}: ${d.prop} reads var(--pt-radius-chip)`);
        }
      }
    }
  }
  if (isTokens) {
    const flat = stripComments(source);
    const defs = new Map([...flat.matchAll(/(--pt-radius[\w-]*)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
    if (defs.has('--pt-radius')) problems.push({ line: 1, rule: 'K6', message: '--pt-radius is retired: read a --pt-radius-<role> token' });
    for (const [name, value] of Object.entries(PINS)) {
      if (!defs.has(name)) problems.push({ line: 1, rule: 'K6', message: `${name} is missing; it is ${value} (Kevin's toolbar, round two, 2026-10-05)` });
      else if (defs.get(name) !== value) problems.push({ line: 1, rule: 'K6', message: `${name} is ${defs.get(name)}; it is pinned at ${value} (Kevin's toolbar, round two, 2026-10-05)` });
    }
    for (const name of defs.keys()) {
      if (name !== '--pt-radius' && !(name in PINS)) problems.push({ line: 1, rule: 'K6', message: `${name} is not one of the six radius tokens` });
    }
  }
  return problems;
}

/** The `style={{ ... }}` objects of a TSX file, as { body, offset }. */
function styleObjects(text) {
  const out = [];
  for (const m of text.matchAll(/style=\{\{/g)) {
    let depth = 2;
    let i = m.index + m[0].length;
    const start = i;
    for (; i < text.length && depth > 0; i++) {
      if (text[i] === '{') depth++;
      else if (text[i] === '}') depth--;
    }
    out.push({ body: text.slice(start, i - 2), offset: start });
  }
  return out;
}

/** The class strings of a TSX file: className="..", className={'..'}, className={`..`} and cn(..)/clsx(..) string arguments, as { value, offset }. */
function classStrings(text) {
  const out = [];
  for (const m of text.matchAll(/className=(?:"([^"]*)"|'([^']*)'|\{\s*(?:'([^']*)'|"([^"]*)"|`([^`]*)`)\s*\})/g)) {
    out.push({ value: m[1] ?? m[2] ?? m[3] ?? m[4] ?? m[5] ?? '', offset: m.index });
  }
  for (const m of text.matchAll(/\b(?:cn|clsx)\(/g)) {
    let depth = 1;
    let i = m.index + m[0].length;
    const start = i;
    for (; i < text.length && depth > 0; i++) {
      if (text[i] === '(') depth++;
      else if (text[i] === ')') depth--;
    }
    const args = text.slice(start, i - 1);
    for (const s of args.matchAll(/'([^']*)'|"([^"]*)"|`([^`]*)`/g)) out.push({ value: s[1] ?? s[2] ?? s[3] ?? '', offset: start + s.index });
  }
  return out;
}

/** The problems of one TSX file (K5). */
export function lintRadiusTsx(rel, source) {
  const problems = [];
  const text = source.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' ')).replace(/(^|[^:])\/\/.*$/gm, (c, p) => p + ' '.repeat(c.length - p.length));
  const hatch = hatches(source);
  const lineAt = (i) => text.slice(0, i).split('\n').length;
  const report = (line, message) => {
    const reason = hatch.has(line) ? hatch.get(line) : hatch.has(line - 1) ? hatch.get(line - 1) : null;
    if (reason === null) problems.push({ line, rule: 'K5', message });
    else if (reason === '') problems.push({ line, rule: 'H0', message: 'the lint-radius hatch needs a reason (it covers K5)' });
  };
  for (const { body, offset } of styleObjects(text)) {
    for (const m of body.matchAll(/\bborder\w*Radius\s*:\s*([^,}\n]+)/g)) {
      const raw = m[1].trim();
      const v = raw.replace(/^['"`]|['"`]$/g, '');
      if (!/^['"`]/.test(raw) || !/^var\(--pt-radius-(shell|control|inner|chip|card|round)\)$/.test(v)) {
        report(lineAt(offset + m.index), `${m[0].trim()}: a style object's corner reads a radius token string, 'var(--pt-radius-<role>)'`);
      }
    }
  }
  for (const { value, offset } of classStrings(text)) {
    const hit = value.split(/\s+/).find((c) => /^(?:[\w-]+:)*!?rounded(?:-[\w[\]./-]+)?$/.test(c));
    if (hit) report(lineAt(offset), `className ${hit}: a Tailwind corner; read a --pt-radius-<role> token in the sheet`);
  }
  return problems;
}

/** Every finding under `root`: { problems: ['file:line RULE message'], files }. */
export function lintRadius(root) {
  const problems = [];
  const seen = new Map();
  let files = 0;
  let tokens = false;
  for (const rel of sourceFiles(root)) {
    if (!/\.(css|tsx)$/.test(rel) || allowedRadiusFile(rel)) continue;
    files++;
    const source = readFileSync(join(root, rel), 'utf8');
    const found = rel.endsWith('.css') ? lintRadiusCss(rel, source, seen) : lintRadiusTsx(rel, source);
    if (rel === TOKENS) tokens = true;
    for (const p of found) problems.push(`${rel}:${p.line} ${p.rule} ${p.message}`);
  }
  if (!tokens) problems.push(`${TOKENS}:1 K6 missing`);
  for (const entry of [...NESTED, ...CHIPS]) {
    if (!seen.get(entry)) problems.push(`src:1 K3 ${entry} never takes the chip corner (var(--pt-radius-chip)); a chip or a control inside a field is not square`);
  }
  return { problems, files };
}

/* ------------------------------------------------------------------ */
/* Live mode: the rendered pages on the dev server                      */
/* ------------------------------------------------------------------ */

/** Where the live rules stand down, by DOM: the craft article, the plate, the presenter, the dev overlay. */
export const LIVE_SKIP = ['.ptd-craft', '[class*="ptc-"]:not(.ptc-every)', '.plate-root', '.pr-root', 'nextjs-portal'];

/** Routes live mode never reads: the deck's own grammar, the directions, the presenter. */
const SKIP_ROUTES = /^\/(d\/|deck|present)/;

/**
 * Runs in the page: every visible element the rules read, as records with
 * the computed corners in px (null for a percent), the border-box rect, the
 * borders, the ground, the clip and the lists each element matches.
 */
export function collectCorners(lists) {
  const records = [];
  const skip = lists.skip.join(', ');
  const ids = new Map();
  const idOf = (el) => {
    if (!ids.has(el)) ids.set(el, ids.size);
    return ids.get(el);
  };
  const desc = (el) => {
    const cls = [...el.classList].filter((c) => !/^(ptInter|inter_|module__|__)/.test(c)).slice(0, 3);
    return el.tagName.toLowerCase() + (cls.length ? `.${cls.join('.')}` : '');
  };
  const path = (el) => {
    const parts = [];
    for (let e = el, i = 0; i < 3 && e && e !== document.body; i++, e = e.parentElement) parts.unshift(desc(e));
    return parts.join(' > ');
  };
  const alpha = (c) => {
    if (!c || c === 'transparent') return 0;
    const m = /rgba?\(([^)]+)\)/.exec(c);
    if (!m) return 1;
    const p = m[1].split(/[ ,/]+/).filter(Boolean);
    return p.length >= 4 ? parseFloat(p[3]) : 1;
  };
  const corner = (v, w, h) => {
    const first = v.split(' ')[0];
    if (first.endsWith('%')) return { px: (parseFloat(first) / 100) * Math.min(w, h), pct: parseFloat(first) };
    return { px: parseFloat(first) || 0, pct: null };
  };
  const matches = (el, list) => list.some((s) => { try { return el.matches(s); } catch { return false; } });
  const INTERACTIVE = 'button, a[href], input, select, textarea, summary, [role=button], [role=tab], [role=switch], [role=checkbox], [role=radio], [role=option], [role=menuitem]';
  for (const el of document.body.querySelectorAll('*')) {
    if (el.closest(skip) || (el.closest('svg') && el.tagName.toLowerCase() !== 'svg')) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const b = el.getBoundingClientRect();
    if (b.width < 1 || b.height < 1) continue;
    const tl = corner(cs.borderTopLeftRadius, b.width, b.height);
    const tr = corner(cs.borderTopRightRadius, b.width, b.height);
    const br = corner(cs.borderBottomRightRadius, b.width, b.height);
    const bl = corner(cs.borderBottomLeftRadius, b.width, b.height);
    const sides = ['Top', 'Right', 'Bottom', 'Left'].map((s) => ({
      w: parseFloat(cs[`border${s}Width`]) || 0,
      on: (parseFloat(cs[`border${s}Width`]) || 0) > 0 && cs[`border${s}Style`] !== 'none' && cs[`border${s}Style`] !== 'hidden' && alpha(cs[`border${s}Color`]) > 0,
    }));
    const ground = alpha(cs.backgroundColor) > 0 || (cs.backgroundImage && cs.backgroundImage !== 'none');
    const media = /^(img|video|canvas|picture|iframe)$/i.test(el.tagName);
    const rounded = [tl, tr, br, bl].some((c) => c.px > 0);
    const interactive = el.matches(INTERACTIVE);
    const shell = matches(el, lists.shell);
    const row = matches(el, lists.rows);
    if (!rounded && !media && !interactive && !shell && !row) continue;
    records.push({
      id: idOf(el),
      parent: el.parentElement ? idOf(el.parentElement) : null,
      sel: path(el),
      tag: el.tagName.toLowerCase(),
      rect: { x: b.left, y: b.top, w: b.width, h: b.height },
      corners: [tl, tr, br, bl],
      borders: sides.map((s) => s.w),
      box: sides.every((s) => s.on) || ground,
      clips: cs.overflowX !== 'visible' || cs.overflowY !== 'visible' || cs.contain.includes('paint'),
      media,
      interactive,
      shell,
      row,
      inner: matches(el, lists.inner),
      scrim: /scrim/.test(el.className && typeof el.className === 'string' ? el.className : ''),
      group: matches(el, lists.groups),
      specimen: matches(el, lists.specimens),
      exception: matches(el, lists.exceptions),
    });
  }
  /* the ancestor chain of each record, nearest first, among the records */
  const byId = new Map(records.map((r) => [r.id, r]));
  for (const [el, id] of ids) {
    const r = byId.get(id);
    if (!r) continue;
    const chain = [];
    for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) {
      if (!ids.has(e)) {
        /* an element the collector skipped can still clip */
        const cs = getComputedStyle(e);
        if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') chain.push({ clip: true });
        continue;
      }
      chain.push({ id: ids.get(e) });
    }
    r.chain = chain;
  }
  return records;
}

const near = (a, b, tol = 0.5) => Math.abs(a - b) <= tol;

/**
 * The live rules over one page's records: { failures, warnings }, each a
 * line naming the rule, the element and the numbers.
 */
export function judgeCorners(records) {
  const failures = [];
  const warnings = [];
  const byId = new Map(records.map((r) => [r.id, r]));
  const px = (c) => Math.round(c.px * 100) / 100;
  for (const r of records) {
    const cs = r.corners;
    /* L1: shells and rows are square */
    if ((r.shell || r.row) && cs.some((c) => c.px > 0.01)) {
      failures.push(`L1 ${r.sel}: a shell or a row computes ${cs.map(px).join(' ')}px; it is square`);
    }
    /* L3: the values */
    if (!r.specimen && !r.exception) {
      for (const c of cs) {
        if (c.pct !== null) {
          if (c.pct === 50 && !near(r.rect.w, r.rect.h, 1)) failures.push(`L3 ${r.sel}: 50% on a ${Math.round(r.rect.w)}x${Math.round(r.rect.h)} box is an ellipse; the round token is for a square box`);
          else if (c.pct !== 50) failures.push(`L3 ${r.sel}: a ${c.pct}% corner; read a radius token`);
          break;
        }
        if (![0, 4, 5, 6].some((v) => near(c.px, v, 0.01))) {
          failures.push(`L3 ${r.sel}: a ${px(c)}px corner; the corners are 0, 4, 5 and 6px (DESIGN.md section 2, Corners)`);
          break;
        }
      }
    } else if (r.exception && !cs.every((c) => near(c.px, 8, 0.01) || c.px === 0)) {
      failures.push(`L3 ${r.sel}: the named exception is 8px, computed ${cs.map(px).join(' ')}px`);
    }
    /* L2: a visible control is not square */
    if (r.interactive && r.box && !r.row && !r.inner && !r.scrim && !r.shell) {
      if (r.group) {
        /* a group's member: its corners on the group's outer edge are rounded, the interior ones square */
        const g = r.chain.map((c) => (c.id !== undefined ? byId.get(c.id) : null)).find((a) => a && a.corners.some((c) => c.px > 0) && a.rect.w >= r.rect.w && a.rect.h >= r.rect.h);
        if (g) {
          const outer = [
            near(r.rect.x, g.rect.x, 1 + g.borders[3]) && near(r.rect.y, g.rect.y, 1 + g.borders[0]),
            near(r.rect.x + r.rect.w, g.rect.x + g.rect.w, 1 + g.borders[1]) && near(r.rect.y, g.rect.y, 1 + g.borders[0]),
            near(r.rect.x + r.rect.w, g.rect.x + g.rect.w, 1 + g.borders[1]) && near(r.rect.y + r.rect.h, g.rect.y + g.rect.h, 1 + g.borders[2]),
            near(r.rect.x, g.rect.x, 1 + g.borders[3]) && near(r.rect.y + r.rect.h, g.rect.y + g.rect.h, 1 + g.borders[2]),
          ];
          outer.forEach((isOuter, i) => {
            if (isOuter && cs[i].px <= 0.01) failures.push(`L2 ${r.sel}: an end option's outer corner is square; it takes the inner radius`);
          });
        }
      } else if (cs.some((c) => c.px <= 0.01)) {
        /* the corner stack's members round only their outer corners: a square corner is interior when another member shares the edge */
        failures.push(`L2 ${r.sel}: a control that draws a box computes ${cs.map(px).join(' ')}px; it takes the control corner`);
      }
    }
    /* L4: a picture in a rounded frame is clipped or concentric */
    if (r.media) {
      let clipped = false;
      for (const link of r.chain) {
        if (link.clip) {
          clipped = true;
          continue;
        }
        const a = byId.get(link.id);
        if (!a) continue;
        const reach = [
          r.rect.x <= a.rect.x + a.borders[3] + 1 && r.rect.y <= a.rect.y + a.borders[0] + 1,
          r.rect.x + r.rect.w >= a.rect.x + a.rect.w - a.borders[1] - 1 && r.rect.y <= a.rect.y + a.borders[0] + 1,
          r.rect.x + r.rect.w >= a.rect.x + a.rect.w - a.borders[1] - 1 && r.rect.y + r.rect.h >= a.rect.y + a.rect.h - a.borders[2] - 1,
          r.rect.x <= a.rect.x + a.borders[3] + 1 && r.rect.y + r.rect.h >= a.rect.y + a.rect.h - a.borders[2] - 1,
        ];
        a.corners.forEach((c, i) => {
          if (c.px <= 0.01 || !reach[i] || clipped || a.clips) return;
          const want = Math.max(0, c.px - Math.max(a.borders[i], a.borders[(i + 3) % 4]));
          if (r.corners[i].px + 0.5 < want) failures.push(`L4 ${r.sel}: the picture's square corner shows past ${a.sel}'s ${px(c)}px corner; clip the frame or give the picture ${px({ px: want })}px`);
        });
        if (a.clips) clipped = true;
      }
    }
    /* L5 (warning): a rounded box 1 to 3px inside a rounded ancestor's corner is concentric */
    if (cs.some((c) => c.px > 0.01) && !r.media) {
      const parent = r.chain[0]?.id !== undefined ? byId.get(r.chain[0].id) : null;
      if (parent && parent.corners.some((c) => c.px > 0.01)) {
        const inset = r.rect.x - parent.rect.x;
        const insetY = r.rect.y - parent.rect.y;
        if (inset >= 1 && inset <= 3.01 && near(inset, insetY, 0.5) && cs[0].px > 0.01 && parent.corners[0].px > 0.01 && !near(cs[0].px, parent.corners[0].px - inset, 0.5)) {
          warnings.push(`L5 ${r.sel}: ${px(cs[0])}px, ${inset.toFixed(1)}px inside ${parent.sel}'s ${px(parent.corners[0])}px; concentric is ${px({ px: parent.corners[0].px - inset })}px`);
        }
      }
    }
  }
  return { failures, warnings };
}

const LISTS = {
  skip: LIVE_SKIP,
  shell: SHELL.filter((s) => !s.includes('::')),
  rows: ROWS,
  inner: INNER,
  groups: GROUPS,
  specimens: Object.keys(SPECIMENS),
  exceptions: Object.keys(EXCEPTIONS),
};

async function runLive(root, argv) {
  const flag = (name) => {
    const i = argv.indexOf(name);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const base = (flag('--base') ?? 'http://localhost:3005').replace(/\/$/, '');
  const report = argv.includes('--report');
  const only = flag('--only');
  const widths = flag('--width') ? [Number(flag('--width'))] : [1440, 390];
  const jobs = Number(flag('--jobs') ?? 2);
  let chromium;
  try {
    ({ chromium } = await import('playwright-core'));
  } catch (error) {
    console.error(`lint:radius --live needs playwright-core: ${error}`);
    return 2;
  }
  const browser = await chromium.launch({ executablePath: CHROME_PATH, headless: true });
  const failures = [];
  const warnings = [];
  let broken = 0;

  /** One page at one width and theme: load, settle, collect at rest, under each overlay key and on the hover pass. */
  const visit = async (path, width, theme, keys = []) => {
    const ctx = await browser.newContext({ viewport: { width, height: width <= 600 ? 844 : 900 } });
    await seedTheme(ctx, theme);
    const page = await ctx.newPage();
    try {
      const resp = await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded', timeout: 240000 });
      if (!resp || resp.status() >= 400) throw new Error(`HTTP ${resp ? resp.status() : 'none'}`);
      await page.waitForSelector('.pt-viewer, .viewer, .blog-root', { timeout: 240000 });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1500);
      const out = [];
      const collect = async (state) => out.push({ state, records: await page.evaluate(collectCorners, LISTS) });
      await collect('rest');
      for (const key of keys) {
        await page.keyboard.press(key);
        await page.waitForTimeout(1200);
        await collect(key);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(400);
      }
      /* the hover pass: the box Kevin saw beside the round pill and seg */
      for (const target of ['.pt-toolbar .pt-ib[title^="Show or hide the index"]', '.pt-toolbar .pt-count']) {
        const el = await page.$(target);
        if (!el || !(await el.isVisible())) continue;
        await el.hover();
        await page.waitForTimeout(300);
        await collect(`hover ${target.includes('count') ? 'count' : 'index'}`);
      }
      return out;
    } finally {
      await ctx.close();
    }
  };

  let all;
  try {
    all = liveRoutes();
  } catch (error) {
    await browser.close();
    console.error(`lint:radius --live: ${error instanceof Error ? error.message : error}`);
    return 2;
  }
  const routes = all.filter((r) => !r.deck && !SKIP_ROUTES.test(r.path)).filter((r) => !only || r.path.includes(only));
  const tasks = [];
  for (const route of routes) {
    for (const width of widths) tasks.push({ route, width, theme: 'dark', keys: route.keys });
    if (route.path === '/brand') tasks.push({ route, width: widths[0], theme: 'light', keys: [] });
  }
  let next = 0;
  const worker = async () => {
    while (next < tasks.length) {
      const { route, width, theme, keys } = tasks[next++];
      try {
        for (const { state, records } of await visit(route.path, width, theme, keys)) {
          const where = `${route.path} ${width} ${theme}${state === 'rest' ? '' : ` ${state}`}`;
          const { failures: f, warnings: w } = judgeCorners(records);
          for (const line of f) failures.push(`${where} ${line}`);
          for (const line of w) warnings.push(`${where} ${line}`);
        }
      } catch (error) {
        broken++;
        console.error(`lint:radius --live: ${route.path} at ${width} ${theme}: ${error instanceof Error ? error.message : error}`);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(jobs, tasks.length) }, worker));
  await browser.close();

  for (const w of [...new Set(warnings)]) console.log(`warning ${w}`);
  const unique = [...new Set(failures)];
  if (unique.length) {
    console.error(`lint:radius --live found ${unique.length} problem${unique.length === 1 ? '' : 's'} on ${base} (DESIGN.md section 2, Corners):`);
    for (const f of unique) console.error(`  ${f}`);
  } else {
    console.log(`lint:radius --live clean: ${tasks.length} page${tasks.length === 1 ? '' : 's'} at ${widths.join(' and ')} on ${base}`);
  }
  if (broken) return 2;
  return unique.length && !report ? 1 : 0;
}

function runStatic(root, argv) {
  const report = argv.includes('--report');
  const { problems, files } = lintRadius(root);
  if (problems.length) {
    console.error(`lint:radius found ${problems.length} problem${problems.length === 1 ? '' : 's'} (DESIGN.md section 2, Corners):`);
    for (const p of problems) console.error(`  ${p}`);
    return report ? 0 : 1;
  }
  console.log(`lint:radius clean: ${files} source files write their corners through the six radius tokens`);
  return 0;
}

async function main() {
  const argv = process.argv.slice(2);
  const at = argv.indexOf('--root');
  const root = at >= 0 ? resolve(argv[at + 1]) : resolve(dirname(fileURLToPath(import.meta.url)), '..');
  if (argv.includes('--live')) process.exit(await runLive(root, argv));
  try {
    process.exit(runStatic(root, argv));
  } catch (error) {
    console.error(`lint:radius could not run: ${error instanceof Error ? error.stack : error}`);
    process.exit(2);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
