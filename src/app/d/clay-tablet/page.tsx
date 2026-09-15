import type { Metadata } from 'next';
import { Forum } from 'next/font/google';

import DirectionCorner from '@/components/viewer/DirectionCorner';

import CaseFooter from './sections/CaseFooter';
import CaseNav from './sections/CaseNav';
import HeroTablet from './sections/HeroTablet';
import PricingTablets from './sections/PricingTablets';
import ProofTablet from './sections/ProofTablet';
import ReviewTablet from './sections/ReviewTablet';
import ScriptsTablet from './sections/ScriptsTablet';
import Stele from './sections/Stele';
import SurfacesTablet from './sections/SurfacesTablet';

import './styles.css';

/**
 * clay-tablet: a museum case of clay tablets.
 *
 * The page is the vitrine. Every section is one tablet, a fired-clay slab
 * with pillow corners, ruled into registers and columns; its tones, borders,
 * and dividers are impressed wedges whose density is an ordered Bayer dither.
 * The tablets sit on a dark case ground between hairline shelf lines, each
 * with its museum label. The lineage is Sumerian and Assyrian revival held
 * to geometry: the cuneiform wedge as a triangle, the Behistun inscription's
 * parallel registers, no figures. The living material is GT's real strings,
 * rates, locales, and customers. Forum is the one display face; Inter is the
 * body.
 */
export const metadata: Metadata = {
  title: 'clay-tablet — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

const forum = Forum({
  subsets: ['latin'],
  weight: '400',
  variable: '--clay-tablet-display',
  display: 'swap',
});

export default function ClayTabletPage() {
  return (
    <>
      <div className={`clay-tablet-root ${forum.variable}`}>
        <CaseNav />
        <main className='ct-case'>
          <HeroTablet />
          <ProofTablet />
          <SurfacesTablet />
          <ScriptsTablet />
          <ReviewTablet />
          <Stele />
          <PricingTablets />
        </main>
        <CaseFooter />
      </div>
      <DirectionCorner slug='clay-tablet' />
    </>
  );
}
