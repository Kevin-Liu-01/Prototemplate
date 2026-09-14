'use client';

import DitherPlate from './DitherPlate';
import { sunDisk } from '../../fields';

/**
 * The winged disk reduced to geometry: a dithered sun disk between two
 * horizontal bars, one wing each side as a single gold rule. Home: the hero
 * crown, the one crown element above the h1. The disk is the hero's Bayer
 * surface; each bar is one fill drawn once.
 */
export default function Crown() {
  return (
    <div className='pg-crown' aria-hidden='true'>
      <div className='pg-wing is-l'>
        <span />
      </div>
      <DitherPlate className='pg-disk' field={sunDisk()} scale={2} fps={20} reducedMotionTime={2.4} />
      <div className='pg-wing is-r'>
        <span />
      </div>
    </div>
  );
}
