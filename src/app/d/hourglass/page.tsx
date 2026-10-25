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
import TopNav from './sections/TopNav';

import './styles.css';

const route = seoRoute({
  path: '/d/hourglass',
  title: 'Hourglass',
  kind: 'direction',
  description: directionDescription('hourglass'),
});

export const metadata = route.metadata;

/**
 * Version 22 — Hourglass. From the founder's sketch over the dark PortalHero
 * prototype: a full-bleed dark hero where two walls of product-UI cards recede
 * in one-point perspective toward a central vanishing point — English source
 * strings flowing in on the left, locale-stamped translations flowing out on
 * the right — and the negative space between the walls reads as an hourglass
 * pinched to a waist that holds the mark, headline, CTAs, languages, and
 * customer wordmarks. After the hero, the light toolchain shell continues.
 */
export default function HourglassPage() {
  return (
    <SmoothScroll>
      <div className='hourglass-root'>
        <TopNav />

        <Hero />

        <div className='tc-rail'>
          <Frameworks />
          <Bento />
          <ReviewWorkspace />
        </div>

        <DarkBand cursorEffects={false} />

        <div className='tc-rail'>
          <Pricing />
          <SiteFooter hrefs={{}} />
        </div>
      </div>
      <DirectionCorner slug='hourglass' />
    </SmoothScroll>
  );
}
