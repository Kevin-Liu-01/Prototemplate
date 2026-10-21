'use client';

import { useId, useRef, type CSSProperties } from 'react';
import { T, useGT, useMessages } from '@/app/d/blog-globe/_shared/i18n';

import { useMountEffect } from '@/lib/use-mount-effect';

import CityTargets from '@/app/d/blog-globe/_rounds/r2/CityTargets';
import {
  formatCoordinates,
  STOPS,
} from '@/app/d/blog-globe/_rounds/r2/stops';
import { mountGlobeB } from '@/app/d/blog-globe/_rounds/r2/variant-b/engine';
import {
  DISC,
  drawFrame,
  drawRoute,
  poseAt,
  ROUTE_AT,
  VIEW,
  type Frame,
} from '@/app/d/blog-globe/_rounds/r2/variant-b/geometry';

import './globe-b.css';

/** Custom properties are legal inline styles but absent from CSSProperties. */
type StyleVars = CSSProperties & Record<`--${string}`, string | number>;

/* The server's still: the globe faces the first stop, and each stop's route
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

/* Variant B: a line globe with the route. A vertical timeline of native
   radios picks a language; the globe turns to its city, the route draws on
   to it as a doubled line, the label counts the coordinates on the way and
   the passage steps into the new language. engine.ts runs the move;
   without it the radios switch the label, the passage and the route. */
export default function GlobeB() {
  const gt = useGT();
  const m = useMessages();
  const group = useId();
  const captionId = useId();
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
                    <path className='gbb-core' d={d} suppressHydrationWarning />
                  </g>
                ))}
                <g className='gbb-route-now'>
                  <path className='gbb-thread gbb-route-live' />
                  <path className='gbb-core gbb-route-live' />
                </g>
                <circle
                  className='gbb-limb'
                  cx={DISC.cx}
                  cy={DISC.cy}
                  r={DISC.r}
                />
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

          <div className='gbb-tl' role='radiogroup' aria-label={gt('Language')}>
            <span className='gbb-track' aria-hidden='true'>
              <span className='gbb-run' />
            </span>
            {STOPS.map((stop, i) => (
              <label
                key={stop.lang}
                className='gbb-stop'
                style={{ '--i': i } as StyleVars}
              >
                <input
                  type='radio'
                  name={group}
                  value={stop.lang}
                  defaultChecked={i === 0}
                />
                <span className='gbb-mark' aria-hidden='true' />
                <span className='gbb-year'>{m(stop.yearLabel)}</span>
                <span className='gbb-name' lang={stop.lang} dir={stop.dir}>
                  {stop.label}
                </span>
              </label>
            ))}
          </div>

          {/* every passage in one cell, so the box keeps one height; on a
              narrow plate it sits under the globe, over the timeline */}
          <div className='gbb-passage'>
            {STOPS.map((stop) => (
              <p
                key={stop.lang}
                className='gbb-text'
                lang={stop.lang}
                dir={stop.dir}
              >
                {stop.passage}
              </p>
            ))}
          </div>
        </div>
      </div>

      <figcaption className='gbb-cap' id={captionId}>
        <T>
          Euclid&apos;s first definition in the order the Elements were
          translated, from Alexandria to Beijing.
        </T>
      </figcaption>
    </figure>
  );
}
