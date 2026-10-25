import DirectionCorner from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { directionDescription } from '@/app/directions/descriptions';
import { seoRoute } from '@/lib/seo/route';

import Bento from './sections/Bento';
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
import SiteFooter from '@/app/d/toolchain/sections/SiteFooter';
import Story from '@/app/d/toolchain/forks/Story';
import './sections/story/story.css';
import TopNav from '@/app/d/toolchain/forks/TopNav';

import './styles.css';

const route = seoRoute({
  path: '/d/paper-foundry',
  title: 'Paper Foundry',
  kind: 'direction',
  description: directionDescription('paper-foundry'),
});

export const metadata = route.metadata;

/**
 * Paper Foundry — the machine shop translated onto paper. The toolchain shell
 * (ruled column, hairline structure, weight cap 500) carries the founder hero
 * stack — white headline card with the morphing-word hinge, then the visual
 * band cut as one machined plate: hairline bento cells over an anisotropic
 * brushed-graphite sheen, the lead cell's grain flipped 90°, parts seated in
 * reading order with one gloss sweep each — then the trust card. Features-
 * forward: the bento leads right after the hero, entering under the same
 * cascade discipline.
 */
export default function PaperFoundryPage() {
  return (
    <SmoothScroll>
      <div className='paperfoundry-root'>
        <TopNav />

        <div className='tc-rail'>
          <Hero />
          <Bento />
          <Frameworks />
          <Story />
          <ReviewWorkspace />
        </div>

        <DarkBand cursorEffects={false} />

        <div className='tc-rail'>
          <Pricing />
          <SiteFooter hrefs={{}} />
        </div>
      </div>
      <DirectionCorner slug='paper-foundry' />
    </SmoothScroll>
  );
}
