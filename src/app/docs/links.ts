import { HANDBOOK, HANDBOOK_README } from '@/app/handbook/registry';

import { docHref, README_SLUG } from './model';
import { DOCS } from './registry';

/**
 * Where a repository path opens on the site. The two book registries say
 * which Markdown files the site renders: the repository documents at /docs
 * and the handbook at /handbook. A link between them, written as a relative
 * path the way GitHub resolves it (`../../BRAND.md` from a handbook page,
 * `docs/SHIP-LOOP.md` from the readme), opens the document's own route. A
 * curated skill's SKILL.md opens its page and any other file of the skill
 * its raw address. Every other repository file opens on GitHub, since the
 * site does not serve it (LICENSE, docs/ARTIFACT-PICTURES.md). Pure data and
 * string functions; the server-side renderers read it.
 */

/** The public repository's file view on main, for repository files the site does not serve. */
export const REPO_BLOB = 'https://github.com/Kevin-Liu-01/Prototemplate/blob/main/';

/** Every Markdown file the books render, by its repository path, with its route. */
export const DOC_ROUTES: Readonly<Record<string, string>> = {
  'README.md': docHref(README_SLUG),
  ...Object.fromEntries(DOCS.map((doc) => [doc.file, docHref(doc.slug)])),
  [HANDBOOK_README.file]: docHref(README_SLUG, 'handbook'),
  ...Object.fromEntries(HANDBOOK.map((doc) => [doc.file, docHref(doc.slug, 'handbook')])),
};

/** Repository paths that stand for a page of their own: the skills index and the handbook's folder. */
const PAGE_PATHS: Readonly<Record<string, string>> = {
  skills: '/skills',
  'skills/README.md': '/skills',
  'docs/handbook': '/handbook',
};

/* skills/<slug>/<file>: the skill's page for its SKILL.md, the raw file for anything beside it */
const SKILL_PATH = /^skills\/([a-z0-9-]+)\/(.+)$/;

/** A target with a scheme (`https:`, `mailto:`), a site path or an anchor: never a repository path. */
const NOT_RELATIVE = /^(?:[a-z][a-z0-9+.-]*:|\/|#)/i;

/**
 * A relative target resolved against the folder of the file that holds it,
 * as a repository path: `../../skills/gt-ship/SKILL.md` from `docs/handbook`
 * is `skills/gt-ship/SKILL.md`. Null for a target that climbs out of the
 * repository.
 */
export function repoPath(dir: string, target: string): string | null {
  const parts: string[] = [];
  for (const part of `${dir}/${target}`.split('/')) {
    if (part === '' || part === '.') continue;
    if (part === '..') {
      if (parts.length === 0) return null;
      parts.pop();
    } else parts.push(part);
  }
  return parts.join('/');
}

/**
 * The site address for a link written in a repository Markdown file that
 * lives in `dir` (`''` for the root, `docs/handbook` for the handbook). An
 * absolute URL, a site path or an anchor comes back unchanged.
 */
export function siteHref(href: string, dir = ''): string {
  if (NOT_RELATIVE.test(href)) return href;
  const hash = href.indexOf('#');
  const target = hash >= 0 ? href.slice(0, hash) : href;
  const anchor = hash >= 0 ? href.slice(hash) : '';
  const path = repoPath(dir, target);
  if (path === null) return href;
  const doc = DOC_ROUTES[path] ?? PAGE_PATHS[path.replace(/\/$/, '')];
  if (doc) return `${doc}${anchor}`;
  const skill = SKILL_PATH.exec(path);
  if (skill?.[1] && skill[2]) return skill[2] === 'SKILL.md' ? `/skills/${skill[1]}${anchor}` : `/skills/${skill[1]}/${skill[2]}`;
  return `${REPO_BLOB}${path}${anchor}`;
}
