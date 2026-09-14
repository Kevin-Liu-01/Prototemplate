import { Julius_Sans_One } from 'next/font/google';

import DirectionCorner from '@/components/viewer/DirectionCorner';

import Footer from './sections/Footer';
import Hero from './sections/Hero';
import Ledger from './sections/Ledger';
import Nav from './sections/Nav';
import Proof from './sections/Proof';
import Scripts from './sections/Scripts';
import Stele from './sections/Stele';
import Surfaces from './sections/Surfaces';

import './styles.css';

/** The one display face: deco caps of geometric construction, for the claim and the rubrics only. */
const display = Julius_Sans_One({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--papyrus-registers-display',
});

export const metadata = {
  title: 'papyrus-registers — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * PAPYRUS-REGISTERS. A General Translation landing page set as a ruled
 * papyrus scroll, in the Egyptian revival lineage of Art Deco, geometry
 * only. The page is one column eighteen canon squares wide between two
 * hairline rails; every section is a column of the scroll opened by a
 * rubric in red with a bar-and-dot numeral in the margin. Ornament is
 * papyrus umbels reduced to radiating bars and rendered as gold Bayer
 * dither: a fan band over the canon grid above the claim, a fan cell for
 * every script. The T proof sets the source as a red rubric column beside
 * twelve black-ink cells of translations with flag chips as marginal
 * marks. The four surfaces are ledgers and a terminal. The one dark moment
 * is a granodiorite stele with battered sides carrying one string from the
 * source to the served file over a stepped dither floor. The pricing file
 * is three ruled ledger columns. Inter is the body; Julius Sans One sets
 * the rubrics.
 */
export default function PapyrusRegistersPage() {
  return (
    <>
      <div className={`papyrus-registers-root ${display.variable}`}>
        <Nav />
        <main>
          <div className='pr-scroll'>
            <Hero />
            <Proof />
            <Surfaces />
            <Scripts />
          </div>
          <Stele />
          <div className='pr-scroll'>
            <Ledger />
            <Footer />
          </div>
        </main>
      </div>
      <DirectionCorner slug='papyrus-registers' />
    </>
  );
}
