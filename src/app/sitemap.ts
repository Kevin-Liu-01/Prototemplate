import type { MetadataRoute } from 'next';

import { ARCHIVE } from '@/lib/archive';
import { policyFor, SITE_URL } from '@/lib/seo/policy';
import { UPDATED } from '@/lib/updated';

/**
 * The indexable pages, as the union of three sources: the undated
 * singleton routes below, every page src/lib/updated.ts dates (the docs
 * pages, the handbook's among them), and the archive entries. Each URL is on www, deduplicated,
 * and kept only when the policy (src/lib/seo/policy.ts) lists it, so no
 * /d/ study and no blog post (both have their canonical elsewhere or are
 * noindex) can enter.
 *
 * lastmod is the commit date updated.ts records for the page, and is left
 * out where it has none: a build date would tell a crawler nothing, so it
 * learns to ignore the field. A new indexable page gets an entry in
 * scripts/build/updated.mjs, so its lastmod is true. changeFrequency and
 * priority are not written; Google ignores both.
 */
const SINGLETONS = [
  `${SITE_URL}/`,
  `${SITE_URL}/present`,
  `${SITE_URL}/deck`,
  `${SITE_URL}/brand`,
  `${SITE_URL}/docs`,
  `${SITE_URL}/skills`,
  `${SITE_URL}/marks`,
  `${SITE_URL}/blog`,
  `${SITE_URL}/graphics`,
  `${SITE_URL}/motion`,
  `${SITE_URL}/compare`,
  `${SITE_URL}/press`,
  `${SITE_URL}/atlas`,
];

function pathOf(url: string): string {
  const path = url.slice(SITE_URL.length);
  return path === '' ? '/' : path;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    ...SINGLETONS.map(pathOf),
    ...Object.keys(UPDATED),
    ...ARCHIVE.map((item) => `/archive/${item.slug}`),
  ];

  const seen = new Set<string>();
  const entries: MetadataRoute.Sitemap = [];
  for (const path of paths) {
    if (seen.has(path) || !policyFor(path).inSitemap) continue;
    seen.add(path);
    const updated = UPDATED[path];
    entries.push({
      url: path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`,
      ...(updated ? { lastModified: new Date(updated.at) } : {}),
    });
  }
  return entries;
}
