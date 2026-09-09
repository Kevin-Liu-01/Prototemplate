import type { MetadataRoute } from 'next';

import { DOCS } from '@/app/docs/registry';
import { ARCHIVE } from '@/lib/archive';
import { DIRECTIONS } from '@/lib/directions';

const SITE_URL = 'https://prototemplate.vercel.app';

/**
 * Every route on the site, derived from the registries the pages render
 * from so the sitemap tracks the lineup: the gallery, the presenter, the
 * deck, the brand book, the documents, the skills, the mark explorations,
 * the compare rig, each direction with each site concept's enterprise page,
 * and the archive of retired versions. /craft is a redirect to /docs and is
 * not listed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/present`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/deck`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/brand`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/docs`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/skills`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/marks`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
  ];

  for (const doc of DOCS) {
    entries.push({
      url: `${SITE_URL}/docs/${doc.slug}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  entries.push({ url: `${SITE_URL}/compare`, lastModified, changeFrequency: 'monthly', priority: 0.5 });

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

  for (const item of ARCHIVE) {
    entries.push({
      url: `${SITE_URL}/archive/${item.slug}`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    });
  }

  return entries;
}
