'use client';

import { useId, useRef, useState } from 'react';

import BrandFilm from '@/app/brand/BrandFilm';

import Plate from '../Plate';
import { filmGroups, filmName } from './film-list';
import type { PublishedFilm } from './films';

import './artifacts.css';

type FilmPlayerDemoProps = {
  /** the published films, from films.ts on the server */
  films: readonly PublishedFilm[];
  /** the film shown first */
  initial?: string;
};

/**
 * BrandFilm, the player on /brand and /motion, over every published film.
 * The poster is a lazy image inside a play button and the video preloads
 * nothing, so the plate costs one poster until the reader presses play. A
 * pick while a film plays starts the next film at once; a pick while it is
 * paused shows the next film's poster.
 */
export default function FilmPlayerDemo({ films, initial = 'blog-designing-docs' }: FilmPlayerDemoProps) {
  const selectId = useId();
  const frame = useRef<HTMLDivElement>(null);
  const [slug, setSlug] = useState(initial);
  const [autoStart, setAutoStart] = useState(false);
  const film = films.find((f) => f.slug === slug) ?? films[0];
  if (!film) return null;

  const pick = (next: string) => {
    const video = frame.current?.querySelector('video');
    setAutoStart(Boolean(video && !video.paused && !video.ended));
    setSlug(next);
  };

  return (
    <Plate
      controls={
        <>
          <div className='dmo-field dmo-field-wide'>
            <label className='dmo-field-label' htmlFor={selectId}>
              Film
            </label>
            <select className='dmo-art-select' id={selectId} value={film.slug} onChange={(event) => pick(event.currentTarget.value)}>
              {filmGroups(films).map(([section, list]) => (
                <optgroup key={section} label={section}>
                  {list.map((f) => (
                    <option key={f.slug} value={f.slug}>
                      {filmName(f)}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <p className='dmo-bar-status'>
            <span className='dmo-num'>{film.length}</span>, {films.length} published films
          </p>
        </>
      }
      fit
      label={`The film player showing ${filmName(film)}`}
      tag='<BrandFilm src poster name />'
    >
      <div className='dmo-film' ref={frame}>
        <BrandFilm
          autoStart={autoStart}
          captions={film.captions}
          captionsLang={film.captionsLang}
          key={film.slug}
          name={filmName(film)}
          poster={film.poster}
          src={film.video}
        />
      </div>
    </Plate>
  );
}
