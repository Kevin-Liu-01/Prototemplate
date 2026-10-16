import DirectionCorner from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import TryPage from '@/components/try/TryPage';
import { seoRoute } from '@/lib/seo/route';

import ProdFooter from '../sections/ProdFooter';
import ProdNav from '../sections/ProdNav';

import '../../toolchain/styles.css';
import '@/components/try/try.css';
import '../../_v0/v0-pages.css';

/* The live description, "Grade how localized any site really is.", runs
   39 characters; lint:seo wants 50 to 160, so the mirror adds the six
   categories the page grades. */
const route = seoRoute({
  path: '/d/production/report-card',
  title: 'Report card',
  section: 'Shipped',
  kind: 'mirror',
  description:
    'Grade how localized any site really is, across six localization categories.',
});

export const metadata = route.metadata;

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
