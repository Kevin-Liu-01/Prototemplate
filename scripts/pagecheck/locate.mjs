// Where a reading points in the source: the stylesheet line that declares
// an element's class, the component line that renders its text or id, or
// the line that builds or names a requested path. The report's "where"
// column is filled from here, so a defect row names a file and a line
// rather than a folder.
//
// The index is built once per report from src/, deck/parts and content/:
// every class a CSS selector line declares (file and line), every class a
// className attribute carries, and the files' lines for text searches. A
// hit is ranked by tier: the page's own source folders first (pages.mjs
// `source`, in the order given), then src/components, src/lib, then the
// rest of src. The archived directions under src/app/d are left out
// unless a page lists one: their sheets declare the same class names
// under their own root classes, so a hit there would point at a rule the
// live page never gets. Within a tier the class with the fewest
// declarations is chosen (.pt-list over .pt-ib on a toolbar button), and
// a code line is ranked before a comment line.
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const SOURCE_DIRS = ['src', 'deck/parts', 'content'];
const CODE_EXT = /\.(tsx|ts|mdx|md|html)$/;
const CSS_EXT = /\.css$/;
const SKIP_DIRS = new Set(['node_modules', '.next']);
const ARCHIVE_PREFIX = 'src/app/d/';

/** A class token as a selector or a className carries it (Tailwind's bracket forms never match, by design). */
const CLASS_TOKEN = /^-?[_a-zA-Z][\w-]*$/;
const CLASS_IN_SELECTOR = /\.(-?[_a-zA-Z][\w-]*)/g;
const QUOTED = /(['"`])((?:\\.|(?!\1).)*)\1/g;

/** The shortest text the locator searches for; shorter strings hit everywhere. */
const MIN_TEXT = 4;
/** Below this length a text must sit at a JSX or string boundary to count. */
const BOUNDARY_UNDER = 12;
/** A class that names a state of the element (is-on, has-ind) and so points at no stylesheet of its own. */
const STATE_CLASS = /^(is|has)-/;

let index = null;

function walk(dir, out) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (CODE_EXT.test(e.name) || CSS_EXT.test(e.name)) out.push(p);
  }
}

const isComment = (line) => /^\s*(\*|\/\/|\/\*|<!--)/.test(line);

/**
 * The classes a stylesheet declares, by the selector lines: a line that
 * opens a block or ends a selector list with a comma, outside comments
 * and at-rules. Property lines never open a block, so the test is enough.
 */
function indexCss(file, lines, map) {
  let inComment = false;
  lines.forEach((raw, i) => {
    let line = raw;
    if (inComment) {
      const end = line.indexOf('*/');
      if (end < 0) return;
      line = line.slice(end + 2);
      inComment = false;
    }
    line = line.replace(/\/\*.*?\*\//g, '');
    const open = line.indexOf('/*');
    if (open >= 0) {
      line = line.slice(0, open);
      inComment = true;
    }
    const t = line.trim();
    if (!t || t.startsWith('@')) return;
    const opens = t.includes('{');
    const continues = t.endsWith(',') && !t.includes(';');
    if (!opens && !continues) return;
    /* a class inside :not() is the rule's exclusion; the rule does not declare it */
    const selector = (opens ? t.slice(0, t.indexOf('{')) : t).replace(/:not\([^)]*\)/g, '');
    for (const part of selector.split(',')) {
      /* a rule on the element itself (.a.b:hover) is ranked before one reaching it through a combinator (.x > .a) */
      const own = !/[\s>+~]/.test(part.trim());
      for (const m of part.matchAll(CLASS_IN_SELECTOR)) {
        const list = map.get(m[1]) ?? [];
        list.push({ file, line: i + 1, own });
        map.set(m[1], list);
      }
    }
  });
}

/** The classes a component line hands to className or class, by the quoted strings on that line. */
function indexClassNames(file, lines, map) {
  lines.forEach((line, i) => {
    if (!/className|class=/.test(line)) return;
    for (const q of line.matchAll(QUOTED)) {
      for (const token of q[2].split(/\s+/)) {
        if (!CLASS_TOKEN.test(token)) continue;
        const list = map.get(token) ?? [];
        list.push({ file, line: i + 1 });
        map.set(token, list);
      }
    }
  });
}

/** Builds the index once; later calls return it. */
export function sourceIndex(root) {
  if (index) return index;
  const files = [];
  for (const d of SOURCE_DIRS) walk(join(root, d), files);
  const cssRules = new Map();
  const classUses = new Map();
  const texts = [];
  for (const abs of files) {
    const file = relative(root, abs);
    const lines = readFileSync(abs, 'utf8').split('\n');
    texts.push({ file, lines });
    if (CSS_EXT.test(file)) indexCss(file, lines, cssRules);
    else indexClassNames(file, lines, classUses);
  }
  index = { cssRules, classUses, texts };
  return index;
}

