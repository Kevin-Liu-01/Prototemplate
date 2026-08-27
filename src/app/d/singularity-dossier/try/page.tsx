import DirectionDock from '@/components/shared/DirectionDock';
import SmoothScroll from '@/components/shared/SmoothScroll';

import V0Footer from '../../_v0/V0Footer';
import V0Nav from '../../_v0/V0Nav';

import TryPage from '@/components/try/TryPage';

import '../../toolchain/styles.css';
import '@/components/try/try.css';
import '../../_v0/v0-pages.css';

export const metadata = {
  title: 'Report card',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * Singularity · Dossier — the localization report card. The production
 * /try page in the dossier shell: the glyph-field hero with the URL form
 * and the satellite figure, a hatch strip, then the graded report as a
 * framed artifact, between the shared V0 nav and footer. No pre-boot
 * js-arm stamp: the home arms its veiled hero sections with it, and this
 * page ships none — every animation here starts from a client state.
 */
export default function Page() {
  return (
    <SmoothScroll>
      <div className='toolchain-root sgdh-root try-root'>
        <V0Nav />
        <main className='tc-rail try-rail'>
          <TryPage />
          <V0Footer />
        </main>
      </div>
      <DirectionDock slug='singularity-dossier' />
    </SmoothScroll>
  );
}
