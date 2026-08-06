import type { MetadataRoute } from 'next';

/* Lighthouse (SEO: robots-txt) treats a missing /robots.txt as invalid;
   this serves the permissive default explicitly. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
  };
}
