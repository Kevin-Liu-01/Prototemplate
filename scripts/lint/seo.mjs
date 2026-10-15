#!/usr/bin/env node
/* oxlint-disable no-console -- a lint reporting to stdout. */
/**
 * Holds every route's head to the SEO system: each route gets its title,
 * description, canonical, robots, card and JSON-LD from one call to
 * seoRoute() (src/lib/seo/route.ts), under the policy in
 * src/lib/seo/policy.ts. The law and its sources: the SEO plan of
 * 2026-10-14 (sections 2.1 to 2.7) and Kevin's decisions of that day
 * (www.prototemplate.com canonical, every /d/ study noindex, follow, the
 * mirror canonical on generaltranslation.com, the generated card); the
 * www ruling in docs/handbook/decisions.md (2026-10-10); gt-cloud's
 * finalTitle and createMetadata (a partial openGraph replaces the parent's
 * whole); and gt-voice (no em dash in rendered text, a tab title is
 * rendered text).
 *
 * Usage:
 *   node scripts/lint/seo.mjs [--report] [--update-baseline]      (pnpm lint:seo)
 *   node scripts/lint/seo.mjs --built [--report]                   (in pnpm build, after next build)
 *   node scripts/lint/seo.mjs --live [--base <url>] [--report]     (pnpm lint:seo:live; PT_BASE)
 *
 * Static mode reads src/app and prints `file:line rule message`:
 *
 *   S1 adopt    every page.tsx, every not-found.tsx and every layout that
 *               exports metadata gets it from seoRoute: `metadata =
 *               <name>.metadata`, or a generateMetadata that returns
 *               seoRoute(...).metadata. The root layout and
 *               src/app/d/layout.tsx set the defaults and are exempt.
 *   S2 path     a static route's path literal equals the route its file
 *               gives; a dynamic route's path is a template literal that
 *               starts with the static prefix (a copied page that keeps
 *               the old canonical fails here)
 *   S3 copy     a title or description literal passed to seoRoute holds
 *               no em dash and no exclamation mark, a title ends with no
 *               period, a description runs 50 to 160 characters
 *   S4 root     the root layout sets metadataBase from SITE_URL and sets
 *               no alternates and no openGraph.url (they would be
 *               inherited by every route that sets none)
 *   S5 hosts    no file under src/ or scripts/ names an alias host, but
 *               the files in HOST_EXEMPT, each with its reason
 *   S6 fields   no page.tsx writes icons, openGraph or twitter in its
 *               metadata; seoRoute writes all three
 *   R1 ratchet  scripts/lint/seo.baseline.json lists the route files not
 *               yet adopted. A listed file is excused S1 and S6; a file
 *               outside the list that fails them fails the run; a listed
 *               file that passes, or is gone, fails the run until
 *               --update-baseline drops it. --update-baseline writes the
 *               list and refuses to add a file to an existing one: the
 *               list only shrinks.
 *
 * Built mode reads the prerendered pages under .next/server/app (and the
 * deck's own document, public/brand-deck.html, which /deck rewrites to):
 *
 *   B1 head     one <title>, one description, one absolute https
 *               canonical, og:title, og:description, og:url, og:image with
 *               og:image:width and og:image:height, twitter:card; the
 *               description runs 50 to 160 characters, and the title and
 *               description hold no em dash
 *   B2 host     the canonical is the page's own URL on www, or on
 *               generaltranslation.com where the policy maps it there;
 *               og:url equals the canonical
 *   B3 robots   robots matches policyFor(path); a page still in the
 *               baseline matches its layout's index state instead (noindex
 *               under /d/, index elsewhere), whatever its follow value
 *   B4 json-ld  every application/ld+json block parses and has @context
 *   B5 sitemap  sitemap.xml lists only www URLs the policy lists, each
 *               prerendered, each index with a self canonical (adopted
 *               pages), and each URL src/lib/updated.ts dates carries that
 *               date as lastmod; an undated URL prints a note
 *   B6 robots   robots.txt names the sitemap
 *   B7 unique   indexable pages have unique titles and descriptions
 *
 * A page whose route file is in the baseline skips B1, B2 and B7 (it has
 * no canonical or card of its own yet). Not-found pages are skipped.
 *
 * Live mode fetches a running server (PT_BASE or --base; a production
 * build under next start, or www after a deploy, never a dev server,
 * which would compile every route on its first request):
 *
 *   L1 pages    every sitemap URL and the noindex sample answer 200 with no
 *               redirect and pass B1 to B4
 *   L2 cards    every og:image answers 200 with an image type and more
 *               than 5 KB, and its pixel size (read from the file header)
 *               equals the declared width and height at 1.91 to 1
 *   L3 twins    every text/markdown alternate answers 200 text/markdown
 *               with a Link canonical equal to the page's canonical
 *   L4 agents   /llms.txt, /llms-full.txt and /AGENTS.md answer 200, and
 *               llms.txt links every docs and handbook page
 *   L5 links    no internal link on a sitemap page answers a redirect or a
 *               404
 *
 * Exit 0 on a pass, 1 on findings, 2 when the lint could not judge (no
 * build, no server). --report prints without failing.
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { ROOT } from '../lib/root.mjs';
import { helpIfAsked } from '../lib/help.mjs';

// The repository's package.json names no module type, so Node's type
// stripping (on by default in Node 24, the version engines pins) warns
// MODULE_TYPELESS_PACKAGE_JSON each time a src/ TypeScript module loads.
// This drops that one warning and passes every other warning on to the
// listeners Node installed. A module loaded this way imports nothing at
// runtime (import type only), as src/lib/seo/policy.ts does.
const warningListeners = process.listeners('warning');
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning?.code === 'MODULE_TYPELESS_PACKAGE_JSON') return;
  for (const listener of warningListeners) listener(warning);
});

/** The TypeScript module at `url` (a file URL), loaded with the typeless-package warning dropped. */
export function importTs(url) {
  return import(url.href);
}

