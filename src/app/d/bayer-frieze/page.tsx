import { Inter, Josefin_Sans } from 'next/font/google';

import DirectionCorner from '@/components/viewer/DirectionCorner';

import { DitherDefs } from './ornaments';
import {
  Hero,
  Languages,
  Platform,
  Pricing,
  Proof,
  SiteFooter,
  TopNav,
} from './sections';

import './styles.css';

const display = Josefin_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--bf-display',
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--bf-body',
  display: 'swap',
});

export const metadata = {
  title: 'bayer-frieze — GT Redesign',
  // Declared so the browser stops probing for a /favicon.ico this app never ships.
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * BAYER FRIEZE — dither-focused art deco. The whole deco ornament grammar
 * (Greek-key meander, chevrons, stepped keys, sunrise fans, stripe borders)
 * is generated from one Bayer 4x4 matrix at four stepped densities: 1/16,
 * 4/16, 8/16, 12/16. Cream and ink carry the page; one jade accent sits in
 * the mark, the CTAs, and the ornament rims. Typography stays disciplined
 * (Josefin Sans display over Inter body) so the friezes carry the identity.
 * The hero closes on a full-width dithered meander band that crawls one
 * 48px unit at a time; the footer inverts the same band to cream on ink.
 */
export default function BayerFriezePage() {
  return (
    <>
      <div className={`bayer-frieze-root ${display.variable} ${body.variable}`}>
        <DitherDefs />
        <TopNav />
        <main>
          <Hero />
          <Proof />
          <Languages />
          <Platform />
          <Pricing />
        </main>
        <SiteFooter />
      </div>
      <DirectionCorner slug='bayer-frieze' />
    </>
  );
}
