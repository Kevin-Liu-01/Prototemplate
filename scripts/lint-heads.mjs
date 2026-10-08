#!/usr/bin/env node
/* oxlint-disable no-console -- a lint reporting to stdout. */
/**
 * Holds every book page to one structure (DESIGN.md section 4, The book
 * page): BookHead renders the front matter (the mast with the title, the
 * lead and the panel, one rule, the note, the contents and the hatch band),
 * every section opens with the shared divider, and every space reads a
 * token in src/components/viewer/tokens.css. A page differs from another
 * only in its words and its facts. Pure Node in static mode; --live drives
 * the dev server with playwright-core on lint-type.mjs's harness.
 *
 * Usage:
 *   node scripts/lint-heads.mjs [--report] [--root <dir>]
 *   node scripts/lint-heads.mjs --live [--base http://localhost:3005]
 *     [--only /brand] [--report]
 *
 * Static mode:
 *
 *   S1 props    a <BookHead> carries title, badge, lead, updated and facts; a page
 *               route's title is PAGE_NAMES.<id>.name, or PAGE_NAMES[book].name
 *               in the docs shell (the records, a film package, a skill and
 *               a direction, carry their own)
 *   S2 restyle  no rule outside BookView.css and InstallField.css sets a box
 *               or type property on a standard element (.pt-book-head,
 *               -mast, -lead, -panel, -fact, -band, -sec, -col, -toc, or a
 *               class the TSX writes beside pt-book-sec or pt-book-col), or
 *               on its small, h2, span or p
 *   S3 hatch    no .pt-hatch, .sl-hatch or repeating-linear-gradient in a
 *               book route but the band (.pt-book-band)
 *   S4 guides   no ::before or ::after with a line or a ground on the head,
 *               the mast or the title
 *   S5 titles   a page route's static metadata title reads PAGE_NAMES and
 *               is never absolute (the home page and /docs's
 *               docWindowTitle aside)
 *   S6 tokens   the book page's spaces in BookView.css and Sheet.css read
 *               their tokens, never the literal px they stand for
 *
 * Live mode reads /brand, /docs, /docs/design, /handbook, /motion, the
 * first package, /graphics, /skills, the first skill, /marks, the first
 * direction and /blog at 1440x900 and 390x844 in both themes:
 *
 *   H1 structure  one header.pt-book-head; the mast is h1, the lead, the
 *                 panel; after the header an optional contents, the band,
 *                 then the parts (section.pt-book-part); no section before
 *                 the band
 *   H2 title      the h1's box top is the column's content top
 *   H3 clearance  nothing is drawn between the column's top (the stage's
 *                 top, under the toolbar's rule) and the title, which sits
 *                 --pt-title-clear under it; no line
 *                 crosses an h1 or an h2; a divider's h2 is --pt-sec-pad
 *                 under the line above it at least
 *   H4 lead       at most the lead measure wide, 1 to 3 lines at 1440 and
 *                 6 at 390, 200 characters at most
 *   H5 panel      Updated first, dated as src/lib/updated.ts records the
 *                 route; four slots (the install field is two); a glyph per
 *                 label; no value cut; side by side, the first row's
 *                 baseline is the lead's first and every row sits on the
 *                 lead's baselines; at 390 under the lead, the copy target
 *                 44px
 *   H6 rule       one 1px --pt-hair rule on the content box, painted
 *                 across the stage (a --pt-bleed border image), no other
 *                 line within 4px of it,
 *                 --pt-head-rule-pad under the taller of lead and panel
 *   H7 band       one band, 42px, its own --pt-hair rules on both edges,
 *                 on the column's content box (the mast rule's span) and
 *                 painted across the stage,
 *                 --pt-sec-over under the block above, nothing else drawn
 *                 within 4px of its rules
 *   H8 dividers   the first part's divider draws no rule and starts on the
 *                 band; the rest draw a --pt-hair rule painted across the
 *                 stage; every gutter note is
 *                 two lines in titanium, `Section n` first; every h2 sits
 *                 the same distance under its rule (35.5 at 1440, 79 at 390)
 *   H9 standard   at 1440, a one-line title's mast rule is the same distance
 *                 under it on every page (193.16)
 *
 * Exit 0 on a pass, 1 on findings, 2 on an infrastructure failure.
 * --report prints without failing.
 */

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { EXEC, liveRoutes, parseCss, sourceFiles, stripComments, subjectOf } from './lint-type.mjs';

/* ------------------------------------------------------------------ */
/* Static mode                                                          */
/* ------------------------------------------------------------------ */

/** The files that own the book page's styles. */
export const OWNERS = ['src/components/viewer/BookView.css', 'src/components/viewer/InstallField.css'];

/** The record routes: their heads carry the record's own title. */
export const RECORDS = ['src/app/motion/[slug]/PackageViewer.tsx', 'src/app/skills/SkillViewer.tsx', 'src/app/directions/DirectionViewer.tsx'];

/** The component's own file: BookView passes its title through. */
const COMPONENT = 'src/components/viewer/BookView.tsx';

/** The standard elements' classes. */
export const STANDARD = ['pt-book-head', 'pt-book-mast', 'pt-book-lead', 'pt-book-panel', 'pt-book-fact', 'pt-book-band', 'pt-book-sec', 'pt-book-col', 'pt-book-toc'];

/** The box and type properties a route never sets on a standard element. */
const BOX_TYPE = /^(margin|padding|border|gap$|row-gap$|column-gap$|grid-|display$|font|line-height$|letter-spacing$|color$|background|height$|min-height$|width$|max-width$)/;

/** The book routes S3 reads, and the gallery files and the craft article it allows by name. */
const BOOK_ROUTES = ['src/app/brand/', 'src/app/docs/', 'src/app/handbook/', 'src/app/motion/', 'src/app/graphics/', 'src/app/skills/', 'src/app/marks/', 'src/app/directions/', 'src/app/blog/', 'src/components/viewer/BookView', 'src/components/viewer/InstallField'];
const HATCH_ALLOWED = ['src/app/prototemplate.css', 'src/app/system-ledger.css', 'src/app/GalleryViewer.tsx', 'src/app/AnatomyWall.tsx', 'src/app/craft/'];

/** S5's exceptions: the home page (the nameplate) and /docs (docWindowTitle writes the whole title). */
const TITLE_EXCEPT = ['src/app/page.tsx', 'src/app/docs/page.tsx'];