const { ALIAS_HOSTS, SITE_URL, normalizePath, policyFor, selfUrl } = await importTs(new URL('../../src/lib/seo/policy.ts', import.meta.url));
const { UPDATED } = await importTs(new URL('../../src/lib/updated.ts', import.meta.url));

helpIfAsked(import.meta.url);

export const BASELINE = 'scripts/lint/seo.baseline.json';

/** Files that set the metadata defaults rather than a route's own. */
export const DEFAULT_LAYOUTS = ['src/app/layout.tsx', 'src/app/d/layout.tsx'];

/** The files that may spell an alias host, each with its reason. */
export const HOST_EXEMPT = {
  'src/lib/seo/policy.ts': 'the alias list itself (ALIAS_HOSTS)',
  'src/lib/archive.ts': 'the capture record: the address each archived capture was taken from',
};

/** Routes served from a file outside .next/server/app. */
export const REWRITES = { '/deck': 'public/brand-deck.html' };

/** The noindex sample live mode reads beside the sitemap: an exploration, a site concept subpage, a mirror page, a dashboard state. */
export const NOINDEX_SAMPLE = ['/d/toolchain', '/d/singularity-dossier/careers', '/d/production/pricing', '/d/production/signin'];

const EM_DASH = '\u2014';
const DESCRIPTION_MIN = 50;
const DESCRIPTION_MAX = 160;

/* ------------------------------------------------------------------ */
/* source scanning                                                     */
/* ------------------------------------------------------------------ */

function skipString(text, i) {
  const quote = text[i];
  let j = i + 1;
  while (j < text.length) {
    const c = text[j];
    if (c === '\\') j += 2;
    else if (c === quote || c === '\n') return j + 1;
    else j += 1;
  }
  return j;
}

function skipTemplate(text, i) {
  let j = i + 1;
  while (j < text.length) {
    const c = text[j];
    if (c === '\\') j += 2;
    else if (c === '`') return j + 1;
    else if (c === '$' && text[j + 1] === '{') {
      const close = matchClose(text, j + 1);
      if (close < 0) return text.length;
      j = close + 1;
    } else j += 1;
  }
  return j;
}

const PAIRS = { '(': ')', '{': '}', '[': ']' };

/** The index of the bracket that closes the one at `open`, skipping strings, templates and comments; -1 when unbalanced. */
export function matchClose(text, open) {
  const stack = [PAIRS[text[open]]];
  let i = open + 1;
  while (i < text.length) {
    const c = text[i];
    if (c === '/' && text[i + 1] === '/') {
      const end = text.indexOf('\n', i);
      if (end < 0) return -1;
      i = end;
    } else if (c === '/' && text[i + 1] === '*') {
      const end = text.indexOf('*/', i + 2);
      if (end < 0) return -1;
      i = end + 2;
    } else if (c === "'" || c === '"') i = skipString(text, i);
    else if (c === '`') i = skipTemplate(text, i);
    else if (c in PAIRS) {
      stack.push(PAIRS[c]);
      i += 1;
    } else if (c === ')' || c === '}' || c === ']') {
      if (stack.pop() !== c) return -1;
      if (stack.length === 0) return i;
      i += 1;
    } else i += 1;
  }
  return -1;
}

/** The top-level properties of an object literal (braces included): key to value text. Spreads are kept under '...'. */
export function topLevelProps(obj) {
  const props = new Map();
  let i = 1;
  const end = obj.length - 1;
  while (i < end) {
    while (i < end && /[\s,]/.test(obj[i])) i += 1;
    if (obj.startsWith('//', i)) {
      i = obj.indexOf('\n', i) + 1 || end;
      continue;
    }
    if (obj.startsWith('/*', i)) {
      i = obj.indexOf('*/', i) + 2 || end;
      continue;
    }
    if (i >= end) break;
    let key;
    if (obj.startsWith('...', i)) {
      key = '...';
      i += 3;
    } else if (obj[i] === "'" || obj[i] === '"') {
      const close = skipString(obj, i);
      key = obj.slice(i + 1, close - 1);
      i = close;
    } else {
      const m = /^[A-Za-z_$][\w$]*/.exec(obj.slice(i));
      if (!m) {
        i += 1;
        continue;
      }
      key = m[0];
      i += key.length;
    }
    while (i < end && /\s/.test(obj[i])) i += 1;
    if (key !== '...' && obj[i] !== ':') {
      /* shorthand property, or a method */
      if (obj[i] === '(') {
        const close = matchClose(obj, i);
        i = close < 0 ? end : close + 1;
        while (i < end && /\s/.test(obj[i])) i += 1;
        if (obj[i] === '{') {
          const body = matchClose(obj, i);
          i = body < 0 ? end : body + 1;
        }
        continue;
      }
      props.set(key, key);
      continue;
    }
    if (key !== '...') i += 1;
    const start = i;
    while (i < end && obj[i] !== ',') {
      const c = obj[i];
      if (c in PAIRS) {
        const close = matchClose(obj, i);
        i = close < 0 ? end : close + 1;
      } else if (c === "'" || c === '"') i = skipString(obj, i);
      else if (c === '`') i = skipTemplate(obj, i);
      else i += 1;
    }
    const value = obj.slice(start, i).trim();
    props.set(key, props.has(key) && key === '...' ? `${props.get(key)}, ${value}` : value);
  }
  return props;
}

const ESCAPES = { n: '\n', t: '\t', r: '\r', '\\': '\\', "'": "'", '"': '"', '`': '`' };

/** The string a plain literal holds ('a', "a", or `a` with no substitution), else null. */
export function literalValue(value) {
  const text = value.trim().replace(/\s+as\s+const$/, '');
  const m = /^(['"`])([\s\S]*)\1$/.exec(text);
  if (!m) return null;
  if (m[1] === '`' && m[2].includes('${')) return null;
  if (m[2].replace(/\\./g, '').includes(m[1])) return null;
  return m[2].replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16))).replace(/\\(.)/g, (_, c) => ESCAPES[c] ?? c);
}

