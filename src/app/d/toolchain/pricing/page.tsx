import DirectionCorner from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { seoRoute } from '@/lib/seo/route';

import SiteFooter from '../sections/SiteFooter';
import TopNav from '../sections/TopNav';

import CloseBand from './CloseBand';
import PlanLedger from './PlanLedger';
import PricingFaq from './PricingFaq';
import PricingHero from './PricingHero';
import ProofRow from './ProofRow';
import UsageRates from './UsageRates';

import '../styles.css';
/* The footer's theme-paired brand marks and the shared icon sizing live with
   the base page's Frameworks section; this route has no Frameworks, so it
   imports the sheet directly (the locadex and enterprise pages set the
   precedent). */
import '../sections/logos-icons.css';
import './pricing.css';

const route = seoRoute({
  path: '/d/toolchain/pricing',
  title: 'Pricing, Toolchain',
  kind: 'direction',
  description:
    'The pricing page of the Toolchain direction: the two plans, a ruled comparison ledger and the published rate card.',
});

export const metadata = route.metadata;

/**
 * The full pricing page in the toolchain grammar: the same ruled column and
 * hairline system, but every section is a ledger. A dry-run receipt is the
 * hero artifact (the price is knowable before you run), the two real plans
 * sit beside it, the comparison is one ruled table with plans as columns,
 * the published rate card teases the usage page, and the FAQ is a ruled
 * two-column ledger. One dark band at the close, the house way.
 */
export default function ToolchainPricingPage() {
  return (
    <SmoothScroll>
      <div className='toolchain-root'>
        <TopNav />

        <div className='tc-rail'>
          <PricingHero />
          <PlanLedger />
          <UsageRates />
          <ProofRow />
          <PricingFaq />
        </div>

        <CloseBand />

        <div className='tc-rail'>
          <SiteFooter />
        </div>
      </div>
      <DirectionCorner slug='toolchain' />
    </SmoothScroll>
  );
}
