import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import EnterpriseContact from '../singularity/sections/EnterpriseContact';
import Hero from '../singularity/sections/Hero';
import SiteFooter from '../singularity/sections/SiteFooter';
import TopNav from '../singularity/sections/TopNav';

import Catalog from './sections/Catalog';
import Observation from './sections/Observation';
import Readouts from './sections/Readouts';

import '../singularity/styles.css';
import './styles.css';

export const metadata = {
  title: 'Singularity · Observatory — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Singularity · Observatory — the gate, then the evidence measured from a
 * distance. Delivery observed on the meridian globe, the customers filed
 * as a star catalog with their statements as observation notes, and the
 * closing readouts row. The page convinces the way an observatory does:
 * nothing is claimed that was not measured.
 */
export default function SingularityObservatoryPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root sgb-root'>
        <TopNav />
        <Hero />
        <div className='tc-rail'>
          <Observation />
        </div>
        <Catalog />
        <div className='tc-rail'>
          <Readouts />
        </div>
        <EnterpriseContact />
        <div className='tc-rail'>
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='singularity-observatory' />
    </SmoothScroll>
  );
}
