import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import EnterpriseContact from '../../singularity/sections/EnterpriseContact';
import Hero from '../../singularity/sections/Hero';
import SiteFooter from '../../singularity/sections/SiteFooter';
import TopNav from '../../singularity/sections/TopNav';

import Ledger from '../sections/Ledger';
import Procurement from '../sections/Procurement';
import Testimony from '../sections/Testimony';

/* no Frameworks on this route — the footer's marks need the sheet directly
   (the toolchain enterprise subpage precedent) */
import '../../singularity/sections/logos-icons.css';
import '../../singularity/styles.css';
import '../styles.css';

export const metadata = {
  title: 'Enterprise — Dossier — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Singularity · Dossier — the gate, then the evidence file. No spectacle
 * below the horizon: the case for GT is made the way procurement reads it —
 * sworn statements set as machined typography, a certificate wall for the
 * controls, and an audit ledger of what actually shipped. The aura is
 * restraint: everything measured, ruled, and signed.
 */
export default function SingularityDossierPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root sgd-root'>
        <TopNav />
        <Hero />
        <div className='tc-rail'>
          <Testimony />
        </div>
        <Procurement />
        <div className='tc-rail'>
          <Ledger />
        </div>
        <EnterpriseContact />
        <div className='tc-rail'>
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='singularity-dossier' />
    </SmoothScroll>
  );
}
