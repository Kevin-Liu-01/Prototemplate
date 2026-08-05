import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import EnterpriseContact from '../../singularity/sections/EnterpriseContact';
import EnterpriseEvidence from '../../singularity/sections/EnterpriseEvidence';
import EnterpriseFrameworks from '../../singularity/sections/EnterpriseFrameworks';
import EnterpriseTestimony from '../../singularity/sections/EnterpriseTestimony';
import Hero from '../../singularity/sections/Hero';
import SiteFooter from '../../singularity/sections/SiteFooter';
import TopNav from '../../singularity/sections/TopNav';

/* no Frameworks on this route — the footer's marks need the sheet directly
   (the toolchain enterprise subpage precedent) */
import '../../singularity/sections/logos-icons.css';
import '../../singularity/styles.css';
import '../../singularity/sections/enterprise.css';
import '../styles.css';

export const metadata = {
  title: 'Enterprise — Observatory — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Singularity · Observatory — the gate, then the same evidence measured
 * from a distance. The shared enterprise composition under the hero, in
 * this final's observatory dress: circular readings in the matrix, the
 * record filed as observation notes — nothing claimed that was not
 * measured.
 */
export default function SingularityObservatoryPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root sgb-root'>
        <TopNav />
        <Hero />
        <EnterpriseContact />
        <div className='tc-rail'>
          <EnterpriseEvidence />
          <EnterpriseFrameworks />
          <EnterpriseTestimony />
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='singularity-observatory' />
    </SmoothScroll>
  );
}
