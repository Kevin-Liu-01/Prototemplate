#!/usr/bin/env node
/* oxlint-disable no-console -- a lint reporting to stdout. */
/**
 * Holds the site's type to one system: the rsms InterVariable through the
 * tokens in src/components/viewer/tokens.css (DESIGN.md section 4, "Book
 * type"; BRAND.md section 6). Pure Node in static mode; --live drives the
 * dev server with playwright-core, as lint-lines.mjs does.
 *
 * Usage:
 *   node scripts/lint-type.mjs [--report] [--update-baseline] [--root <dir>]
 *   node scripts/lint-type.mjs --live [--base http://localhost:3005]
 *     [--only /brand] [--width 1440] [--report]
 *
 * Static mode reads src/**\/*.{css,ts,tsx} minus the allowlist (ALLOW_FILES)
 * and prints `file:line RULE message`. Hard rules:
 *
 *   T1 family      font-family, fontFamily and the family of `font:` read a
 *                  type token (var(--pt-text), var(--pt-display),
 *                  var(--pt-mono), var(--pt-text-hant|hans|ja|he)) or
 *                  inherit; the face tokens only on the nameplate and the
 *                  gallery's grotesk labels
 *   T2 stack       no family named Inter, InterVariable, Inter var, Inter
 *                  Display, TWK Lausanne or Lausanne anywhere; no custom
 *                  property outside tokens.css that names a family or
 *                  var(--font-inter); in tokens.css an Inter stack starts
 *                  with var(--font-inter) and holds no Helvetica Neue or
 *                  Arial; no @font-face with a local() source
 *   T3 next/font   src/lib/fonts.ts binds `ptInter`; no binding named after
 *                  an installed family (`inter`) outside /d/ and /present/;
 *                  no identifier bound in two files outside /d/ (next/font
 *                  names the family after the identifier). /d/ is read as
 *                  warnings. Every localFont call outside src/lib/fonts.ts
 *                  and src/lib/brand-fonts.ts sets preload: false, /d/ and
 *                  /present/ included: Turbopack merges @font-face rules
 *                  into CSS chunks that other routes share, and Next
 *                  preloads every font a route's CSS names
 *   T4 features    font-feature-settings reads var(--pt-ff-text) or
 *                  var(--pt-ff-display) (`normal` on the nameplate); both
 *                  token definitions hold 'liga' 1 and 'calt' 1
 *   T5 variation   no font-variation-settings, no font-optical-sizing: none
 *   T6 weight      nothing above 500 outside the nameplate and the
 *                  specimens; tokens.css holds the :is(b, strong) base rule
 *   T7 headings    an h1 or h2 rule sets its size, line height and tracking
 *                  through the --pt-d* tokens and never its family or
 *                  features (the base in tokens.css owns them)
 *   T8 tracking    no positive letter-spacing on Inter
 *   T9 mono        var(--pt-mono) only on code, pre, samp, tt, kbd, a class
 *                  ending in -code, -token, -path, -file, -tag or -hex, or a
 *                  named MONO entry (numbers, identifiers, paths, hex values
 *                  and locale codes; words move to Inter)
 *
 * Ratchets, per file, against scripts/lint-type.baseline.json: R1 literal
 * px font-size, R2 literal letter-spacing, R3 literal line-height. A rise
 * fails; a drop asks for --update-baseline. Counts are per file, so edits
 * that move lines do not churn the baseline.
 *
 * Escape hatch: `/* lint-type: allow <reason> *\/` on the declaration's line
 * or the line above it. An empty reason fails.
 *
 * Exit 0 on a pass, 1 on failures, 2 on an infrastructure failure. --report
 * prints without failing.
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PATHS = {
  tokens: 'src/components/viewer/tokens.css',
  fonts: 'src/lib/fonts.ts',
  baseline: 'scripts/lint-type.baseline.json',
  deckHead: 'deck/parts/head.html',
};

/**
 * Files the static mode does not read, each with its reason. A prefix
 * ending in `/` covers a folder. `t3` names how rule T3 (the next/font
 * bindings) still reads the entry: 'warn' or 'skip'; the rest of the rules
 * never read it.
 */
export const ALLOW_FILES = [
  { path: 'src/app/d/', t3: 'warn', reason: 'the /d/ directions are self-contained explorations with their own type' },
  { path: 'src/components/shared/StorySection.css', t3: 'skip', reason: 'mounted only by the directions' },
  { path: 'src/components/shared/FeatureBento.css', t3: 'skip', reason: 'mounted only by the directions' },
  { path: 'src/components/shared/EditorWorkspace.css', t3: 'skip', reason: 'mounted only by the directions' },
  { path: 'src/components/shared/LanguageWheel.css', t3: 'skip', reason: 'mounted only by the directions' },
  { path: 'src/components/shared/HeroFieldSwitcher.css', t3: 'skip', reason: 'mounted only by the directions' },
  { path: 'src/components/shared/field-effects-menu.css', t3: 'skip', reason: 'mounted only by the directions' },
  { path: 'src/components/shared/diagrams/', t3: 'skip', reason: 'mounted only by the directions and the craft demos' },
  { path: 'src/components/try/', t3: 'skip', reason: 'mounted only by the directions and the craft demos' },
  { path: 'src/components/plate/', t3: 'skip', reason: "another session's code: the dashboard's sign-in and onboarding gallery" },
  { path: 'src/app/craft/', t3: 'skip', reason: "another session's code: the craft article and its demos on /docs" },
  { path: 'src/app/present/', t3: 'skip', reason: "a specimen: the presenter's type beats set the wrong Inter beside the right one on purpose" },
];

/**
 * Selectors that may step outside the rules, each with what it may do and
 * why. A rule's selector matches an entry when one of its comma items
 * ends with the entry's text at a compound boundary.
 */
export const NAMEPLATE = {
  selectors: ['.pt-face-serif', '.pt-face-grot'],
  reason: 'the nameplate (DESIGN.md section 15): Fraunces 600 and Space Grotesk 500 with their own tracking, and no Inter features',
};

export const GROTESK_LABELS = {
  selectors: ['.pt-line.is-h i', '.pt-src-spec', '.pt-funnel-t', '.aw-chip', '.sl-cap-name', '.sl-fig-label', '.sl-fig-word'],
  reason: "the gallery's grotesk labels (DESIGN.md section 4, the grotesk for labels): Space Grotesk with positive tracking",
};

