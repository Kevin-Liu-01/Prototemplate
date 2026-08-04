import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import SiteFooter from '../../sections/SiteFooter';
import TopNav from '../../sections/TopNav';

import MonthBand from './sections/MonthBand';
import RateLedger from './sections/RateLedger';
import UsageCTA from './sections/UsageCTA';
import UsageHero from './sections/UsageHero';

/* no Frameworks on this route — the footer's marks need the sheet directly */
import '../../sections/logos-icons.css';
import '../../styles.css';
import './usage-pricing.css';

export const metadata = {
  title: 'Usage Pricing — Toolchain',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * The usage-pricing page — the toolchain direction's deep page for the meters.
 * Same ruled column, same one full-bleed dark band. The argument runs in page
 * order: the four meters and their published rates (hero), the whole rate card
 * plus the rows that stay at zero (ledger), one project's month computed line
 * by line at those rates (the dark band), and the caps that make the spend a
 * setting rather than a surprise.
 *
 * Every rate on this page is a published rate from the research inventory;
 * every volume in the worked example is labeled illustrative.
 */
export default function ToolchainUsagePricingPage() {
  return (
    <SmoothScroll>
      <div className='toolchain-root'>
        <TopNav />

        <div className='tc-rail'>
          <UsageHero />
          <RateLedger />
        </div>

        <MonthBand />

        <div className='tc-rail'>
          <UsageCTA />
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='toolchain' />
    </SmoothScroll>
  );
}
