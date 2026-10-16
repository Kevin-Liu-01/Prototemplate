'use client';

import type { RefObject } from 'react';
import { useRef, useState } from 'react';

import BrandFilm from '@/app/brand/BrandFilm';
import type { MotionFilm } from '@/lib/motion';
import { useMountEffect } from '@/lib/use-mount-effect';

import type { FilmCut } from './cuts';
import { filmCuts } from './cuts';
import LanguageToggle from './LanguageToggle';

export type FilmCutState = {
  cuts: readonly FilmCut[];
  /** the cut on screen; the base (English) cut until the toggle picks another */
  current: FilmCut;
  choose: (key: string) => void;
  /** true when the cut the toggle replaced was playing, so the new one starts at once */
  autoStart: boolean;
  figureRef: RefObject<HTMLElement | null>;
};

/**
 * The cut a film shows: the base cut, or the language version the toggle
 * picked. A row or a page that swaps more than the player (the records, the
 * meta line) reads `current.film` for them. A switch while the film plays
 * keeps it playing in the new language, from the start. An old anchor to a
 * version's own row (`#film-slash-announcement-de`, from before the versions
 * were one entry) opens that version and is rewritten to the film's row
 * before the shell reads the hash: this mount effect runs before the
 * shell's, which is its ancestor.
 */
export function useFilmCut(film: MotionFilm): FilmCutState {
  const cuts = filmCuts(film);
  const [key, setKey] = useState(film.slug);
  const [autoStart, setAutoStart] = useState(false);
  const figureRef = useRef<HTMLElement>(null);
  const current = cuts.find((cut) => cut.key === key) ?? { key: film.slug, rowId: film.id, language: film.language, film };

  const choose = (next: string) => {
    if (next === key) return;
    const video = figureRef.current?.querySelector('video');
    setAutoStart(Boolean(video && !video.paused && !video.ended));
    setKey(next);
  };

  useMountEffect(() => {
    const hash = decodeURIComponent(window.location.hash.replace(/^#/, ''));
    const version = cuts.slice(1).find((cut) => cut.rowId === hash);
    if (!version) return;
    setKey(version.key);
    window.history.replaceState(window.history.state, '', `#${film.id}`);
  });

  return { cuts, current, choose, autoStart, figureRef };
}

type FilmCutPlayerProps = {
  film: MotionFilm;
  state: FilmCutState;
  /** the figure's classes: `mo-film`, plus `mo-head-film` at the head of a package */
  className: string;
};

/**
 * The language toggle over the film, and the film: the chosen cut's web
 * copy, poster and captions in BrandFilm, remounted per cut so the play
 * button and the poster come back with it. The 16:9 box is reserved by the
 * video's width and height, and the toggle keeps its place, so a switch
 * moves nothing. A film with one cut gets the player alone.
 */
export default function FilmCutPlayer({ film, state, className }: FilmCutPlayerProps) {
  const { cuts, current, choose, autoStart, figureRef } = state;
  const media = current.film.media;
  const many = cuts.length > 1;
  const language = current.language;
  const name = `the ${film.title} film${many && language ? `, in ${language.language}` : ''}`;
  return (
    <>
      {many ? (
        <LanguageToggle
          label={`Language of the ${film.title} film`}
          options={cuts.flatMap((cut) => (cut.language ? [{ value: cut.key, language: cut.language }] : []))}
          value={current.key}
          onChange={choose}
        />
      ) : null}
      {media ? (
        <figure ref={figureRef} className={className}>
          <BrandFilm
            key={current.key}
            autoStart={autoStart}
            captions={current.film.captions}
            captionsLang={language ? { locale: language.locale, label: language.name } : undefined}
            name={name}
            poster={media.poster}
            src={media.video}
          />
        </figure>
      ) : null}
    </>
  );
}
