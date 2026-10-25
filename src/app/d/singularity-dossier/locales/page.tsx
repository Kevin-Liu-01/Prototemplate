import { DirectionCorner } from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { seoRoute } from '@/lib/seo/route';

import LocaleLedger from '../../singularity/company-sections/LocaleLedger';
import LocalesHero from '../../singularity/company-sections/LocalesHero';
import WritingSystems from '../../singularity/company-sections/WritingSystems';
import SiteFooter from '../../singularity/sections/SiteFooter';
import TopNav from '../../singularity/sections/TopNav';

/* no Frameworks on this route — the footer's marks need the sheet directly
   (the toolchain enterprise subpage precedent) */
import '../../singularity/sections/logos-icons.css';
import '../../singularity/styles.css';
import '../../singularity/company-sections/company.css';
import '../styles.css';

const route = seoRoute({
  path: '/d/singularity-dossier/locales',
  title: 'Supported locales, Dossier',
  kind: 'direction',
  description:
    'The supported locales page of the Dossier site concept: every language General Translation supports, read from the live data.',
});

export const metadata = route.metadata;

/**
 * Supported Locales — the shared company composition in the singularity
 * grammar, wearing the Dossier accent sheet. All 120 rows come from
 * the exact data path the old landing page read at runtime; the sections
 * are built once under ../../singularity/company-sections.
 */
export default function SingularityDossierLocalesPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root sgd-root' id='top'>
        <TopNav />
        <div className='tc-rail'>
          <LocalesHero />
          <LocaleLedger />
        </div>
        <WritingSystems />
        <div className='tc-rail'>
          <SiteFooter />
        </div>
      </div>
      <DirectionCorner slug='singularity-dossier' />
    </SmoothScroll>
  );
}