export const SPECIMENS = {
  selectors: ['.ptb-display', '.mk-ascii'],
  reason: 'specimens: the brand page weight rows (300 to 800) and the /marks ASCII plates show type as an object',
};

/**
 * Monospace beyond the code elements, by selector. An entry is added only
 * for a selector whose text is a number, a code identifier, a path, a hex
 * value or a locale code; words move to Inter.
 */
export const MONO = {
  selectors: [
    '.pt-row-label', // the gallery's row numbers, 01 to 20
    '.sl-law-n', // the ledger's law numbers
    '.pt-funnel-n', // the funnel's counts, 20+
    '.ptb-swatch span', // hex values
    '.ptb-pill', // locale codes
    '.pt-craft-lib h3', // the code name horizon-field
    '.ptc-n', // the craft figure's numbers
    '.ptc-part-token', // the craft figure's tokens
    '.ptb-device-row b', // the brand device names: doubled-line, locale-tag, horizon-field (component identifiers)
    '.sl-fig-mono', // the ledger figures' CSS tokens: non-scaling-stroke and the property names
    '.blog-fumadocs-architecture .fm', // the Fumadocs figure's package names: fumadocs-mdx, fumadocs-core, base-ui
  ],
  reason: 'numbers, code identifiers, paths, hex values and locale codes (DESIGN.md section 4, BRAND.md section 6)',
};

const FAMILY_TOKENS = /^var\(--pt-(text|display|mono|text-hant|text-hans|text-ja|text-he)\)$/;
const FACE_TOKENS = /^var\(--pt-face-(serif|grot)\)$/;
const FEATURE_TOKENS = /^var\(--pt-ff-(text|display)\)$/;
const BANNED_FAMILY = /(^|[\s,'"])(InterVariable|Inter Display|Inter var|Inter|TWK Lausanne|Lausanne)(?=$|[\s,'"])/i;
const HEAVY = /^(600|700|800|900|bold|bolder)$/;
const CODE_SUBJECT = /(^|[\s:(,>+~])(code|pre|samp|tt|kbd)(?=$|[.:#[\s,)])/;
const CODE_CLASS = /\.[\w-]+-(code|token|path|file|tag|hex)(?=$|[.:#[\s,)])/;
const HATCH = /lint-type:\s*allow\b(.*?)(\*\/|$)/;


/** Every file under `dir` (relative to root), sorted. */
function listFiles(root, dir) {
  const abs = join(root, dir);
  if (!existsSync(abs)) return [];
  const out = [];
  const walk = (rel) => {
    for (const name of readdirSync(join(root, rel)).sort()) {
      if (name === 'node_modules' || name.startsWith('.')) continue;
      const child = `${rel}/${name}`;
      if (statSync(join(root, child)).isDirectory()) walk(child);
      else out.push(child);
    }
  };
  walk(dir);
  return out;
}

/** The allowlist entry covering a file, or null. */
export function allowedFile(rel) {
  return ALLOW_FILES.find((entry) => (entry.path.endsWith('/') ? rel.startsWith(entry.path) : rel === entry.path)) ?? null;
}

/** Comments blanked to spaces, newlines kept, so offsets still give line numbers. */
export function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
}

/** The hatches of a file: line number to reason ('' for an empty reason). */
function hatches(text) {
  const out = new Map();
  text.split('\n').forEach((line, i) => {
    const m = line.match(HATCH);
    if (m) out.set(i + 1, m[1].replace(/\*\/.*$/, '').trim());
  });
  return out;
}

/** Splits on `sep` outside parentheses, brackets and quotes. */
function splitTop(text, sep) {
  const out = [];
  let depth = 0;
  let quote = null;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === quote && text[i - 1] !== '\\') quote = null;
      continue;
    }
    if (c === '"' || c === "'") quote = c;
    else if (c === '(' || c === '[') depth++;
    else if (c === ')' || c === ']') depth--;
    else if (c === sep && depth === 0) {
      out.push(text.slice(start, i));
      start = i + 1;
    }
  }
  out.push(text.slice(start));
  return out;
}

/**
 * A small CSS block parser: the rules of a sheet as { selectors, decls, at },
 * where selectors are the comma items of the rule's selector, decls are
 * { prop, value, line }, and at lists the enclosing at-rule preludes. It
 * walks @media, @container, @supports and @layer nesting, reads
 * @font-face as a rule whose selector is `@font-face`, and resolves a
 * nested style rule against its parent (`&` or a descendant).
 */
export function parseCss(source) {
  const text = stripComments(source);
  const rules = [];
  const lineAt = (i) => text.slice(0, i).split('\n').length;
  /* the stack: { kind: 'at' | 'rule', prelude, selectors, rule } */
  const stack = [];
  let start = 0;
  let depth = 0;
  let quote = null;
  const top = () => stack[stack.length - 1];
  const flushDecl = (end) => {
    const frame = top();
    const chunk = text.slice(start, end);
    if (!frame || frame.kind !== 'rule' || !chunk.trim()) return;
    const colon = chunk.indexOf(':');
    if (colon < 0) return;
    const prop = chunk.slice(0, colon).trim().toLowerCase();
    const value = chunk.slice(colon + 1).trim();
    const offset = start + chunk.search(/\S/);
    frame.rule.decls.push({ prop, value, line: lineAt(offset) });
  };
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === quote && text[i - 1] !== '\\') quote = null;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      continue;
    }
    if (c === '(') depth++;
    else if (c === ')') depth--;
    if (depth > 0) continue;
    if (c === ';') {
      flushDecl(i);
      start = i + 1;
    } else if (c === '{') {
      const prelude = text.slice(start, i).trim();
      const parent = top();
      if (prelude.startsWith('@') && !/^@font-face\b/i.test(prelude)) {
        stack.push({ kind: 'at', prelude });
      } else {
        const own = prelude.startsWith('@') ? ['@font-face'] : splitTop(prelude, ',').map((s) => s.trim().replace(/\s+/g, ' '));
        const outer = [...stack].reverse().find((f) => f.kind === 'rule');
        const selectors = outer
          ? outer.selectors.flatMap((p) => own.map((s) => (s.includes('&') ? s.replaceAll('&', p) : `${p} ${s}`)))
          : own;
        const at = stack.filter((f) => f.kind === 'at').map((f) => f.prelude);
        const rule = { selectors, decls: [], at, line: lineAt(start + text.slice(start, i).search(/\S/)) };
        rules.push(rule);
        stack.push({ kind: 'rule', selectors, rule, parent });
      }
      start = i + 1;
    } else if (c === '}') {
      flushDecl(i);
      stack.pop();
      start = i + 1;
    }
  }
  return rules;
}

