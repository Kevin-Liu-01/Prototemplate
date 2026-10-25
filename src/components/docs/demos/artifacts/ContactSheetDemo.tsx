'use client';

import { useId, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

import { Range, Toggle } from '../controls';
import { useArmed, useReducedMotion } from '../hooks';
import Plate from '../Plate';
import { SHEET_TILE, filmGroups, filmName } from './film-list';
import type { FilmSheet, PublishedFilm } from './films';

import './artifacts.css';

type ContactSheetDemoProps = {
  /** the published films, from films.ts on the server; the plate lists those with a sheet */
  films: readonly PublishedFilm[];
  /** the film shown first */
  initial?: string;
};

/** How many frames the strip under the viewer samples, evenly from the first to the last. */
const STRIP = 10;

/**
 * One tile of the sheet as a CSS crop: the sheet is the background, sized
 * so one 384 px tile spans the box (--k is screen px per sheet px), and
 * moved to the tile's column and row on the 387 by 219 pitch.
 */
function tileStyle(sheet: FilmSheet, frame: number, armed: boolean): CSSProperties {
  return {
    '--sheet-w': sheet.width,
    '--sheet-col': frame % sheet.columns,
    '--sheet-row': Math.floor(frame / sheet.columns),
    backgroundImage: armed ? `url("${sheet.src}")` : undefined,
  };
}

/** A frame's half second: frame k is taken from the middle of k / 2 to (k + 1) / 2 s. */
function halfSecond(frame: number): string {
  const from = frame / SHEET_TILE.perSecond;
  return `${from.toFixed(1)} to ${(from + 1 / SHEET_TILE.perSecond).toFixed(1)} s`;
}

/**
 * A film's contact sheet as a scrubber. The sheet is one WebP of 384 by
 * 216 tiles, eight to a row, two frames a second from frame 0; the viewer
 * shows one tile at a time as a crop of that one image, so scrubbing
 * loads nothing new. Drag across the viewer or the strip, step with the
 * Frame control, or play the sheet at two frames a second, the rate it
 * was cut at. Nothing loads until the plate nears the viewport.
 */
export default function ContactSheetDemo({ films, initial = 'blog-fuma-nama' }: ContactSheetDemoProps) {
  const selectId = useId();
  const root = useRef<HTMLDivElement>(null);
  const armed = useArmed(root);
  const reduced = useReducedMotion();
  const withSheets = films.filter((f) => f.sheet);
  const [slug, setSlug] = useState(initial);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef(0);
  const dragging = useRef(false);

  useMountEffect(() => () => window.clearInterval(timer.current));

  const film = withSheets.find((f) => f.slug === slug) ?? withSheets[0];
  const sheet = film?.sheet;
  if (!film || !sheet) return null;
  const last = sheet.frames - 1;
  const at = Math.min(frame, last);

  const stop = () => {
    window.clearInterval(timer.current);
    setPlaying(false);
  };

  const play = (on: boolean) => {
    if (!on) {
      stop();
      return;
    }
    setPlaying(true);
    window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      setFrame((k) => (k >= last ? 0 : k + 1));
    }, 1000 / SHEET_TILE.perSecond);
  };

  const pick = (next: string) => {
    stop();
    setSlug(next);
    setFrame(0);
  };

  const scrub = (event: PointerEvent<HTMLElement>) => {
    const r = event.currentTarget.getBoundingClientRect();
    if (r.width < 1) return;
    const share = Math.min(1, Math.max(0, (event.clientX - r.left) / r.width));
    setFrame(Math.round(share * last));
  };

  const scrubHandlers = {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      stop();
      dragging.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      scrub(event);
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (dragging.current) scrub(event);
    },
    onPointerUp: () => {
      dragging.current = false;
    },
    onPointerCancel: () => {
      dragging.current = false;
    },
  };

  const strip = Array.from({ length: STRIP }, (_, i) => Math.round((i * last) / (STRIP - 1)));

  return (
    <Plate
      controls={
        <>
          <div className='dmo-field dmo-field-wide'>
            <label className='dmo-field-label' htmlFor={selectId}>
              Film
            </label>
            <select className='dmo-art-select' id={selectId} value={film.slug} onChange={(event) => pick(event.currentTarget.value)}>
              {filmGroups(withSheets).map(([section, list]) => (
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
          <Range
            format={(v) => `${v + 1} of ${sheet.frames}`}
            label='Frame'
            max={last}
            min={0}
            step={1}
            value={at}
            onChange={(v) => {
              stop();
              setFrame(v);
            }}
          />
          <Toggle
            disabled={reduced}
            label='Play'
            pressed={playing && !reduced}
            title='Step through the sheet at two frames a second'
            onChange={play}
          />
          <p className='dmo-bar-status' role='status'>
            Frame <span className='dmo-num'>{at + 1}</span> of {sheet.frames}, from{' '}
            <span className='dmo-num'>{halfSecond(at)}</span> of {film.length}
          </p>
        </>
      }
      fit
      label={`The contact sheet of ${filmName(film)}, frame ${at + 1} of ${sheet.frames}`}
      moves
      tag={sheet.src}
    >
      <div className='dmo-sheet' ref={root}>
        <div className='dmo-sheet-view' {...scrubHandlers}>
          <div className='dmo-sheet-tile' style={tileStyle(sheet, at, armed)} />
        </div>
        <div className='dmo-sheet-strip' {...scrubHandlers}>
          {strip.map((k, i) => (
            <div
              aria-hidden='true'
              className={k <= at && (strip[i + 1] ?? sheet.frames) > at ? 'dmo-sheet-thumb is-on' : 'dmo-sheet-thumb'}
              key={i}
            >
              <div className='dmo-sheet-tile' style={tileStyle(sheet, k, armed)} />
            </div>
          ))}
        </div>
      </div>
    </Plate>
  );
}
