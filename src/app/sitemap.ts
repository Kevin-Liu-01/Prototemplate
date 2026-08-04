import type { MetadataRoute } from 'next';

import { DIRECTIONS } from '@/lib/directions';

const SITE_URL = 'https://prototemplate.vercel.app';

/**
 * Every curated route, derived from the direction registry so the sitemap
 * tracks the lineup automatically: the index, the presenter, the build log,
 * each direction, and each site concept's enterprise page.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/present`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/craft`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
  ];

  for (const direction of DIRECTIONS) {
    entries.push({
      url: `${SITE_URL}/d/${direction.slug}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
    if (direction.site) {
      entries.push({
        url: `${SITE_URL}/d/${direction.slug}/enterprise`,
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }
  }

  return entries;
}
