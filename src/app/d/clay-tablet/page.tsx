import localFont from 'next/font/local';

import DirectionCorner from '@/components/viewer/DirectionCorner';
import { directionDescription } from '@/app/directions/descriptions';
import { seoRoute } from '@/lib/seo/route';

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
const route = seoRoute({
  path: '/d/clay-tablet',
  title: 'Clay Tablet',
  kind: 'direction',
  description: directionDescription('clay-tablet'),
});

export const metadata = route.metadata;

const forum = localFont({
  src: [
    { path: '../../../../public/fonts/google/forum-400.woff2', weight: '400', style: 'normal' },
  ],
  variable: '--clay-tablet-display',
  display: 'swap',
  preload: false,
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
