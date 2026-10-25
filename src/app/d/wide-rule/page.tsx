import DirectionCorner from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { directionDescription } from '@/app/directions/descriptions';
import { seoRoute } from '@/lib/seo/route';

/* A fork sheet follows the shared section it styles, so the cascade keeps
   the order the sections are imported in. */
import DarkBand from '@/app/d/toolchain/sections/DarkBand';
import './sections/darkband-v3.css';
import Frameworks from '@/app/d/toolchain/sections/Frameworks';
import './sections/icons.css';
import './sections/chip-consistency.css';
import './sections/logos-icons.css';
import Hero from './sections/Hero';
import Pricing from '@/app/d/toolchain/forks/Pricing';
import ReviewWorkspace from '@/app/d/toolchain/forks/ReviewWorkspace';
import './sections/review-workspace.css';
import SiteFooter from './sections/SiteFooter';
import Story from '@/app/d/toolchain/forks/Story';
import './sections/story/story.css';
import TopNav from '@/app/d/toolchain/forks/TopNav';

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
        <TopNav blogHref='#toolchain' enterpriseHref='#toolchain' />

        <div className='tc-rail'>
          <Hero />
          <Frameworks href='#toolchain' />
          <Story />
          <ReviewWorkspace />
        </div>

        <DarkBand cursorEffects={false} />

        <div className='tc-rail'>
          <Pricing />
          <SiteFooter />
        </div>
      </div>
      <DirectionCorner slug='wide-rule' />
    </SmoothScroll>
  );
}
