import DirectionCorner from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { seoRoute } from '@/lib/seo/route';

import SiteFooter from '../sections/SiteFooter';
import TopNav from '../sections/TopNav';
import '../styles.css';
/* the footer's theme-switched marks and icon sizing live with the shell's
   logo sheet (imported by the home page via Frameworks) — reused, not copied */
import '../sections/logos-icons.css';

import AgentBand from './AgentBand';
import LocadexHero from './LocadexHero';
import Pipeline from './Pipeline';
import './locadex.css';
/* the side-by-side hero and the exploded-run isometric ride their own
   sheets, imported after locadex.css so their overrides win the cascade */
import './locadex-hero2.css';
import './locadex-iso.css';

const route = seoRoute({
  path: '/d/toolchain/locadex',
  title: 'Locadex, Toolchain',
  kind: 'direction',
  description:
    'The Locadex product page of the Toolchain direction: one agent run filed as its exhibits, from transcript to pull request, then the bill.',
});

export const metadata = route.metadata;

/**
 * The Locadex product page in the toolchain grammar: the same ruled column,
 * the same hairline shells, one dark band. The page narrates a single run —
 * push #e4f21c9 through PR #218 — first as a transcript, then as artifacts,
 * then as the bill.
 */
export default function LocadexPage() {
  return (
    <SmoothScroll>
      <div className='toolchain-root'>
        <TopNav />

        <div className='tc-rail'>
          <LocadexHero />
          <Pipeline />
        </div>

        <AgentBand />

        <div className='tc-rail'>
          <SiteFooter />
        </div>
      </div>
      <DirectionCorner slug='toolchain' />
    </SmoothScroll>
  );
}
