import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import Bento from './sections/Bento';
import DarkBand from './sections/DarkBand';
import Frameworks from './sections/Frameworks';
import Hero from './sections/Hero';
import Pricing from './sections/Pricing';
import Review from './sections/Review';
import SiteFooter from './sections/SiteFooter';
import Story from './sections/Story';
import TopNav from './sections/TopNav';

import './styles.css';

export const metadata = {
  title: 'Paper Foundry — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Paper Foundry — the machine shop translated onto paper. The toolchain shell
 * (ruled column, hairline structure, weight cap 500) carries a hero cut as one
 * machined plate: hairline bento cells over an anisotropic brushed-graphite
 * sheen, the headline cell's grain flipped 90°, parts seated in reading order
 * with one gloss sweep each. Features-forward: the bento leads right after the
 * hero, entering under the same cascade discipline.
 */
export default function PaperFoundryPage() {
  return (
    <SmoothScroll>
      <div className='paperfoundry-root'>
        <TopNav />

        <div className='tc-rail'>
          <Hero />
          <Bento />
          <Frameworks />
          <Story />
          <Review />
        </div>

        <DarkBand />

        <div className='tc-rail'>
          <Pricing />
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='paper-foundry' />
    </SmoothScroll>
  );
}
