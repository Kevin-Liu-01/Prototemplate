import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

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

export const metadata = {
  title: 'Supported Locales — Orbit — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Supported Locales — the shared company composition in the singularity
 * grammar, wearing the Orbit accent sheet. All 120 rows come from
 * the exact data path the old landing page read at runtime; the sections
 * are built once under ../../singularity/company-sections.
 */
export default function SingularityOrbitLocalesPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root sgo-root' id='top'>
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
      <DirectionDock slug='singularity-orbit' />
    </SmoothScroll>
  );
}
