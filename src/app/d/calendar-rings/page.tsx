/**
 * calendar-rings: a General Translation landing page as a concentric disk
 * that works as an instrument.
 *
 * The hero is one disk of nested rings, ground and dither alternating
 * outward, and every ring reads something real: the claim in the hub, the
 * name on the first ring, the four surfaces on the second, the seven usage
 * rates on the third as bar-and-dot numerals, the twenty locales on the
 * fourth as flag chips, and a rim notched once per locale. A key under the
 * disk says how to read it. Every section after it unrolls one ring into a
 * wide arc band with radial cells, notch ticks and seated numerals: the
 * customers, the T component as a half disk around its source, the
 * negative ring with the stack and the pipeline, floored by the disk
 * itself inverted, the languages, the pricing file as rate segments, and
 * the flat base register of the footer. The lineage is the Aztec and Maya
 * revival of the 1920s, geometry only: rings, notches, cells, radial
 * rules, stepped registers and bar-and-dot numerals. Material palette:
 * obsidian, terracotta, jade, gold.
 */
import localFont from 'next/font/local';

import { DirectionCorner } from '@/components/viewer/DirectionCorner';

import { Footer } from './sections/Footer';
import { Hero } from './sections/Hero';
import { Languages } from './sections/Languages';
import { Nav } from './sections/Nav';
import { Pricing } from './sections/Pricing';
import { Proof } from './sections/Proof';
import { Surfaces } from './sections/Surfaces';
import { Trust } from './sections/Trust';

import './styles.css';

/* the one display face: inscriptional capitals for h1, h2 and the crown */
const display = localFont({
  src: [
    { path: '../../../../public/fonts/google/cinzel-400.woff2', weight: '400', style: 'normal' },
    { path: '../../../../public/fonts/google/cinzel-500.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--calendar-rings-display',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
});

export const metadata = {
  title: 'calendar-rings — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

export default function CalendarRingsPage() {
  return (
    <>
      <div className={`calendar-rings-root ${display.variable}`}>
        <Nav />
        <main>
          <Hero />
          <Trust />
          <Proof />
          <Surfaces />
          <Languages />
          <Pricing />
        </main>
        <Footer />
      </div>
      <DirectionCorner slug='calendar-rings' />
    </>
  );
}
