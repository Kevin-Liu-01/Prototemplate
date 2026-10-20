'use client';

import { useRef } from 'react';

import { dmsPair, type LatLon } from '../coords';
import { mountGlobe, type GlobeHandle } from '../globe';
import { useLayoutWork, useMountEffect } from '../hooks';

type Props = {
  /** The place the globe turns to and pins. */
  place: LatLon & { city: string };
  className?: string;
  /** CSS pixels per dither cell. */
  cell?: number;
  /** Degrees the place sits above the disc's centre. */
  tilt?: number;
};

/* The dithered globe with its pin: a crosshair at the place and its
   coordinates, which flips to the pin's left near the right limb. */
export default function Globe({ place, className, cell = 3, tilt = 14 }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const pin = useRef<HTMLSpanElement>(null);
  const handle = useRef<GlobeHandle | null>(null);

  useMountEffect(() => {
    if (!canvas.current) return;
    handle.current = mountGlobe(canvas.current, pin.current, place, cell, tilt);
    return () => handle.current?.destroy();
  });

  useLayoutWork(
    () => {
      handle.current?.turnTo(place);
    },
    { dependencies: [place.lat, place.lon] }
  );

  return (
    <div className={['gtp-globe', className].filter(Boolean).join(' ')}>
      <canvas ref={canvas} className='gtp-globe-canvas' aria-hidden='true' />
      <span ref={pin} className='gtp-globe-pin' aria-hidden='true'>
        <span className='gtp-globe-label'>
          <span className='gtp-globe-city'>{place.city}</span>
          <span className='gtp-globe-coords'>{dmsPair(place)}</span>
        </span>
      </span>
    </div>
  );
}
