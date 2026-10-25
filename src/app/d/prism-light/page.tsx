import { DirectionCorner } from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { directionDescription } from '@/app/directions/descriptions';
import { seoRoute } from '@/lib/seo/route';

/* A fork sheet follows the shared section it styles, so the cascade keeps
   the order the sections are imported in. */
import DarkBand from '@/app/d/toolchain/sections/DarkBand';
import './sections/darkband-v3.css';
import Delivery from './sections/Delivery';
import Frameworks from '@/app/d/toolchain/sections/Frameworks';
import './sections/icons.css';
import './sections/chip-consistency.css';
import './sections/logos-icons.css';
import Hero from './sections/Hero';
import Pricing from '@/app/d/toolchain/forks/Pricing';
import ReviewWorkspace from '@/app/d/toolchain/forks/ReviewWorkspace';
import './sections/review-workspace.css';
import SiteFooter from '@/app/d/toolchain/sections/SiteFooter';
import Story from '@/app/d/toolchain/forks/Story';
import './sections/story/story.css';
import TopNav from '@/app/d/toolchain/forks/TopNav';

import './styles.css';

const route = seoRoute({
  path: '/d/prism-light',
  title: 'Prism Light',
  kind: 'direction',
  description: directionDescription('prism-light'),
});

export const metadata = route.metadata;

/**
 * Version 10 — the minimalist option. One ruled column carries the whole page;
 * the only full-bleed break in it is the single dark band before pricing.
 */
export default function ToolchainPage() {
  return (
    <SmoothScroll>
      <div className='prismlight-root'>
        <TopNav />

        <div className='tc-rail'>
          <Hero />
          <Frameworks />
          <Delivery />
          <Story />
          <ReviewWorkspace />
        </div>

        <DarkBand cursorEffects={false} />

        <div className='tc-rail'>
          <Pricing />
          <SiteFooter hrefs={{}} />
        </div>
      </div>
      <DirectionCorner slug='prism-light' />
    </SmoothScroll>
  );
}
