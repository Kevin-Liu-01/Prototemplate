/**
 * seoRoute: the one call every route makes for its head. It returns the
 * route's complete Next.js metadata and the JSON-LD nodes for its kind, and
 * it writes every field every time (title, description, canonical, robots,
 * Open Graph, the X card, the icon), because Next merges metadata shallowly:
 * a field a route leaves out is inherited from a layout, and a partial
 * object replaces the parent's whole. gt-cloud's createMetadata always
 * emits complete openGraph and twitter objects for the same reason.
 *
 *   const route = seoRoute({ path: '/brand', title: 'Brand', kind: 'page', description: '...' });
 *   export const metadata = route.metadata;
 *   export default function Page() { return <><JsonLd nodes={route.jsonLd} />...</>; }
 *
 * A dynamic route calls it in generateMetadata and again in the page body
 * with the same input. scripts/lint/seo.mjs holds every route to it.
 */
import type { Metadata } from 'next';

import type { PageUpdated } from '@/lib/page-updated';

import { cardPath, OG_HEIGHT, OG_WIDTH } from './card-url';
import { blogPosting, breadcrumbs, softwareSourceCode, techArticle } from './json-ld';
import { isLocked, normalizePath, policyFor, selfUrl } from './policy';
import { GT_ICON, HUB_ICONS, SITE_NAME, SITE_URL, TWITTER_CREATOR, TWITTER_SITE } from './site';

import type { SeoKind, SeoSection } from './card-url';
import type { Crumb, JsonLdNode } from './json-ld';

export type { SeoKind, SeoSection } from './card-url';

/** A social card other than the generated one: a post's own card, made for GT. */
export type SeoImage = {
  /** a site path or an absolute URL */
  url: string;
  width: number;
  height: number;
  alt: string;
  type?: string;
};

export type SeoRouteInput = {
  /** '/docs/handbook/design': no host, no query, no trailing slash */
  path: string;
  /** the page's own name: 'Design system' */
  title: string;
  section?: SeoSection;
  /** 50 to 160 characters, plain and declarative, no em dash */
  description: string;
  kind: SeoKind;
  /** the parents; Home comes first and the page itself last on their own */
  crumbs?: readonly Crumb[];
  /** the page's entry in src/lib/updated.ts, for dateModified */
  updated?: PageUpdated;
  /** a post's frontmatter date */
  published?: string;
  /** a post's author display names, never emails */
  authors?: readonly string[];
  /** an override for the generated card */
  image?: SeoImage;
  /** false names no social card (no og:image and no X image), for a private page that unfurls as text alone */
  card?: false;
  /** the page's Markdown twin path, advertised as its text/markdown alternate */
  markdown?: string;
  /** an RSS feed the page advertises (absolute URL) */
  feed?: string;
  /** a repository path for a SoftwareSourceCode node: 'skills/gt-voice', or '' for the repository */
  source?: string;
  /** an explicit canonical, for a mirror page whose live path differs from its own */
  canonical?: string;
};

export type SeoRoute = { metadata: Metadata; jsonLd: JsonLdNode[] };

/** The longest <title> before the section and then the site name are dropped (gt-cloud's finalTitle). */
export const TITLE_MAX = 60;

/** `<title>, <section>, Prototemplate`, dropping the section and then the site name past 60 characters; the home page is the site name. */
function seoTitle(title: string, section?: SeoSection): string {
  if (title === SITE_NAME) return SITE_NAME;
  const candidates = [section ? `${title}, ${section}, ${SITE_NAME}` : null, `${title}, ${SITE_NAME}`];
  for (const candidate of candidates) {
    if (candidate && candidate.length <= TITLE_MAX) return candidate;
  }
  return title;
}

/** Whether the path is one of the GT design studies (or the presenter), which take the GT mark as their icon. */
function gtIcon(path: string): boolean {
  return path === '/d' || path.startsWith('/d/') || path === '/present';
}

function absolute(url: string): string {
  return /^https?:\/\//.test(url) ? url : `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

const INDEX_ROBOTS: NonNullable<Metadata['robots']> = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
};

const NOINDEX_ROBOTS: NonNullable<Metadata['robots']> = { index: false, follow: true };

