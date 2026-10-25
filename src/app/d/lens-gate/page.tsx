import DirectionCorner from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { directionDescription } from '@/app/directions/descriptions';
import { seoRoute } from '@/lib/seo/route';

/* A fork sheet follows the shared section it styles, so the cascade keeps
   the order the sections are imported in. */
import Bento from '@/app/d/toolchain/forks/Bento';
import './sections/bento-motion.css';
import './diagrams/surface/surface.css';
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
import SiteFooter from '@/app/d/toolchain/sections/SiteFooter';
import Story from '@/app/d/toolchain/forks/Story';
import './sections/story/story.css';
import StoryCinema from './sections/StoryCinema';
import TopNav from '@/app/d/toolchain/forks/TopNav';
import Transit from './sections/Transit';

import './styles.css';

const route = seoRoute({
  path: '/d/lens-gate',
  title: 'Lens Gate',
  kind: 'direction',
  description: directionDescription('lens-gate'),
});

export const metadata = route.metadata;

/**
 * Lens Gate — the toolchain shell with the Concrete Origin identity refracted
 * into it: the hero's ruled hairlines pass through one breathing glass lens,
 * and a slim transit strip carries the EN→locale narrative across a seam.
 */
export default function LensGatePage() {
  return (
    <SmoothScroll>
      <div className='lensgate-root'>
        <TopNav />

        <div className='tc-rail'>
          <Hero />
          <Transit />
          <Frameworks />
          <Bento />
          <Story />
          <StoryCinema />
          <ReviewWorkspace />
        </div>

        <DarkBand cursorEffects={false} />

        <div className='tc-rail'>
          <Pricing />
          <SiteFooter hrefs={{}} />
        </div>
      </div>
      <DirectionCorner slug='lens-gate' />
    </SmoothScroll>
  );
}