/** The last compound selector of a selector item (its subject). */
export function subjectOf(selector) {
  const parts = [];
  let depth = 0;
  let cur = '';
  for (const c of selector) {
    if (c === '(' || c === '[') depth++;
    if (c === ')' || c === ']') depth--;
    if (depth === 0 && /[\s>+~]/.test(c)) {
      if (cur) parts.push(cur);
      cur = '';
    } else cur += c;
  }
  if (cur) parts.push(cur);
  return parts[parts.length - 1] ?? '';
}

/** True when a selector item ends with `entry` at a compound boundary. */
function endsWithEntry(selector, entry) {
  const s = selector.replace(/::?(before|after|first-line|first-letter|marker|placeholder)$/, '');
  if (s === entry) return true;
  if (!s.endsWith(entry)) return false;
  const before = s[s.length - entry.length - 1];
  return /[\s>+~]/.test(before) || (entry.startsWith('.') && /[\w)\]]/.test(before));
}

/** True when every comma item of the rule matches one of the entry's selectors (or a descendant of one). */
function ruleIn(rule, group, { descendants = false } = {}) {
  return rule.selectors.every((sel) =>
    group.selectors.some((entry) => endsWithEntry(sel, entry) || (descendants && (sel.startsWith(`${entry} `) || sel.includes(` ${entry} `) || sel.includes(`${entry}:`))))
  );
}