/** A private page's robots (policy.ts, PRIVATE_PATHS). */
const PRIVATE_ROBOTS: NonNullable<Metadata['robots']> = { index: false, follow: false };

export function seoRoute(input: SeoRouteInput): SeoRoute {
  const path = normalizePath(input.path);
  const policy = policyFor(path);
  const isError = input.kind === 'error';
  const canonical = input.canonical ?? policy.canonical;
  const fullTitle = seoTitle(input.title, input.section);
  const ogTitle = input.title;
  /* a page that opts out has no card at all, and the root's card is not inherited: Next replaces openGraph whole; a locked page never has one */
  const card = input.card !== false && !isLocked(path);

  const image: SeoImage = input.image
    ? { ...input.image, url: absolute(input.image.url) }
    : {
        url: `${SITE_URL}${cardPath({
          title: input.title,
          section: input.section,
          description: input.description,
          kind: input.kind,
          path,
        })}`,
        width: OG_WIDTH,
        height: OG_HEIGHT,
        type: 'image/png',
        alt: input.title === SITE_NAME ? SITE_NAME : `${input.title}, ${SITE_NAME}`,
      };

  const types: Record<string, string> = {};
  if (input.markdown) types['text/markdown'] = input.markdown;
  if (input.feed) types['application/rss+xml'] = input.feed;

  const metadata: Metadata = {
    title: { absolute: fullTitle },
    description: input.description,
    alternates: isError
      ? undefined
      : { canonical, ...(Object.keys(types).length ? { types } : {}) },
    robots: isError ? { index: false } : policy.index ? INDEX_ROBOTS : policy.follow === false ? PRIVATE_ROBOTS : NOINDEX_ROBOTS,
    openGraph: {
      title: ogTitle,
      description: input.description,
      url: isError ? selfUrl(path) : canonical,
      siteName: SITE_NAME,
      locale: 'en_US',
      type: input.kind === 'article' || input.kind === 'skill' || input.kind === 'post' ? 'article' : 'website',
      ...(card
        ? { images: [{ url: image.url, width: image.width, height: image.height, alt: image.alt, ...(image.type ? { type: image.type } : {}) }] }
        : {}),
    },
    twitter: {
      card: card ? 'summary_large_image' : 'summary',
      site: TWITTER_SITE,
      creator: TWITTER_CREATOR,
      title: ogTitle,
      description: input.description,
      ...(card ? { images: [{ url: image.url, alt: image.alt }] } : {}),
    },
    icons: gtIcon(path) ? { icon: [GT_ICON] } : HUB_ICONS,
  };

  return { metadata, jsonLd: jsonLdFor(input, path, canonical, image.url) };
}

function jsonLdFor(input: SeoRouteInput, path: string, canonical: string, image: string): JsonLdNode[] {
  const own = selfUrl(path);
  const trail = path === '/' ? null : breadcrumbs([...(input.crumbs ?? []), { name: input.title, path }]);
  const dateModified = input.updated?.at;
  const nodes: JsonLdNode[] = [];

  switch (input.kind) {
    case 'article':
      nodes.push(techArticle({ title: input.title, description: input.description, url: own, dateModified }));
      break;
    case 'skill':
      nodes.push(techArticle({ title: input.title, description: input.description, url: own, dateModified }));
      break;
    case 'post':
      nodes.push(
        blogPosting({
          title: input.title,
          description: input.description,
          url: canonical,
          dateModified,
          datePublished: input.published,
          image,
          authors: input.authors ?? [],
        }),
      );
      break;
    case 'direction':
      /* the indexed presentation pages carry a trail; the /d/ studies carry nothing beyond the WebSite */
      if (!path.startsWith('/directions/')) return nodes;
      break;
    case 'mirror':
    case 'error':
      return nodes;
    case 'page':
      break;
  }

  if (input.source !== undefined) {
    nodes.push(
      softwareSourceCode({
        name: path === '/' ? SITE_NAME : input.title,
        description: input.description,
        url: own,
        source: input.source,
        language: input.kind === 'skill' ? 'Markdown' : 'TypeScript',
      }),
    );
  }
  if (trail) nodes.push(trail);
  return nodes;
}
