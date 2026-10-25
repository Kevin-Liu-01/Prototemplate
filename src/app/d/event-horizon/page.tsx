import { DirectionCorner } from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { directionDescription } from '@/app/directions/descriptions';
import { seoRoute } from '@/lib/seo/route';

/* A fork sheet follows the shared section it styles, so the cascade keeps
   the order the sections are imported in. */
import Bento from '@/app/d/toolchain/forks/Bento';
import './diagrams/surface/surface.css';
import './sections/bento-motion.css';
import DarkBand from '@/app/d/toolchain/sections/DarkBand';
import './sections/darkband-v3.css';
import Frameworks from '@/app/d/toolchain/sections/Frameworks';
import './components/icons.css';
import './sections/chip-consistency.css';
import './sections/logos-icons.css';
import Hero from './sections/Hero';
import Pricing from '@/app/d/toolchain/forks/Pricing';
import ReviewWorkspace from '@/app/d/toolchain/forks/ReviewWorkspace';
import './sections/review-workspace.css';
import SiteFooter from '@/app/d/toolchain/sections/SiteFooter';
import Story from '@/app/d/toolchain/forks/Story';
import './sections/story/story.css';
import StoryCinema from '@/app/d/toolchain/forks/StoryCinema';
import TopNav from './sections/TopNav';

import './styles.css';

const route = seoRoute({
  path: '/d/event-horizon',
  title: 'Event Horizon',
  kind: 'direction',
  description: directionDescription('event-horizon'),
});

export const metadata = route.metadata;

/**
 * Event Horizon — the toolchain shell with a warped-wall hero: dense
 * component sheets fill the screen from both edges — row courses locked
 * across every column — and warp into a real event horizon, a purpose-built
 * lensing shader that wraps accretion light around a photon ring and bends
 * the page's own ruled structure into the hole. English source UI drifts in
 * on the left and slips under the ring's glow; the same components emerge on
 * the right translated and locale-stamped — passage through the hole IS the
 * translation. The dark core holds the mark, headline and CTAs light-on-dark,
 * and the locale flag chips orbit the horizon on a dashed rail.
 */
export default function EventHorizonPage() {
  return (
    <SmoothScroll>
      <div className='eventhorizon-root'>
        <TopNav />

        {/* The hero escapes the 1170px rail — the grids run full-bleed from
            both screen edges into the horizon, like the dark band below. */}
        <Hero />

        <div className='tc-rail'>
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
      <DirectionCorner slug='event-horizon' />
    </SmoothScroll>
  );
}
