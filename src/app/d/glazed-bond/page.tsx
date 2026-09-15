import { Cinzel } from 'next/font/google';

import DirectionCorner from '@/components/viewer/DirectionCorner';

import BondWall from './components/Bond';
import GlazeDefs from './components/GlazeDefs';
import { RosetteBand } from './components/Rosette';
import BondCourse from './sections/BondCourse';
import Foundation from './sections/Foundation';
import Gate from './sections/Gate';
import InnerCourt from './sections/InnerCourt';
import Lintel from './sections/Lintel';
import Plaques from './sections/Plaques';
import RosetteCourse from './sections/RosetteCourse';
import Threshold from './sections/Threshold';
import Ziggurat from './sections/Ziggurat';

import './styles.css';

export const metadata = {
  title: 'glazed-bond — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/* The one display face: Cinzel, inscriptional caps built on Roman
   geometry, for h1, h2 and the crown cartouche only. Inter stays on <html>
   as --font-inter for everything else. Latin Extended is loaded so the
   Polish, Turkish and Portuguese claims set in the same face. */
const cinzel = Cinzel({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600'],
  variable: '--glazed-bond-display',
  display: 'swap',
});

/**
 * glazed-bond: General Translation as a gate elevation in the Babylonian
 * revival of Art Deco. Two battered towers with stepped parapets flank a
 * corbelled arch that holds the claim; below the gate, the page is the
 * elevation's successive courses, content set as glazed panels into
 * running-bond brick, rosette bands running across the towers between
 * them. The materials are the Ishtar Gate's: lapis and turquoise glaze,
 * gold rosettes, fired brick, cream mortar. Every glazed surface catches
 * light as ordered dither from one shared set of Bayer tiles. Geometry
 * only.
 *
 * Courses, top to bottom: the lintel (navigation), the gate (the claim),
 * the threshold (six customer marks as glazed tiles in the bond), the T
 * proof (the source as a gold brick, its translations laid in Flemish bond
 * with glazed lapis headers), the languages (three courses of rosette
 * medallions and the variants register), the inner court (the four product
 * surfaces on the one dark wall, under its own crenellation), the ziggurat
 * (the story on three stepped tiers), the pricing gate (gold plaques set in
 * two towers, the ledger as the opening), the foundation (the footer).
 */
export default function GlazedBondPage() {
  return (
    <>
      <div className={`glazed-bond-root ${cinzel.variable}`}>
        <GlazeDefs />
        <Lintel />
        <Gate />

        <div className='gb-elevation'>
          {/* the flank towers below the gate: the same bond, one continuous strip each */}
          <aside className='gb-flank is-left' aria-hidden='true'>
            <BondWall />
          </aside>
          <aside className='gb-flank is-right' aria-hidden='true'>
            <BondWall />
          </aside>

          <Threshold />

          <div className='gb-band' aria-hidden='true'>
            <RosetteBand />
          </div>
          <BondCourse />

          <div className='gb-band' aria-hidden='true'>
            <RosetteBand />
          </div>
          <RosetteCourse />

          {/* no band here: the court's own crenellation is the seam above it */}
          <InnerCourt />

          <div className='gb-band' aria-hidden='true'>
            <RosetteBand />
          </div>
          <Ziggurat />

          <div className='gb-band' aria-hidden='true'>
            <RosetteBand />
          </div>
          <Plaques />
        </div>

        <Foundation />
      </div>
      <DirectionCorner slug='glazed-bond' />
    </>
  );
}
