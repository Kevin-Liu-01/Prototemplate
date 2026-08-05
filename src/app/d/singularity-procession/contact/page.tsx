import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import ContactBay from '../../singularity/company-sections/ContactBay';
import ContactHero from '../../singularity/company-sections/ContactHero';
import SiteFooter from '../../singularity/sections/SiteFooter';
import TopNav from '../../singularity/sections/TopNav';

/* no Frameworks on this route — the footer's marks need the sheet directly
   (the toolchain enterprise subpage precedent) */
import '../../singularity/sections/logos-icons.css';
import '../../singularity/styles.css';
import '../../singularity/company-sections/company.css';
import '../styles.css';

export const metadata = {
  title: 'Contact — Procession — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Contact — the shared company composition in the singularity grammar,
 * wearing the Procession accent sheet. The bay shares its DNA with the
 * enterprise contact band (same ink, same rain, same hairline instruments)
 * but is its own composition under ../../singularity/company-sections.
 */
export default function SingularityProcessionContactPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root sgp-root' id='top'>
        <TopNav />
        <div className='tc-rail'>
          <ContactHero />
        </div>
        <ContactBay />
        <div className='tc-rail'>
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='singularity-procession' />
    </SmoothScroll>
  );
}