/** The static head of a template literal (the text before its first substitution), else null. */
export function templateHead(value) {
  const m = /^`([^`]*)`$/.exec(value.trim());
  if (!m) return null;
  const at = m[1].indexOf('${');
  return at < 0 ? m[1] : m[1].slice(0, at);
}

/** The initializer text of `const <name> = ...` in a file: an object, a string or a template; null when absent. */
export function resolveConst(text, name) {
  const m = new RegExp(`(?:const|let)\\s+${name.replace(/[$]/g, '\\$')}\\s*(?::[^=]+)?=\\s*`).exec(text);
  if (!m) return null;
  const at = m.index + m[0].length;
  const c = text[at];
  if (c === '{') {
    const close = matchClose(text, at);
    return close < 0 ? null : text.slice(at, close + 1);
  }
  if (c === "'" || c === '"') return text.slice(at, skipString(text, at));
  if (c === '`') return text.slice(at, skipTemplate(text, at));
  return null;
}

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

/** The route a file under src/app serves: route groups and parallel slots removed; the home page is '/'. */
export function routeOf(file) {
  const parts = file.replace(/^src\/app\/?/, '').split('/').slice(0, -1);
  const segments = parts.filter((p) => p && !/^\(.*\)$/.test(p) && !p.startsWith('@'));
  return `/${segments.join('/')}`;
}

/** The part of a route before its first dynamic segment. */
export function staticPrefix(route) {
  const segments = route.split('/');
  const at = segments.findIndex((s) => s.startsWith('['));
  return at < 0 ? route : segments.slice(0, at).join('/') || '/';
}

