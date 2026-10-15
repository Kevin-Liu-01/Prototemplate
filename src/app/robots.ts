import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/seo/policy';

/* Every agent may crawl every path, and the sitemap is named. The index
   policy lives in each page's head (src/lib/seo/policy.ts), never here: a
   disallowed page can still be indexed from links, and its noindex is
   never read. No Content-Signal line (Kevin, 2026-10-14), the same file
   generaltranslation.com serves. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
