import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import SiteFooter from '../../singularity/sections/SiteFooter';
import TopNav from '../../singularity/sections/TopNav';

import CloseBand from './CloseBand';
import CompareTable from './CompareTable';
import GroupLabelHandoff from './GroupLabelHandoff';
import PlanCards from './PlanCards';
import PricingHero from './PricingHero';
import { StackBoard } from './StackBoard';

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
 * grid, the pressable full-stack board wired straight to its expanded
 * platform, the framed compare ledger under the ¥€$ motif, and the
 * condensation close raining the world's currencies.
 */
export default function DossierPricingPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root sgd-root pricing-root'>
        <TopNav />
        <div className='tc-rail'>
          <PricingHero />
          <PlanCards />
          <StackBoard />
          <CompareTable />
          <GroupLabelHandoff />
        </div>
        <CloseBand />
        <div className='tc-rail'>
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='singularity-dossier' />
    </SmoothScroll>
  );
}
