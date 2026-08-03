import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import EnterpriseContact from '../singularity/sections/EnterpriseContact';
import Hero from '../singularity/sections/Hero';
import SiteFooter from '../singularity/sections/SiteFooter';
import TopNav from '../singularity/sections/TopNav';

import Assurance from './sections/Assurance';
import Intercepts from './sections/Intercepts';
import TransmissionLog from './sections/TransmissionLog';

import '../singularity/styles.css';
import './styles.css';

export const metadata = {
  title: 'Singularity · Signal — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

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
