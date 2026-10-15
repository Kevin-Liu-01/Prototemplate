/**
 * Schema.org JSON-LD builders. Ported from gt-cloud
 * apps/landing/src/lib/docs-structured-data.ts (origin/k/seo-0-kit):
 * the article and breadcrumb builders and serializeJsonLd, with locales
 * removed and every URL absolute on www. Each node carries its own
 * @context, so each renders as its own script tag (JsonLd.tsx).
 */
import { selfUrl } from './policy';
import { GT_ORGANIZATION, KEVIN, REPO_URL, SITE_DESCRIPTION, SITE_NAME, SITE_URL, WEBSITE_ID } from './site';

export type JsonLdNode = { '@context': 'https://schema.org'; '@type': string } & Record<string, unknown>;

export type Crumb = { name: string; path: string };

const CONTEXT = 'https://schema.org' as const;

/** The site's WebSite node, rendered once by the root layout on every page. */
export function webSite(): JsonLdNode {
  return {
    '@context': CONTEXT,
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    description: SITE_DESCRIPTION,
    inLanguage: 'en',
    publisher: GT_ORGANIZATION,
    creator: KEVIN,
  };
}

/** Home, then the given crumbs, then the page itself unless the last crumb already is the page. */
export function breadcrumbs(crumbs: readonly Crumb[]): JsonLdNode {
  const list: Crumb[] = [{ name: 'Home', path: '/' }, ...crumbs];
  const seen = new Set<string>();
  const items = list.filter((crumb) => {
    const url = selfUrl(crumb.path);
    if (seen.has(url)) return false;
    seen.add(url);
    return true;
  });
  return {
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: selfUrl(crumb.path),
    })),
  };
}

type ArticleInput = {
  title: string;
  description: string;
  url: string;
  dateModified?: string;
};

/** A TechArticle: a docs page, a handbook document or a skill. */
export function techArticle({ title, description, url, dateModified }: ArticleInput): JsonLdNode {
  return {
    '@context': CONTEXT,
    '@type': 'TechArticle',
    headline: title,
    name: title,
    description,
    url,
    mainEntityOfPage: url,
    inLanguage: 'en',
    author: KEVIN,
    publisher: GT_ORGANIZATION,
    isPartOf: { '@id': WEBSITE_ID },
    ...(dateModified ? { dateModified } : {}),
  };
}

type PostInput = ArticleInput & {
  datePublished?: string;
  image: string;
  /** display names only: the author files hold emails, which never enter JSON-LD */
  authors: readonly string[];
};

/** A BlogPosting whose url and main entity are the post's canonical on generaltranslation.com. */
export function blogPosting({ title, description, url, dateModified, datePublished, image, authors }: PostInput): JsonLdNode {
  return {
    '@context': CONTEXT,
    '@type': 'BlogPosting',
    headline: title,
    name: title,
    description,
    url,
    mainEntityOfPage: url,
    image,
    inLanguage: 'en',
    author: authors.map((name) => ({ '@type': 'Person', name })),
    publisher: GT_ORGANIZATION,
    ...(datePublished ? { datePublished } : {}),
    ...((dateModified ?? datePublished) ? { dateModified: dateModified ?? datePublished } : {}),
  };
}

type SourceInput = {
  name: string;
  description: string;
  url: string;
  /** a repository path ('skills/gt-voice'), or '' for the whole repository */
  source: string;
  language: string;
};

/** A SoftwareSourceCode node for the repository or one folder of it. */
export function softwareSourceCode({ name, description, url, source, language }: SourceInput): JsonLdNode {
  const folder = source.replace(/^\/+|\/+$/g, '');
  return {
    '@context': CONTEXT,
    '@type': 'SoftwareSourceCode',
    name,
    description,
    url,
    codeRepository: folder ? `${REPO_URL}/tree/main/${folder}` : REPO_URL,
    programmingLanguage: language,
    license: `${REPO_URL}/blob/main/LICENSE`,
    author: KEVIN,
    publisher: GT_ORGANIZATION,
  };
}

/** JSON for a script tag: escapes `<` (so no `</script>` closes it early) and the two line separators JavaScript reads as newlines. */
export function serializeJsonLd(value: object): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