/** The metadata a route file exports: { form, text, index } with form 'const' or 'function', or null. */
export function metadataExport(text) {
  const c = /export\s+const\s+metadata\b[^=]*=\s*/.exec(text);
  if (c) {
    const at = c.index + c[0].length;
    if (text[at] === '{') {
      const close = matchClose(text, at);
      return { form: 'const', text: text.slice(at, close + 1), index: c.index };
    }
    const end = text.indexOf('\n', at);
    return { form: 'const', text: text.slice(at, end < 0 ? text.length : end).replace(/;\s*$/, ''), index: c.index };
  }
  const f = /export\s+(?:async\s+)?function\s+generateMetadata\s*\(|export\s+const\s+generateMetadata\s*=\s*(?:async\s*)?\(/.exec(text);
  if (f) {
    const paren = f.index + f[0].length - 1;
    const close = matchClose(text, paren);
    const brace = text.indexOf('{', close);
    const body = brace < 0 ? -1 : matchClose(text, brace);
    return { form: 'function', text: body < 0 ? '' : text.slice(brace, body + 1), index: f.index };
  }
  return null;
}

/** The argument objects of every seoRoute(...) call in a file: { obj, index }, resolving an identifier argument to its const. */
export function seoRouteCalls(text) {
  const calls = [];
  for (const m of text.matchAll(/\bseoRoute\(/g)) {
    const open = m.index + m[0].length - 1;
    const close = matchClose(text, open);
    if (close < 0) continue;
    const arg = text.slice(open + 1, close).trim();
    if (arg.startsWith('{')) calls.push({ obj: arg, index: m.index });
    else if (/^[A-Za-z_$][\w$]*$/.test(arg)) {
      const resolved = resolveConst(text, arg);
      calls.push({ obj: resolved && resolved.startsWith('{') ? resolved : null, index: m.index, name: arg });
    } else calls.push({ obj: null, index: m.index });
  }
  return calls;
}

/** Whether a metadata export comes from seoRoute. */
export function adoptsSeoRoute(text, exported) {
  if (!exported || !/\bseoRoute\(/.test(text)) return false;
  if (exported.form === 'const') {
    const value = exported.text.trim();
    const m = /^([A-Za-z_$][\w$]*)\.metadata$/.exec(value);
    if (m) return new RegExp(`\\b${m[1].replace(/[$]/g, '\\$')}\\s*(?::[^=]+)?=\\s*seoRoute\\(`).test(text);
    return /^seoRoute\([\s\S]*\)\.metadata$/.test(value);
  }
  return /\.metadata\b/.test(exported.text) && !/\breturn\s*\{/.test(exported.text);
}

/* ------------------------------------------------------------------ */
/* static rules                                                        */
/* ------------------------------------------------------------------ */

const finding = (file, line, rule, message) => ({ file, line, rule, message });

/** S1, S2, S3 and S6 over one route file (page.tsx, not-found.tsx or a layout). */
export function lintRouteFile(file, text) {
  const out = [];
  const base = file.split('/').pop();
  const isPage = base === 'page.tsx' || base === 'page.ts';
  const isNotFound = base === 'not-found.tsx';
  const exported = metadataExport(text);

  if (DEFAULT_LAYOUTS.includes(file)) return out;
  if (!exported) {
    if (isPage || isNotFound) out.push(finding(file, 1, 'S1', 'exports no metadata: export `const route = seoRoute({...})` and `export const metadata = route.metadata` (src/lib/seo/route.ts)'));
    return out;
  }
  const line = lineOf(text, exported.index);
  if (!adoptsSeoRoute(text, exported)) {
    out.push(finding(file, line, 'S1', 'metadata does not come from seoRoute: write `export const metadata = route.metadata` with `const route = seoRoute({...})`, or return seoRoute(...).metadata from generateMetadata'));
  }
  if (isPage) {
    const keys = exported.form === 'const' && exported.text.startsWith('{') ? [...topLevelProps(exported.text).keys()] : [...exported.text.matchAll(/\b(icons|openGraph|twitter)\s*:/g)].map((m) => m[1]);
    for (const key of ['icons', 'openGraph', 'twitter']) {
      if (keys.includes(key)) out.push(finding(file, line, 'S6', `metadata writes ${key} directly; seoRoute writes the icon, the Open Graph card and the X card for every route`));
    }
  }

  const route = routeOf(file);
  const dynamic = route.includes('[') || isNotFound;
  const prefix = isNotFound ? route : staticPrefix(route);
  for (const call of seoRouteCalls(text)) {
    const callLine = lineOf(text, call.index);
    if (!call.obj) {
      out.push(finding(file, callLine, 'S2', 'pass seoRoute an object literal, or a const object in this file, so its path can be checked'));
      continue;
    }
    const props = topLevelProps(call.obj);
    let path = props.get('path');
    if (path && /^[A-Za-z_$][\w$]*$/.test(path)) path = resolveConst(text, path) ?? path;
    const literal = path === undefined ? null : literalValue(path);
    const head = path === undefined ? null : templateHead(path);
    if (path === undefined) {
      out.push(finding(file, callLine, 'S2', 'seoRoute has no path'));
    } else if (!dynamic) {
      if (literal === null) out.push(finding(file, callLine, 'S2', `a static route's path is a string literal: '${route}'`));
      else if (normalizePath(literal) !== route) out.push(finding(file, callLine, 'S2', `path '${literal}' is not this file's route '${route}' (a copied page keeps the old canonical)`));
    } else {
      const start = literal ?? head;
      const boundary = prefix === '/' ? '/' : `${prefix}/`;
      if (start === null) out.push(finding(file, callLine, 'S2', `a dynamic route's path is a template literal starting '${boundary}'`));
      else if (!(start === prefix || start.startsWith(boundary))) out.push(finding(file, callLine, 'S2', `path '${start}...' does not start with this route's prefix '${prefix}'`));
    }

    const title = props.has('title') ? literalValue(props.get('title')) : null;
    const description = props.has('description') ? literalValue(props.get('description')) : null;
    for (const [name, value] of [['title', title], ['description', description]]) {
      if (value === null) continue;
      if (value.includes(EM_DASH)) out.push(finding(file, callLine, 'S3', `the ${name} holds an em dash; write a comma, a colon or two sentences`));
      if (value.includes('!')) out.push(finding(file, callLine, 'S3', `the ${name} holds an exclamation mark`));
    }
    if (title !== null && /\.\s*$/.test(title)) out.push(finding(file, callLine, 'S3', 'the title ends with a period'));
    if (description !== null && (description.length < DESCRIPTION_MIN || description.length > DESCRIPTION_MAX)) {
      out.push(finding(file, callLine, 'S3', `the description runs ${description.length} characters; write ${DESCRIPTION_MIN} to ${DESCRIPTION_MAX}, which a search snippet shows whole`));
    }
  }
  return out;
}

/** S4 over the root layout. */
export function lintRootLayout(text, file = 'src/app/layout.tsx') {
  const out = [];
  const exported = metadataExport(text);
  if (!exported || exported.form !== 'const' || !exported.text.startsWith('{')) {
    return [finding(file, 1, 'S4', 'the root layout exports no metadata object')];
  }
  const line = lineOf(text, exported.index);
  const props = topLevelProps(exported.text);
  if ((props.get('metadataBase') ?? '').replace(/\s+/g, '') !== 'newURL(SITE_URL)' || !/import\s*\{[^}]*\bSITE_URL\b[^}]*\}\s*from\s*'@\/lib\/seo\/(?:policy|site)'/.test(text)) {
    out.push(finding(file, line, 'S4', "metadataBase is new URL(SITE_URL), with SITE_URL imported from '@/lib/seo/policy' or '@/lib/seo/site'"));
  }
  if (props.has('alternates')) out.push(finding(file, line, 'S4', 'the root sets alternates, which every route that sets none inherits: its canonical would name the home page as every page\'s original'));
  const og = props.get('openGraph');
  if (og && og.startsWith('{') && topLevelProps(og).has('url')) out.push(finding(file, line, 'S4', 'the root sets openGraph.url, which every route that sets no card inherits'));
  return out;
}

/** S5 over one file's text. */
export function lintAliasHosts(file, text, hosts = ALIAS_HOSTS) {
  if (Object.hasOwn(HOST_EXEMPT, file)) return [];
  const out = [];
  const lines = text.split('\n');
  lines.forEach((line, index) => {
    for (const host of hosts) {
      if (line.includes(host)) out.push(finding(file, index + 1, 'S5', `names the alias host ${host}; the canonical host is ${new URL(SITE_URL).host} (SITE_URL in src/lib/seo/policy.ts)`));
    }
  });
  return out;
}

const SKIP_DIRS = new Set(['node_modules', '.next', '.git', '.source']);
const TEXT_EXT = /\.(?:[cm]?[jt]sx?|json|css|md|mdx|py|sh|html|txt|ya?ml)$/;

function walk(dir, root, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) walk(abs, root, out);
    else out.push(relative(root, abs).split('\\').join('/'));
  }
  return out;
}

/** The route files the static rules read. */
export function routeFiles(root) {
  return walk(join(root, 'src/app'), root).filter((file) => /\/(?:page\.tsx?|not-found\.tsx|layout\.tsx)$/.test(file));
}

export function readBaseline(root) {
  const file = join(root, BASELINE);
  if (!existsSync(file)) return null;
  const data = JSON.parse(readFileSync(file, 'utf8'));
  return Array.isArray(data.files) ? data.files : [];
}

/** The excusable rules: a file in the baseline is excused these until it adopts seoRoute. */
const BASELINED_RULES = new Set(['S1', 'S6']);

/** Applies the ratchet: drops excused findings, and adds R1 for stale entries. */
export function applyBaseline(findings, baseline, files) {
  if (!baseline) return findings;
  const listed = new Set(baseline);
  const failing = new Set(findings.filter((f) => BASELINED_RULES.has(f.rule)).map((f) => f.file));
  const kept = findings.filter((f) => !(BASELINED_RULES.has(f.rule) && listed.has(f.file)));
  const present = new Set(files);
  for (const file of baseline) {
    if (!present.has(file)) kept.push(finding(BASELINE, 1, 'R1', `${file} is listed but gone; run node scripts/lint/seo.mjs --update-baseline`));
    else if (!failing.has(file)) kept.push(finding(BASELINE, 1, 'R1', `${file} adopts seoRoute now; run node scripts/lint/seo.mjs --update-baseline to drop it`));
  }
  return kept;
}

/** Every static finding in a checkout, before the baseline. */
export function lintStatic(root) {
  const findings = [];
  const files = routeFiles(root);
  for (const file of files) {
    findings.push(...lintRouteFile(file, readFileSync(join(root, file), 'utf8')));
  }
  const layout = join(root, 'src/app/layout.tsx');
  if (existsSync(layout)) findings.push(...lintRootLayout(readFileSync(layout, 'utf8')));
  for (const file of [...walk(join(root, 'src'), root), ...walk(join(root, 'scripts'), root)]) {
    if (!TEXT_EXT.test(file)) continue;
    findings.push(...lintAliasHosts(file, readFileSync(join(root, file), 'utf8')));
  }
  return { findings, files };
}

/** The baseline a run would write: every route file failing S1 or S6. Refuses to add to an existing list. */
export function nextBaseline(findings, previous) {
  const files = [...new Set(findings.filter((f) => BASELINED_RULES.has(f.rule)).map((f) => f.file))].sort();
  const added = previous ? files.filter((f) => !previous.includes(f)) : [];
  return { files, added };
}

/* ------------------------------------------------------------------ */
/* heads: shared by built and live mode                                */
/* ------------------------------------------------------------------ */

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0' };

export function decodeEntities(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (all, code) => {
    if (code[0] === '#') return String.fromCodePoint(code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10));
    return ENTITIES[code.toLowerCase()] ?? all;
  });
}

