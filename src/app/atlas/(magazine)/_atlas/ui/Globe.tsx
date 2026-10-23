'use client';

import { useRef, type ReactNode } from 'react';

import { dmsPair, type LatLon } from '../coords';
import { mountGlobe, type GlobeHandle } from '../globe';
import { useLayoutWork, useMountEffect } from '../hooks';

type Props = {
  /** The place the globe turns to and pins. */
  place: LatLon & { city: string };
  className?: string;
  /** CSS pixels per dither cell, rounded to whole device pixels. */
  cell?: number;
  /** Degrees the place sits above the disc's centre. */
  tilt?: number;
  /** Prints the parallels and meridians. */
  graticule?: boolean;
  /** The pin's own label with the city and its coordinates; off where a readout beside the globe carries them. */
  label?: boolean;
  /** How the globe turns to a new place: how long, in ms, and on what curve; a quick ease-out when not given. */
  turn?: { ms: number; curve?: (t: number) => number };
  /** Drawn inside the globe's box, which carries the pin's place as --px and --py. */
  children?: ReactNode;
};

/* The dithered globe with its pin: a crosshair at the place and its
   coordinates, which flips to the pin's left near the right limb. */
export default function Globe({ place, className, cell = 3, tilt = 14, graticule = false, label = true, turn, children }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const pin = useRef<HTMLSpanElement>(null);
  const handle = useRef<GlobeHandle | null>(null);

  useMountEffect(() => {
    if (!canvas.current) return;
    handle.current = mountGlobe(canvas.current, pin.current, place, cell, tilt, graticule);
    return () => handle.current?.destroy();
  });

  useLayoutWork(
    () => {
      handle.current?.turnTo(place, turn?.ms, turn?.curve);
    },
    { dependencies: [place.lat, place.lon] }
  );

  return (
    <div className={['gtp-globe', className].filter(Boolean).join(' ')}>
      <canvas ref={canvas} className='gtp-globe-canvas' aria-hidden='true' />
      <span ref={pin} className='gtp-globe-pin' aria-hidden='true'>
        {label ? (
          <span className='gtp-globe-label'>
            <span className='gtp-globe-city'>{place.city}</span>
            <span className='gtp-globe-coords'>{dmsPair(place)}</span>
          </span>
        ) : null}
      </span>
      {children}
    </div>
  );
}
