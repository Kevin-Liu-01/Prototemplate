import DirectionCorner from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { seoRoute } from '@/lib/seo/route';

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

const route = seoRoute({
  path: '/d/singularity-orbit/contact',
  title: 'Contact, Orbit',
  kind: 'direction',
  description:
    'The contact page of the Orbit site concept: General Translation’s contact bay rebuilt in the concept’s type and color.',
});

export const metadata = route.metadata;

/**
 * Contact — the shared company composition in the singularity grammar,
 * wearing the Orbit accent sheet. The bay shares its DNA with the
 * enterprise contact band (same ink, same rain, same hairline instruments)
 * but is its own composition under ../../singularity/company-sections.
 */
export default function SingularityOrbitContactPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root sgo-root' id='top'>
        <TopNav />
        <div className='tc-rail'>
          <ContactHero />
        </div>
        <ContactBay />
        <div className='tc-rail'>
          <SiteFooter />
        </div>
      </div>
      <DirectionCorner slug='singularity-orbit' />
    </SmoothScroll>
  );
}
