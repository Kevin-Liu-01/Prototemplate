import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { directionMetadata } from '@/lib/directions';

import EnterpriseContact from '../../singularity/sections/EnterpriseContact';
import Hero from '../../singularity/sections/Hero';
import SiteFooter from '../../singularity/sections/SiteFooter';
import TopNav from '../../singularity/sections/TopNav';

import Assurance from '../sections/Assurance';
import Intercepts from '../sections/Intercepts';
import TransmissionLog from '../sections/TransmissionLog';

/* no Frameworks on this route — the footer's marks need the sheet directly
   (the toolchain enterprise subpage precedent) */
import '../../singularity/sections/logos-icons.css';
import '../../singularity/styles.css';
import '../styles.css';

export const metadata = directionMetadata('singularity-signal', 'enterprise');

/**
 * Singularity · Signal — the gate, then the broadcast. What comes out of
 * the horizon is a signal: customer intercepts on paper, a live rollout
 * log typing itself out over raining glyphs with the beam running under
 * it, and the assurance strip for the people who sign. The aura is a
 * control room, not a brochure.
 */
export default function SingularitySignalPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root sgs-root'>
        <TopNav />
        <Hero />
        <div className='tc-rail'>
          <Intercepts />
        </div>
        <TransmissionLog />
        <div className='tc-rail'>
          <Assurance />
        </div>
        <EnterpriseContact />
        <div className='tc-rail'>
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='singularity-signal' />
    </SmoothScroll>
  );
}
