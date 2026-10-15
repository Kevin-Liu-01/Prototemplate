import DirectionCorner from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import TryPage from '@/components/try/TryPage';

import ProdFooter from '../sections/ProdFooter';
import ProdNav from '../sections/ProdNav';

import '../../toolchain/styles.css';
import '@/components/try/try.css';
import '../../_v0/v0-pages.css';

export const metadata = {
  title: 'Report card — Shipped — GT Redesign',
  description: 'Grade any site on six localization categories.',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * PRODUCTION · REPORT CARD. The shipped /report-card page on the shipped
 * direction (gt-cloud #4403 drafted it as /try; #4557 renamed it and left
 * a permanent redirect, which next.config.ts mirrors for /d/production/try):
 * the glyph-field hero with the URL form and the satellite figure, a hatch
 * strip, then the graded report as a framed artifact,
 * between the shipped header (ProdNav) and footer (ProdFooter), as on
 * every other mirror page. The components are
 * the shared set under src/components/try, one implementation for every
 * direction that mounts the instrument.
 */
export default function ProductionReportCardPage() {
  return (
    <SmoothScroll>
      <div className='toolchain-root sgdh-root prod-root try-root'>
        <ProdNav />
        <main className='tc-rail try-rail'>
          <TryPage />
          <ProdFooter />
        </main>
      </div>
      <DirectionCorner slug='production' />
    </SmoothScroll>
  );
}
