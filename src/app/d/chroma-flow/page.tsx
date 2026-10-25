import { DirectionCorner } from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { directionDescription } from '@/app/directions/descriptions';
import { seoRoute } from '@/lib/seo/route';

import Delivery from './sections/Delivery';
/* A fork sheet follows the shared section it styles, so the cascade keeps
   the order the sections are imported in. */
import Frameworks from '@/app/d/toolchain/sections/Frameworks';
import './sections/icons.css';
import './sections/chip-consistency.css';
import './sections/logos-icons.css';
import Hero from './sections/Hero';
import LocadexBand from './sections/LocadexBand';
import PipelineRail from './sections/PipelineRail';
import Pricing from './sections/Pricing';
import ReviewWorkspace from '@/app/d/toolchain/forks/ReviewWorkspace';
import './sections/review-workspace.css';
import SiteFooter from '@/app/d/toolchain/sections/SiteFooter';
import TopNav from '@/app/d/toolchain/forks/TopNav';

import './styles.css';

const route = seoRoute({
  path: '/d/chroma-flow',
  title: 'Chroma Flow',
  kind: 'direction',
  description: directionDescription('chroma-flow'),
});

export const metadata = route.metadata;

/**
 * CHROMA-FLOW — the toolchain frame carrying a new identity. The hero is a
 * curl-noise flow field: every streamline a doubled ink thread at constant
 * gauge, parting around the headline, with one chroma pass where the current
 * runs fast. The sections walk the string's journey in order — the six-station
 * rail (M05), write (frameworks), the Locadex PR dark band (M08), review, and
 * delivery at the edge (M11).
 */
export default function ChromaFlowPage() {
  return (
    <SmoothScroll>
      <div className='chromaflow-root'>
        <TopNav blogHref='#pipeline' enterpriseHref='#locadex' />

        <div className='tc-rail'>
          <Hero />
          <PipelineRail />
          <Frameworks href='#pipeline' />
        </div>

        <LocadexBand />

        <div className='tc-rail'>
          <ReviewWorkspace />
          <Delivery />
          <Pricing />
          <SiteFooter hrefs={{}} />
        </div>
      </div>
      <DirectionCorner slug='chroma-flow' />
    </SmoothScroll>
  );
}
