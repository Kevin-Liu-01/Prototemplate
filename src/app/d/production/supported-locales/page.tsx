import { Suspense } from 'react';

import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import V0Footer from '../../_v0/V0Footer';
import V0Nav from '../../_v0/V0Nav';
import LocalesCatalog from '../sections/LocalesCatalog';

import '../../toolchain/sections/logos-icons.css';
import '../../toolchain/styles.css';
import '../../_v0/v0-pages.css';

export const metadata = {
  title: 'Supported Locales — Production — GT Redesign',
  description:
    'Explore all languages and regional variants supported by General Translation',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * PRODUCTION — Supported Locales. The control, not a direction.
 *
 * Reproduces generaltranslation.com/supported-locales: one section, the
 * centered head and its one-line sub, the search rail with its live
 * `shown / total` readout, and all 120 locales as a three-up card grid.
 * The real route is /supported-locales, so this one is too.
 *
 * Chrome follows the real page rather than the other concepts' subpages.
 * On the live site SupportedLocalesPage renders nothing but a <main> — the
 * header and footer come from the (home) route group's layout, the same pair
 * the home page wears. So this page mounts V0Nav and V0Footer, the chrome
 * /d/production's landing page already carries, instead of the singularity
 * family's TopNav/SiteFooter.
 *
 * Suspense wraps the catalog for the same reason the real route does: the
 * component reads `?search=` through useSearchParams.
 */
export default function ProductionSupportedLocalesPage() {
  return (
    <SmoothScroll>
      <div
        className='toolchain-root sgdh-root prod-root locales-root'
        id='top'
      >
        <V0Nav />

        <main className='tc-rail'>
          <Suspense>
            <LocalesCatalog />
          </Suspense>
          <V0Footer />
        </main>
      </div>
      <DirectionDock slug='production' />
    </SmoothScroll>
  );
}
