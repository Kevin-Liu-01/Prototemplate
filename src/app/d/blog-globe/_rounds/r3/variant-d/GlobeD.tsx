'use client';

import { useRef } from 'react';
import { T, useMessages } from '@/app/d/blog-globe/_shared/i18n';

import { useMountEffect } from '@/lib/use-mount-effect';

import CityTargets from '@/app/d/blog-globe/_rounds/r3/CityTargets';
import LanguageLinks from '@/app/d/blog-globe/_rounds/r3/LanguageLinks';
import Passage from '@/app/d/blog-globe/_rounds/r3/Passage';
import {
  formatCoordinates,
  STOPS,
  type GlobeStop,
} from '@/app/d/blog-globe/_rounds/r3/stops';
import {
  cameraOf,
  DISC,
  landPath,
  markAt,
  mountGlobeD,
  SIZE,
  WINDOW,
} from '@/app/d/blog-globe/_rounds/r3/variant-d/globe-d';

import './globe-d.css';

/* the server draws the globe facing the first stop */
const FIRST = cameraOf(STOPS[0]);
const FIRST_LAND = landPath(FIRST);

/* The coordinates on one line and the city and year on the next; a
   coordinate never breaks inside itself. */
function Label({ stop }: { stop: GlobeStop }) {
  const m = useMessages();
  return (
    <>
      <span className='gd-at'>{formatCoordinates(stop)}</span>
      <span>
        {m(stop.city)}
        {' · '}
        {m(stop.yearLabel)}
      </span>
    </>
  );
}

/* Globe variant D, quiet minimal: a zoomed dot globe in a round window with
   the place under it, and beside it the five languages as underlined words
   over Euclid's eight definitions. The radios own the choice and CSS shows
   the checked stop, so the server markup works without JavaScript;
   globe-d.ts adds the turn and the text step. */
export default function GlobeD() {
  const ref = useRef<HTMLElement>(null);

  useMountEffect(() => (ref.current ? mountGlobeD(ref.current) : undefined));

  return (
    <figure ref={ref} className='not-prose gd' data-testid='blog-globe-d'>
      <div className='gd-plate'>
        <div className='gd-map'>
          {/* the drawing's own box, so the city targets share its size */}
          <div className='gd-disc'>
            <svg
              className='gd-globe'
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              aria-hidden='true'
            >
              <circle className='gd-rim' cx={DISC.cx} cy={DISC.cy} r={WINDOW} />
              <path className='gd-land' d={FIRST_LAND} />
              {/* every halo under every mark: a wide halo clears the land
                  dots and never a neighbour's dot or ring */}
              {(['halo', 'mark'] as const).map((layer) => (
                <g key={layer}>
                  {STOPS.map((stop) => {
                    const mark = markAt(FIRST, stop);
                    return (
                      <g
                        key={stop.lang}
                        className='gd-city'
                        transform={mark.transform}
                        visibility={mark.shown ? undefined : 'hidden'}
                      >
                        {layer === 'halo' ? (
                          <circle className='gd-halo' r='8' />
                        ) : (
                          <>
                            <circle className='gd-ring' r='6' />
                            <circle className='gd-dot' r='2.5' />
                          </>
                        )}
                      </g>
                    );
                  })}
                </g>
              ))}
            </svg>
            <CityTargets />
          </div>

          {/* every label in one cell, so the box keeps the tallest */}
          <div className='gd-caps'>
            {STOPS.map((stop) => (
              <p key={stop.lang} className='gd-cap'>
                <Label stop={stop} />
              </p>
            ))}
          </div>
        </div>

        <div className='gd-read'>
          <LanguageLinks className='gd-links' />
          <Passage lines={8} className='gd-passage' />
        </div>
      </div>
      <figcaption className='gd-caption'>
        <T>
          Euclid&apos;s first eight definitions, in the order the Elements
          travelled from Alexandria to Beijing.
        </T>
      </figcaption>
    </figure>
  );
}
