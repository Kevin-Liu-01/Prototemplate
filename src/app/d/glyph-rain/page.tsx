import { DirectionCorner } from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { directionDescription } from '@/app/directions/descriptions';
import { seoRoute } from '@/lib/seo/route';

import DarkBand from './sections/DarkBand';
/* A fork sheet follows the shared section it styles, so the cascade keeps
   the order the sections are imported in. */
import Frameworks from '@/app/d/toolchain/sections/Frameworks';
import './sections/icons.css';
import './sections/chip-consistency.css';
import './sections/logos-icons.css';
import Grammar from './sections/Grammar';
import Hero from './sections/Hero';
import Measure from './sections/Measure';
import Pricing from '@/app/d/toolchain/forks/Pricing';
import ReviewWorkspace from '@/app/d/toolchain/forks/ReviewWorkspace';
import './sections/review-workspace.css';
import Scripts from './sections/Scripts';
import SiteFooter from '@/app/d/toolchain/sections/SiteFooter';
import Story from '@/app/d/toolchain/forks/Story';
import './sections/story/story.css';
import TopNav from '@/app/d/toolchain/forks/TopNav';

import './styles.css';

const route = seoRoute({
  path: '/d/glyph-rain',
  title: 'Glyph Rain',
  kind: 'direction',
  description: directionDescription('glyph-rain'),
});

export const metadata = route.metadata;

/**
 * GLYPH RAIN — the script-led fork of the toolchain frame. The hero is a
 * canvas-2D particle field: glyphs from eight writing systems drifting in
 * depth, condensing into the word "language" one script at a time. The
 * product sections follow the same thesis — measurement, writing systems,
 * locale variants, plurals and direction — inside the ruled column.
 */
export default function GlyphRainPage() {
  return (
    <SmoothScroll>
      <div className='glyphrain-root'>
        <TopNav />

        <div className='tc-rail'>
          <Hero />
          <Frameworks />
          <Measure />
          <Scripts />
          <Grammar />
          <Story />
          <ReviewWorkspace />
        </div>

        <DarkBand />

        <div className='tc-rail'>
          <Pricing />
          <SiteFooter hrefs={{}} />
        </div>
      </div>
      <DirectionCorner slug='glyph-rain' />
    </SmoothScroll>
  );
}