/** The book page's space tokens and the literal px each stands for (tokens.css, 1440). */
export const SPACE_PX = { 44: '--pt-title-clear', 14: '--pt-head-gap', 26: '--pt-head-rule-pad', 56: '--pt-head-col-gap or --pt-col-pad-x', 304: '--pt-head-panel', 32: '--pt-book-gap', 48: '--pt-sec-over', 30: '--pt-sec-pad', 42: '--pt-band-h' };

/** The rules S6 reads: the book page's own boxes and the reading column. */
const SPACE_SUBJECTS = ['.pt-book-in', '.pt-book-col', '.pt-book-mast', '.pt-book-mast > h1', '.pt-book-lead', '.pt-book-band', '.pt-book-sec', '.pt-flow-col'];

/** The props of every `<BookHead` element in a TSX text: [{ line, attrs: Map(name, raw), spread }]. */
export function bookHeads(source) {
  const out = [];
  for (const m of source.matchAll(/<BookHead\b/g)) {
    let i = m.index + m[0].length;
    let depth = 0;
    let quote = null;
    const start = i;
    for (; i < source.length; i++) {
      const c = source[i];
      if (quote) {
        if (c === quote && source[i - 1] !== '\\') quote = null;
        continue;
      }
      if (depth > 0 && (c === "'" || c === '"' || c === '`')) quote = c;
      else if (c === '{') depth++;
      else if (c === '}') depth--;
      else if (depth === 0 && (c === '>' || (c === '/' && source[i + 1] === '>'))) break;
    }
    const text = source.slice(start, i);
    const attrs = new Map();
    let spread = false;
    let j = 0;
    while (j < text.length) {
      const rest = text.slice(j);
      const sp = /^\s*\{\s*\.\.\./.exec(rest);
      const at = /^\s*([A-Za-z_][\w-]*)(=)?/.exec(rest);
      if (sp) spread = true;
      if (!sp && !at) break;
      let k = j + (sp ? sp[0].length - 4 : at[0].length);
      let value = 'true';
      if (sp || (at && at[2])) {
        const open = text[k];
        if (open === '{') {
          let d = 0;
          const vs = k;
          for (; k < text.length; k++) {
            if (text[k] === '{') d++;
            else if (text[k] === '}') {
              d--;
              if (d === 0) break;
            }
          }
          value = text.slice(vs + 1, k);
          k++;
        } else if (open === "'" || open === '"') {
          const end = text.indexOf(open, k + 1);
          value = text.slice(k + 1, end);
          k = end + 1;
        }
      }
      if (at && !sp) attrs.set(at[1], value.trim());
      j = k;
    }
    out.push({ line: source.slice(0, m.index).split('\n').length, attrs, spread });
  }
  return out;
}

/** A title read from PAGE_NAMES: `PAGE_NAMES.brand.name`, or `PAGE_NAMES[book].name` in a shell that renders more than one book (DocsShell). */
const PAGE_NAME = /^PAGE_NAMES(?:\.\w+|\[\w+\])\.name$/;

/** S1 over one TSX file. */
export function lintHeadProps(rel, source) {
  const problems = [];
  const record = RECORDS.includes(rel);
  for (const head of bookHeads(source)) {
    for (const prop of ['title', 'badge', 'lead', 'updated', 'facts']) {
      if (!head.attrs.has(prop) && !(prop === 'facts' && head.spread)) {
        problems.push({ line: head.line, rule: 'S1', message: `<BookHead> has no ${prop}: every head carries a title, its badge (BadgeCycle.tsx), a lead, the Updated entry and its facts` });
      }
    }
    if (record || rel === COMPONENT || !head.attrs.has('title')) continue;
    let title = head.attrs.get('title');
    const ident = /^[A-Za-z_]\w*$/.exec(title);
    if (ident) {
      const def = new RegExp(`const\\s+${title}\\s*=\\s*([^;\\n]+)`).exec(source);
      if (def) title = def[1].trim();
    }
    if (!PAGE_NAME.test(title)) {
      problems.push({ line: head.line, rule: 'S1', message: `<BookHead title=${head.attrs.get('title')}>: a page's title is its plain name, PAGE_NAMES.<id>.name (src/lib/page-names.ts)` });
    }
  }
  return problems;
}

/** The classes a TSX file writes beside pt-book-sec or pt-book-col in one className. */
export function aliasesIn(source) {
  const out = new Set();
  for (const m of source.matchAll(/className=\{?\s*(?:cn\()?\s*['"`]([^'"`]*)['"`]/g)) {
    const classes = m[1].split(/\s+/).filter(Boolean);
    if (classes.includes('pt-book-sec') || classes.includes('pt-book-col')) {
      for (const c of classes) if (!STANDARD.includes(c) && c !== 'pt-book-part') out.add(c);
    }
  }
  return out;
}

/** The compounds of a selector item, in order. */
function compounds(selector) {
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
  return parts;
}

/** True when a compound carries one of the classes itself (a :has() or :not() argument is another element). */
const hasClass = (compound, names) => {
  const own = compound.replace(/:(has|not)\((?:[^()]|\([^()]*\))*\)/g, '');
  return names.some((n) => new RegExp(`\\.${n.replace(/[-]/g, '\\-')}(?![\\w-])`).test(own));
};

/** S2, S3 and S4 over one stylesheet. `aliases` are the classes collected from the TSX. */
export function lintHeadCss(rel, source, aliases = new Set()) {
  const problems = [];
  const standard = [...STANDARD, ...aliases];
  const owner = OWNERS.includes(rel);
  const bookRoute = BOOK_ROUTES.some((p) => rel.startsWith(p));
  const hatchOk = HATCH_ALLOWED.some((p) => rel.startsWith(p));
  for (const r of parseCss(source)) {
    for (const item of r.selectors) {
      const parts = compounds(item);
      const subject = subjectOf(item);
      const prev = parts.length > 1 ? parts[parts.length - 2] : '';
      const subjectBase = subject.replace(/::?(before|after)$/, '');
      /* S2: a route never restyles a standard element */
      if (!owner) {
        const onStandard = hasClass(subjectBase, standard);
        const onInner = /^(small|h2|span|p)(?=$|[.:[#])/.test(subjectBase) && hasClass(prev, standard);
        if (onStandard || onInner) {
          for (const d of r.decls) {
            if (BOX_TYPE.test(d.prop)) problems.push({ line: d.line, rule: 'S2', message: `${item} sets ${d.prop}: the book page's elements are styled in BookView.css alone; a page differs only in its words and its facts` });
          }
        }
      }
      /* S4: no guide drawn on the head, the mast or the title */
      if (/::?(before|after)$/.test(subject)) {
        const guided = hasClass(subjectBase, ['pt-book-head', 'pt-book-mast']) || (/^h1(?=$|[.:[#])/.test(subjectBase) && parts.slice(0, -1).some((p) => hasClass(p, ['pt-book-head', 'pt-book-mast'])));
        if (guided) {
          for (const d of r.decls) {
            if (/^(border|background|outline|box-shadow)/.test(d.prop) && !/^(none|0|transparent)$/.test(d.value.trim())) {
              problems.push({ line: d.line, rule: 'S4', message: `${item} draws ${d.prop}: nothing is drawn in --pt-title-clear and no line crosses a title` });
            }
          }
        }
      }
    }
    /* S3: one hatch per book, the band's */
    if (bookRoute && !hatchOk && !r.selectors.every((s) => endsWithBand(s))) {
      for (const d of r.decls) {
        if (/repeating-linear-gradient/.test(d.value)) problems.push({ line: d.line, rule: 'S3', message: `${r.selectors.join(', ')} draws a hatch: a book has one band, .pt-book-band (BookHead)` });
      }
      if (r.selectors.some((s) => /\.(pt|sl)-hatch(?![\w-])/.test(s))) problems.push({ line: r.line, rule: 'S3', message: `${r.selectors.join(', ')}: .pt-hatch and .sl-hatch are the gallery's; a book has one band, .pt-book-band` });
    }
  }
  return problems;
}

/* the band, or its ::before, which carries the hatch across the stage */
const endsWithBand = (s) => /\.pt-book-band(::before)?$/.test(s.trim());

/** S3 over a TSX file of a book route. */
export function lintHeadTsx(rel, source) {
  const problems = [];
  const bookRoute = BOOK_ROUTES.some((p) => rel.startsWith(p));
  if (!bookRoute || HATCH_ALLOWED.some((p) => rel.startsWith(p))) return problems;
  const text = stripComments(source);
  for (const m of text.matchAll(/\b(pt-hatch|sl-hatch)\b|repeating-linear-gradient/g)) {
    problems.push({ line: text.slice(0, m.index).split('\n').length, rule: 'S3', message: `${m[0]}: a book has one band, rendered by BookHead (.pt-book-band)` });
  }
  return problems;
}

/** S5 over a page route's source. */
export function lintTitles(rel, source) {
  const problems = [];
  if (!/^src\/app\/(?!d\/).*page\.tsx$/.test(rel) || TITLE_EXCEPT.includes(rel)) return problems;
  const m = /export const metadata(?::\s*\w+)?\s*=\s*\{/.exec(source);
  if (!m) return problems;
  const body = source.slice(m.index, source.indexOf('\n};', m.index));
  const t = /\btitle\s*:\s*([^,\n]+)/.exec(body);
  if (!t) return problems;
  const line = source.slice(0, m.index + t.index).split('\n').length;
  const value = t[1].trim();
  if (/absolute/.test(value) || /absolute/.test(body.slice(t.index, t.index + 200).split('\n')[0])) {
    problems.push({ line, rule: 'S5', message: `metadata.title is absolute: the layout's template adds ", Prototemplate"; read PAGE_NAMES.<id>.name` });
  } else if (!PAGE_NAME.test(value)) {
    problems.push({ line, rule: 'S5', message: `metadata.title: ${value}; read PAGE_NAMES.<id>.name (src/lib/page-names.ts), the one source for a page's name` });
  }
  return problems;
}

/** S6 over BookView.css and Sheet.css: the book page's spaces read their tokens. */
export function lintSpaces(rel, source) {
  const problems = [];
  if (rel !== 'src/components/viewer/BookView.css' && rel !== 'src/components/viewer/Sheet.css') return problems;
  for (const r of parseCss(source)) {
    if (!r.selectors.some((s) => SPACE_SUBJECTS.includes(s))) continue;
    for (const d of r.decls) {
      if (!/^(margin|padding|gap$|row-gap$|column-gap$|height$|grid-template-columns$)/.test(d.prop)) continue;
      for (const px of d.value.matchAll(/(?<![\w-])(\d+(?:\.\d+)?)px\b/g)) {
        const token = SPACE_PX[px[1]];
        if (token) problems.push({ line: d.line, rule: 'S6', message: `${r.selectors.join(', ')} ${d.prop}: ${d.value}; ${px[0]} is ${token}` });
      }
    }
  }
  return problems;
}

/** Every static finding under `root`: { problems: ['file:line RULE message'], heads }. */
export function lintHeads(root) {
  const problems = [];
  const files = sourceFiles(root).filter((rel) => !rel.startsWith('src/app/d/'));
  const sources = new Map(files.map((rel) => [rel, readFileSync(join(root, rel), 'utf8')]));
  const aliases = new Set();
  let heads = 0;
  for (const [rel, source] of sources) {
    if (!rel.endsWith('.tsx')) continue;
    for (const a of aliasesIn(source)) aliases.add(a);
    heads += bookHeads(source).length;
  }
  for (const [rel, source] of sources) {
    const found = rel.endsWith('.css')
      ? [...lintHeadCss(rel, source, aliases), ...lintSpaces(rel, source)]
      : rel.endsWith('.tsx')
        ? [...lintHeadProps(rel, source), ...lintHeadTsx(rel, source), ...lintTitles(rel, source)]
        : [];
    for (const p of found) problems.push(`${rel}:${p.line} ${p.rule} ${p.message}`);
  }
  return { problems, heads, aliases: [...aliases].sort() };
}

/* ------------------------------------------------------------------ */
/* Live mode: the rendered heads on the dev server                      */
/* ------------------------------------------------------------------ */

/** The routes live mode reads, by kind: the single pages and the first of each record (from lint-type's list). */
const LIVE_PATHS = /^\/(brand|docs|docs\/design|handbook|motion(\/[\w-]+)?|graphics|skills(\/[\w-]+)?|marks|directions\/[\w-]+|blog)$/;

/**
 * Runs in the page: the head's geometry and the lines around it. Every
 * number is in CSS px from the viewport's top left; the reading page's
 * scroll region is at its top.
 */
export function collectHead() {
  const W = window;
  const cs = (e, p) => W.getComputedStyle(e, p);
  const rect = (e) => {
    const b = e.getBoundingClientRect();
    return { x: b.left, y: b.top, w: b.width, h: b.height, r: b.right, b: b.bottom };
  };
  const desc = (e) => {
    if (!e) return null;
    const cls = typeof e.className === 'string' ? e.className.trim().split(/\s+/).filter(Boolean).slice(0, 3) : [];
    return e.tagName.toLowerCase() + (cls.length ? `.${cls.join('.')}` : '');
  };
  const alpha = (c) => {
    if (!c || c === 'transparent') return 0;
    const m = /rgba?\(([^)]+)\)/.exec(c);
    if (!m) return 1;
    const p = m[1].split(/[ ,/]+/).filter(Boolean);
    return p.length >= 4 ? parseFloat(p[3]) : 1;
  };
  /* drawn and on screen: an off-canvas sidebar or a faded toast draws nothing a reader sees */
  const shown = (e) => {
    if (!e.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return false;
    const b = e.getBoundingClientRect();
    return (b.width > 0 || b.height > 0) && b.right > 0 && b.left < innerWidth;
  };
  /* a computed token: a length through a probe's padding, a color through its color */
  const probe = document.createElement('div');
  probe.style.cssText = 'position:absolute;visibility:hidden;width:0;height:0';
  (document.querySelector('.pt-book-col') ?? document.body).appendChild(probe);
  const len = (name) => {
    probe.style.paddingTop = `var(${name})`;
    return parseFloat(cs(probe).paddingTop);
  };
  const color = (name) => {
    probe.style.color = `var(${name})`;
    return cs(probe).color;
  };
  const tokens = {
    titleClear: len('--pt-title-clear'),
    headRulePad: len('--pt-head-rule-pad'),
    secPad: len('--pt-sec-pad'),
    secOver: len('--pt-sec-over'),
    bandH: len('--pt-band-h'),
    hair: color('--pt-hair'),
    titanium: color('--pt-titanium'),
  };
  probe.style.paddingTop = '';
  probe.style.fontSize = 'var(--pt-t-lead)';
  probe.style.width = 'var(--pt-measure-lead)';
  tokens.measureLead = parseFloat(cs(probe).width);
  probe.remove();

  /* every drawn line in the book's region (the reading page's scroll
     region, or the blog's column): borders, outlines, 1 to 2px
     painted boxes, absolute pseudo-elements. The chrome around the region
     (the toolbar, the sidebar, a toast) draws outside it. */
  const lines = [];
  const region = document.querySelector('.pt-book-head')?.closest('.sheet-flow, .blog-root') ?? document.body;
  const all = [region, ...region.querySelectorAll('*')].filter((e) => !(e.closest('svg') && e.tagName.toLowerCase() !== 'svg') && !e.closest('nextjs-portal'));
  for (const e of all) {
    if (!shown(e)) continue;
    const s = cs(e);
    const b = e.getBoundingClientRect();
    const by = desc(e);
    for (const side of ['top', 'bottom', 'left', 'right']) {
      const w = parseFloat(s[`border-${side}-width`]);
      const st = s[`border-${side}-style`];
      const col = s[`border-${side}-color`];
      if (!(w > 0) || st === 'none' || st === 'hidden' || alpha(col) === 0) continue;
      if (side === 'top') lines.push({ o: 'h', y: b.top, x1: b.left, x2: b.right, w, col, by, el: e });
      if (side === 'bottom') lines.push({ o: 'h', y: b.bottom - w, x1: b.left, x2: b.right, w, col, by, el: e });
      if (side === 'left') lines.push({ o: 'v', x: b.left, y1: b.top, y2: b.bottom, w, col, by, el: e });
      if (side === 'right') lines.push({ o: 'v', x: b.right - w, y1: b.top, y2: b.bottom, w, col, by, el: e });
    }
    const ow = parseFloat(s.outlineWidth);
    if (ow > 0 && s.outlineStyle !== 'none' && alpha(s.outlineColor) > 0) {
      const off = parseFloat(s.outlineOffset) || 0;
      lines.push({ o: 'h', y: b.top - off - ow, x1: b.left - off - ow, x2: b.right + off + ow, w: ow, col: s.outlineColor, by: `${by} outline`, el: e });
      lines.push({ o: 'h', y: b.bottom + off, x1: b.left - off - ow, x2: b.right + off + ow, w: ow, col: s.outlineColor, by: `${by} outline`, el: e });
    }
    if (b.height > 0 && b.height <= 2.01 && b.width > 8 && alpha(s.backgroundColor) > 0) lines.push({ o: 'h', y: b.top, x1: b.left, x2: b.right, w: b.height, col: s.backgroundColor, by: `${by} box`, el: e });
    if (b.width > 0 && b.width <= 2.01 && b.height > 8 && alpha(s.backgroundColor) > 0) lines.push({ o: 'v', x: b.left, y1: b.top, y2: b.bottom, w: b.width, col: s.backgroundColor, by: `${by} box`, el: e });
    for (const pe of ['::before', '::after']) {
      const p = cs(e, pe);
      if (!p || p.content === 'none' || p.content === 'normal' || p.display === 'none') continue;
      if (p.position !== 'absolute' && p.position !== 'fixed') continue;
      const wT = parseFloat(p.borderTopWidth);
      const hasLine = (wT > 0 && p.borderTopStyle !== 'none' && alpha(p.borderTopColor) > 0) || alpha(p.backgroundColor) > 0;
      if (!hasLine) continue;
      /* a pseudo line is placed against the element when it is positioned */
      const top = parseFloat(p.top);
      const h = parseFloat(p.height);
      if (Number.isFinite(top) && (Number.isFinite(h) ? h <= 2.01 : wT > 0)) lines.push({ o: 'h', y: b.top + top, x1: b.left, x2: b.right, w: wT || h, col: p.borderTopColor, by: `${by}${pe}`, el: e });
    }
  }
  const strip = (l) => ({ o: l.o, y: l.y, x: l.x, x1: l.x1, x2: l.x2, y1: l.y1, y2: l.y2, w: l.w, col: l.col, by: l.by });

  const out = { url: location.pathname, vw: innerWidth };
  const headers = [...document.querySelectorAll('header.pt-book-head')];
  out.headers = headers.length;
  const head = headers[0];
  if (!head) return out;
  const mast = head.querySelector(':scope > .pt-book-mast');
  out.mastChildren = mast ? [...mast.children].map(desc) : [];
  /* after the header: its siblings, a wrapper flattened to the parts inside its column */
  const after = [];
  let sawBand = false;
  let sectionBeforeBand = false;
  for (let e = head.nextElementSibling; e; e = e.nextElementSibling) {
    if (e.matches('div.pt-book-band')) sawBand = true;
    if (!sawBand && e.querySelector('section')) sectionBeforeBand = true;
    if (e.matches('section, nav, div.pt-book-band')) after.push(desc(e));
    else {
      const inner = e.querySelector('.pt-book-col');
      if (inner) for (const c of inner.children) after.push(desc(c));
      else after.push(desc(e));
    }
  }
  out.after = after;
  out.sectionBeforeBand = sectionBeforeBand;

  /* the frame is the reading column (.pt-flow-col) on a shell route, the
     book's own column on /blog; neither draws an edge, so its content box
     is the span every rule of the book shares */
  const flow = head.closest('.pt-flow-col');
  const col = head.closest('.pt-book-col');
  const frame = flow ?? col;
  const fs = cs(frame);
  const fr = rect(frame);
  const padT = flow ? parseFloat(fs.paddingTop) : 0;
  const padL = flow ? parseFloat(fs.paddingLeft) : 0;
  const padR = flow ? parseFloat(fs.paddingRight) : 0;
  out.frame = {
    kind: 'column',
    x1: fr.x + padL,
    x2: fr.r - padR,
    top: fr.y,
    contentTop: fr.y + padT,
    contentX1: fr.x + padL,
    contentX2: fr.r - padR,
  };
  if (!flow) {
    const main = head.closest('.blog-root');
    out.frame.pageTop = main ? rect(main).y : 0;
  }

  const baselineOf = (el, where = 'start') => {
    const sp = document.createElement('span');
    sp.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
    if (where === 'start') el.prepend(sp);
    else el.append(sp);
    const y = sp.getBoundingClientRect().bottom;
    sp.remove();
    return y;
  };
  const h1 = mast?.querySelector(':scope > h1');
  if (h1) out.h1 = { rect: rect(h1), lh: parseFloat(cs(h1).lineHeight) };
  const lead = mast?.querySelector(':scope > .pt-book-lead');
  if (lead) {
    const ls = cs(lead);
    const lh = parseFloat(ls.lineHeight);
    const lr = rect(lead);
    out.lead = { rect: lr, lh, lines: Math.round(lr.h / lh), chars: lead.textContent.trim().length, first: baselineOf(lead) };
  }
  const panel = mast?.querySelector(':scope > .pt-book-panel');
  if (panel) {
    const rows = [...panel.querySelectorAll('dl > div')];
    out.panel = {
      rect: rect(panel),
      rows: rows.map((row) => {
        const dt = row.querySelector('dt');
        const dd = row.querySelector('dd');
        const time = row.querySelector('time[datetime]');
        const copy = row.querySelector('.pt-cmd-copy');
        return {
          cls: row.className,
          rect: rect(row),
          field: row.classList.contains('is-field'),
          svgs: dt ? dt.querySelectorAll('svg').length : 0,
          hiddenLabel: dt ? dt.classList.contains('pt-book-vh') : false,
          cut: dd ? dd.scrollWidth > dd.clientWidth + 0.5 : false,
          baseline: dd && !row.classList.contains('is-field') ? baselineOf(dd) : null,
          time: time ? time.getAttribute('datetime') : null,
          copy: copy ? rect(copy) : null,
        };
      }),
    };
  }
  /* a full-width rule: a border image outset at least the viewport's width on both sides */
  const bleeds = (st) => {
    const [top, right = top, , left = right] = st.borderImageOutset.split(' ').map(parseFloat);
    return st.borderImageSource !== 'none' && right >= innerWidth - 1 && left >= innerWidth - 1;
  };
  if (mast) {
    const ms = cs(mast);
    const mr = rect(mast);
    out.rule = { y: mr.b - parseFloat(ms.borderBottomWidth), w: parseFloat(ms.borderBottomWidth), st: ms.borderBottomStyle, col: ms.borderBottomColor, x1: mr.x, x2: mr.r, bleed: bleeds(ms) };
    /* a line under 4px from the rule doubles it (the install field's box over a stacked panel's rule) */
    const rr = out.rule;
    rr.near = lines
      .filter((l) => l.o === 'h' && l.el !== mast && Math.min(l.x2, rr.x2) - Math.max(l.x1, rr.x1) > 1)
      .filter((l) => (l.y + l.w <= rr.y ? rr.y - (l.y + l.w) : l.y >= rr.y + rr.w ? l.y - (rr.y + rr.w) : 0) < 4 - 0.01)
      .map(strip);
  }
  /* the band */
  const bands = [...document.querySelectorAll('.pt-book-band')];
  out.bands = bands.length;
  const band = bands[0];
  if (band) {
    const bs = cs(band);
    const br = rect(band);
    const above = band.previousElementSibling;
    out.band = {
      rect: br,
      bleed: bleeds(bs),
      top: { w: parseFloat(bs.borderTopWidth), st: bs.borderTopStyle, col: bs.borderTopColor },
      bottom: { w: parseFloat(bs.borderBottomWidth), st: bs.borderBottomStyle, col: bs.borderBottomColor },
      aboveBottom: above ? rect(above).b : null,
      above: desc(above),
      near: lines
        .filter((l) => l.o === 'h' && l.el !== band && Math.min(l.x2, br.r) - Math.max(l.x1, br.x) > 1)
        .filter((l) => Math.abs(l.y - br.y) <= 4 || Math.abs(l.y + l.w - br.y) <= 4 || Math.abs(l.y - br.b) <= 4 || Math.abs(l.y + l.w - br.b) <= 4)
        .map(strip),
    };
  }
  /* the dividers */
  out.dividers = [...document.querySelectorAll('.pt-book-sec')].map((d) => {
    const s = cs(d);
    const r = rect(d);
    const note = d.querySelector(':scope > small');
    const h2 = d.querySelector('h2');
    const part = d.closest('section.pt-book-part');
    const ns = note ? cs(note) : null;
    return {
      rect: r,
      borderTop: { w: parseFloat(s.borderTopWidth), st: s.borderTopStyle, col: s.borderTopColor },
      bleed: bleeds(s),
      first: Boolean(part && part.matches('.pt-book-part:first-of-type') && d === part.firstElementChild),
      note: note
        ? {
            lines: Math.round(note.getBoundingClientRect().height / parseFloat(ns.lineHeight)),
            spans: [...note.querySelectorAll(':scope > span')].map((x) => x.textContent.trim()),
            col: ns.color,
          }
        : null,
      h2: h2 ? rect(h2) : null,
    };
  });
  /* the lines that could touch a title */
  const titles = [...document.querySelectorAll('.pt-book-mast > h1, .pt-book-sec h2')];
  out.titleLines = lines.filter((l) => !titles.some((t) => t.contains(l.el))).map(strip);
  out.h2s = [...document.querySelectorAll('.pt-book-sec h2')].map((h) => rect(h));
  out.tokens = tokens;
  return out;
}

const near = (a, b, tol = 0.5) => Math.abs(a - b) <= tol;
const f1 = (n) => (Math.round(n * 100) / 100).toString();

/** H1: the structure. */
export function judgeStructure(d) {
  const out = [];
  if (d.headers !== 1) return [`H1 ${d.headers} header.pt-book-head on the page; a book has one`];
  const mast = ['h1', 'p.pt-book-lead', 'aside.pt-book-panel'];
  if (d.mastChildren.length !== 3 || d.mastChildren.some((c, i) => !c.startsWith(mast[i]))) {
    out.push(`H1 the mast holds ${d.mastChildren.join(', ')}; it is the h1, the lead and the panel, in that order`);
  }
  const list = [...d.after];
  if (list[0]?.startsWith('nav.') && list[0].includes('pt-book-toc')) list.shift();
  if (!list[0]?.startsWith('div.pt-book-band')) out.push(`H1 after the head (and the contents) comes ${list[0] ?? 'nothing'}; it is the band`);
  else list.shift();
  if (!list[0]?.startsWith('section.pt-book-part')) out.push(`H1 after the band comes ${list[0] ?? 'nothing'}; it is the first section.pt-book-part`);
  const trailing = list.findIndex((c) => !c.startsWith('section.pt-book-part'));
  if (trailing >= 0 && list.slice(trailing).some((c) => !c.startsWith('nav'))) out.push(`H1 the parts are followed by ${list.slice(trailing).join(', ')}; after the parts only a nav (the pager) may follow`);
  if (d.sectionBeforeBand) out.push('H1 a <section> comes before the band');
  return out;
}

/** H2: the title's position. */
export function judgeTitle(d) {
  if (!d.h1) return ['H2 the head has no h1'];
  const off = d.h1.rect.y - d.frame.contentTop;
  return near(off, 0) ? [] : [`H2 the h1's box top is ${f1(off)}px from the ${d.frame.kind}'s content top; it is 0`];
}

/** H3: nothing drawn over a title. */
export function judgeClearance(d) {
  const out = [];
  if (!d.h1) return out;
  const h = d.h1.rect;
  const overlapsX = (l, r) => Math.min(l.x2, r.r) - Math.max(l.x1, r.x) > 1;
  const top = d.frame.pageTop ?? d.frame.top;
  for (const l of d.titleLines) {
    if (l.o === 'h' && overlapsX(l, h) && l.y > top + 0.5 && l.y + l.w <= h.y + 0.5) out.push(`H3 ${l.by} draws a line at y ${f1(l.y)} between the ${d.frame.kind}'s top and the title; nothing is drawn there`);
  }
  if (h.y - top < d.tokens.titleClear - 0.5) out.push(`H3 the title is ${f1(h.y - top)}px under the ${d.frame.kind}'s top; it is --pt-title-clear (${d.tokens.titleClear}px)`);
  for (const r of [h, ...d.h2s]) {
    for (const l of d.titleLines) {
      const crosses = l.o === 'h' ? overlapsX(l, r) && l.y + l.w > r.y + 0.5 && l.y < r.b - 0.5 : l.x + l.w > r.x + 0.5 && l.x < r.r - 0.5 && Math.min(l.y2, r.b) - Math.max(l.y1, r.y) > 1;
      if (crosses) out.push(`H3 ${l.by} crosses the title at ${f1(r.x)},${f1(r.y)}; no line crosses a title`);
    }
  }
  for (const r of d.h2s) {
    const above = d.titleLines.filter((l) => l.o === 'h' && overlapsX(l, r) && l.y + l.w <= r.y + 0.5).sort((a, b) => b.y - a.y)[0];
    if (above && r.y - (above.y + above.w) < d.tokens.secPad - 0.5) out.push(`H3 the h2 at y ${f1(r.y)} is ${f1(r.y - above.y - above.w)}px under ${above.by}; it is --pt-sec-pad (${d.tokens.secPad}px) at least`);
  }
  return out;
}

/** H4: the lead. `record` names a record route whose lead the page's data writes. */
export function judgeLead(d, { wide, record = null } = {}) {
  const out = [];
  if (!d.lead) return ['H4 the head has no lead'];
  const l = d.lead;
  if (l.rect.w > d.tokens.measureLead + 0.5) out.push(`H4 the lead is ${f1(l.rect.w)}px wide; it is --pt-measure-lead (${f1(d.tokens.measureLead)}px) at most`);
  if (wide ? l.lines < 1 || l.lines > 3 : l.lines > 6) out.push(`H4 the lead runs ${l.lines} lines; it is 1 to 3 at 1440 and 6 at most at 390`);
  if (l.chars > 200) out.push(`H4 the lead is ${l.chars} characters; it is 200 at most`);
  return record ? out.map((x) => `${x} (waiting on the motion hold: the lead is ${record}'s series line in src/lib/motion.ts)`) : out;
}

/** H5: the panel. `day` is the route's entry in src/lib/updated.ts. */
export function judgePanel(d, { day, wide }) {
  const out = [];
  const p = d.panel;
  if (!p) return ['H5 the head has no panel'];
  const [first] = p.rows;
  if (!first || !/\bis-updated\b/.test(first.cls)) out.push('H5 the panel\'s first row is not Updated');
  else if (!first.time) out.push('H5 the Updated row has no time[datetime]');
  else if (day && first.time.slice(0, 10) !== day) out.push(`H5 the Updated row reads ${first.time.slice(0, 10)}; src/lib/updated.ts records ${day} for the route`);
  const slots = p.rows.reduce((n, r) => n + (r.field ? 2 : 1), 0);
  if (slots !== 4) out.push(`H5 the panel holds ${slots} slots; it holds four: Updated and three facts, or Updated, one fact and the install field (two slots)`);
  for (const r of p.rows) {
    if (!r.field && r.svgs !== 1) out.push(`H5 a panel row's label draws ${r.svgs} glyphs; it draws one`);
    if (r.cut) out.push('H5 a panel value is cut (scrollWidth over clientWidth)');
  }
  const side = d.lead && p.rect.x > d.lead.rect.r;
  if (side) {
    const firstBase = p.rows.find((r) => r.baseline !== null)?.baseline;
    if (firstBase !== undefined && !near(firstBase, d.lead.first)) out.push(`H5 the panel's first row sits ${f1(firstBase - d.lead.first)}px from the lead's first baseline; it starts on the lead's first line`);
    for (const r of p.rows) {
      if (r.baseline === null) continue;
      const k = (r.baseline - d.lead.first) / d.lead.lh;
      if (!near(k * d.lead.lh, Math.round(k) * d.lead.lh)) out.push(`H5 a panel row's baseline is ${f1((k - Math.round(k)) * d.lead.lh)}px off the lead's baselines`);
    }
  } else if (d.lead && p.rect.y < d.lead.rect.b - 0.5) out.push('H5 the panel is neither beside the lead nor under it');
  if (!wide) for (const r of p.rows) if (r.copy && (r.copy.w < 44 - 0.5 || r.copy.h < 44 - 0.5)) out.push(`H5 the copy button is ${f1(r.copy.w)}x${f1(r.copy.h)}; on a phone it is 44px at least`);
  return out;
}

/** H6: the mast's rule. */
export function judgeRule(d) {
  const out = [];
  const r = d.rule;
  if (!r || r.w !== 1 || r.st !== 'solid') return [`H6 the mast's rule is ${r ? `${r.w}px ${r.st}` : 'missing'}; it is 1px solid --pt-hair`];
  if (r.col !== d.tokens.hair) out.push(`H6 the mast's rule is ${r.col}; it is --pt-hair (${d.tokens.hair})`);
  if (!near(r.x1, d.frame.contentX1) || !near(r.x2, d.frame.contentX2)) out.push(`H6 the mast's rule runs ${f1(r.x1)} to ${f1(r.x2)}; the content box runs ${f1(d.frame.contentX1)} to ${f1(d.frame.contentX2)}`);
  if (!r.bleed) out.push("H6 the mast's rule stops at the column; it runs across the stage (a var(--pt-bleed-bottom) border image)");
  const side = d.lead && d.panel && d.panel.rect.x > d.lead.rect.r;
  if (side) {
    const taller = Math.max(d.lead.rect.b, d.panel.rect.b);
    if (!near(r.y - taller, d.tokens.headRulePad)) out.push(`H6 the mast's rule is ${f1(r.y - taller)}px under the taller of lead and panel; it is --pt-head-rule-pad (${d.tokens.headRulePad}px)`);
  }
  for (const l of r.near ?? []) out.push(`H6 ${l.by} draws a line at y ${f1(l.y)}, within 4px of the mast's rule`);
  return out;
}

/** H7: the band. */
export function judgeBand(d) {
  const out = [];
  if (d.bands !== 1) return [`H7 ${d.bands} bands on the page; a book has one`];
  const b = d.band;
  if (!near(b.rect.h, d.tokens.bandH)) out.push(`H7 the band is ${f1(b.rect.h)}px tall; it is --pt-band-h (${d.tokens.bandH}px)`);
  for (const [edge, s] of [['top', b.top], ['bottom', b.bottom]]) {
    if (s.w !== 1 || s.st !== 'solid' || s.col !== d.tokens.hair) out.push(`H7 the band's ${edge} rule is ${s.w}px ${s.st} ${s.col}; it draws its own 1px --pt-hair rule`);
  }
  if (!near(b.rect.x, d.frame.x1) || !near(b.rect.r, d.frame.x2)) out.push(`H7 the band runs ${f1(b.rect.x)} to ${f1(b.rect.r)}; the ${d.frame.kind}'s inner edges are ${f1(d.frame.x1)} to ${f1(d.frame.x2)}`);
  if (!b.bleed) out.push("H7 the band's rules stop at the column; they run across the stage (a var(--pt-bleed-block) border image)");
  if (b.aboveBottom !== null && !near(b.rect.y - b.aboveBottom, d.tokens.secOver)) out.push(`H7 the band is ${f1(b.rect.y - b.aboveBottom)}px under ${b.above}; it is --pt-sec-over (${d.tokens.secOver}px)`);
  for (const l of b.near) out.push(`H7 ${l.by} draws a line at y ${f1(l.y)}, within 4px of the band's rules`);
  return out;
}

/** H8: the dividers. */
export function judgeDividers(d, { wide }) {
  const out = [];
  const gaps = [];
  d.dividers.forEach((v, i) => {
    let ruleBottom;
    if (v.first) {
      if (v.borderTop.w > 0 || v.bleed) out.push('H8 the first part\'s divider draws a rule; the band\'s bottom rule is its rule');
      if (d.band && !near(v.rect.y, d.band.rect.b)) out.push(`H8 the first divider starts ${f1(v.rect.y - d.band.rect.b)}px from the band's bottom edge; it starts on it`);
      ruleBottom = d.band ? d.band.rect.b : v.rect.y;
    } else {
      if (v.borderTop.w !== 1 || v.borderTop.col !== d.tokens.hair) out.push(`H8 divider ${i + 1} draws ${v.borderTop.w}px ${v.borderTop.col}; it draws a 1px --pt-hair rule`);
      else if (!v.bleed) out.push(`H8 divider ${i + 1}'s rule stops at the column; it runs across the stage (a var(--pt-bleed-top) border image)`);
      ruleBottom = v.rect.y + v.borderTop.w;
    }
    if (!v.note || v.note.spans.length !== 2 || v.note.lines !== 2) out.push(`H8 divider ${i + 1}'s gutter note is ${v.note ? `${v.note.lines} lines` : 'missing'}; it is two lines: Section n, then one fact`);
    else {
      if (!/^Section \d+$/.test(v.note.spans[0])) out.push(`H8 divider ${i + 1}'s gutter note opens "${v.note.spans[0]}"; it opens Section n`);
      if (v.note.col !== d.tokens.titanium) out.push(`H8 divider ${i + 1}'s gutter note is ${v.note.col}; it is titanium`);
    }
    if (v.h2) gaps.push({ i, gap: v.h2.y - ruleBottom });
  });
  const want = wide ? 35.5 : 79;
  for (const g of gaps) {
    if (!near(g.gap, want, 1)) out.push(`H8 divider ${g.i + 1}'s h2 is ${f1(g.gap)}px under its rule; it is ${want}px at ${wide ? 1440 : 390}`);
  }
  return out;
}

/** H9: one standard mast at 1440. */
export const H9_GAP = 193.16;
export function judgeStandard(d) {
  /* the side-by-side mast only: a narrow head (the blog's 720px column) stacks its panel */
  const side = d.lead && d.panel && d.panel.rect.x > d.lead.rect.r;
  if (!side || !d.h1 || !d.rule || d.h1.rect.h > d.h1.lh * 1.5) return [];
  const gap = d.rule.y - d.h1.rect.y;
  return near(gap, H9_GAP) ? [] : [`H9 the mast's rule is ${f1(gap)}px under the title's top; every one-line title's is ${H9_GAP}px (45.76 + 14 + 2 + 105.4 + 26)`];
}

/** Every live rule over one page. */
export function judgeHead(d, { wide, day, record = null }) {
  if (d.headers === 0) return { failures: ['H1 no header.pt-book-head on the page'], waiting: [] };
  const lead = judgeLead(d, { wide, record });
  return {
    failures: [
      ...judgeStructure(d),
      ...judgeTitle(d),
      ...judgeClearance(d),
      ...(record ? [] : lead),
      ...judgePanel(d, { day, wide }),
      ...judgeRule(d),
      ...judgeBand(d),
      ...judgeDividers(d, { wide }),
      ...(wide ? judgeStandard(d) : []),
    ],
    waiting: record ? lead : [],
  };
}

/** The day src/lib/updated.ts records for a route (a /docs/<slug> reads /docs, a /handbook/<slug> reads /handbook). */
export function updatedDay(root, path) {
  const text = readFileSync(join(root, 'src/lib/updated.ts'), 'utf8');
  const key = path.startsWith('/docs/') ? '/docs' : path.startsWith('/handbook/') ? '/handbook' : path;
  const m = new RegExp(`^ {2}'${key.replace(/[/]/g, '\\/')}': \\{ day: '([^']+)'`, 'm').exec(text);
  return m ? m[1] : null;
}

async function runLive(root, argv) {
  const flag = (name) => {
    const i = argv.indexOf(name);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const base = (flag('--base') ?? 'http://localhost:3005').replace(/\/$/, '');
  const report = argv.includes('--report');
  const only = flag('--only');
  const jobs = Number(flag('--jobs') ?? 2);
  let chromium;
  try {
    ({ chromium } = await import('playwright-core'));
  } catch (error) {
    console.error(`lint:heads --live needs playwright-core: ${error}`);
    return 2;
  }
  const browser = await chromium.launch({ executablePath: EXEC, headless: true });
  const failures = [];
  const waiting = [];
  let broken = 0;
  const { routes: all, missing } = await liveRoutes(browser, base, root);
  for (const kind of missing.filter((k) => k !== 'post' && k !== 'archive')) {
    console.error(`lint:heads --live: no first ${kind} was found`);
    broken++;
  }
  const routes = all.map((r) => r.path).filter((p) => LIVE_PATHS.test(p)).filter((p) => !only || p.includes(only));
  const cells = [
    [1440, 900, 'dark'],
    [1440, 900, 'light'],
    [390, 844, 'dark'],
    [390, 844, 'light'],
  ];
  const tasks = routes.flatMap((path) => cells.map(([w, h, theme]) => ({ path, w, h, theme })));
  let next = 0;
  const worker = async () => {
    while (next < tasks.length) {
      const { path, w, h, theme } = tasks[next++];
      const ctx = await browser.newContext({ viewport: { width: w, height: h } });
      await ctx.addInitScript((t) => {
        try {
          localStorage.setItem('gt-theme', t);
        } catch {}
      }, theme);
      const page = await ctx.newPage();
      try {
        const resp = await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded', timeout: 240000 });
        if (!resp || resp.status() >= 400) throw new Error(`HTTP ${resp ? resp.status() : 'none'}`);
        await page.waitForSelector('.pt-book-head', { timeout: 240000 });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(1200);
        /* a deep link may have scrolled the book: read the head from the top */
        await page.evaluate(() => document.querySelector('.pt-book-head')?.closest('.pt-scroll, .sheet-flow')?.scrollTo(0, 0));
        await page.waitForTimeout(300);
        const data = await page.evaluate(collectHead);
        const wide = w >= 900;
        const record = /^\/motion\/[\w-]+$/.test(path) ? path : null;
        const { failures: f, waiting: wt } = judgeHead(data, { wide, day: updatedDay(root, path), record });
        const where = `${path} ${w} ${theme}`;
        for (const line of f) failures.push(`${where} ${line}`);
        for (const line of wt) waiting.push(`${where} ${line}`);
      } catch (error) {
        broken++;
        console.error(`lint:heads --live: ${path} at ${w} ${theme}: ${error instanceof Error ? error.message : error}`);
      } finally {
        await ctx.close();
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(jobs, tasks.length) }, worker));
  await browser.close();

  for (const w of [...new Set(waiting)]) console.log(`waiting ${w}`);
  const unique = [...new Set(failures)];
  if (unique.length) {
    console.error(`lint:heads --live found ${unique.length} problem${unique.length === 1 ? '' : 's'} on ${base} (DESIGN.md section 4, The book page):`);
    for (const f of unique) console.error(`  ${f}`);
  } else if (!broken) {
    console.log(`lint:heads --live clean: ${routes.length} routes x ${cells.length} cells on ${base}; the mast rule sits ${H9_GAP}px under every one-line title at 1440`);
  }
  if (broken) {
    console.error(`lint:heads --live could not read ${broken} of ${tasks.length} cells; nothing is judged clean until every cell loads`);
    return 2;
  }
  return unique.length && !report ? 1 : 0;
}

function runStatic(root, argv) {
  const report = argv.includes('--report');
  const { problems, heads, aliases } = lintHeads(root);
  if (problems.length) {
    console.error(`lint:heads found ${problems.length} problem${problems.length === 1 ? '' : 's'} (DESIGN.md section 4, The book page):`);
    for (const p of problems) console.error(`  ${p}`);
    return report ? 0 : 1;
  }
  console.log(`lint:heads clean: ${heads} book heads, ${aliases.length} route aliases of the shared book classes, none restyled`);
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
    console.error(`lint:heads could not run: ${error instanceof Error ? error.stack : error}`);
    process.exit(2);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
