import DirectionCorner from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { directionDescription } from '@/app/directions/descriptions';
import { seoRoute } from '@/lib/seo/route';

import DarkBand from './sections/DarkBand';
import Frameworks from './sections/Frameworks';
import Grammar from './sections/Grammar';
import Hero from './sections/Hero';
import Measure from './sections/Measure';
import Pricing from './sections/Pricing';
import Review from './sections/Review';
import Scripts from './sections/Scripts';
import SiteFooter from './sections/SiteFooter';
import Story from './sections/Story';
import TopNav from './sections/TopNav';

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
          <Review />
        </div>

        <DarkBand />

        <div className='tc-rail'>
          <Pricing />
          <SiteFooter />
        </div>
      </div>
      <DirectionCorner slug='glyph-rain' />
    </SmoothScroll>
  );
}
