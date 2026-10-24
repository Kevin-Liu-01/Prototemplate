'use client';

import { dms } from '../coords';
import type { Place } from '../stories';
import Flag from './Flag';
import Globe from './Globe';

/** A place to read out: a living one with its country's flag, or a historical one ('grc') with none. */
type LocatorPlace = Omit<Place, 'country'> & Partial<Pick<Place, 'country'>>;

type Props = {
  place: LocatorPlace;
  className?: string;
};

/* A place on the globe, read out beside it: the globe with its coordinate
   lines, and a leader line from the pin to the readout, which gives the
   locale over the city and the latitude and the longitude on a line each.
   The coordinates change like a split-flap board when the place moves. */
export default function Locator({ place, className }: Props) {
  return (
    <div className={['gtp-locator', className].filter(Boolean).join(' ')}>
      <Globe
        place={place}
        cell={1}
        graticule
        label={false}
        className='gtp-locator-globe'
      >
        <span className='gtp-locator-leader' aria-hidden='true' />
        <div className='gtp-locator-readout' aria-live='polite'>
          <span className='gtp-locator-locale'>
            {place.country ? <Flag country={place.country} size={16} /> : null}
            {place.locale}
          </span>
          <span className='gtp-locator-city'>{place.city}</span>
          <span className='gtp-locator-coords'>
            <span>{dms(place.lat, 'lat')}</span>
            <span>{dms(place.lon, 'lon')}</span>
          </span>
        </div>
      </Globe>
    </div>
  );
}
