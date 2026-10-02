'use client';

import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';

type BrandFilmProps = {
  /** the film under public/media, as a root path */
  src: string;
  /** its poster, the film's title card */
  poster: string;
  /** what the film is called to a screen reader: `the Fuma Nama trailer` */
  name: string;
};

/**
 * One blog film in Made with the system. The browser draws its control bar
 * over the bottom of a paused video, which is where the Fuma Nama title
 * card sets its title, so the video carries no controls until it is first
 * played. Until then a play button covers the frame and the whole poster
 * shows. The first press starts the film, turns the native controls on and
 * moves focus to the video, so the keyboard reaches those controls next.
 * The width and height attributes reserve the 16:9 box before the metadata
 * arrives, and turning the controls on does not change it.
 */
export default function BrandFilm({ src, poster, name }: BrandFilmProps) {
  const video = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  function play() {
    const el = video.current;
    if (!el) return;
    el.play().catch(() => {
      /* a refused play leaves the native controls on, so the visitor can start it there */
    });
    flushSync(() => setStarted(true));
    el.focus();
  }

  return (
    <div className='ptb-film'>
      <video
        aria-label={name}
        controls={started}
        height={1080}
        playsInline
        poster={poster}
        preload='metadata'
        ref={video}
        src={src}
        width={1920}
      />
      {started ? null : (
        <button aria-label={`play ${name}`} className='ptb-film-play' onClick={play} type='button'>
          <span aria-hidden className='ptb-film-badge'>
            <svg viewBox='0 0 16 16'>
              <path d='M5.5 3v10l8-5z' />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}