/** The heading level a selector's subject names: 'h1', 'h2' or null. */
function headingOf(selector) {
  const subject = subjectOf(selector);
  const m = subject.match(/^(h[12])(?=$|[.:#[])/);
  if (m) return m[1];
  return null;
}

/** The family part of a `font:` shorthand: what follows the size (and its line height). */
export function shorthandFamily(value) {
  const m = value.match(/(?:^|\s)(?:[\d.]+(?:px|em|rem|%|pt|vw|vh|ch)|var\([^)]*\)|calc\([^)]*\))(?:\s*\/\s*\S+)?\s+(.+)$/);
  return m ? m[1].trim() : value.trim();
}

/** The weight part of a `font:` shorthand, or null. */
function shorthandWeight(value) {
  const m = value.match(/(?:^|\s)(100|200|300|400|500|600|700|800|900|bold|bolder)(?=\s)/);
  return m ? m[1] : null;
}

const literal = (value) => !/var\(/.test(value) && !/^(inherit|initial|unset|normal|0)$/.test(value.trim());

/**
 * The problems of one stylesheet, as { line, rule, message }, and its
 * ratchet counts. `rel` decides the tokens-file exemptions.
 */
export function lintCss(rel, source) {
  const problems = [];
  const counts = { R1: 0, R2: 0, R3: 0 };
  const isTokens = rel === PATHS.tokens;
  const hatch = hatches(source);
  const hatched = (line) => (hatch.has(line) ? hatch.get(line) : hatch.has(line - 1) ? hatch.get(line - 1) : null);
  const report = (line, rule, message) => {
    const reason = hatched(line);
    if (reason === null) problems.push({ line, rule, message });
    else if (reason === '') problems.push({ line, rule: 'H0', message: `the lint-type hatch needs a reason (it covers ${rule})` });
  };
  const rules = parseCss(source);
  for (const r of rules) {
    const sel = r.selectors.join(', ');
    const nameplate = ruleIn(r, NAMEPLATE);
    const grotesk = ruleIn(r, GROTESK_LABELS);
    const specimen = ruleIn(r, SPECIMENS, { descendants: true });
    const monoEntry = ruleIn(r, MONO);
    const fontFace = r.selectors[0] === '@font-face';
    const setsMono = r.decls.some((d) => (d.prop === 'font-family' || d.prop === 'font') && /var\(--pt-mono\)/.test(d.value));
    const headings = r.selectors.map(headingOf).filter(Boolean);
    for (const d of r.decls) {
      const { prop, value, line } = d;
      const v = value.replace(/\s*!important$/, '').trim();
      /* T2: banned family names, wherever a family can be named */
      if ((prop === 'font-family' || prop === 'font' || prop === 'src' || prop.startsWith('--')) && BANNED_FAMILY.test(v.replace(/var\([^)]*\)/g, ''))) {
        report(line, 'T2', `${prop}: ${v} names a family other than the self-hosted InterVariable token`);
      }
      if (fontFace && prop === 'src' && /local\(/.test(v)) report(line, 'T2', '@font-face with a local() source picks up an installed face');
      if (prop.startsWith('--')) {
        const namesFamily = /var\(--font-inter\)/.test(v) || /(^|,)\s*(['"][^'"]+['"]|[A-Za-z-]+)\s*(,\s*(['"][^'"]+['"]|serif|sans-serif|monospace|system-ui|ui-monospace|ui-sans-serif))+\s*$/.test(v);
        if (!isTokens && namesFamily) {
          report(line, 'T2', `${prop} names a font stack outside ${PATHS.tokens}; read a type token`);
        }
        if (isTokens && /var\(--font-inter\)/.test(v)) {
          if (!/^var\(--font-inter\)/.test(v)) report(line, 'T2', `${prop}: the Inter stack must start with var(--font-inter)`);
          if (splitTop(v, ',').some((item) => /^(['"]?Helvetica Neue['"]?|['"]?Arial['"]?)$/.test(item.trim()))) report(line, 'T2', `${prop}: Helvetica Neue and Arial after var(--font-inter) are dead (next/font's fallback face is local Arial)`);
        }
        if (isTokens && /^--pt-ff-(text|display)$/.test(prop) && !(/'liga' 1/.test(v) && /'calt' 1/.test(v))) {
          report(line, 'T4', `${prop} must hold 'liga' 1 and 'calt' 1 (Chrome turns them off under letter-spacing)`);
        }
        continue;
      }
      /* T1: the family reads a token */
      if (prop === 'font-family' || prop === 'font') {
        const fam = prop === 'font' ? shorthandFamily(v) : v;
        const ok = FAMILY_TOKENS.test(fam) || fam === 'inherit' || (FACE_TOKENS.test(fam) && (nameplate || grotesk));
        if (!ok && !(isTokens && fam === 'inherit')) report(line, 'T1', `${prop}: ${v}; read var(--pt-text), var(--pt-display) or var(--pt-mono)`);
        if (/var\(--pt-mono\)/.test(fam)) {
          const subjects = r.selectors.map(subjectOf);
          const codeish = r.selectors.every((s, k) => CODE_SUBJECT.test(subjects[k]) || CODE_CLASS.test(subjects[k]));
          if (!codeish && !monoEntry) report(line, 'T9', `${sel}: mono is for code, numbers and tokens; words take var(--pt-text) (or name the selector in MONO with its reason)`);
        }
        if (headings.length && !isTokens) report(line, 'T7', `${sel}: a heading never sets its family (the base in tokens.css owns it)`);
      }
      /* T4: features read a token */
      if (prop === 'font-feature-settings') {
        const ok = FEATURE_TOKENS.test(v) || (v === 'normal' && nameplate);
        if (!ok) report(line, 'T4', `font-feature-settings: ${v}; read var(--pt-ff-text) or var(--pt-ff-display)${/tnum/.test(v) ? ' (tabular figures: font-variant-numeric)' : ''}`);
        if (headings.length && !isTokens) report(line, 'T7', `${sel}: a heading never sets its features (the base in tokens.css owns them)`);
      }
      /* T5: no variation */
      if (prop === 'font-variation-settings') report(line, 'T5', 'font-variation-settings: opsz and wght come from the size and the weight');
      if (prop === 'font-optical-sizing' && v === 'none') report(line, 'T5', 'font-optical-sizing: none switches off the Display design');
      /* T6: weight */
      if (prop === 'font-weight' || prop === 'font') {
        const w = prop === 'font' ? shorthandWeight(v) : v;
        if (w && HEAVY.test(w) && !nameplate && !specimen) report(line, 'T6', `${prop}: ${v}; nothing above 500 (BRAND.md section 6): var(--pt-w-strong) or 500`);
      }
      /* T7: heading sizes from the display ladder */
      if (headings.length && !isTokens && (prop === 'font-size' || prop === 'line-height' || prop === 'letter-spacing' || prop === 'font')) {
        if (prop === 'font' || !/var\(--pt-d[123]/.test(v)) report(line, 'T7', `${sel} ${prop}: ${v}; read --pt-d1, --pt-d2 or --pt-d3 (and their -lh and -track)`);
      }
      /* T8: no positive tracking on Inter */
      if (prop === 'letter-spacing') {
        const n = Number.parseFloat(v);
        if (!Number.isNaN(n) && n > 0 && !setsMono && !nameplate && !grotesk && !monoEntry) report(line, 'T8', `letter-spacing: ${v}; nothing on Inter is tracked positive`);
      }
      /* ratchets */
      if (!isTokens && !nameplate && !grotesk && !specimen) {
        if (prop === 'font-size' && /\dpx\b/.test(v) && literal(v)) counts.R1 += hatched(line) ? 0 : 1;
        if (prop === 'letter-spacing' && literal(v)) counts.R2 += hatched(line) ? 0 : 1;
        if (prop === 'line-height' && literal(v)) counts.R3 += hatched(line) ? 0 : 1;
      }
    }
  }
  if (isTokens) {
    const flat = stripComments(source);
    if (!/:is\(b, strong\)\s*\{[^}]*font-weight:\s*var\(--pt-w-strong\)/.test(flat)) {
      problems.push({ line: 1, rule: 'T6', message: 'tokens.css must hold the :is(b, strong) base rule at var(--pt-w-strong) (the UA bolder computes 700)' });
    }
  }
  return { problems, counts };
}

/** The `style={{ ... }}` objects of a TSX file, as { body, offset }. */
function styleObjects(text) {
  const out = [];
  const re = /style=\{\{/g;
  let m;
  while ((m = re.exec(text))) {
    let depth = 2;
    let i = m.index + m[0].length;
    for (; i < text.length && depth > 0; i++) {
      if (text[i] === '{') depth++;
      else if (text[i] === '}') depth--;
    }
    out.push({ body: text.slice(m.index + m[0].length, i - 2), offset: m.index + m[0].length });
  }
  return out;
}

/** The problems of one TSX or TS file's inline type (T1, T4, T5, T6, T8), as { line, rule, message }. */
export function lintTsx(rel, source) {
  const problems = [];
  const text = source.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' ')).replace(/(^|[^:])\/\/.*$/gm, (c, p) => p + ' '.repeat(c.length - p.length));
  const hatch = hatches(source);
  const lineAt = (i) => text.slice(0, i).split('\n').length;
  for (const { body, offset } of styleObjects(text)) {
    for (const m of body.matchAll(/\b(fontFamily|fontFeatureSettings|fontVariationSettings|fontWeight|letterSpacing)\s*:\s*([^,}\n]+)/g)) {
      const line = lineAt(offset + m.index);
      if (hatch.has(line) || hatch.has(line - 1)) {
        if ((hatch.get(line) ?? hatch.get(line - 1)) === '') problems.push({ line, rule: 'H0', message: 'the lint-type hatch needs a reason' });
        continue;
      }
      const [, key, raw] = m;
      const v = raw.trim().replace(/^['"`]|['"`]$/g, '');
      if (key === 'fontFamily' && !FAMILY_TOKENS.test(v)) problems.push({ line, rule: BANNED_FAMILY.test(v) ? 'T2' : 'T1', message: `fontFamily: ${raw.trim()}; read var(--pt-text) or var(--pt-display)` });
      if (key === 'fontFeatureSettings' && !FEATURE_TOKENS.test(v)) problems.push({ line, rule: 'T4', message: `fontFeatureSettings: ${raw.trim()}; read var(--pt-ff-text) or var(--pt-ff-display)` });
      if (key === 'fontVariationSettings') problems.push({ line, rule: 'T5', message: 'fontVariationSettings: opsz and wght come from the size and the weight' });
      if (key === 'fontWeight' && HEAVY.test(v)) problems.push({ line, rule: 'T6', message: `fontWeight: ${v}; nothing above 500` });
      if (key === 'letterSpacing' && Number.parseFloat(v) > 0) problems.push({ line, rule: 'T8', message: `letterSpacing: ${v}; nothing on Inter is tracked positive` });
    }
  }
  return problems;
}

/** The next/font bindings of a source file: [{ name, line }]. */
export function fontBindings(source) {
  const out = [];
  for (const m of source.matchAll(/(?:export\s+)?const\s+(\w+)\s*=\s*localFont\(/g)) {
    const call = source.slice(m.index, source.indexOf('});', m.index));
    out.push({ name: m[1], line: source.slice(0, m.index).split('\n').length, preload: !/\bpreload:\s*false\b/.test(call) });
  }
  return out;
}

/** The two files whose faces every shell route draws, so their preloads stay (the roman Inter and the nameplate). */
const PRELOADED_FONTS = new Set([PATHS.fonts, 'src/lib/brand-fonts.ts']);

/** Families installed on designers' machines that a next/font identifier must not take (next/font names the family after it). */
const INSTALLED = new Set(['inter', 'arial', 'helvetica', 'georgia', 'times', 'menlo', 'roboto']);

/**
 * T3 over every source file's bindings: { problems: [{ file, line, rule, message }], warnings }.
 * `files` maps a relative path to its source.
 */
export function lintBindings(files) {
  const problems = [];
  const warnings = [];
  const seen = new Map();
  for (const [rel, source] of files) {
    if (!PRELOADED_FONTS.has(rel)) {
      for (const { name, line, preload } of fontBindings(source)) {
        if (preload) problems.push({ file: rel, line, rule: 'T3', message: `next/font binding ${name} is preloaded on every route that shares its CSS chunk; set preload: false` });
      }
    }
    const allow = allowedFile(rel);
    if (allow && allow.t3 === 'skip') continue;
    const warn = allow?.t3 === 'warn';
    for (const { name, line } of fontBindings(source)) {
      if (rel === PATHS.fonts && name !== 'ptInter') problems.push({ file: rel, line, rule: 'T3', message: `the Inter binding is ${name}; bind it as ptInter (the family takes the identifier's name)` });
      if (INSTALLED.has(name.toLowerCase()) && !warn && !rel.startsWith('src/app/present/')) {
        problems.push({ file: rel, line, rule: 'T3', message: `next/font binding ${name} names the family after an installed font` });
      }
      const key = name;
      seen.set(key, [...(seen.get(key) ?? []), { rel, line, warn }]);
    }
  }
  for (const [name, where] of seen) {
    if (where.length < 2) continue;
    const outside = where.filter((w) => !w.warn);
    const list = where.map((w) => w.rel).join(', ');
    if (outside.length >= 2) {
      for (const w of outside) problems.push({ file: w.rel, line: w.line, rule: 'T3', message: `next/font binding ${name} is also bound in ${list}: two faces would share the family name ${name}` });
    } else {
      warnings.push(`T3 (warning) next/font binding ${name} in ${where.length} files under /d/ shares one family name and can swap faces after client navigation: ${list}`);
    }
  }
  return { problems, warnings };
}

/** The source files the static mode reads, relative to root. */
export function sourceFiles(root) {
  return listFiles(root, 'src').filter((rel) => /\.(css|ts|tsx)$/.test(rel));
}

/**
 * Every finding under `root`: { problems: ['file:line RULE message'], warnings, counts }.
 * `counts` is the ratchet's { R1: { file: n }, R2, R3 }.
 */
export function lintType(root) {
  const problems = [];
  const counts = { R1: {}, R2: {}, R3: {} };
  const all = new Map();
  for (const rel of sourceFiles(root)) {
    const source = readFileSync(join(root, rel), 'utf8');
    all.set(rel, source);
    if (allowedFile(rel)) continue;
    if (rel.endsWith('.css')) {
      const { problems: found, counts: n } = lintCss(rel, source);
      for (const p of found) problems.push(`${rel}:${p.line} ${p.rule} ${p.message}`);
      for (const key of ['R1', 'R2', 'R3']) if (n[key]) counts[key][rel] = n[key];
    } else if (rel.endsWith('.tsx')) {
      for (const p of lintTsx(rel, source)) problems.push(`${rel}:${p.line} ${p.rule} ${p.message}`);
    }
  }
  if (!all.has(PATHS.fonts)) problems.push(`${PATHS.fonts}:1 T3 missing`);
  if (!all.has(PATHS.tokens)) problems.push(`${PATHS.tokens}:1 T2 missing`);
  const { problems: t3, warnings } = lintBindings(all);
  for (const p of t3) problems.push(`${p.file}:${p.line} ${p.rule} ${p.message}`);
  return { problems, warnings, counts };
}

/** The ratchet: rises fail, drops remind. Returns { rises: [...], drops: [...] }. */
export function ratchet(counts, baseline) {
  const rises = [];
  const drops = [];
  const name = { R1: 'literal px font-size', R2: 'literal letter-spacing', R3: 'literal line-height' };
  for (const key of ['R1', 'R2', 'R3']) {
    const now = counts[key] ?? {};
    const known = baseline?.[key] ?? {};
    for (const file of new Set([...Object.keys(now), ...Object.keys(known)])) {
      const a = now[file] ?? 0;
      const b = known[file] ?? 0;
      if (a > b) rises.push(`${file} ${key} ${name[key]}: ${a} (baseline ${b}); read a type token`);
      else if (a < b) drops.push(`${file} ${key}: ${a} (baseline ${b})`);
    }
  }
  return { rises, drops };
}

/* ------------------------------------------------------------------ */
/* Live mode: the rendered pages on the dev server                      */
/* ------------------------------------------------------------------ */

/** The Chrome lint-lines.mjs drives (CHROME_PATH first, as scripts/site-pages.mjs reads it); the same build reads the same faces. lint-radius.mjs and lint-heads.mjs drive it too. */
export const EXEC =
  process.env.CHROME_PATH ??
  '/Users/kevinliu/Library/Caches/ms-playwright/chromium-1217/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';

/**
 * Where the live rules stand down, by DOM: the nameplate, code, the mono
 * entries, the gallery's grotesk labels, the craft article and its demos
 * (another session's code; .ptc-every on /brand stays in), and the deck's
 * type specimens.
 */
export const LIVE_ALLOW = {
  /* .panel is the deck's code panel */
  face: [...NAMEPLATE.selectors, ...GROTESK_LABELS.selectors, ...MONO.selectors, 'code', 'pre', 'samp', 'kbd', 'tt', '.spec', '.ladder', '.lang', '.panel'],
  craft: '.ptd-craft',
  specimen: [...SPECIMENS.selectors, ...NAMEPLATE.selectors, '.spec', '.ladder'],
};

/**
 * Runs in the page: every visible element with text of its own, grouped by
 * selector and computed type, with what the rules read. `data-lt` tags the
 * first element of each group for the CDP face query.
 */
function collectPage({ allow, interRange }) {
  const INTER = new RegExp(interRange);
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'TITLE']);
  const HASHED = /^(ptInter|inter_|fraunces_|grotesk_|module__|__)/;
  const desc = (el) => {
    const cls = [...el.classList].filter((c) => !HASHED.test(c)).slice(0, 3);
    return el.tagName.toLowerCase() + (cls.length ? `.${cls.join('.')}` : '');
  };
  const path = (el) => {
    const parts = [];
    for (let e = el, i = 0; i < 4 && e && e !== document.body; i++, e = e.parentElement) parts.unshift(desc(e));
    return parts.join(' > ');
  };
  const faceSel = allow.face.join(', ');
  const specSel = allow.specimen.join(', ');
  /* the computed form of the two feature tokens, read off a probe in the page */
  const probe = document.createElement('span');
  document.body.appendChild(probe);
  const resolve = (value) => {
    probe.style.fontFeatureSettings = value;
    return getComputedStyle(probe).fontFeatureSettings;
  };
  const deck = !getComputedStyle(document.documentElement).getPropertyValue('--pt-ff-text').trim();
  const ff = {
    text: deck ? resolve("'liga' 1, 'calt' 1") : resolve('var(--pt-ff-text)'),
    display: deck ? resolve("'liga' 1, 'calt' 1, 'cv11' 1, 'ss01' 1") : resolve('var(--pt-ff-display)'),
  };
  probe.remove();
  const root = getComputedStyle(document.documentElement);
  const px = (name) => parseFloat(root.getPropertyValue(name)) || 0;
  const ladder = deck
    ? []
    : ['d1', 'd2', 'd3'].map((d) => ({ d, size: px(`--pt-${d}`), track: parseFloat(root.getPropertyValue(`--pt-${d}-track`)) }));
  /* a fresh tag per collect: an overlay state collects the same page again */
  for (const el of document.querySelectorAll('[data-lt]')) el.removeAttribute('data-lt');
  const groups = new Map();
  let id = 0;
  for (const el of document.body.querySelectorAll('*')) {
    if (SKIP.has(el.tagName) || el.closest('nextjs-portal, svg')) continue;
    let text = '';
    for (const n of el.childNodes) if (n.nodeType === 3) text += n.textContent;
    text = text.replace(/\s+/g, ' ').trim();
    if (!text) continue;
    if (!el.checkVisibility({ visibilityProperty: true, opacityProperty: false })) continue;
    const cs = getComputedStyle(el);
    const size = parseFloat(cs.fontSize);
    const ls = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing);
    const lh = parseFloat(cs.lineHeight);
    const rect = el.getBoundingClientRect();
    const style = {
      family: cs.fontFamily,
      size,
      weight: Number(cs.fontWeight),
      lsEm: +(ls / size).toFixed(4),
      ffs: cs.fontFeatureSettings,
      wrap: cs.textWrapStyle || cs.textWrap,
    };
    const selector = path(el);
    const key = `${selector}|${JSON.stringify(style)}`;
    let g = groups.get(key);
    if (!g) {
      const lt = `lt${id++}`;
      el.setAttribute('data-lt', lt);
      g = {
        lt,
        selector,
        tag: el.tagName.toLowerCase(),
        text: text.slice(0, 60),
        style,
        face: Boolean(el.closest(faceSel)),
        craft: Boolean(el.closest(allow.craft)) || (Boolean(el.closest('[class*="ptc-"]')) && !el.closest('.ptc-every')),
        specimen: Boolean(el.closest(specSel)),
        display: Boolean(el.closest('h1, h2, .ptc-every')) || (deck && Boolean(el.closest('.big'))),
        heading: /^h[1-3]$/.test(el.tagName.toLowerCase()) ? el.tagName.toLowerCase() : null,
        lead: el.classList.contains('pt-book-lead'),
        /* a run whose descendants hold code, a mono entry or another script: CDP reports their faces too */
        mixed: Boolean(el.querySelector(faceSel)) || !INTER.test(el.textContent ?? ''),
        lines: lh > 0 ? Math.round(rect.height / lh) : 1,
        chars: text.length,
        count: 0,
      };
      groups.set(key, g);
    }
    g.count++;
  }
  return { deck, ff, ladder, groups: [...groups.values()] };
}

/** Latin and the punctuation, arrows and symbols Inter draws; a run outside them may take another face. */
const INTER_RANGE = /^[\u0000-ɏ̀-ͯ -⁯₠-⃏℀-⅏←-⇿−∕≈≠≤≥■-□✓]*$/;

/** The opsz and weight of an InterVariable instance from its PostScript name (`InterVariable_opsz200000_wght1F40000`). */
export function interInstance(name) {
  const m = /^InterVariable(?:Italic)?(?:_opsz([0-9A-F]+))?(?:_wght([0-9A-F]+))?/i.exec(name);
  if (!m) return null;
  return { opsz: m[1] ? parseInt(m[1], 16) / 65536 : null, wght: m[2] ? parseInt(m[2], 16) / 65536 : null };
}

/**
 * The live rules over one page's groups: { failures, warnings }, each a
 * line naming the rule, the selector and the text. `page` is what
 * collectPage returned, with `platform` ([{ name, custom, glyphs }]) on
 * each group.
 */
export function checkGroups(page, { lead = false } = {}) {
  const failures = [];
  const warnings = [];
  const say = (list, rule, g, message) => list.push(`${rule} ${g.selector} "${g.text}": ${message}`);
  const featureSet = (v) => (v === 'normal' ? '' : v.replace(/"/g, '').split(/,\s*/).sort().join(','));
  for (const g of page.groups) {
    if (g.craft) continue;
    const platform = g.platform ?? [];
    const inter = platform.filter((f) => /^InterVariable/i.test(f.name));
    const others = platform.filter((f) => !/^InterVariable/i.test(f.name) && f.glyphs > 0);
    const isInter = inter.length > 0;
    /* L1: a Latin run in another face */
    if (!g.face && !g.mixed && others.length > 0 && INTER_RANGE.test(g.text)) {
      say(failures, 'L1', g, `rendered by ${others.map((f) => f.name).join(', ')}, not InterVariable`);
    }
    if (g.face || !isInter) continue;
    /* L2: the features of the role */
    const want = g.display ? page.ff.display : page.ff.text;
    const ok = featureSet(g.style.ffs) === featureSet(want) || (page.deck && !g.display && g.style.ffs === 'normal');
    if (!ok) say(failures, 'L2', g, `font-feature-settings ${g.style.ffs}; the ${g.display ? 'display' : 'text'} features are ${want}`);
    /* L3: tracking */
    if (g.style.lsEm > 0) say(failures, 'L3', g, `letter-spacing +${g.style.lsEm}em on Inter`);
    if (g.heading === 'h1' || g.heading === 'h2') {
      const step = page.deck ? { d: 'deck', track: -0.025 } : page.ladder.find((d) => Math.abs(d.size - g.style.size) < 0.5);
      if (!step) say(failures, 'L3', g, `${g.style.size}px is off the display ladder (${page.ladder.map((d) => `${d.d} ${d.size}px`).join(', ')})`);
      else if (Math.abs(step.track - g.style.lsEm) > 0.002) say(failures, 'L3', g, `tracking ${g.style.lsEm}em; ${step.d} is ${step.track}em`);
    } else if (g.style.weight <= 400 && g.style.lsEm !== 0) {
      say(failures, 'L3', g, `weight ${g.style.weight} text tracked ${g.style.lsEm}em`);
    }
    /* L4: the optical size follows the size */
    const want4 = Math.min(32, Math.max(14, g.style.size));
    const sizes = inter.map((f) => interInstance(f.name)?.opsz).filter((v) => v !== null && v !== undefined);
    if (sizes.length && !sizes.some((v) => Math.abs(v - want4) < 0.5)) say(failures, 'L4', g, `opsz ${sizes.join('/')}; ${want4} at ${g.style.size}px`);
    /* L5: nothing above 500 */
    if (g.style.weight > 500 && !g.specimen) say(failures, 'L5', g, `weight ${g.style.weight}`);
    /* L6: headings balance */
    if (g.heading && !/balance/.test(g.style.wrap ?? '')) say(failures, 'L6', g, `text-wrap ${g.style.wrap}`);
    /* L7: tracking keeps calt */
    if (g.style.lsEm !== 0 && !/calt/.test(g.style.ffs)) say(failures, 'L7', g, `tracked ${g.style.lsEm}em without calt (${g.style.ffs})`);
    /* L8: a head lead in two or three lines of 75 characters at most */
    if (lead && g.lead) {
      const perLine = Math.round(g.chars / Math.max(1, g.lines));
      if (g.lines > 3 || perLine > 75) say(warnings, 'L8', g, `${g.lines} lines at about ${perLine} characters a line`);
    }
  }
  return { failures, warnings };
}

/** The first slug a source file declares after `from` (lint-lines.mjs's helper). */
function firstSlugIn(root, file, pattern, from) {
  let text = readFileSync(join(root, file), 'utf8');
  if (from) text = text.slice(Math.max(0, text.indexOf(from)));
  return text.match(pattern)?.[1] ?? null;
}

const DEFAULT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * The live lints' one route list (lint-type, lint-radius and lint-heads
 * read it): the shell's routes, the first of each kind read from the data
 * or from its index page (a skill, a post, a direction, an archive entry,
 * a motion package), and the deck's own document. Returns the routes, each
 * { path, keys?, deck? }, and the kinds it could not find.
 */
export async function liveRoutes(browser, base, root = DEFAULT_ROOT) {
  const direction = firstSlugIn(root, 'src/lib/directions.ts', /slug: '([^']+)'/);
  const archive = firstSlugIn(root, 'src/lib/archive.ts', /entry\('([^']+)'/);
  const pkg = firstSlugIn(root, 'src/lib/motion.ts', /'([^']+)'/, 'export const MOTION_PACKAGE_SLUGS');
  const firstLink = async (path, prefix) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    try {
      await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded', timeout: 240000 });
      await page.waitForSelector(`a[href^="${prefix}"]`, { timeout: 240000 }).catch(() => null);
      return await page.evaluate((p) => {
        const a = [...document.querySelectorAll('a[href]')].find((el) => {
          const href = el.getAttribute('href') ?? '';
          return href.startsWith(p) && href.length > p.length && !href.includes('#');
        });
        return a ? a.getAttribute('href') : null;
      }, prefix);
    } finally {
      await ctx.close();
    }
  };
  const skill = await firstLink('/skills', '/skills/');
  const post = await firstLink('/blog', '/blog/');
  const routes = [
    { path: '/' },
    { path: '/brand', keys: ['r', 'Meta+k', 'Shift+Slash'] },
    { path: '/docs' },
    { path: '/docs/design' },
    { path: '/handbook' },
    { path: '/compare' },
    { path: '/graphics' },
    { path: '/marks' },
    { path: '/skills' },
    skill ? { path: skill } : null,
    { path: '/motion' },
    pkg ? { path: `/motion/${pkg}` } : null,
    direction ? { path: `/directions/${direction}` } : null,
    archive ? { path: `/archive/${archive}` } : null,
    { path: '/blog' },
    post ? { path: post } : null,
    { path: '/brand-deck.html', deck: true },
  ].filter(Boolean);
  const missing = Object.entries({ skill, post, direction, archive, package: pkg })
    .filter(([, v]) => !v)
    .map(([k]) => k);
  return { routes, missing };
}

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
    console.error(`lint:type --live needs playwright-core: ${error}`);
    return 2;
  }
  const deckFixed = readFileSync(join(root, PATHS.deckHead), 'utf8').includes("'calt' 1");
  const browser = await chromium.launch({ executablePath: EXEC, headless: true });
  const failures = [];
  const warnings = [];
  let broken = 0;

  /** One page at one width: load, settle, collect, read the faces over CDP. */
  const visit = async (path, width, keys = []) => {
    const ctx = await browser.newContext({ viewport: { width, height: width <= 600 ? 844 : 900 } });
    await ctx.addInitScript(() => {
      try {
        localStorage.setItem('gt-theme', 'dark');
        localStorage.setItem('gt-deck-theme', 'dark');
      } catch {}
    });
    const page = await ctx.newPage();
    try {
      /* domcontentloaded, then the page's root: /compare and /directions hold
         live direction pages in iframes, whose load the lint does not need */
      const resp = await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded', timeout: 240000 });
      if (!resp || resp.status() >= 400) throw new Error(`HTTP ${resp ? resp.status() : 'none'}`);
      await page.waitForSelector('.pt-viewer, .viewer, .blog-root', { timeout: 240000 });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1500);
      const out = [];
      for (const state of [null, ...keys]) {
        if (state) {
          await page.keyboard.press(state);
          /* past the overlay's entry (a scaled card renders a smaller optical size mid-flight) */
          await page.waitForTimeout(1500);
        }
        const data = await page.evaluate(collectPage, { allow: LIVE_ALLOW, interRange: INTER_RANGE.source });
        if (data.groups.length === 0) throw new Error('no text found');
        const cdp = await ctx.newCDPSession(page);
        await cdp.send('DOM.enable');
        await cdp.send('CSS.enable');
        const { root: doc } = await cdp.send('DOM.getDocument', { depth: -1 });
        for (const g of data.groups) {
          try {
            const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: doc.nodeId, selector: `[data-lt="${g.lt}"]` });
            const { fonts } = nodeId ? await cdp.send('CSS.getPlatformFontsForNode', { nodeId }) : { fonts: [] };
            g.platform = fonts.map((f) => ({ name: f.postScriptName || f.familyName, custom: f.isCustomFont, glyphs: f.glyphCount }));
          } catch {
            g.platform = [];
          }
        }
        await cdp.detach();
        out.push({ state: state ?? 'rest', data });
        if (state) {
          await page.keyboard.press('Escape');
          await page.waitForTimeout(400);
        }
      }
      return out;
    } finally {
      await ctx.close();
    }
  };

  /* the routes: the shared list (liveRoutes), narrowed by --only */
  const { routes: all, missing } = await liveRoutes(browser, base, root);
  const routes = all.filter((r) => !only || r.path.includes(only));
  if (missing.length) {
    console.error(`lint:type --live: no first ${missing.join(', ')} was found`);
    broken++;
  }

  const tasks = routes.flatMap((route) => widths.map((width) => ({ route, width })));
  let next = 0;
  const worker = async () => {
    while (next < tasks.length) {
      const { route, width } = tasks[next++];
      try {
        const states = await visit(route.path, width, route.keys ?? []);
        for (const { state, data } of states) {
          const where = `${route.path} ${width}${state === 'rest' ? '' : ` ${state}`}`;
          const { failures: f, warnings: w } = checkGroups(data, { lead: width >= 1200 });
          /* the deck owner's rules: warnings, and once head.html carries the calt fix its L2 and L7 count */
          const deckWarn = (line) => data.deck && (!deckFixed || !/^L[27] /.test(line));
          for (const line of f) {
            if (deckWarn(line)) warnings.push(`${where} ${line} (the deck's own rule, deck/parts/head.html)`);
            else failures.push(`${where} ${line}`);
          }
          for (const line of w) warnings.push(`${where} ${line}`);
        }
      } catch (error) {
        broken++;
        console.error(`lint:type --live: ${route.path} at ${width}: ${error instanceof Error ? error.message : error}`);
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(jobs, tasks.length) }, worker));
  await browser.close();

  for (const w of [...new Set(warnings)]) console.log(`warning ${w}`);
  const unique = [...new Set(failures)];
  if (unique.length) {
    console.error(`lint:type --live found ${unique.length} problem${unique.length === 1 ? '' : 's'} on ${base}:`);
    for (const f of unique) console.error(`  ${f}`);
  } else {
    console.log(`lint:type --live clean: ${tasks.length} page${tasks.length === 1 ? '' : 's'} at ${widths.join(' and ')} on ${base}`);
  }
  if (broken) return 2;
  return unique.length && !report ? 1 : 0;
}

