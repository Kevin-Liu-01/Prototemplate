import localFont from 'next/font/local';

import DirectionCorner from '@/components/viewer/DirectionCorner';

import Footer from './components/Footer';
import Hero from './components/Hero';
import Legend from './components/Legend';
import Nav from './components/Nav';
import Pricing from './components/Pricing';
import Proof from './components/Proof';
import Scripts from './components/Scripts';
import Shadow from './components/Shadow';
import Surfaces from './components/Surfaces';
import { Frieze } from './components/Wall';

import './styles.css';

/* The one display face: Marcellus, inscriptional caps with a real lowercase,
   read by styles.css for h1 and h2 only. Inter stays on <html>. */
const display = localFont({
  src: [
    { path: '../../../../public/fonts/google/marcellus-400.woff2', weight: '400', style: 'normal' },
  ],
  variable: '--textile-block-display',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
});

export const metadata = {
  title: 'textile-block — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * textile-block. The General Translation landing page as a relief block
 * wall in the Mayan-revival line of Art Deco: Frank Lloyd Wright's textile
 * blocks, the Mayan Theater's stacked relief facade, the Aztec Hotel's
 * stepped friezes. A rigid grid of square cast blocks in horizontal
 * courses. Most blocks carry a geometric relief from a library of six
 * (the Ennis, Millard, Storer, and Freeman blocks, the greca band, the
 * running bond), and every course is keyed to one of them. Content sits on
 * smooth faces set into the same bond. Nothing floats: the claim, the T
 * proof, the four product objects, the scripts, the shadowed course, the
 * pricing plaques, the legend and the footer are all blocks in the wall.
 */
export default function TextileBlockPage() {
  return (
    <>
      <div className={`textile-block-root ${display.variable}`}>
        <div className='tb-page'>
          <Nav />
          <main className='tb-main'>
            <div className='tb-wall'>
              <Hero />
              <Frieze relief='millard' />
              <Proof />
              <Frieze relief='greca' />
              <Surfaces />
              <Frieze relief='freeman' />
              <Scripts />
            </div>

            <Shadow />

            <div className='tb-wall is-lower'>
              <Pricing />
              <Frieze relief='greca' />
              <Legend />
              <Footer />
            </div>
          </main>
        </div>
      </div>
      <DirectionCorner slug='textile-block' />
    </>
  );
}
