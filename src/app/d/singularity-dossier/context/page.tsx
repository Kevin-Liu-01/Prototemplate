import SmoothScroll from '@/components/shared/SmoothScroll';

import V0Footer from '../../_v0/V0Footer';
import V0Nav from '../../_v0/V0Nav';

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
  title: 'Context — Dossier — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Singularity · Dossier — the Context product page.
 * The two senses of "Save" as Exhibits A and B, the four signal classes
 * on ruled sheets, and the Context Group accumulator on the dark band.
 * A thin wrapper: shared product sections between the deployed nav and
 * footer, exactly the way this final's enterprise page composes.
 */
export default function DossierContextPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root toolchain-root sgd-root'>
        <V0Nav />
        <div className='tc-rail'>
          <ContextHero />
          <ContextSignals />
        </div>
        <ContextGroupBand />
        <div className='tc-rail'>
          <ContextControls />
          <V0Footer />
        </div>
      </div>
    </SmoothScroll>
  );
}
