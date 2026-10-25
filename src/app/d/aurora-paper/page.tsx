import { DirectionCorner } from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { directionDescription } from '@/app/directions/descriptions';
import { seoRoute } from '@/lib/seo/route';

import Bento from './sections/Bento';
import ContextGroups from './sections/ContextGroups';
import DarkBand from './sections/DarkBand';
import Editor from './sections/Editor';
/* A fork sheet follows the shared section it styles, so the cascade keeps
   the order the sections are imported in. */
import Frameworks from '@/app/d/toolchain/sections/Frameworks';
import './sections/icons.css';
import './sections/chip-consistency.css';
import './sections/logos-icons.css';
import Hero from './sections/Hero';
import Platform from './sections/Platform';
import Pricing from '@/app/d/toolchain/forks/Pricing';
import Proof from './sections/Proof';
import ReviewFlow from './sections/ReviewFlow';
import SiteFooter from '@/app/d/toolchain/sections/SiteFooter';
import TopNav from '@/app/d/toolchain/forks/TopNav';

import './styles.css';

const route = seoRoute({
  path: '/d/aurora-paper',
  title: 'Aurora Paper',
  kind: 'direction',
  description: directionDescription('aurora-paper'),
});

export const metadata = route.metadata;

/**
 * AURORA PAPER — the toolchain frame with a new identity. The material is a
 * soft aurora on paper (lib/aurora-wash.ts): barely-there chroma breathing
 * through the hero card, at full exposure on the specimen band, the same
 * field turned to ink for the one dark band (and, in dark mode, retuned to a
 * northern sky on ink-black paper). The sections are workspace-led — the
 * editor grid, the review flow, the dashboard ledger, and context groups —
 * with the founder-batch bento carrying the systems story between them.
 */
export default function AuroraPaperPage() {
  return (
    <SmoothScroll>
      <div className='aurorapaper-root'>
        <TopNav />

        <div className='tc-rail'>
          <Hero />
          <Frameworks />
          <Bento />
          <Editor />
          <ReviewFlow />
          <Platform />
          <ContextGroups />
          <Proof />
        </div>

        <DarkBand />

        <div className='tc-rail'>
          <Pricing />
          <SiteFooter hrefs={{}} />
        </div>
      </div>
      <DirectionCorner slug='aurora-paper' />
    </SmoothScroll>
  );
}
