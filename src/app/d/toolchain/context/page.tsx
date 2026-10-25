import { DirectionCorner } from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { seoRoute } from '@/lib/seo/route';

import SiteFooter from '../sections/SiteFooter';
import TopNav from '../sections/TopNav';

import ContextCTA from './sections/ContextCTA';
import ContextHero from './sections/ContextHero';
import Controls from './sections/Controls';
import GroupBand from './sections/GroupBand';
import Signals from './sections/Signals';

/* no Frameworks on this route — the footer's marks need the sheet directly */
import '../sections/logos-icons.css';
import '../styles.css';
import './context.css';

const route = seoRoute({
  path: '/d/toolchain/context',
  title: 'Context, Toolchain',
  kind: 'direction',
  description:
    'The Context product page of the Toolchain direction: how General Translation reads context, from the context attribute to Context Groups.',
});

export const metadata = route.metadata;

/**
 * The Context product page — the toolchain direction's deep page for the
 * `context=` attribute, glossaries, directives, code signals, and Context
 * Groups. Same ruled column, same one full-bleed dark band; the band here
 * is the group accumulator: sources in, translations out, on the brand's
 * doubled thread.
 */
export default function ToolchainContextPage() {
  return (
    <SmoothScroll>
      <div className='toolchain-root'>
        <TopNav />

        <div className='tc-rail'>
          <ContextHero />
          <Signals />
        </div>

        <GroupBand />

        <div className='tc-rail'>
          <Controls />
          <ContextCTA />
          <SiteFooter />
        </div>
      </div>
      <DirectionCorner slug='toolchain' />
    </SmoothScroll>
  );
}
