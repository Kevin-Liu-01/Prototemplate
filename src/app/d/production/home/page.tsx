import { seoRoute } from '@/lib/seo/route';

import ProductionPage from '../page';

/* Live /home names the home page as its canonical, so this alias does too.
   Its title and description differ from /d/production's own, since both
   pages are indexable and lint:seo holds indexable heads unique. */
const route = seoRoute({
  path: '/d/production/home',
  title: 'Home (/home)',
  section: 'Shipped',
  kind: 'mirror',
  description:
    "Full-stack localization for the world's best companies, at the home page's /home address.",
  canonical: 'https://generaltranslation.com/en-US',
});

export const metadata = route.metadata;

/**
 * PRODUCTION · HOME ALIAS: generaltranslation.com/home serves the home page
 * itself with a 200 (apps/landing/src/app/[locale]/(home)/home/page.tsx
 * renders HomePage), and the live header logo and the 404's Go Home link
 * point there. The mirror's /home renders the same page.
 */
export default ProductionPage;
