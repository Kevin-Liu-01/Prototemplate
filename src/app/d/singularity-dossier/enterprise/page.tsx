import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import SiteFooter from '../../singularity/sections/SiteFooter';
import TopNav from '../../singularity/sections/TopNav';

import EnterpriseContactSection from './sections/EnterpriseContactSection';
import EnterpriseGradeSection from './sections/EnterpriseGradeSection';
import EnterpriseHero from './sections/EnterpriseHero';
import GovernedExplorer from './sections/GovernedExplorer';
import Security from './sections/Security';
import TestimonialSection from './sections/TestimonialSection';

import '../../singularity/styles.css';
import '../../singularity/sections/logos-icons.css';
import '../styles.css';
import './enterprise.css';
import './enterprise-iso.css';

export const metadata = {
  title: 'Enterprise — Dossier — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Singularity · Dossier — the enterprise page, ported whole from the
 * gt-cloud production build: the ink hero with the contained rain and
 * the customer proof ledger, the quote plate, the ruled contact bay,
 * the governance timeline (scroll-lit words, per-card blue lock-ins),
 * the three access instruments in three accents, and the framework
 * coverage strip flooded in the ink rain.
 */
export default function SingularityDossierEnterprisePage() {
  return (
    <SmoothScroll>
      <div className='singularity-root sgd-root sgde-root'>
        <TopNav />
        <div className='tc-rail'>
          <EnterpriseHero />
          <TestimonialSection />
          <EnterpriseContactSection />
          <GovernedExplorer />
          <Security />
          <EnterpriseGradeSection />
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='singularity-dossier' />
    </SmoothScroll>
  );
}
