'use client';

import { useId, useRef, type CSSProperties } from 'react';
import { T, useMessages } from '@/app/d/blog-globe/_shared/i18n';

import { useMountEffect } from '@/lib/use-mount-effect';

import CityTargets from '@/app/d/blog-globe/_rounds/r3/CityTargets';
import LanguageLinks from '@/app/d/blog-globe/_rounds/r3/LanguageLinks';
import Passage from '@/app/d/blog-globe/_rounds/r3/Passage';
import { project } from '@/app/d/blog-globe/_rounds/r3/ortho';
import { formatCoordinates, STOPS } from '@/app/d/blog-globe/_rounds/r3/stops';

import { mountGlobeA } from './engine';
import { aim, nearDepth, ZOOM } from './field';
import { firstStopStill, STILL_CELLS } from './still';

import './globe-a.css';

type GlobeAProps = {
  /** Seconds each stop holds on the guided tour before the next; 0 (the default) turns the tour off. */
  tour?: number;
};

/** Custom properties are legal inline styles but absent from CSSProperties. */
type StyleVars = CSSProperties & Record<`--${string}`, string>;

/* Where each stop sits on the first stop's still, in percent of the window:
   without JavaScript the pin moves there when its language is picked. A
   stop outside the window has no pin. */
const ON_STILL = (() => {
  const view = { ...aim(STOPS[0]), radius: 50 * ZOOM, cx: 50, cy: 50 };
  const least = nearDepth(ZOOM);
  const vars: Record<`--${string}`, string> = {};
  STOPS.forEach((stop, i) => {
    const p = project(view, stop);
    const seen = p.depth >= least;
    vars[`--ga-x-${i}`] = seen ? `${p.x.toFixed(2)}%` : '50%';
    vars[`--ga-y-${i}`] = seen ? `${p.y.toFixed(2)}%` : '50%';
    vars[`--ga-pin-${i}`] = seen ? 'visible' : 'hidden';
  });
  return vars;
})();

/* Variant A, the dithered globe: the passage's five stops on a globe
   printed in the house 1-bit material, framed close in a round window, which
   turns to each city when its language is picked; the city's coordinates
   sit under the window. The radios under the
   language links own the choice and CSS shows the checked passage and
   label, so the server markup reads without JavaScript, with the window at
   the first stop from a still; engine.ts adds the turn and the step. */
export default function GlobeA({ tour = 0 }: GlobeAProps) {
  const m = useMessages();
  const captionId = useId();
  const ref = useRef<HTMLElement>(null);
  const still = firstStopStill();

  useMountEffect(() => {
    if (!ref.current) return;
    return mountGlobeA(ref.current, tour);
  });

  return (
    <figure
      ref={ref}
      className='not-prose ga'
      data-testid='blog-globe-a'
      aria-labelledby={captionId}
      style={ON_STILL as StyleVars}
    >
      <div className='ga-plate'>
        <LanguageLinks className='ga-links' />

        <div className='ga-stage'>
          <div className='ga-disc'>
            <svg
              className='ga-still'
              viewBox={`0 0 ${STILL_CELLS} ${STILL_CELLS}`}
              aria-hidden='true'
            >
              <path data-ink='1' d={still.light} suppressHydrationWarning />
              <path data-ink='2' d={still.strong} suppressHydrationWarning />
            </svg>
            <canvas className='ga-field' aria-hidden='true' />
            <span className='ga-pin' aria-hidden='true' />
            <CityTargets />
          </div>
          {/* under the window, so it never covers a city to click */}
          <div className='ga-labels'>
            {STOPS.map((stop) => (
              <p key={stop.lang} className='ga-label'>
                <span className='ga-coords'>{formatCoordinates(stop)}</span>
                <span className='ga-sep'> · </span>
                <span className='ga-where'>
                  {`${m(stop.city)} · ${m(stop.yearLabel)}`}
                </span>
              </p>
            ))}
          </div>
        </div>

        <Passage lines={8} className='ga-passage' />
      </div>

      <figcaption className='ga-cap' id={captionId}>
        <T>
          Euclid&apos;s first eight definitions in the five languages that
          carried the Elements, at the city and year of each version.
        </T>
        {/* shown while the tour runs; its line is kept from the first paint */}
        {tour > 0 ? (
          <span className='ga-tour'>
            {' '}
            <T>The globe moves on to the next stop until you pick one.</T>
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}
