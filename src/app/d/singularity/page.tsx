import { DirectionCorner } from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { directionDescription } from '@/app/directions/descriptions';
import { seoRoute } from '@/lib/seo/route';

/* A fork sheet follows the shared section it styles, so the cascade keeps
   the order the sections are imported in. */
import Bento from '@/app/d/toolchain/forks/Bento';
import './sections/bento-motion.css';
import './diagrams/surface/surface.css';
import DarkBand from '@/app/d/toolchain/sections/DarkBand';
import GlyphRain from './sections/GlyphRain';
import './sections/darkband-v3.css';
import EnterpriseContact from './sections/EnterpriseContact';
import Frameworks from '@/app/d/toolchain/sections/Frameworks';
import './components/icons.css';
import './sections/chip-consistency.css';
import './sections/logos-icons.css';
import Hero from './sections/Hero';
import Pricing from '@/app/d/toolchain/forks/Pricing';
import ReviewWorkspace from '@/app/d/toolchain/forks/ReviewWorkspace';
import './sections/review-workspace.css';
import SiteFooter from './sections/SiteFooter';
import Story from '@/app/d/toolchain/forks/Story';
import './sections/story/story.css';
import StoryCinema from '@/app/d/toolchain/forks/StoryCinema';
import TopNav from './sections/TopNav';

import './styles.css';
import './bay-phone.css';

const route = seoRoute({
  path: '/d/singularity',
  title: 'Singularity',
  kind: 'direction',
  description: directionDescription('singularity'),
});

export const metadata = route.metadata;

/**
 * Singularity — the event-horizon fork with the component walls removed.
 * The hero is the gate alone: the lensing shader wraps accretion light
 * around a photon ring and bends the page's own ruled structure into the
 * hole, over otherwise empty paper. The dark core holds the mark, headline
 * and CTAs light-on-dark, and the locale flag chips orbit the horizon on a
 * dashed rail — nothing else competes with the mass.
 */
export default function SingularityPage() {
  return (
    <SmoothScroll>
      <div className='singularity-root'>
        <TopNav />

        {/* The hero escapes the 1170px rail — the horizon and its orbit sit
            on full-bleed paper, and the contact bay lands directly under
            the gate: the CTAs' destination before anything else. */}
        <Hero />
        <EnterpriseContact />

        <div className='tc-rail'>
          <Frameworks />
          <Bento />
          <Story />
          <StoryCinema />
          <ReviewWorkspace />
        </div>

        <DarkBand
          cursorEffects={false}
          backdrop={<GlyphRain className='tcb-rain' intensity={0.55} />}
        />

        <div className='tc-rail'>
          <Pricing />
          <SiteFooter />
        </div>
      </div>
      <DirectionCorner slug='singularity' />
    </SmoothScroll>
  );
}
