import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import DirectionCorner from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { seoRoute } from '@/lib/seo/route';

import ProdFooter from '../../sections/ProdFooter';
import ProdNav from '../../sections/ProdNav';
import UsagePricing from '../../sections/UsagePricing';

import '../../../toolchain/sections/logos-icons.css';
import '../../../toolchain/styles.css';
import '../../../_v0/v0-pages.css';
import '../../sections/pricing.css';
import '../../sections/usage-pricing.css';

const route = seoRoute({
  path: '/d/production/pricing/usage',
  title: 'Usage rates',
  section: 'Shipped',
  kind: 'mirror',
  description:
    'Usage rates for translation workflows, Google Slides, context, and the Locadex agent.',
});

export const metadata = route.metadata;

/**
 * PRODUCTION · USAGE RATES: generaltranslation.com/pricing/usage.
 *
 * The live page (apps/landing/src/components/pages/pricing/
 * UsagePricingPage.tsx) is one section on the rail: Back to Pricing, the
 * Usage rates head with its Contact us link, then the shared UsagePricing
 * body. The root carries `toolchain-root sgdh-root pricing-root
 * usage-pricing-root` as live's does; pricing.css brings the help bubble
 * and the emphasis ink, usage-pricing.css the page's own rules. The
 * (home) layout supplies the header and the footer, which here are
 * ProdNav and ProdFooter.
 */
export default function ProductionUsagePricingPage() {
  return (
    <SmoothScroll>
      <div className='toolchain-root sgdh-root prod-root pricing-root usage-pricing-root'>
        <ProdNav />

        <main className='tc-rail'>
          <section className='tc-sec usage-pricing-page'>
            <div className='usage-back'>
              <Link href='/d/production/pricing'>
                <ArrowLeft aria-hidden />
                Back to Pricing
              </Link>
            </div>
            <header className='usage-pricing-hero'>
              <div className='usage-pricing-hero-inner'>
                <h1>Usage rates</h1>
                <p>
                  Usage-based pricing for General Translation&apos;s standard workflows.
                  <br />
                  <Link href='/d/production/enterprise/contact'>Contact us</Link> for custom pricing.
                </p>
              </div>
            </header>
            <div className='usage-pricing-content'>
              <UsagePricing />
            </div>
          </section>
          <ProdFooter />
        </main>
      </div>
      <DirectionCorner slug='production' />
    </SmoothScroll>
  );
}
