import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';
import TryPage from '@/components/try/TryPage';

import V0Footer from '../../_v0/V0Footer';
import V0Nav from '../../_v0/V0Nav';

import '../../toolchain/styles.css';
import '@/components/try/try.css';
import '../../_v0/v0-pages.css';

export const metadata = {
  title: 'Report card — Shipped — GT Redesign',
  description: 'Grade any site on six localization categories.',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * PRODUCTION · REPORT CARD — the shipped /try page on the shipped
 * direction: the glyph-field hero with the URL form and the satellite
 * figure, a hatch strip, then the graded report as a framed artifact,
 * between the production final's V0 nav and footer. The components are
 * the shared set under src/components/try, one implementation for every
 * direction that mounts the instrument.
 */
export default function ProductionTryPage() {
  return (
    <SmoothScroll>
      <div className='toolchain-root sgdh-root prod-root try-root'>
        <V0Nav />
        <main className='tc-rail try-rail'>
          <TryPage />
          <V0Footer />
        </main>
      </div>
      <DirectionDock slug='production' />
    </SmoothScroll>
  );
}