/**
 * The tier of a file for a page: its place in the page's source list
 * (a folder, a file, or `folder/*` for the folder's own files only), then
 * the shared components, the libraries, the rest of src and the content;
 * -1 leaves the file out (an archived direction the page does not list).
 */
function tierOf(file, sources) {
  for (let i = 0; i < sources.length; i++) {
    const s = sources[i];
    if (s.endsWith('/*')) {
      const dir = s.slice(0, -2);
      if (file.startsWith(dir + '/') && !file.slice(dir.length + 1).includes('/')) return i;
    } else if (file === s || file.startsWith(s + '/')) return i;
  }
  const n = sources.length;
  if (file.startsWith('src/components/')) return n;
  if (file.startsWith('src/lib/')) return n + 1;
  if (file.startsWith(ARCHIVE_PREFIX)) return -1;
  if (file.startsWith('src/')) return n + 2;
  return n + 3;
}

const ref = (h) => `${h.file}:${h.line}`;

/** The hits of one class in the allowed tiers, best first: the lowest tier, a rule on the element itself, the earliest line. */
function rankedHits(map, cls, sources) {
  return (map.get(cls) ?? [])
    .map((h) => ({ ...h, tier: tierOf(h.file, sources) }))
    .filter((h) => h.tier >= 0)
    .sort((a, b) => a.tier - b.tier || Number(Boolean(b.own)) - Number(Boolean(a.own)) || a.file.localeCompare(b.file) || a.line - b.line);
}

/** Splits the probe's description `tag#id.a.b[testid]` into its parts. */
export function parseDesc(desc) {
  const m = /^([a-z0-9-]*)(#[^.[]+)?((?:\.[^.[#]+)*)(\[[^\]]*\])?$/i.exec(desc ?? '');
  if (!m) return { tag: '', id: '', classes: [], testid: '' };
  return {
    tag: m[1] ?? '',
    id: m[2] ? m[2].slice(1) : '',
    classes: m[3] ? m[3].split('.').filter(Boolean) : [],
    testid: m[4] ? m[4].slice(1, -1) : '',
  };
}

/**
 * The best stylesheet line for an element's classes: the lowest tier,
 * then a class with a rule on the element itself, then the class with
 * the fewest declarations in that tier, then the later class in the
 * element's list (the more specific one).
 */
function locateClasses(classes, sources, root) {
  const idx = sourceIndex(root);
  /* a state modifier (is-on, has-ind) names a condition of the element; it is tried only when no other class is declared */
  const identity = classes.filter((c) => !STATE_CLASS.test(c));
  const tried = identity.length ? identity : classes;
  let best = null;
  tried.forEach((cls, order) => {
    const hits = rankedHits(idx.cssRules, cls, sources);
    if (hits.length === 0) return;
    const tier = hits[0].tier;
    const own = Boolean(hits[0].own);
    const count = hits.filter((h) => h.tier === tier).length;
    const better =
      !best ||
      tier < best.tier ||
      (tier === best.tier && (own !== best.own ? own : count < best.count || (count === best.count && order > best.order)));
    if (better) best = { cls, hit: hits[0], tier, own, count, order };
  });
  return best;
}

/**
 * The lines where a text appears, best first: the lowest tier, then a
 * line that renders the text (JSX content, an aria-label, title,
 * placeholder or alt, a markdown link) before one that only holds it in
 * a string, then a code line before a comment. `plain` skips the
 * boundary rule short texts otherwise need.
 */
function textHits(text, sources, root, { plain = false, limit = 1 } = {}) {
  const idx = sourceIndex(root);
  const needBoundary = !plain && text.length < BOUNDARY_UNDER;
  const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const boundary = needBoundary ? new RegExp(`(^|[>'"\`\\s[(])${escaped}(?=$|[<'"\`\\s.,\\])])`) : null;
  const rendered = new RegExp(`>\\s*${escaped}|${escaped}\\s*<|(aria-label|title|placeholder|alt|label)=\\{?['"\`]${escaped}|\\[${escaped}\\]\\(`);
  const hits = [];
  for (const { file, lines } of idx.texts) {
    const tier = tierOf(file, sources);
    if (tier < 0) continue;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.includes(text)) continue;
      if (boundary && !boundary.test(line)) continue;
      hits.push({ file, line: i + 1, tier, rendered: rendered.test(line), comment: isComment(line) });
    }
  }
  hits.sort(
    (a, b) =>
      a.tier - b.tier || Number(b.rendered) - Number(a.rendered) || Number(a.comment) - Number(b.comment) || a.file.localeCompare(b.file) || a.line - b.line
  );
  return hits.slice(0, limit);
}

