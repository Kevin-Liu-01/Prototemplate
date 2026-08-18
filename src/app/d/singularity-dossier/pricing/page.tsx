import SmoothScroll from '@/components/shared/SmoothScroll';

import V0Footer from '../../_v0/V0Footer';
import V0Nav from '../../_v0/V0Nav';

import CloseBand from './CloseBand';
import CompareTable from './CompareTable';
import GroupLabelHandoff from './GroupLabelHandoff';
import PlanCards from './PlanCards';
import PricingHero from './PricingHero';

/* no Frameworks on this route — the footer's marks need the sheet directly
   (the toolchain enterprise subpage precedent) */
import '../../singularity/sections/logos-icons.css';
import '../../singularity/styles.css';
import '../styles.css';
import './pricing.css';

export const metadata = {
  title: 'Pricing — Dossier — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Singularity · Dossier — the pricing page ported whole from the live
 * redesign: the money-weather hero, the two plans on the full-bleed
 * grid, the framed compare ledger directly under the plans (one
 * hairline between them), and the shared deploy close — the glyph
 * condensation field beside a single ask. The full-stack board left
 * this page for the enterprise mirror, which still imports it (and
 * this sheet) from this directory.
 */
export default function DossierPricingPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root toolchain-root sgd-root pricing-root'>
        <V0Nav />
        <div className='tc-rail'>
          <PricingHero />
          <PlanCards />
          <CompareTable />
          <GroupLabelHandoff />
        </div>
        <CloseBand />
        <div className='tc-rail'>
          <V0Footer />
        </div>
      </div>
    </SmoothScroll>
  );
}
