import DirectionCorner from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { seoRoute } from '@/lib/seo/route';

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

const route = seoRoute({
  path: '/d/singularity-dossier/legal',
  title: 'Legal, Dossier',
  kind: 'direction',
  description:
    'The legal library of the Dossier site concept: General Translation’s policies, terms and data processing documents in one index.',
});

export const metadata = route.metadata;

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
      <DirectionCorner slug='singularity-dossier' />
    </SmoothScroll>
  );
}