/**
 * The texts tried for an element, longest first: the text as read, the
 * text without its leading punctuation (a code sample's brace), the text
 * without the number the sidebar rows append (`Readme01`, `Engineering001
 * to 209`) or anything from its first digit on (`The register6 rules`),
 * the text cut at its last space while ten characters remain, and last
 * its longest token of eight characters or more (`hero.title`).
 */
function textCandidates(text) {
  const out = [];
  const push = (t) => {
    const s = t.replace(/\s+/g, ' ').trim();
    if (s.length >= MIN_TEXT && /[a-zA-Z]/.test(s) && !out.includes(s)) out.push(s);
  };
  if (!text) return out;
  push(text);
  push(text.replace(/^[^a-zA-Z0-9]+/, ''));
  push(text.replace(/\d{2,3}( to \d{2,3})?$/, ''));
  push(text.replace(/\d.*$/, ''));
  let cut = text;
  while (cut.includes(' ') && cut.length > 10) {
    cut = cut.slice(0, cut.lastIndexOf(' '));
    if (cut.length >= 10) push(cut);
  }
  const token = text
    .split(/[^\w.-]+/)
    .filter((t) => t.length >= 8 && /[a-zA-Z]/.test(t))
    .sort((a, b) => b.length - a.length)[0];
  if (token) push(token);
  return out;
}

/** The best `file:line` declaring one class for a page, or '' when none is found. */
export function locateClass(cls, sources, root) {
  const best = locateClasses([cls], sources, root);
  return best ? ref(best.hit) : '';
}

/** The best `file:line` holding a text for a page (code lines before comments), or ''. */
export function locateText(text, sources, root) {
  const hit = textHits(text, sources, root, { plain: true })[0];
  return hit ? ref(hit) : '';
}

/**
 * Where an element the probe described lives: `{ where, via }` with
 * `where` a `file:line` and `via` what found it, or null. The order: a
 * class of its own in a stylesheet, its id, a line that renders its text,
 * the nearest classed ancestor's rule (`within .class`, for a bare link
 * in a styled row), a line that only holds its text in a string, and
 * last a className line carrying one of its classes.
 */
export function locateElement({ el, text, within }, sources, root) {
  const { id, classes } = parseDesc(el);
  const own = locateClasses(classes, sources, root);
  if (own) return { where: ref(own.hit), via: `.${own.cls}` };
  if (id) {
    const hit = textHits(`id='${id}'`, sources, root, { plain: true })[0] ?? textHits(`id="${id}"`, sources, root, { plain: true })[0];
    if (hit) return { where: ref(hit), via: `#${id}` };
  }
  let held = null;
  for (const candidate of textCandidates(text)) {
    const hit = textHits(candidate, sources, root)[0];
    if (!hit) continue;
    if (hit.rendered) return { where: ref(hit), via: `text "${candidate}"` };
    held ??= { where: ref(hit), via: `text "${candidate}"` };
  }
  if (within) {
    const parent = locateClasses(parseDesc(within).classes, sources, root);
    if (parent) return { where: ref(parent.hit), via: `within .${parent.cls}` };
  }
  if (held) return held;
  const idx = sourceIndex(root);
  for (const cls of [...classes].reverse()) {
    const uses = rankedHits(idx.classUses, cls, sources);
    if (uses.length) return { where: ref(uses[0]), via: `className ${cls}` };
  }
  return null;
}

/**
 * Where a requested path comes from: the line naming the path itself,
 * else the line naming its stem (the file name without extension or
 * theme suffix) and the lines building its folder. Up to three
 * `file:line` references with what each one holds.
 */
export function locateAsset(path, sources, root) {
  const refs = [];
  const clean = path.replace(/\?.*$/, '');
  /* up to two code lines naming the path; a comment line only when no code line does */
  const codeFirst = (hits) => hits.filter((h, _i, all) => !h.comment || !all.some((x) => !x.comment)).slice(0, 2);
  const exacts = codeFirst(textHits(clean, sources, root, { plain: true, limit: 4 }));
  if (exacts.length === 0) exacts.push(...codeFirst(textHits(clean.replace(/^\//, ''), sources, root, { plain: true, limit: 4 })));
  const exact = exacts[0];
  for (const h of exacts) refs.push(`${ref(h)} names the path`);
  const base = clean
    .split('/')
    .pop()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/-(dark|light)$/, '');
  if (!exact && base.length >= 5) {
    const stem = textHits(base, sources, root, { plain: true })[0];
    if (stem) refs.push(`${ref(stem)} names ${base}`);
  }
  const dir = clean.replace(/\/[^/]*$/, '').replace(/^\//, '');
  if (!exact && dir.length >= MIN_TEXT) {
    for (const h of textHits(dir, sources, root, { plain: true, limit: 3 })) {
      if (!h.comment) refs.push(`${ref(h)} builds the ${dir} path`);
    }
  }
  return refs.slice(0, 3);
}
