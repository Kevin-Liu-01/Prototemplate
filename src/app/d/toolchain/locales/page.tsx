import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import SiteFooter from '../sections/SiteFooter';
import TopNav from '../sections/TopNav';

import Ledger from './sections/Ledger';
import LocalesHero from './sections/LocalesHero';
import Systems from './sections/Systems';

/* no Frameworks on this route — the footer's marks need the sheet directly */
import '../sections/logos-icons.css';
import '../styles.css';
import './locales.css';

export const metadata = {
  title: 'Supported Locales — Toolchain',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Supported Locales, mutated into the toolchain grammar: the old landing
 * page's card grid becomes a data monument — one ruled ledger of every
 * locale the API serves, a stat band derived from the same rows, and the
 * writing-system roll-up on the page's one dark artifact panel. All 120
 * rows come from the exact data path the old page read at runtime
 * (see ./data.ts); nothing on this page is invented.
 */
export default function ToolchainLocalesPage() {
  return (
    <SmoothScroll>
      <div className='toolchain-root'>
        <TopNav />

        <div className='tc-rail'>
          <LocalesHero />
          <Ledger />
          <Systems />
          <SiteFooter />
        </div>
      </div>
      <DirectionDock slug='toolchain' />
    </SmoothScroll>
  );
}
