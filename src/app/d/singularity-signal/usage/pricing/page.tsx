import DirectionCorner from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { seoRoute } from '@/lib/seo/route';

import SiteFooter from '../../../singularity/sections/SiteFooter';
import TopNav from '../../../singularity/sections/TopNav';

import UsageClose from '../../../singularity/product-sections/UsageClose';
import UsageHero from '../../../singularity/product-sections/UsageHero';
import UsageLedger from '../../../singularity/product-sections/UsageLedger';
import UsageMonthBand from '../../../singularity/product-sections/UsageMonthBand';

/* no Frameworks on this route — the footer's marks need the sheet directly
   (the toolchain enterprise subpage precedent) */
import '../../../singularity/sections/logos-icons.css';
import '../../../singularity/styles.css';
import '../../../singularity/product-sections/product.css';
import '../../styles.css';

const route = seoRoute({
  path: '/d/singularity-signal/usage/pricing',
  title: 'Usage pricing, Signal',
  kind: 'direction',
  description:
    'The usage pricing page of the Signal site concept: four meters, the whole rate card as a ruled ledger and one worked month.',
});

export const metadata = route.metadata;

/**
 * Singularity · Signal — the usage-pricing page.
 * Four meters on one dark panel, the whole rate card as a ruled ledger
 * with its zero rows, and one worked month itemised on the dark band.
 * A thin wrapper: shared product sections between the shared TopNav and
 * footer, exactly the way this final's enterprise page composes.
 */
export default function SignalUsagePricingPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root sgs-root'>
        <TopNav />
        <div className='tc-rail'>
          <UsageHero />
          <UsageLedger />
        </div>
        <UsageMonthBand />
        <div className='tc-rail'>
          <UsageClose />
          <SiteFooter />
        </div>
      </div>
      <DirectionCorner slug='singularity-signal' />
    </SmoothScroll>
  );
}
