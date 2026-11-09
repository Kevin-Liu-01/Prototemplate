'use client';

import GtLogoMotion from '@/components/brand/GtLogoMotion';

import Plate from './Plate';

/**
 * The logo in motion: the loader at 96, 32 and 16 pixels, and the hover
 * mark at 96 inside a link, which draws its meridian back while the link
 * is hovered or keyboard focused. Both are GtLogoMotion, SVG and CSS alone,
 * and both rest on the logo's own path.
 */
export default function GtLogoMotionDemo() {
  return (
    <Plate fit moves label='The General Translation logo as a loader at three sizes and as a hover mark' stageClassName='dmo-logo-motion' tag='<GtLogoMotion />'>
      <div className='dmo-logo-motion-row' data-testid='logo-motion-loaders'>
        <GtLogoMotion mode='loader' size={96} label='Loading' />
        <GtLogoMotion mode='loader' size={32} label='Loading' />
        <GtLogoMotion mode='loader' size={16} label='Loading' />
      </div>
      <a className='dmo-logo-motion-host' href='/marks/graticule#animations-hover' data-testid='logo-motion-hover' aria-label='The hover and loading videos on the graticule page'>
        <GtLogoMotion mode='hover' size={96} />
      </a>
    </Plate>
  );
}
