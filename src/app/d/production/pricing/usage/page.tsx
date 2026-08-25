import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import V0Footer from '../../../_v0/V0Footer';
import V0Nav from '../../../_v0/V0Nav';

import UsageRates from '../../sections/UsageRates';

import '../../../toolchain/sections/logos-icons.css';
import '../../../toolchain/styles.css';
import '../../../_v0/v0-pages.css';

export const metadata = {
  title: 'Usage rates — Production — GT Redesign',
  description:
    'Usage rates for translation workflows, Google Slides, context, and the Locadex agent.',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * PRODUCTION — /pricing/usage, the separate usage-rates page the pricing
 * hero links to. On the shipped site this is its own route
 * (apps/landing/src/app/[locale]/(home)/pricing/usage/page.tsx), so it is
 * its own route here too rather than being folded into the pricing page.
 *
 * Chrome: the real page sits in the (home) route group, whose layout wraps
 * every page in the site Header and SiteFooterMount — the same nav and
 * footer the home page carries. So this subpage takes the production
 * landing page's own V0Nav / V0Footer shell, not the TopNav / SiteFooter
 * pair the proposal concepts use for their subpages.
 *
 * The page itself is a thin wrapper, exactly as UsagePricingPage is: one
 * ruled section holding the back link, the hero and the rate card.
 */
export default function ProductionUsageRatesPage() {
  return (
    <SmoothScroll>
      <div className='toolchain-root sgdh-root prod-root pu-root' id='top'>
        <V0Nav />

        <main className='tc-rail'>
          <UsageRates />
          <V0Footer />
        </main>
      </div>
      <DirectionDock slug='production' />
    </SmoothScroll>
  );
}
