import type { Metadata } from 'next';
import { Cinzel } from 'next/font/google';

import { DirectionCorner } from '@/components/viewer/DirectionCorner';

import { Base } from './sections/Base';
import { Claim } from './sections/Claim';
import { BaseDissolve } from './sections/deco/BaseDissolve';
import { Cornice } from './sections/deco/Cornice';
import { RegisterRule } from './sections/deco/RegisterRule';
import { Instruments } from './sections/Instruments';
import { Nav } from './sections/Nav';
import { Proof } from './sections/Proof';
import { Rates } from './sections/Rates';
import { Reveal } from './sections/Reveal';
import { Review } from './sections/Review';
import { Scripts } from './sections/Scripts';

import './styles.css';

/**
 * three-registers: a stele of registers.
 *
 * One tall slab of black granodiorite stands on a dark ground under a
 * stepped cornice. Every section is a register of three bands read top to
 * bottom, after the stone that carried one decree in three scripts: the
 * claim is cut into the first band, the same claim in a living script into
 * the second, the served interface into the third. Six more registers
 * follow down the slab, separated by chevron strips: the T component, the
 * scripts, the instruments, the gilded review, the rates, and the base,
 * where the stone dissolves into the ground. Cinzel is the incised face
 * for h1 and h2; Inter is everything else.
 */
const display = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--three-registers-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'three-registers — GT Redesign',
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

export default function ThreeRegistersPage() {
  return (
    <>
      <div className={`three-registers-root ${display.variable}`} id='top'>
        <Reveal>
          <div className='tr-ground'>
            <div className='tr-slab'>
              <Cornice />
              <div className='tr-stele'>
                <Nav />
                <Claim />
                <RegisterRule />
                <Proof />
                <RegisterRule />
                <Scripts />
                <RegisterRule />
                <Instruments />
                <RegisterRule />
                <Review />
                <RegisterRule />
                <Rates />
                <RegisterRule />
                <Base />
              </div>
              <BaseDissolve />
            </div>
          </div>
        </Reveal>
      </div>
      <DirectionCorner slug='three-registers' />
    </>
  );
}
