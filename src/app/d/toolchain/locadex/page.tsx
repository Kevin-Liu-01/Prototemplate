import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

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

export const metadata = {
  title: 'Locadex — the localization agent · GT Toolchain',
  icons: { icon: '/brand/no-bg-locadex-logo-light.png' },
};

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
      <DirectionDock slug='toolchain' />
    </SmoothScroll>
  );
}
