'use client';

import { useId, useRef } from 'react';
import { T, useGT, useMessages } from '@/app/d/blog-globe/_shared/i18n';

import { useMountEffect } from '@/lib/use-mount-effect';

import {
  formatCoordinate,
  STOPS,
  type GlobeStop,
} from '@/app/d/blog-globe/_rounds/r1/stops';
import {
  cameraOf,
  DISC,
  landPath,
  markAt,
  mountGlobeD,
  SIZE,
} from '@/app/d/blog-globe/_rounds/r1/variant-d/globe-d';

import type { CSSProperties } from 'react';

import './globe-d.css';

/* the server draws the globe facing the first stop */
const FIRST = cameraOf(STOPS[0]);
const FIRST_LAND = landPath(FIRST);

/* One line on a wide plate. Narrower, the separators drop out and the label
   breaks after the coordinates (and on the narrowest after the city), so no
   line ends or starts on a dot; each span keeps its words together. */
function Label({ stop }: { stop: GlobeStop }) {
  const m = useMessages();
  return (
    <bdi>
      <span className='gd-at'>
        <span>{formatCoordinate(stop.lat, 'lat', stop.places)},</span>{' '}
        <span>{formatCoordinate(stop.lon, 'lon', stop.places)}</span>
      </span>
      <span className='gd-sep'>{' · '}</span>
      <span className='gd-place'>{m(stop.city)}</span>
      <span className='gd-sep gd-sep-2'>{' · '}</span>
      <span>{m(stop.yearLabel)}</span>
    </bdi>
  );
}

function Name({ stop }: { stop: (typeof STOPS)[number] }) {
  return (
    <span className='gd-name' lang={stop.lang} dir={stop.dir}>
      {stop.label}
    </span>
  );
}

/* Globe variant D, quiet minimal: a dot globe beside the passage, the place
   and year in one line under it, and a slider of native radios. The
   radios own the choice and CSS shows the checked stop, so the server
   markup works without JavaScript; globe-d.ts adds the turn and the text
   step. */
export default function GlobeD() {
  const gt = useGT();
  const group = useId();
  const ref = useRef<HTMLElement>(null);

  useMountEffect(() => (ref.current ? mountGlobeD(ref.current) : undefined));

  return (
    <figure
      ref={ref}
      className='not-prose gd'
      data-testid='blog-globe-d'
      style={{ '--n': STOPS.length } as CSSProperties}
    >
      <div className='gd-plate'>
        <div className='gd-stage'>
          <svg
            className='gd-globe'
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            aria-hidden='true'
          >
            <circle
              className='gd-limb'
              cx={DISC.cx}
              cy={DISC.cy}
              r={DISC.radius}
            />
            <path className='gd-land' d={FIRST_LAND} />
            <g>
              {STOPS.map((stop) => {
                const mark = markAt(FIRST, stop);
                return (
                  <g
                    key={stop.lang}
                    className='gd-city'
                    transform={mark.transform}
                    visibility={mark.near ? undefined : 'hidden'}
                  >
                    <circle className='gd-halo' r='8' />
                    <circle className='gd-ring' r='6' />
                    <circle className='gd-dot' r='2.5' />
                  </g>
                );
              })}
            </g>
          </svg>

          <div className='gd-texts'>
            {STOPS.map((stop) => (
              <p
                key={stop.lang}
                className='gd-text'
                lang={stop.lang}
                dir={stop.dir}
              >
                {stop.passage}
              </p>
            ))}
          </div>

          {/* each label takes its stop's direction, so Arabic's sits right with its passage */}
          <div className='gd-caps'>
            {STOPS.map((stop) => (
              <p key={stop.lang} className='gd-cap' dir={stop.dir}>
                <Label stop={stop} />
              </p>
            ))}
          </div>
        </div>

        <div className='gd-ctl'>
          <div
            className='gd-pill'
            role='radiogroup'
            aria-label={gt('Language')}
          >
            <span className='gd-thumb' aria-hidden='true' />
            {STOPS.map((stop, i) => (
              <label key={stop.lang} className='gd-opt'>
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
            <span className='gd-lens' aria-hidden='true'>
              {STOPS.map((stop) => (
                <span key={stop.lang} className='gd-opt'>
                  <Name stop={stop} />
                </span>
              ))}
            </span>
          </div>
        </div>
      </div>
      <figcaption className='gd-caption'>
        <T>
          Euclid&apos;s first definition, in the order the Elements travelled
          from Alexandria to Beijing.
        </T>
      </figcaption>
    </figure>
  );
}
