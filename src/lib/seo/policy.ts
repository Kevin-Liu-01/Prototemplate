/**
 * The canonical and indexing policy: one pure function from a pathname to
 * whether the page is indexed, its canonical URL and whether the sitemap
 * lists it. The prefix rules:
 *
 *   /d/production and each mirror page   index, canonical on generaltranslation.com/en-US, not listed
 *   /d/production/<dashboard state>      noindex, self canonical, not listed (no public page exists)
 *   every other /d/ page                 noindex, self canonical, not listed (a design study of GT copy)
 *   /blog/<slug>                         index, canonical on generaltranslation.com/en-US/blog, not listed
 *   /press/<slug> of a GT post           index, canonical on generaltranslation.com/en-US/blog, not listed
 *   every other path                     index, self canonical on www, listed
 *
 * www.prototemplate.com is canonical (decision log, 2026-10-10); the two
 * aliases serve the same deployment and are consolidated by the absolute
 * canonical in every head, never by a redirect. robots.txt never carries the
 * policy: a disallowed page can still be indexed from links, and its
 * noindex is never read.
 *
 * This file imports nothing at runtime, so scripts/lint/seo.mjs, its tests
 * and scripts/build/deck.mjs load it directly through Node's type stripping.
 * Keep it that way: `import type` only, and no TypeScript syntax that emits
 * code (no enums, no namespaces, no parameter properties).
 */

/** The canonical origin of every page on this site. */
export const SITE_URL = 'https://www.prototemplate.com';

/** General Translation's site, the original of every mirror page and post. */
export const GT_URL = 'https://generaltranslation.com';

/** The locale segment of GT's canonical URLs. */
export const GT_LOCALE = 'en-US';

/** The other two hosts of this deployment. Only this file and the archive's capture record may spell them; lint:seo S5 holds that. */
export const ALIAS_HOSTS: readonly string[] = ['prototemplate.vercel.app', 'prototemplate.kevinliu.studio'];

/** The mirror's route prefix. */
export const MIRROR_PREFIX = '/d/production';

/** The dashboard states under the mirror: they render states of the dashboard, which has no public page to point at. */
export const MIRROR_WITHOUT_LIVE: readonly string[] = ['signin', 'onboarding', 'consent', 'device', 'cli'];

/** The GT Atlas stories that are GT blog posts: like /blog/<slug>, each takes the post as its canonical. */
export const PRESS_POSTS: readonly string[] = ['designing-docs-for-humans', 'rewriting-our-docs', 'fuma-nama'];

export type SeoPolicy = {
  /** index, follow when true; noindex, follow when false */
  index: boolean;
  /** the absolute canonical URL */
  canonical: string;
  /** whether src/app/sitemap.ts lists the page */
  inSitemap: boolean;
};

/** A pathname with one leading slash, no query, no fragment and no trailing slash (the home page is `/`). */
export function normalizePath(path: string): string {
  const bare = path.replace(/[?#].*$/, '');
  if (!bare.startsWith('/')) throw new Error(`seo policy: ${JSON.stringify(path)} is not a pathname`);
  const trimmed = bare.replace(/\/+$/, '');
  return trimmed === '' ? '/' : trimmed;
}

/** The page's own URL on the canonical host. */
export function selfUrl(path: string): string {
  const p = normalizePath(path);
  return p === '/' ? `${SITE_URL}/` : `${SITE_URL}${p}`;
}

/** The policy for one pathname. */
export function policyFor(path: string): SeoPolicy {
  const p = normalizePath(path);
  const self = selfUrl(p);

  if (p === MIRROR_PREFIX || p.startsWith(`${MIRROR_PREFIX}/`)) {
    const rest = p.slice(MIRROR_PREFIX.length);
    const first = rest.split('/')[1];
    if (first !== undefined && MIRROR_WITHOUT_LIVE.includes(first)) {
      return { index: false, canonical: self, inSitemap: false };
    }
    return { index: true, canonical: `${GT_URL}/${GT_LOCALE}${rest}`, inSitemap: false };
  }

  if (p === '/d' || p.startsWith('/d/')) {
    return { index: false, canonical: self, inSitemap: false };
  }

  if (/^\/blog\/[^/]+$/.test(p)) {
    return { index: true, canonical: `${GT_URL}/${GT_LOCALE}${p}`, inSitemap: false };
  }
  const press = /^\/press\/([^/]+)$/.exec(p);
  if (press && PRESS_POSTS.includes(press[1] ?? '')) {
    return { index: true, canonical: `${GT_URL}/${GT_LOCALE}/blog/${press[1]}`, inSitemap: false };
  }

  return { index: true, canonical: self, inSitemap: true };
}
