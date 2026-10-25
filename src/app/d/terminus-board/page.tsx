import { DirectionCorner } from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { directionDescription } from '@/app/directions/descriptions';
import { seoRoute } from '@/lib/seo/route';

/* A fork sheet follows the shared section it styles, so the cascade keeps
   the order the sections are imported in. */
import DarkBand from '@/app/d/toolchain/sections/DarkBand';
import './sections/darkband-v3.css';
import Departures from './sections/Departures';
import FlapPhrase from './sections/FlapPhrase';
import Frameworks from '@/app/d/toolchain/sections/Frameworks';
import './sections/locale-icons.css';
import './sections/chip-consistency.css';
import './sections/logos-icons.css';
import Hero from './sections/Hero';
import Pricing from '@/app/d/toolchain/forks/Pricing';
import ReviewWorkspace from '@/app/d/toolchain/forks/ReviewWorkspace';
import './sections/review-workspace.css';
import SiteFooter from '@/app/d/toolchain/sections/SiteFooter';
import TopNav from '@/app/d/toolchain/forks/TopNav';

import './styles.css';

const route = seoRoute({
  path: '/d/terminus-board',
  title: 'Terminus Board',
  kind: 'direction',
  description: directionDescription('terminus-board'),
});

export const metadata = route.metadata;

/**
 * Direction 19 — Terminus Board. The toolchain shell carrying a split-flap
 * departure board: a flip-wave cell field and a script-riffling headline in
 * the hero, a Departures locales section right after it, and one warm amber
 * phosphor as the page's only hue.
 */
export default function TerminusBoardPage() {
  return (
    <SmoothScroll>
      <div className='terminusboard-root'>
        <TopNav />

        <div className='tc-rail'>
          <Hero />
          <Departures />
          <Frameworks
            title={
              <>
                One toolchain, <FlapPhrase text='every stack.' />
              </>
            }
          />
          <ReviewWorkspace
            title={
              <>
                Edit <FlapPhrase text='in context.' />
              </>
            }
          />
        </div>

        <DarkBand
          cursorEffects={false}
          title={
            <>
              Everything you need, <FlapPhrase text='in one toolchain.' />
            </>
          }
        />

        <div className='tc-rail'>
          <Pricing
            title={
              <>
                Pricing <FlapPhrase text='for everyone.' />
              </>
            }
          />
          <SiteFooter hrefs={{}} />
        </div>
      </div>
      <DirectionCorner slug='terminus-board' />
    </SmoothScroll>
  );
}