function attrs(tag) {
  const out = {};
  for (const m of tag.matchAll(/([a-zA-Z:-]+)\s*=\s*("([^"]*)"|'([^']*)')/g)) out[m[1].toLowerCase()] = decodeEntities(m[3] ?? m[4] ?? '');
  return out;
}

/** The head of an HTML document, read: titles, metas by name or property, links, and every JSON-LD block in the document. */
export function parseHead(html) {
  const close = html.search(/<\/head>/i);
  const head = close < 0 ? html : html.slice(0, close);
  const titles = [...head.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi)].map((m) => decodeEntities(m[1]).trim());
  const metas = [...head.matchAll(/<meta\b[^>]*>/gi)].map((m) => attrs(m[0]));
  const links = [...head.matchAll(/<link\b[^>]*>/gi)].map((m) => attrs(m[0]));
  const jsonLd = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  const meta = (key) => metas.filter((m) => m.name === key || m.property === key).map((m) => m.content ?? '');
  return { titles, metas, links, jsonLd, meta };
}

function sameUrl(a, b) {
  try {
    return new URL(a).href === new URL(b).href;
  } catch {
    return false;
  }
}

/**
 * B1 to B4 over one page's HTML. `adopted` false (the route file is in the
 * baseline) skips B1 and B2 and holds robots to the layout default.
 */
export function judgeHead(path, html, { adopted = true } = {}) {
  const out = [];
  const head = parseHead(html);
  const policy = policyFor(path);
  const canonicals = head.links.filter((l) => (l.rel ?? '').split(/\s+/).includes('canonical'));
  const canonical = canonicals[0]?.href;

  if (adopted) {
    if (head.titles.length !== 1) out.push(['B1', `${head.titles.length} <title> elements; a page has one`]);
    const descriptions = head.meta('description');
    if (descriptions.length !== 1) out.push(['B1', `${descriptions.length} description metas; a page has one`]);
    if (canonicals.length !== 1) out.push(['B1', `${canonicals.length} canonical links; a page has one`]);
    else if (!/^https:\/\/[^/]+/.test(canonical ?? '')) out.push(['B1', `the canonical ${canonical} is not an absolute https URL`]);
    for (const key of ['og:title', 'og:description', 'og:url', 'og:image', 'og:image:width', 'og:image:height', 'twitter:card']) {
      if (head.meta(key).length === 0) out.push(['B1', `no ${key}`]);
    }
    const description = descriptions[0] ?? '';
    if (descriptions.length === 1 && (description.length < DESCRIPTION_MIN || description.length > DESCRIPTION_MAX)) {
      out.push(['B1', `the description runs ${description.length} characters; write ${DESCRIPTION_MIN} to ${DESCRIPTION_MAX}`]);
    }
    if ((head.titles[0] ?? '').includes(EM_DASH)) out.push(['B1', `the title "${head.titles[0]}" holds an em dash`]);
    if (description.includes(EM_DASH)) out.push(['B1', 'the description holds an em dash']);

    if (canonical) {
      const host = new URL(canonical, SITE_URL).host;
      const expected = new URL(policy.canonical).host;
      if (host !== expected) out.push(['B2', `the canonical ${canonical} is on ${host}; the policy puts this page on ${expected}`]);
      else if (expected === new URL(SITE_URL).host && !sameUrl(canonical, policy.canonical)) out.push(['B2', `the canonical ${canonical} is not this page's own URL ${policy.canonical}`]);
      const ogUrl = head.meta('og:url')[0];
      if (ogUrl && !sameUrl(ogUrl, canonical)) out.push(['B2', `og:url ${ogUrl} differs from the canonical ${canonical}`]);
    }
  }

  const robots = (head.meta('robots')[0] ?? 'index, follow').toLowerCase();
  const wantIndex = adopted ? policy.index : !(path === '/d' || path.startsWith('/d/'));
  const indexed = !/\bnoindex\b/.test(robots);
  const followed = !/\bnofollow\b/.test(robots);
  /* a page still in the baseline may set its own follow value until it adopts seoRoute; only its index state is held */
  if (wantIndex !== indexed || (adopted && !followed)) {
    out.push(['B3', `robots "${robots}"; ${adopted ? 'the policy' : "the layout's default"} gives ${wantIndex ? 'index, follow' : 'noindex, follow'}`]);
  }

  head.jsonLd.forEach((block, index) => {
    try {
      const node = JSON.parse(block);
      const nodes = Array.isArray(node) ? node : [node];
      if (nodes.some((n) => !n || typeof n !== 'object' || !n['@context'])) out.push(['B4', `JSON-LD block ${index + 1} has no @context`]);
    } catch (error) {
      out.push(['B4', `JSON-LD block ${index + 1} does not parse: ${error.message}`]);
    }
  });
  return { findings: out, head, canonical };
}

