import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import V0Footer from '../../_v0/V0Footer';
import V0Nav from '../../_v0/V0Nav';

import Deploy from '../sections/Deploy';
import PricingCompare from '../sections/PricingCompare';
import PricingHero from '../sections/PricingHero';
import PricingPlanCards from '../sections/PricingPlanCards';

import '../../toolchain/sections/logos-icons.css';
import '../../toolchain/styles.css';
import '../../_v0/v0-pages.css';
import '../sections/pricing.css';

export const metadata = {
  title: 'Pricing — Production — GT Redesign',
  description:
    'The shipped pricing page, reproduced section for section: the hero, the two plans, and the compare board every other direction is measured against.',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * PRODUCTION · PRICING — the shipped page, not a direction.
 *
 * The real /pricing is short. It mounts exactly four things, in this
 * order (apps/landing/src/components/pages/pricing/PricingPage.tsx):
 *
 *   PricingHero        h1 "Pricing", one promise, the Usage Rates link
 *   PlanCards         Starter $0 and Enterprise, Recommended on the latter
 *   #features          "Compare plans" over the shared feature grid
 *   Deploy             the landing page's own closing band, reused as-is
 *
 * Everything a proposal might want to add here — a dry-run receipt, a
 * credits ledger, an FAQ, a testimonial, the rate card itself — the real
 * page does NOT carry: the rates live one route further out, at
 * /pricing/usage, behind the hero's single link. So none of it is here.
 *
 * Chrome: V0Nav and V0Footer, the same pair the concept's landing page
 * mounts — the shipped site serves one nav and one footer from its layout
 * on every route, /pricing included, so the subpage inherits the home
 * page's chrome rather than the singularity finals' TopNav/SiteFooter.
 * The root carries `pricing-root` beside the shell classes exactly as the
 * shipped page's does (`toolchain-root sgdh-root pricing-root`).
 */
export default function ProductionPricingPage() {
  return (
    <SmoothScroll>
      <div
        className='toolchain-root sgdh-root prod-root pricing-root'
        id='top'
      >
        <V0Nav />

        <main className='tc-rail'>
          <PricingHero />
          <PricingPlanCards />
          <PricingCompare />
          <Deploy />
          <V0Footer />
        </main>
      </div>
      <DirectionDock slug='production' />
    </SmoothScroll>
  );
}
