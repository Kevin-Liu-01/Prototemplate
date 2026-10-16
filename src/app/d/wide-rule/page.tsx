import DirectionCorner from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { directionDescription } from '@/app/directions/descriptions';
import { seoRoute } from '@/lib/seo/route';

import DarkBand from './sections/DarkBand';
import Frameworks from './sections/Frameworks';
import Hero from './sections/Hero';
import Pricing from './sections/Pricing';
import Review from './sections/Review';
import SiteFooter from './sections/SiteFooter';
import Story from './sections/Story';
import TopNav from './sections/TopNav';

import './styles.css';

const route = seoRoute({
  path: '/d/wide-rule',
  title: 'Wide Rule',
  kind: 'direction',
  description: directionDescription('wide-rule'),
});

export const metadata = route.metadata;

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
      <DirectionCorner slug='wide-rule' />
    </SmoothScroll>
  );
}