const sortObj = (o) => Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]]));

function runStatic(root, argv) {
  const report = argv.includes('--report');
  const { problems, warnings, counts } = lintType(root);
  const baselinePath = join(root, PATHS.baseline);
  if (argv.includes('--update-baseline')) {
    const data = { R1: sortObj(counts.R1), R2: sortObj(counts.R2), R3: sortObj(counts.R3) };
    writeFileSync(baselinePath, `${JSON.stringify(data, null, 1)}\n`);
    const total = (k) => Object.values(counts[k]).reduce((a, b) => a + b, 0);
    console.log(`lint:type baseline updated: R1 ${total('R1')}, R2 ${total('R2')}, R3 ${total('R3')} literal declarations recorded`);
  }
  const baseline = existsSync(baselinePath) ? JSON.parse(readFileSync(baselinePath, 'utf8')) : null;
  const { rises, drops } = baseline ? ratchet(counts, baseline) : { rises: [], drops: [] };
  for (const w of warnings) console.log(w);
  for (const d of drops) console.log(`ratchet dropped: ${d}; run node scripts/lint-type.mjs --update-baseline`);
  const failures = [...problems, ...rises];
  if (!baseline && !argv.includes('--update-baseline')) failures.push(`${PATHS.baseline}: missing; run node scripts/lint-type.mjs --update-baseline`);
  if (failures.length) {
    console.error(`lint:type found ${failures.length} problem${failures.length === 1 ? '' : 's'} (DESIGN.md section 4, Book type):`);
    for (const p of failures) console.error(`  ${p}`);
    return report ? 0 : 1;
  }
  console.log(`lint:type clean: ${sourceFiles(root).filter((rel) => !allowedFile(rel)).length} source files read the type tokens`);
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
    console.error(`lint:type could not run: ${error instanceof Error ? error.stack : error}`);
    process.exit(2);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
