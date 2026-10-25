import { DirectionCorner } from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { seoRoute } from '@/lib/seo/route';

import { getJobPostings } from '../../singularity/company-sections/careers';
import CareersClose from '../../singularity/company-sections/CareersClose';
import CareersHero from '../../singularity/company-sections/CareersHero';
import OpeningsLedger from '../../singularity/company-sections/OpeningsLedger';
import SiteFooter from '../../singularity/sections/SiteFooter';
import TopNav from '../../singularity/sections/TopNav';

/* no Frameworks on this route — the footer's marks need the sheet directly
   (the toolchain enterprise subpage precedent) */
import '../../singularity/sections/logos-icons.css';
import '../../singularity/styles.css';
import '../../singularity/company-sections/company.css';
import '../styles.css';

const route = seoRoute({
  path: '/d/singularity-dossier/careers',
  title: 'Careers, Dossier',
  kind: 'direction',
  description:
    'The careers page of the Dossier site concept: the open roles from General Translation’s live board in the concept’s type and color.',
});

export const metadata = route.metadata;

/**
 * Careers — the shared company composition in the singularity grammar,
 * wearing the Dossier accent sheet. The live Ashby board is fetched
 * here (the old landing page's own data path) and handed to the shared
 * sections built once under ../../singularity/company-sections.
 */
export default async function SingularityDossierCareersPage() {
  const positions = await getJobPostings();

  return (
    <SmoothScroll>
      <div className='singularity-root sgd-root' id='top'>
        <TopNav />
        <div className='tc-rail'>
          <CareersHero positions={positions} />
          <OpeningsLedger positions={positions} />
          <CareersClose />
          <SiteFooter />
        </div>
      </div>
      <DirectionCorner slug='singularity-dossier' />
    </SmoothScroll>
  );
}
