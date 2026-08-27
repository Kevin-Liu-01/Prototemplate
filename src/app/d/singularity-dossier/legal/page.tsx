import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import LegalLedger from '../../singularity/company-sections/LegalLedger';
import LegalMasthead from '../../singularity/company-sections/LegalMasthead';
import SiteFooter from '../../singularity/sections/SiteFooter';
import TopNav from '../../singularity/sections/TopNav';

/* no Frameworks on this route — the footer's marks need the sheet directly
   (the toolchain enterprise subpage precedent) */
import '../../singularity/sections/logos-icons.css';
import '../../singularity/styles.css';
import '../../singularity/company-sections/company.css';
import '../../singularity/company-sections/legal.css';
import '../styles.css';

export const metadata = {
  title: 'Legal — Dossier — GT Redesign',
  description: 'Policies, terms, and data processing information for General Translation.',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Legal Resources — the index of the published legal library, in the
 * singularity grammar wearing the Dossier accent sheet. The sections are built
 * once under ../../singularity/company-sections; this wrapper only sets the
 * root.
 */
export default function SingularityDossierLegalPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root sgd-root' id='top'>
        <TopNav />
        <div className='tc-rail'>
          <LegalMasthead />
          <LegalLedger />
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='singularity-dossier' />
    </SmoothScroll>
  );
}
