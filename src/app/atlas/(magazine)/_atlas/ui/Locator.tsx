'use client';

import { dms, type LatLon } from '../coords';
import Flag from './Flag';
import Globe from './Globe';

export type LocatorPlace = LatLon & {
  city: string;
  /** BCP 47 for a living place ('es-MX'), or a language code for a historical one ('grc'). */
  locale: string;
  /** The country whose flag flies over the locale, when there is one. */
  country?: string;
};

type Props = {
  place: LocatorPlace;
  /** A line under the city: the year of a historical version. */
  note?: string;
  className?: string;
  /** CSS pixels per dither cell, rounded to whole device pixels. */
  cell?: number;
};

/* A place on the globe, read out beside it: the globe with its coordinate
   lines, and a leader line from the pin to the readout, which gives the
   locale over the city and the latitude and the longitude on a line each.
   The coordinates change like a split-flap board when the place moves. */
export default function Locator({ place, note, className, cell = 1 }: Props) {
  return (
    <div className={['gtp-locator', className].filter(Boolean).join(' ')}>
      <Globe place={place} cell={cell} graticule label={false} className='gtp-locator-globe'>
        <span className='gtp-locator-leader' aria-hidden='true' />
        <div className='gtp-locator-readout' aria-live='polite'>
          <span className='gtp-locator-locale'>
            {place.country ? <Flag country={place.country} size={16} /> : null}
            {place.locale}
          </span>
          <span className='gtp-locator-city'>{place.city}</span>
          {note ? <span className='gtp-locator-note'>{note}</span> : null}
          <span className='gtp-locator-coords'>
            <span>{dms(place.lat, 'lat')}</span>
            <span>{dms(place.lon, 'lon')}</span>
          </span>
        </div>
      </Globe>
    </div>
  );
}
