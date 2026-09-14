import { Marcellus } from 'next/font/google';

import DirectionCorner from '@/components/viewer/DirectionCorner';

import Bento from './sections/Bento';
import DarkBand from './sections/DarkBand';
import Frameworks from './sections/Frameworks';
import Hero from './sections/Hero';
import Locales from './sections/Locales';
import Pricing from './sections/Pricing';
import Review from './sections/Review';
import SiteFooter from './sections/SiteFooter';
import Story from './sections/Story';
import TopNav from './sections/TopNav';

import './styles.css';

/* The one display face: an inscriptional roman for h1, h2 and the hero
   crown's lockup. Inter stays the body, interface and caption face and is
   already on <html> as --font-inter; it is never loaded again here. */
const display = Marcellus({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--glyph-mosaic-display',
  display: 'swap',
});

export const metadata = {
  title: 'glyph-mosaic — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * GLYPH MOSAIC, the dither family's deco direction.
 *
 * GT's complete landing system (the ruled column, the flag chips, the code
 * window, the bento of SSOT diagrams, the locales atlas, the story, the
 * review workspace, the one dark band, the rate ledger, the footer) carries
 * one documented layer on top: mosaic fields whose tesserae are real glyphs
 * from seven scripts, laid at densities decided by the house Bayer screen,
 * forming a sunburst in the hero plate, crests at the section heads,
 * chevron friezes at the dividers and along the dark band's floor. Warm
 * sand, warm ink, terracotta as the one accent, gold as the one ornament
 * color. Language is the material, literally: the floor is made of writing.
 */
export default function GlyphMosaicPage() {
  return (
    <>
      <div className={`glyph-mosaic-root ${display.variable}`}>
        <TopNav />

        <div className='tc-rail'>
          <Hero />
          <Frameworks />
          <Bento />
          <Locales />
          <Story />
          <Review />
        </div>

        <DarkBand />

        <div className='tc-rail'>
          <Pricing />
          <SiteFooter />
        </div>
      </div>
      <DirectionCorner slug='glyph-mosaic' />
    </>
  );
}
