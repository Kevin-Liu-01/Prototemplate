import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import EnterpriseContact from '../../singularity/sections/EnterpriseContact';
import Hero from '../../singularity/sections/Hero';
import SiteFooter from '../../singularity/sections/SiteFooter';
import TopNav from '../../singularity/sections/TopNav';

import GravityWell from '../sections/GravityWell';
import Instruments from '../sections/Instruments';
import Witness from '../sections/Witness';

import '../../singularity/styles.css';
import '../styles.css';

export const metadata = {
  title: 'Enterprise — Orbit — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Singularity · Orbit — the gate, then gravity as the argument. The proof
 * sections stay in the hero's physics: delivery metrics read as instrument
 * dials, the customers ride a real orbit around a second, smaller horizon,
 * and one witness speaks from inside the well. Conversion by gravitational
 * capture.
 */
export default function SingularityOrbitPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root sgo-root'>
        <TopNav />
        <Hero />
        <div className='tc-rail'>
          <Instruments />
        </div>
        <GravityWell />
        <div className='tc-rail'>
          <Witness />
        </div>
        <EnterpriseContact />
        <div className='tc-rail'>
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='singularity-orbit' />
    </SmoothScroll>
  );
}
