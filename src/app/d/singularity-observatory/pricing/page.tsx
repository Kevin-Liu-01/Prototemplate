import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import SiteFooter from '../../singularity/sections/SiteFooter';
import TopNav from '../../singularity/sections/TopNav';

import PricingBand from '../../singularity/product-sections/PricingBand';
import PricingFaq from '../../singularity/product-sections/PricingFaq';
import PricingHero from '../../singularity/product-sections/PricingHero';
import PricingLedger from '../../singularity/product-sections/PricingLedger';
import PricingProof from '../../singularity/product-sections/PricingProof';
import PricingRates from '../../singularity/product-sections/PricingRates';

/* no Frameworks on this route — the footer's marks need the sheet directly
   (the toolchain enterprise subpage precedent) */
import '../../singularity/sections/logos-icons.css';
import '../../singularity/styles.css';
import '../../singularity/product-sections/product.css';
import '../styles.css';

export const metadata = {
  title: 'Pricing — Observatory — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Singularity · Observatory — the pricing page as an
 * evidence file: a dry-run receipt, the two plans, one ruled comparison
 * ledger, the published rate card, and a close on the dark band.
 * A thin wrapper: shared product sections between the shared TopNav and
 * footer, exactly the way this final's enterprise page composes.
 */
export default function ObservatoryPricingPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root sgb-root'>
        <TopNav />
        <div className='tc-rail'>
          <PricingHero />
          <PricingLedger />
          <PricingRates />
          <PricingProof />
          <PricingFaq />
        </div>
        <PricingBand />
        <div className='tc-rail'>
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='singularity-observatory' />
    </SmoothScroll>
  );
}
