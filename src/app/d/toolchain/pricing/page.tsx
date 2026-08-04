import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

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

export const metadata = {
  title: 'Pricing — Toolchain — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

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
      <DirectionDock slug='toolchain' />
    </SmoothScroll>
  );
}
