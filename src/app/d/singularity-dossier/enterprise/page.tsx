import SmoothScroll from '@/components/shared/SmoothScroll';

import V0Footer from '../../_v0/V0Footer';
import V0Nav from '../../_v0/V0Nav';
import { StackBoard } from '../pricing/StackBoard';

import EnterpriseContactSection from './sections/EnterpriseContactSection';
import EnterpriseGradeSection from './sections/EnterpriseGradeSection';
import EnterpriseHero from './sections/EnterpriseHero';
import GovernedExplorer from './sections/GovernedExplorer';
import Security from './sections/Security';
import TestimonialSection from './sections/TestimonialSection';

import '../../singularity/styles.css';
import '../../singularity/sections/logos-icons.css';
import '../styles.css';
/* the full-stack board rides the sibling pricing mirror's sheet,
   scoped by the pricing-root class on this page's root — the same
   pairing the gt-cloud enterprise page makes with the pricing page */
import '../pricing/pricing.css';
import './enterprise.css';
import './enterprise-iso.css';
import './port-compat.css';

export const metadata = {
  title: 'Enterprise — Dossier — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Singularity · Dossier — the enterprise page, ported whole from the
 * gt-cloud production build: the ink hero with the contained rain and
 * the customer proof ledger, the quote plate, the ruled contact bay,
 * the pressable full-stack board carried from the pricing mirror,
 * the governance timeline (scroll-lit words, per-card blue lock-ins),
 * the three access instruments in three accents, and the framework
 * coverage strip flooded in the ink rain.
 */
export default function SingularityDossierEnterprisePage() {
  return (
    <SmoothScroll>
      <div className='singularity-root toolchain-root sgd-root sgde-root pricing-root'>
        <V0Nav />
        <div className='tc-rail'>
          <EnterpriseHero />
          <TestimonialSection />
          <EnterpriseContactSection />
          <StackBoard />
          <GovernedExplorer />
          <Security />
          <EnterpriseGradeSection />
          <V0Footer />
        </div>
      </div>
    </SmoothScroll>
  );
}
