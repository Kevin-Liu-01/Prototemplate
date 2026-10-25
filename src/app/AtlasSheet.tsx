'use client';

import Link from 'next/link';
import { useRef } from 'react';

import { HOME, dms } from '@/app/atlas/(magazine)/_atlas/coords';
import { HOME_CITY } from '@/app/atlas/(magazine)/_atlas/edition';
import Globe from '@/app/atlas/(magazine)/_atlas/ui/Globe';
import HallGuides from '@/app/atlas/(magazine)/_atlas/ui/HallGuides';

import PrototemplateHero, { type HeroRules } from './PrototemplateHero';

// Atlas's faces, its parts (the globe) and its front page (the hall's grounds, its guides and the globe's dial), read
// from the magazine itself
import '@/app/atlas/(magazine)/_atlas/styles/tokens.css';
import '@/app/atlas/(magazine)/_atlas/styles/parts.css';
import '@/app/atlas/(magazine)/_atlas/styles/front-page.css';
import './atlas-sheet.css';

/* The home's first screen as a sheet of Atlas, General Translation's
   magazine (/atlas). The sheet carries the hall's own classes, so it takes
   the hall's stock (black, or paper in the light theme), its grain, its
   guides (HallGuides) and its globe's dial from front-page.css; this file
   and atlas-sheet.css set only what differs: the measures read from the
   sheet's width rather than the window's, and the parts. The nameplate is
   the specimen (PrototemplateHero) in Atlas's Katagami, ruled on its own
   cap line and baseline as Atlas rules its wordmark; the coordinates and
   the hub's volumes stand at the top right, and the dithered globe in its
   dial at the foot. */

/** The hub's volumes, as Atlas lists its topics: each a path and its page. */
const VOLUMES = ['/brand', '/deck', '/docs', '/atlas'] as const;

export default function AtlasSheet() {
  const sheet = useRef<HTMLDivElement>(null);

  /* the nameplate's rules, handed to the guides so the grid's row references centre in the rows they make */
  const onRules = ({ cap, base }: HeroRules) => {
    const el = sheet.current;
    if (!el) return;
    el.style.setProperty('--ah-cap-y', `${cap}px`);
    el.style.setProperty('--ah-base-y', `${base}px`);
    el.dataset.ruled = 'true';
  };

  return (
    <div ref={sheet} className='ah-sheet gtp-landing pt-faces-atlas' data-edition='magazine'>
      <HallGuides count={0} />

      <div className='ah-head'>
        <p className='ah-dms'>
          <span>{dms(HOME.lat, 'lat')}</span>
          <span>{dms(HOME.lon, 'lon')}</span>
        </p>
        <nav className='ah-volumes' aria-label='Volumes'>
          {VOLUMES.map((path) =>
            path === '/deck' ? (
              // the deck is a static document, loaded as a page (src/lib/document-routes.ts)
              <a key={path} className='ah-chip-path' href={path}>
                {path}
              </a>
            ) : (
              <Link key={path} className='ah-chip-path' href={path}>
                {path}
              </Link>
            )
          )}
        </nav>
      </div>

      <PrototemplateHero ruled onRules={onRules} />

      <div className='ah-foot'>
        <span className='gtp-globe-button ah-dial'>
          <Globe place={HOME_CITY} className='gtp-instrument-globe' cell={0.5} graticule label={false} />
        </span>
        <span className='ah-city'>{HOME_CITY.city}</span>
      </div>
    </div>
  );
}
