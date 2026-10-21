'use client';

import { useId, useRef, type CSSProperties } from 'react';
import { T, useGT, useMessages } from '@/app/d/blog-globe/_shared/i18n';

import { useMountEffect } from '@/lib/use-mount-effect';

import CityTargets from '@/app/d/blog-globe/_rounds/r2/CityTargets';
import { project } from '@/app/d/blog-globe/_rounds/r2/ortho';
import {
  formatCoordinates,
  STOPS,
} from '@/app/d/blog-globe/_rounds/r2/stops';

import { mountGlobeA } from './engine';
import { aim } from './field';
import { firstStopStill, STILL_CELLS } from './still';

import './globe-a.css';

type GlobeAProps = {
  /** Seconds each stop holds on the guided tour before the next; 0 (the default) turns the tour off. */
  tour?: number;
};

/** Custom properties are legal inline styles but absent from CSSProperties. */
type StyleVars = CSSProperties & Record<`--${string}`, string>;

/* Where each stop sits on the first stop's globe, in percent of the disc,
   and which way its label opens (toward the disc's centre): without
   JavaScript the pin moves there when its language is picked. */
const ON_STILL = (() => {
  const view = { ...aim(STOPS[0]), radius: 50, cx: 50, cy: 50 };
  const vars: Record<`--${string}`, string> = {};
  STOPS.forEach((stop, i) => {
    const p = project(view, stop);
    const right = p.x > 50;
    vars[`--ga-x-${i}`] = `${p.x.toFixed(2)}%`;
    vars[`--ga-y-${i}`] = `${p.y.toFixed(2)}%`;
    vars[`--ga-tx-${i}`] = right ? 'calc(6px - 100%)' : '-6px';
    vars[`--ga-j-${i}`] = right ? 'end' : 'start';
  });
  return vars;
})();

function Name({ stop }: { stop: (typeof STOPS)[number] }) {
  return (
    <span className='ga-name' lang={stop.lang} dir={stop.dir}>
      {stop.label}
    </span>
  );
}

/* Variant A, the dithered globe: the passage's five stops on a globe
   printed in the house 1-bit material, which turns to each city when its
   language is picked. The radios own the choice and CSS shows the checked
   passage and label, so the server markup reads without JavaScript, with
   the globe at the first stop from a still; engine.ts adds the turn and the
   step. */
export default function GlobeA({ tour = 0 }: GlobeAProps) {
  const gt = useGT();
  const m = useMessages();
  const group = useId();
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
      style={{ '--n': `${STOPS.length}`, ...ON_STILL } as StyleVars}
    >
      <div className='ga-plate'>
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
            <span className='ga-lead' aria-hidden='true' />
            <span className='ga-run' aria-hidden='true' />
            <span className='ga-pin' aria-hidden='true' />
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
            <CityTargets />
          </div>
        </div>

        {/* every passage in one cell, so the box keeps the tallest's height */}
        <div className='ga-passages'>
          {STOPS.map((stop) => (
            <p
              key={stop.lang}
              className='ga-passage'
              lang={stop.lang}
              dir={stop.dir}
            >
              {stop.passage}
            </p>
          ))}
        </div>

        {/* the Versions figure's pill, without the flags */}
        <div className='ga-ctl'>
          <div
            className='ga-pill'
            role='radiogroup'
            aria-label={gt('Language')}
          >
            <span className='ga-thumb' aria-hidden='true' />
            {STOPS.map((stop, i) => (
              <label key={stop.lang} className='ga-opt'>
                <input
                  type='radio'
                  name={group}
                  value={stop.lang}
                  defaultChecked={i === 0}
                />
                <Name stop={stop} />
              </label>
            ))}
            {/* the same names in the thumb's ink, clipped to the thumb */}
            <span className='ga-lens' aria-hidden='true'>
              {STOPS.map((stop) => (
                <span key={stop.lang} className='ga-opt'>
                  <Name stop={stop} />
                </span>
              ))}
            </span>
          </div>
        </div>
      </div>

      <figcaption className='ga-cap' id={captionId}>
        <T>
          Euclid&apos;s first definition in the five languages that carried the
          Elements, at the city and year of each version.
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
