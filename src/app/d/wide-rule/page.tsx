import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

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
  title: 'Wide Rule — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Wide Rule — heir of the Wide Field still, restated in the ruled-column
 * shell. The first viewport is 100svh of nearly empty paper: one analytic
 * wave-interference band on the 36% axis, a two-line registration with a
 * single circular gate mark, the headline low-left in the field's own
 * destructive-interference null. The section lineup is deliberately sparse —
 * density would fight the void the hero spends the fold on.
 */
export default function WideRulePage() {
  return (
    <SmoothScroll>
      <div className='widerule-root'>
        <TopNav />

        <div className='tc-rail'>
          <Hero />
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
      <DirectionDock slug='wide-rule' />
    </SmoothScroll>
  );
}