/** The <url> entries of a sitemap: { loc, lastmod }. */
export function parseSitemap(xml) {
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
    loc: decodeEntities(/<loc>([\s\S]*?)<\/loc>/.exec(m[1])?.[1]?.trim() ?? ''),
    lastmod: /<lastmod>([\s\S]*?)<\/lastmod>/.exec(m[1])?.[1]?.trim() ?? null,
  }));
}

/** B5 over the sitemap's entries, given the judged pages by path. Returns [findings, notes]. */
export function judgeSitemap(entries, pages, updated = UPDATED) {
  const out = [];
  const notes = [];
  for (const { loc, lastmod } of entries) {
    if (!loc.startsWith(`${SITE_URL}/`) && loc !== SITE_URL) {
      out.push(['B5', `${loc} is not on ${SITE_URL}`]);
      continue;
    }
    const path = normalizePath(new URL(loc).pathname);
    if (!policyFor(path).inSitemap) out.push(['B5', `${loc} is listed, and the policy keeps it out of the sitemap`]);
    const page = pages.get(path);
    if (!page) out.push(['B5', `${loc} is listed but not prerendered`]);
    else if (page.adopted) {
      if (!page.canonical || !sameUrl(page.canonical, selfUrl(path))) out.push(['B5', `${loc} has the canonical ${page.canonical ?? '(none)'}, not itself`]);
      if (/\bnoindex\b/.test((page.head.meta('robots')[0] ?? '').toLowerCase())) out.push(['B5', `${loc} is listed and noindex`]);
    }
    const entry = updated[path];
    if (entry) {
      if (!lastmod) out.push(['B5', `${loc} has no lastmod; src/lib/updated.ts dates it ${entry.at}`]);
      else if (new Date(lastmod).getTime() !== new Date(entry.at).getTime()) out.push(['B5', `${loc} lastmod ${lastmod} is not ${entry.at} from src/lib/updated.ts`]);
    } else notes.push(`${loc} has no entry in src/lib/updated.ts, so no lastmod; add the page to scripts/build/updated.mjs`);
  }
  return [out, notes];
}

