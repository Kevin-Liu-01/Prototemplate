'use client';

import { useId, useRef, type CSSProperties } from 'react';
import { T, useMessages } from '@/app/d/blog-globe/_shared/i18n';

import { useMountEffect } from '@/lib/use-mount-effect';

import CityTargets from '@/app/d/blog-globe/_rounds/r3/CityTargets';
import LanguageLinks from '@/app/d/blog-globe/_rounds/r3/LanguageLinks';
import Passage from '@/app/d/blog-globe/_rounds/r3/Passage';
import { formatCoordinates, STOPS } from '@/app/d/blog-globe/_rounds/r3/stops';
import { mountGlobeB } from '@/app/d/blog-globe/_rounds/r3/variant-b/engine';
import {
  DISC,
  drawFrame,
  drawRoute,
  poseAt,
  ROUTE_AT,
  VIEW,
  type Frame,
} from '@/app/d/blog-globe/_rounds/r3/variant-b/geometry';

import './globe-b.css';

/** Custom properties are legal inline styles but absent from CSSProperties. */
type StyleVars = CSSProperties & Record<`--${string}`, string | number>;

/* The server's still: the lens faces the first stop, and each stop's route
   is drawn as seen from there, so the radios still light the right city
   and route without JavaScript. Built once per page. The paths suppress
   hydration warnings because another engine's trig can round a last digit
   differently; the engine redraws them on mount. */
let still: { frame: Frame; routes: string[] } | null = null;

function getStill() {
  if (still) return still;
  const pose = poseAt(0);
  still = {
    frame: drawFrame(pose),
    routes: ROUTE_AT.map((route) => drawRoute({ ...pose, route })),
  };
  return still;
}

/* Variant B: a line globe through a close lens, with the route. The five
   languages sit as links over Euclid's eight definitions; a pick turns the
   globe to its city, draws the route on to it as a doubled line, counts
   the coordinates on the way and steps the passage into the new language.
   engine.ts runs the move; without it the radios switch the label, the
   passage and the route. */
export default function GlobeB() {
  const m = useMessages();
  const captionId = useId();
  // an id url() can read: useId's own may hold characters it cannot
  const lensId = `gbb-lens-${useId().replace(/[^\w-]/g, '')}`;
  const ref = useRef<HTMLElement>(null);
  const { frame, routes } = getStill();

  useMountEffect(() => (ref.current ? mountGlobeB(ref.current) : undefined));

  return (
    <figure
      ref={ref}
      className='not-prose gbb'
      data-testid='blog-globe-b'
      aria-labelledby={captionId}
    >
      <div className='gbb-plate'>
        <div className='gbb-stage'>
          <div className='gbb-globe'>
            {/* the drawing's own box, so the city targets share its size */}
            <div className='gbb-disc'>
              <svg
                className='gbb-svg'
                viewBox={`0 0 ${VIEW} ${VIEW}`}
                aria-hidden='true'
              >
                <defs>
                  <clipPath id={lensId}>
                    <circle cx={DISC.cx} cy={DISC.cy} r={DISC.r} />
                  </clipPath>
                </defs>
                <g clipPath={`url(#${lensId})`}>
                  <path
                    className='gbb-grid'
                    d={frame.grid}
                    suppressHydrationWarning
                  />
                  <path
                    className='gbb-coast'
                    d={frame.coast}
                    suppressHydrationWarning
                  />
                  {routes.map((d, i) => (
                    <g key={i} className='gbb-route'>
                      <path
                        className='gbb-thread'
                        d={d}
                        suppressHydrationWarning
                      />
                      <path
                        className='gbb-core'
                        d={d}
                        suppressHydrationWarning
                      />
                    </g>
                  ))}
                  <g className='gbb-route-now'>
                    <path className='gbb-thread gbb-route-live' />
                    <path className='gbb-core gbb-route-live' />
                  </g>
                  <g className='gbb-cities'>
                    {frame.cities.map(({ x, y, near }, i) => (
                      <g
                        key={i}
                        className='gbb-city'
                        transform={`translate(${x} ${y})`}
                        visibility={near ? 'visible' : 'hidden'}
                        style={{ '--i': i } as StyleVars}
                        suppressHydrationWarning
                      >
                        <rect
                          className='gbb-ring'
                          x={-7.5}
                          y={-7.5}
                          width={15}
                          height={15}
                        />
                        <rect
                          className='gbb-dot'
                          x={-3.5}
                          y={-3.5}
                          width={7}
                          height={7}
                        />
                      </g>
                    ))}
                  </g>
                </g>
                <circle
                  className='gbb-limb'
                  cx={DISC.cx}
                  cy={DISC.cy}
                  r={DISC.r}
                />
              </svg>
              <CityTargets />
            </div>

            {/* every stop's label in one cell, so the box keeps one size: the
                coordinates over the city and year */}
            <p className='gbb-label'>
              {STOPS.map((stop) => (
                <span key={stop.lang} className='gbb-where'>
                  <span className='gbb-coord'>{formatCoordinates(stop)}</span>
                  <span className='gbb-sep'> · </span>
                  <span className='gbb-place'>
                    {m(stop.city)} · {m(stop.yearLabel)}
                  </span>
                </span>
              ))}
            </p>
          </div>

          <div className='gbb-words'>
            <LanguageLinks className='gbb-links' />
            <Passage lines={8} className='gbb-passage' />
          </div>
        </div>
      </div>

      <figcaption className='gbb-cap' id={captionId}>
        <T>
          Euclid&apos;s first eight definitions in the order the Elements were
          translated, from Alexandria to Beijing.
        </T>
      </figcaption>
    </figure>
  );
}
