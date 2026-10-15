import ProductionPage from '../page';

export { metadata } from '../page';

/**
 * PRODUCTION · HOME ALIAS: generaltranslation.com/home serves the home page
 * itself with a 200 (apps/landing/src/app/[locale]/(home)/home/page.tsx
 * renders HomePage), and the live header logo and the 404's Go Home link
 * point there. The mirror's /home renders the same page.
 */
export default ProductionPage;