/** B7 over the indexable adopted pages. */
export function judgeUnique(pages) {
  const out = [];
  for (const [field, read] of [
    ['title', (p) => p.head.titles[0]],
    ['description', (p) => p.head.meta('description')[0]],
  ]) {
    const by = new Map();
    for (const [path, page] of pages) {
      if (!page.adopted || !policyFor(path).index) continue;
      const value = read(page);
      if (!value) continue;
      by.set(value, [...(by.get(value) ?? []), path]);
    }
    for (const [value, paths] of by) {
      if (paths.length > 1) out.push([paths[0], 'B7', `${paths.length} indexable pages share the ${field} "${value.slice(0, 80)}": ${paths.join(', ')}`]);
    }
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* route files for built pages                                         */
/* ------------------------------------------------------------------ */

/** A matcher from a pathname to the page file that serves it: static routes first, then the fewest dynamic segments. */
export function routeMatcher(pageFiles) {
  const routes = pageFiles
    .filter((file) => /\/page\.tsx?$/.test(file))
    .map((file) => {
      const route = routeOf(file);
      const segments = route.split('/').filter(Boolean);
      let source = '';
      let dynamic = 0;
      for (const s of segments) {
        if (/^\[\[\.\.\..+\]\]$/.test(s)) {
          source += '(?:/.+)?';
          dynamic += 3;
        } else if (/^\[\.\.\..+\]$/.test(s)) {
          source += '/.+';
          dynamic += 2;
        } else if (/^\[.+\]$/.test(s)) {
          source += '/[^/]+';
          dynamic += 1;
        } else source += `/${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`;
      }
      return { file, re: new RegExp(`^${source || '/'}$`), dynamic, length: segments.length };
    })
    .sort((a, b) => a.dynamic - b.dynamic || b.length - a.length);
  return (path) => routes.find((r) => r.re.test(path))?.file ?? null;
}

/** Prerendered HTML files under .next/server/app, by pathname; not-found and error pages left out. */
export function builtPages(root) {
  const app = join(root, '.next/server/app');
  const pages = new Map();
  for (const file of walk(app, app)) {
    if (!file.endsWith('.html')) continue;
    const stem = file.slice(0, -5);
    if (stem.split('/').some((s) => s.startsWith('_')) || /(^|\/)(404|500)$/.test(stem)) continue;
    pages.set(stem === 'index' ? '/' : `/${stem}`, join(app, file));
  }
  return pages;
}

/* ------------------------------------------------------------------ */
/* modes                                                               */
/* ------------------------------------------------------------------ */

function print(findings) {
  for (const f of findings) console.log(`${f.file}:${f.line} ${f.rule} ${f.message}`);
}

function runStatic({ report, update }) {
  const { findings, files } = lintStatic(ROOT);
  const previous = readBaseline(ROOT);
  if (update) {
    const { files: listed, added } = nextBaseline(findings, previous);
    if (added.length > 0) {
      for (const file of added) console.log(`${BASELINE}:1 R1 would add ${file}; the baseline only shrinks: adopt seoRoute in that file instead`);
      return 1;
    }
    writeFileSync(
      join(ROOT, BASELINE),
      `${JSON.stringify({ note: 'Route files not yet on seoRoute (excused S1 and S6). Written only by node scripts/lint/seo.mjs --update-baseline; the list only shrinks.', files: listed }, null, 2)}\n`,
    );
    console.log(`lint:seo: baseline written, ${listed.length} file(s)`);
    const rest = findings.filter((f) => !BASELINED_RULES.has(f.rule));
    print(rest);
    return rest.length > 0 && !report ? 1 : 0;
  }
  const kept = applyBaseline(findings, previous, files);
  print(kept);
  const listed = previous?.length ?? 0;
  console.log(`lint:seo: ${files.length} route files, ${listed} in the baseline, ${kept.length} finding(s)`);
  return kept.length > 0 && !report ? 1 : 0;
}

function runBuilt({ report }) {
  const app = join(ROOT, '.next/server/app');
  if (!existsSync(app)) {
    console.log('lint:seo --built: no .next/server/app; run next build first');
    return 2;
  }
  const baseline = new Set(readBaseline(ROOT) ?? []);
  const match = routeMatcher(routeFiles(ROOT));
  const findings = [];
  const pages = new Map();
  const files = builtPages(ROOT);
  for (const [path, rel] of Object.entries(REWRITES)) {
    if (existsSync(join(ROOT, rel))) files.set(path, join(ROOT, rel));
  }
  for (const [path, abs] of files) {
    const file = REWRITES[path] ? null : match(path);
    const adopted = file === null ? true : !baseline.has(file);
    const html = readFileSync(abs, 'utf8');
    const judged = judgeHead(path, html, { adopted });
    pages.set(path, { ...judged, adopted });
    for (const [rule, message] of judged.findings) findings.push(finding(relative(ROOT, abs), 1, rule, `${path}: ${message}`));
  }
  for (const [path, rule, message] of judgeUnique(pages)) findings.push(finding(relative(ROOT, files.get(path)), 1, rule, message));

  const sitemapFile = join(app, 'sitemap.xml.body');
  const notes = [];
  if (!existsSync(sitemapFile)) findings.push(finding('.next/server/app/sitemap.xml.body', 1, 'B5', 'no prerendered sitemap'));
  else {
    const [sitemapFindings, sitemapNotes] = judgeSitemap(parseSitemap(readFileSync(sitemapFile, 'utf8')), pages);
    for (const [rule, message] of sitemapFindings) findings.push(finding('.next/server/app/sitemap.xml.body', 1, rule, message));
    notes.push(...sitemapNotes);
  }
  const robotsFile = join(app, 'robots.txt.body');
  const robots = existsSync(robotsFile) ? readFileSync(robotsFile, 'utf8') : '';
  if (!new RegExp(`^Sitemap: ${SITE_URL.replace(/[.]/g, '\\.')}/sitemap\\.xml$`, 'm').test(robots)) {
    findings.push(finding('.next/server/app/robots.txt.body', 1, 'B6', `robots.txt does not name ${SITE_URL}/sitemap.xml`));
  }

  print(findings);
  for (const note of notes) console.log(`note: ${note}`);
  const skipped = [...pages.values()].filter((p) => !p.adopted).length;
  console.log(`lint:seo --built: ${pages.size} pages (${skipped} in the baseline), ${findings.length} finding(s)`);
  return findings.length > 0 && !report ? 1 : 0;
}

/** The pixel size an image's header declares: PNG IHDR or a JPEG SOF marker; null for anything else. */
export function imageSize(bytes) {
  if (bytes.length > 24 && bytes.readUInt32BE(0) === 0x89504e47) return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  if (bytes.length > 4 && bytes[0] === 0xff && bytes[1] === 0xd8) {
    let i = 2;
    while (i + 9 < bytes.length) {
      if (bytes[i] !== 0xff) return null;
      const marker = bytes[i + 1];
      const length = bytes.readUInt16BE(i + 2);
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { width: bytes.readUInt16BE(i + 7), height: bytes.readUInt16BE(i + 5) };
      }
      i += 2 + length;
    }
  }
  return null;
}

async function pool(items, size, work) {
  const results = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) {
        const index = next++;
        results[index] = await work(items[index]);
      }
    }),
  );
  return results;
}

