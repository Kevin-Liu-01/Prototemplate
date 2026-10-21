'use client';

import { useId, useRef } from 'react';
import { T, useGT, useMessages } from '@/app/d/blog-globe/_shared/i18n';

import { useMountEffect } from '@/lib/use-mount-effect';

import CityTargets from '@/app/d/blog-globe/_rounds/r2/CityTargets';
import { project } from '@/app/d/blog-globe/_rounds/r2/ortho';
import {
  formatCoordinates,
  STOPS,
} from '@/app/d/blog-globe/_rounds/r2/stops';

import {
  CITY,
  SVG_MARGIN,
  SVG_RADIUS,
  cameraOf,
  cityLook,
  lettersOf,
  svgPose,
} from './glyph-globe';
import { mountGlyphGlobe } from './mount-glyph-globe';

import './glyph-globe.css';

type GlobeCProps = {
  /** The figure's caption; by default a line on the passage's route. */
  caption?: string;
  /** seconds per stop on the guided tour; 0 turns it off */
  tour?: number;
};

/* The first stop's globe as SVG, so the server markup shows Alexandria in
   Greek before the canvas takes over (and without JavaScript); the theme's
   inks come from CSS. Floats can differ by an ulp between the server's
   engine and the browser's, so the drawn nodes keep a fixed shape and
   suppress the attribute check. */
const [FIRST] = STOPS;
const FIRST_CAMERA = cameraOf(FIRST);
const FIRST_VIEW = { ...FIRST_CAMERA, radius: 1, cx: 0, cy: 0 };
const FIRST_CITIES = STOPS.map((stop, i) => ({
  i,
  ...project(FIRST_VIEW, { lat: stop.lat, lon: stop.lon }),
  ...cityLook(i, 0, -1),
})).filter((p) => p.near);
const FIRST_POSE = svgPose(
  FIRST_CAMERA,
  lettersOf(FIRST),
  FIRST_CITIES.map(({ x, y, clear }) => ({ x, y, clear }))
);
const BOX = SVG_RADIUS + SVG_MARGIN;
const at = (v: number) => (v * SVG_RADIUS).toFixed(1);

/* Variant C, the glyph globe: Euclid's first definition in the language of
   each place the Elements reached, over a globe whose land is printed in that
   language's letters. Picking a language turns the globe to its city and
   steps the passage, its label and the letters on the land through one
   dither step. The radios own the choice, so the server markup switches
   passage and label without JavaScript. */
export default function GlobeC({ caption, tour = 4 }: GlobeCProps) {
  const gt = useGT();
  const m = useMessages();
  const group = useId();
  const captionId = useId();
  const ref = useRef<HTMLElement>(null);
  const touring = tour > 0;
  const lead = !caption || /[.!?。！？]\s*$/.test(caption) ? ' ' : '. ';

  useMountEffect(() => {
    if (!ref.current) return;
    return mountGlyphGlobe(ref.current, tour);
  });

  return (
    <figure
      ref={ref}
      className='not-prose gvc'
      data-testid='blog-globe-c'
      aria-labelledby={captionId}
    >
      <div className='gvc-plate'>
        <div className='gvc-body'>
          <div className='gvc-globe' aria-hidden='true'>
            <svg
              className='gvc-still'
              viewBox={`${-BOX} ${-BOX} ${BOX * 2} ${BOX * 2}`}
              lang={FIRST.lang}
            >
              <circle className='gvc-limb' r={SVG_RADIUS - 0.5} />
              <path
                className='gvc-sea'
                d={FIRST_POSE.sea}
                suppressHydrationWarning
              />
              {FIRST_POSE.runs.map((run) => (
                <text
                  key={run.size}
                  className='gvc-land'
                  fontSize={run.size}
                  x={run.x}
                  y={run.y}
                  suppressHydrationWarning
                >
                  {run.text}
                </text>
              ))}
              {FIRST_CITIES.map((p) => (
                <circle
                  key={p.i}
                  className={p.accent ? 'gvc-here' : 'gvc-city'}
                  cx={at(p.x)}
                  cy={at(p.y)}
                  r={p.dot * SVG_RADIUS}
                  suppressHydrationWarning
                />
              ))}
              <circle
                className='gvc-ring'
                cx={at(FIRST_CITIES[0]?.x ?? 0)}
                cy={at(FIRST_CITIES[0]?.y ?? 0)}
                r={CITY.ring * SVG_RADIUS}
                suppressHydrationWarning
              />
            </svg>
            <canvas className='gvc-canvas' />
            <CityTargets />
          </div>

          {/* every stop in one grid cell: the box keeps the tallest passage */}
          <div className='gvc-stage'>
            {STOPS.map((stop) => (
              <div key={stop.lang} className='gvc-stop' dir={stop.dir}>
                <p className='gvc-passage' lang={stop.lang} dir={stop.dir}>
                  {stop.passage}
                </p>
                {/* one line, or on a narrow plate the coordinates over the city and year */}
                <p className='gvc-label'>
                  <bdi>
                    <span className='gvc-at'>{formatCoordinates(stop)}</span>
                    <span className='gvc-sep'>{' · '}</span>
                    <span>{m(stop.city)}</span>
                    {' · '}
                    <span>{m(stop.yearLabel)}</span>
                  </bdi>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className='gvc-ctl'>
          <div
            className='gvc-pill'
            role='radiogroup'
            aria-label={gt('Language')}
          >
            {STOPS.map((stop, i) => (
              <label key={stop.lang} className='gvc-opt' title={stop.label}>
                <input
                  type='radio'
                  name={group}
                  value={stop.lang}
                  defaultChecked={i === 0}
                />
                <span className='gvc-name' lang={stop.lang} dir={stop.dir}>
                  {stop.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <figcaption className='gvc-cap' id={captionId}>
        {caption ?? (
          <T>
            Euclid&apos;s first definition, in the order the Elements travelled
            from Alexandria to Beijing.
          </T>
        )}
        {/* shown by the engine while the tour runs */}
        {touring ? (
          <span className='gvc-tour'>
            {lead}
            <T>The figure steps through the languages until you pick one.</T>
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}
