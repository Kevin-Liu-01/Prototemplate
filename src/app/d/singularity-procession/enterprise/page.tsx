import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import EnterpriseContact from '../../singularity/sections/EnterpriseContact';
import Hero from '../../singularity/sections/Hero';
import SiteFooter from '../../singularity/sections/SiteFooter';
import TopNav from '../../singularity/sections/TopNav';

import Epilogue from '../sections/Epilogue';
import Manifesto from '../sections/Manifesto';
import Monuments from '../sections/Monuments';

/* no Frameworks on this route — the footer's marks need the sheet directly
   (the toolchain enterprise subpage precedent) */
import '../../singularity/sections/logos-icons.css';
import '../../singularity/styles.css';
import '../styles.css';

export const metadata = {
  title: 'Enterprise — Procession — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Singularity · Procession — the gate, then the march. The word-swarm
 * prints the manifesto, the customers pass one at a time as monuments in
 * the dark — each a giant mark, one sentence, one measured line — and the
 * epilogue points the reader at the contact bay. Pure ceremony, spent on
 * conversion.
 */
export default function SingularityProcessionPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root sgp-root'>
        <TopNav />
        <Hero />
        <div className='tc-rail'>
          <Manifesto />
        </div>
        <Monuments />
        <div className='tc-rail'>
          <Epilogue />
        </div>
        <EnterpriseContact />
        <div className='tc-rail'>
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='singularity-procession' />
    </SmoothScroll>
  );
}