async function runLive({ report, base }) {
  if (!base) {
    console.log('lint:seo --live: set PT_BASE or pass --base <url> (a next start build or www, never a dev server)');
    return 2;
  }
  const origin = base.replace(/\/+$/, '');
  const local = (url) => {
    const u = new URL(url, SITE_URL);
    return u.host === new URL(SITE_URL).host || u.origin === origin ? `${origin}${u.pathname}${u.search}` : null;
  };
  const get = (url) => fetch(url, { redirect: 'manual' });
  let sitemapXml;
  try {
    const response = await get(`${origin}/sitemap.xml`);
    if (response.status !== 200) throw new Error(`/sitemap.xml answered ${response.status}`);
    sitemapXml = await response.text();
  } catch (error) {
    console.log(`lint:seo --live: ${origin} could not be read: ${error.message}`);
    return 2;
  }

  const baseline = new Set(readBaseline(ROOT) ?? []);
  const match = routeMatcher(routeFiles(ROOT));
  const entries = parseSitemap(sitemapXml);
  const sitemapPaths = entries.map((e) => normalizePath(new URL(e.loc).pathname));
  const paths = [...new Set([...sitemapPaths, ...NOINDEX_SAMPLE])];
  const findings = [];
  const pages = new Map();
  const add = (where, rule, message) => findings.push(finding(where, 1, rule, message));

  await pool(paths, 6, async (path) => {
    const response = await get(`${origin}${path}`).catch((error) => ({ status: 0, error }));
    if (response.status !== 200) {
      add(path, 'L1', `answered ${response.status}${response.headers?.get('location') ? ` to ${response.headers.get('location')}` : ''}`);
      return;
    }
    const html = await response.text();
    const file = REWRITES[path] ? null : match(path);
    const adopted = file === null ? true : !baseline.has(file);
    const judged = judgeHead(path, html, { adopted });
    pages.set(path, { ...judged, adopted, html });
    for (const [rule, message] of judged.findings) add(path, `L1/${rule}`, message);
  });
  for (const [path, rule, message] of judgeUnique(pages)) add(path, `L1/${rule}`, message);

  /* L2: cards */
  const cards = new Map();
  for (const [path, page] of pages) {
    const image = page.head.meta('og:image')[0];
    if (!image) continue;
    const width = Number(page.head.meta('og:image:width')[0]);
    const height = Number(page.head.meta('og:image:height')[0]);
    const key = `${image} ${width}x${height}`;
    if (!cards.has(key)) cards.set(key, { image, width, height, path });
  }
  await pool([...cards.values()], 4, async ({ image, width, height, path }) => {
    const url = local(image) ?? image;
    const response = await get(url).catch((error) => ({ status: 0, error }));
    if (response.status !== 200) return add(path, 'L2', `og:image ${image} answered ${response.status}`);
    const type = response.headers.get('content-type') ?? '';
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!type.startsWith('image/')) add(path, 'L2', `og:image ${image} is ${type}, not an image`);
    if (bytes.length <= 5120) add(path, 'L2', `og:image ${image} is ${bytes.length} bytes`);
    const size = imageSize(bytes);
    if (!size) return add(path, 'L2', `og:image ${image}: no PNG or JPEG header`);
    if (size.width !== width || size.height !== height) add(path, 'L2', `og:image ${image} is ${size.width}x${size.height}; the head declares ${width}x${height}`);
    const ratio = size.width / size.height;
    if (ratio < 1.89 || ratio > 1.92) add(path, 'L2', `og:image ${image} is ${ratio.toFixed(3)} to 1; a large card is 1.91 to 1`);
  });

  /* L3: twins */
  for (const [path, page] of pages) {
    for (const link of page.head.links.filter((l) => l.rel === 'alternate' && l.type === 'text/markdown')) {
      const url = local(link.href);
      if (!url) {
        add(path, 'L3', `the Markdown alternate ${link.href} is off this site`);
        continue;
      }
      const response = await get(url).catch((error) => ({ status: 0, error }));
      if (response.status !== 200) {
        add(path, 'L3', `${link.href} answered ${response.status}`);
        continue;
      }
      if (!(response.headers.get('content-type') ?? '').startsWith('text/markdown')) add(path, 'L3', `${link.href} is ${response.headers.get('content-type')}`);
      const header = response.headers.get('link') ?? '';
      const m = /<([^>]+)>\s*;\s*rel="?canonical"?/.exec(header);
      if (!m || !page.canonical || !sameUrl(m[1], page.canonical)) add(path, 'L3', `${link.href} Link canonical ${m?.[1] ?? '(none)'} is not the page's ${page.canonical}`);
    }
  }

  /* L4: the agent files */
  let llms = '';
  for (const file of ['/llms.txt', '/llms-full.txt', '/AGENTS.md']) {
    const response = await get(`${origin}${file}`).catch((error) => ({ status: 0, error }));
    if (response.status !== 200) add(file, 'L4', `answered ${response.status}`);
    else if (file === '/llms.txt') llms = await response.text();
  }
  if (llms) {
    for (const path of sitemapPaths.filter((p) => /^\/(docs|handbook)(\/|$)/.test(p))) {
      if (!llms.includes(selfUrl(path))) add('/llms.txt', 'L4', `does not link ${selfUrl(path)}`);
    }
  }

  /* L5: internal links on the sitemap pages */
  const links = new Map();
  for (const path of sitemapPaths) {
    const page = pages.get(path);
    if (!page) continue;
    for (const m of page.html.matchAll(/<a\b[^>]*\shref=("([^"]*)"|'([^']*)')/gi)) {
      const href = decodeEntities(m[2] ?? m[3] ?? '');
      if (!href || href.startsWith('#') || href.startsWith('//') || /^[a-z]+:/i.test(href) && !href.startsWith(SITE_URL) && !href.startsWith(origin)) continue;
      const url = local(href.startsWith('/') ? `${SITE_URL}${href}` : href);
      if (!url) continue;
      const clean = url.replace(/#.*$/, '');
      if (!links.has(clean)) links.set(clean, path);
    }
  }
  await pool([...links.keys()], 6, async (url) => {
    const response = await get(url).catch((error) => ({ status: 0, error }));
    if (response.status !== 200) add(links.get(url), 'L5', `links ${url.slice(origin.length)}, which answers ${response.status}${response.headers?.get('location') ? ` to ${response.headers.get('location')}` : ''}`);
  });

  print(findings.sort((a, b) => a.file.localeCompare(b.file)));
  console.log(`lint:seo --live: ${pages.size} pages, ${cards.size} cards, ${links.size} internal links on ${origin}, ${findings.length} finding(s)`);
  return findings.length > 0 && !report ? 1 : 0;
}

function arg(name) {
  const at = process.argv.indexOf(name);
  return at < 0 ? undefined : process.argv[at + 1];
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const report = process.argv.includes('--report');
  let code;
  try {
    if (process.argv.includes('--built')) code = runBuilt({ report });
    else if (process.argv.includes('--live')) code = await runLive({ report, base: arg('--base') ?? process.env.PT_BASE });
    else code = runStatic({ report, update: process.argv.includes('--update-baseline') });
  } catch (error) {
    console.log(`lint:seo: could not judge: ${error.stack ?? error}`);
    code = 2;
  }
  process.exit(code);
}

