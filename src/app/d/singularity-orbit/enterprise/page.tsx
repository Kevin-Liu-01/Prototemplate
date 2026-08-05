import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import EnterpriseContact from '../../singularity/sections/EnterpriseContact';
import EnterpriseEvidence from '../../singularity/sections/EnterpriseEvidence';
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
  title: 'Enterprise — Orbit — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Singularity · Orbit — the gate, then gravity as the argument. The shared
 * enterprise composition under the hero, in this final's orbital dress:
 * rounded instruments, the matrix read as a body chart — conversion by
 * gravitational capture.
 */
export default function SingularityOrbitPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root sgo-root'>
        <TopNav />
        <Hero />
        <EnterpriseContact />
        <div className='tc-rail'>
          <EnterpriseEvidence />
          <EnterpriseTestimony />
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='singularity-orbit' />
    </SmoothScroll>
  );
}
