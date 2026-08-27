import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import MintlifyClose from '../../singularity/company-sections/MintlifyClose';
import MintlifyContent from '../../singularity/company-sections/MintlifyContent';
import MintlifyFaq from '../../singularity/company-sections/MintlifyFaq';
import MintlifyFlow from '../../singularity/company-sections/MintlifyFlow';
import MintlifyHero from '../../singularity/company-sections/MintlifyHero';
import MintlifyLanguages from '../../singularity/company-sections/MintlifyLanguages';
import MintlifySetup from '../../singularity/company-sections/MintlifySetup';
import SiteFooter from '../../singularity/sections/SiteFooter';
import TopNav from '../../singularity/sections/TopNav';

/* no Frameworks on this route — the footer's marks need the sheet directly
   (the toolchain enterprise subpage precedent) */
import '../../singularity/sections/logos-icons.css';
import '../../singularity/styles.css';
import '../../singularity/company-sections/company.css';
import '../../singularity/company-sections/partners.css';
import '../styles.css';

export const metadata = {
  title: 'Mintlify — Dossier — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Mintlify — the partner integration page in the singularity grammar,
 * wearing the Dossier accent sheet. The live page's seven bands are
 * rebuilt once under ../../singularity/company-sections and composed here:
 * masthead and pull-request exhibit, the supported-language sheet, the
 * three-step flow, the MDX exhibit with its capability ledger, the setup
 * record, the questions filed open, and the close on ink.
 */
export default function SingularityDossierMintlifyPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root sgd-root' id='top'>
        <TopNav />
        <div className='tc-rail'>
          <MintlifyHero />
          <MintlifyLanguages />
          <MintlifyFlow />
          <MintlifyContent />
          <MintlifySetup />
          <MintlifyFaq />
        </div>
        <MintlifyClose />
        <div className='tc-rail'>
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='singularity-dossier' />
    </SmoothScroll>
  );
}
