'use client';

import { useId, useRef } from 'react';
import { T, useMessages } from '@/app/d/blog-globe/_shared/i18n';

import { useMountEffect } from '@/lib/use-mount-effect';

import CityTargets from '@/app/d/blog-globe/_rounds/r3/CityTargets';
import LanguageLinks from '@/app/d/blog-globe/_rounds/r3/LanguageLinks';
import Passage from '@/app/d/blog-globe/_rounds/r3/Passage';
import { formatCoordinates, STOPS } from '@/app/d/blog-globe/_rounds/r3/stops';

import {
  CITY,
  SVG_MARGIN,
  SVG_RADIUS,
  cameraOf,
  lettersOf,
  svgPose,
  windowCities,
} from './glyph-globe';
import { mountGlyphGlobe } from './mount-glyph-globe';

import './glyph-globe.css';

type GlobeCProps = {
  /** The figure's caption; by default a line on the passage's route. */
  caption?: string;
  /** seconds per stop on the guided tour; 0 (the default) turns it off */
  tour?: number;
};

/* The first stop's window as SVG, so the server markup shows Alexandria in
   Greek before the canvas takes over (and without JavaScript); the theme's
   inks come from CSS. Floats can differ by an ulp between the server's
   engine and the browser's, so the drawn nodes keep a fixed shape and
   suppress the attribute check. */
const [FIRST] = STOPS;
const FIRST_CAMERA = cameraOf(FIRST);
const FIRST_CITIES = windowCities(STOPS, FIRST_CAMERA, 0, -1);
const FIRST_HERE = FIRST_CITIES.find((p) => p.accent);
const FIRST_POSE = svgPose(
  FIRST_CAMERA,
  lettersOf(FIRST),
  FIRST_CITIES.map(({ x, y, clear }) => ({ x, y, clear }))
);
const BOX = SVG_RADIUS + SVG_MARGIN;
const at = (v: number) => (v * SVG_RADIUS).toFixed(1);

/* Variant C, the glyph globe: Euclid's first eight definitions in the
   language of each place the Elements reached, beside a close window on the
   globe whose land is printed in that language's letters. Picking a
   language, or a city in the window, turns the globe to its city and steps
   the passage, the label and the letters on the land through the dither
   screen. The radios own the choice, so the server markup switches passage
   and label without JavaScript. */
export default function GlobeC({ caption, tour = 0 }: GlobeCProps) {
  const m = useMessages();
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
        <div className='gvc-where'>
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
                cx={at(FIRST_HERE?.x ?? 0)}
                cy={at(FIRST_HERE?.y ?? 0)}
                r={CITY.ring * SVG_RADIUS}
                suppressHydrationWarning
              />
            </svg>
            <canvas className='gvc-canvas' />
            <CityTargets />
          </div>

          {/* every stop's label in one grid cell: the coordinates over the city and year */}
          <div className='gvc-tags'>
            {STOPS.map((stop) => (
              <p key={stop.lang} className='gvc-tag'>
                <bdi>
                  <span className='gvc-at'>{formatCoordinates(stop)}</span>
                  <span className='gvc-sep'>{' · '}</span>
                  <span>{m(stop.city)}</span>
                  {' · '}
                  <span>{m(stop.yearLabel)}</span>
                </bdi>
              </p>
            ))}
          </div>
        </div>

        <div className='gvc-text'>
          <LanguageLinks className='gvc-links' />
          <Passage lines={8} className='gvc-lines' />
        </div>
      </div>

      <figcaption className='gvc-cap' id={captionId}>
        {caption ?? (
          <T>
            Euclid&apos;s first eight definitions, in the order the Elements
            travelled from Alexandria to Beijing.
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
