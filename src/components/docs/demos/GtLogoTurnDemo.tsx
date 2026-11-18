'use client';

import { useState } from 'react';

import GtLogoArmillary from '@/components/brand/GtLogoArmillary';
import GtLogoAscii from '@/components/brand/GtLogoAscii';

import Plate from './Plate';

/**
 * The two turning loaders: the armillary at 96 and 32 pixels with a button
 * that stops and starts the loading, so its settle on the logo shows, and
 * the ASCII loader at 450 pixels in the page's ink. Both draw with script on
 * one shared clock and rest on their still.
 */
export default function GtLogoTurnDemo() {
  const [loading, setLoading] = useState(true);
  return (
    <Plate fit moves label='The armillary loader at two sizes and the ASCII loader' stageClassName='dmo-logo-turn' tag='<GtLogoArmillary /> <GtLogoAscii />'>
      <div className='dmo-logo-motion-row' data-testid='logo-turn-armillary'>
        <GtLogoArmillary size={96} label='Loading' loading={loading} />
        <GtLogoArmillary size={32} label='Loading' loading={loading} />
        <button type='button' className='dmo-logo-turn-toggle' onClick={() => setLoading((on) => !on)}>
          {loading ? 'Finish loading' : 'Load again'}
        </button>
      </div>
      <div className='dmo-logo-turn-ascii' data-testid='logo-turn-ascii'>
        <GtLogoAscii width={450} label='Loading' loading={loading} />
      </div>
    </Plate>
  );
}
