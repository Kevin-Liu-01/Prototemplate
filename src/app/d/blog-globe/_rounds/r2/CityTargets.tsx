'use client';

import { useMessages } from '@/app/d/blog-globe/_shared/i18n';

import { STOPS } from '@/app/d/blog-globe/_rounds/r2/stops';

import './city-targets.css';

/* One hit target per stop, laid over a globe figure's drawn disc: put it
   last inside a positioned box the size of the drawing. The targets stay
   hidden until the variant's engine places them (mountCityTargets in
   targets.ts). They are hidden from assistive technology and out of the
   tab order, since the figure's radios already give keyboard and screen
   reader access to the same choice. */
export default function CityTargets() {
  const m = useMessages();
  return (
    <div className='gct' aria-hidden='true' data-testid='blog-globe-targets'>
      {STOPS.map((stop) => (
        <span
          key={stop.lang}
          className='gct-target'
          data-stop={stop.lang}
          tabIndex={-1}
        >
          <span className='gct-name'>{m(stop.city)}</span>
        </span>
      ))}
    </div>
  );
}
