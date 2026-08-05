import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import SiteFooter from '../../singularity/sections/SiteFooter';
import TopNav from '../../singularity/sections/TopNav';

import ContextControls from '../../singularity/product-sections/ContextControls';
import ContextGroupBand from '../../singularity/product-sections/ContextGroupBand';
import ContextHero from '../../singularity/product-sections/ContextHero';
import ContextSignals from '../../singularity/product-sections/ContextSignals';

/* no Frameworks on this route — the footer's marks need the sheet directly
   (the toolchain enterprise subpage precedent) */
import '../../singularity/sections/logos-icons.css';
import '../../singularity/styles.css';
import '../../singularity/product-sections/product.css';
import '../styles.css';

export const metadata = {
  title: 'Context — Procession — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Singularity · Procession — the Context product page.
 * The two senses of "Save" as Exhibits A and B, the four signal classes
 * on ruled sheets, and the Context Group accumulator on the dark band.
 * A thin wrapper: shared product sections between the shared TopNav and
 * footer, exactly the way this final's enterprise page composes.
 */
export default function ProcessionContextPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root sgp-root'>
        <TopNav />
        <div className='tc-rail'>
          <ContextHero />
          <ContextSignals />
        </div>
        <ContextGroupBand />
        <div className='tc-rail'>
          <ContextControls />
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='singularity-procession' />
    </SmoothScroll>
  );
}
