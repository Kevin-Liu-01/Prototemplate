import DirectionCorner from '@/components/viewer/DirectionCorner';
import SmoothScroll from '@/components/shared/SmoothScroll';
import { seoRoute } from '@/lib/seo/route';

import SiteFooter from '../sections/SiteFooter';
import TopNav from '../sections/TopNav';

import Ledger from './sections/Ledger';
import LocalesHero from './sections/LocalesHero';
import Systems from './sections/Systems';

/* no Frameworks on this route — the footer's marks need the sheet directly */
import '../sections/logos-icons.css';
import '../styles.css';
import './locales.css';

const route = seoRoute({
  path: '/d/toolchain/locales',
  title: 'Supported locales, Toolchain',
  kind: 'direction',
  description:
    'The supported locales page of the Toolchain direction: every language General Translation supports, read from the live data.',
});

export const metadata = route.metadata;

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
      <DirectionCorner slug='toolchain' />
    </SmoothScroll>
  );
}
