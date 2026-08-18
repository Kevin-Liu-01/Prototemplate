import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import SmoothScroll from '@/components/shared/SmoothScroll';

import V0Footer from '../../../_v0/V0Footer';
import V0Nav from '../../../_v0/V0Nav';

import UsagePricing from './UsagePricing';

/* no Frameworks on this route — the footer's marks need the sheet directly
   (the toolchain enterprise subpage precedent) */
import '../../../singularity/sections/logos-icons.css';
import '../../../singularity/styles.css';
import '../../styles.css';
import './usage.css';

export const metadata = {
  title: 'Usage Pricing — Dossier — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Singularity · Dossier — the usage-pricing page, mirroring the live
 * /pricing/usage: back link, the Workflow rates hero, then the shared
 * UsagePricing content — base-rates table under the scroll-shadow
 * wrapper, additional rates, worked examples with help tooltips, and
 * the Locadex LCU card — as a local static copy in the dossier dress.
 */
export default function DossierUsagePricingPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root toolchain-root sgd-root sgu-root'>
        <V0Nav />
        <main className='tc-rail'>
          <section className='tc-sec'>
            <div className='sgu-back'>
              <Link href='/d/singularity-dossier/pricing'>
                <ArrowLeft aria-hidden />
                Back to Pricing
              </Link>
            </div>
            <header className='sgu-hero'>
              <div className='sgu-hero-inner'>
                <h1>Workflow rates</h1>
                <p>
                  Usage-based pricing for General Translation&rsquo;s standard
                  workflows.
                  <br />
                  <Link href='/d/singularity-dossier/contact'>
                    Contact us
                  </Link>{' '}
                  for custom pricing.
                </p>
              </div>
            </header>
            <div className='sgu-content'>
              <UsagePricing />
            </div>
          </section>
          <V0Footer />
        </main>
      </div>
    </SmoothScroll>
  );
}
