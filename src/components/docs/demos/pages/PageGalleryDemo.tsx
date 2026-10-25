'use client';

import { useId, useState } from 'react';
import type { ReactNode } from 'react';

import { devStates } from '@/components/plate/gallery/devStates';

import { Choice } from '../controls';
import { useTheme } from '../hooks';
import Plate from '../Plate';
import { GALLERY, frameAddress, galleryPage, openAddress, stillOf } from './gallery-pages';
import type { GalleryPage } from './gallery-pages';
import PageFrame, { WIDTH_OPTIONS } from './PageFrame';
import type { FrameTheme, FrameWidth } from './PageFrame';

import './pages.css';

const THEME_OPTIONS: readonly { value: FrameTheme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

/* the dev states by their journey group, in the order devStates.ts lists them */
const STATE_GROUPS: readonly (readonly [string, readonly { id: string; title: string }[]])[] = (() => {
  const groups = new Map<string, { id: string; title: string }[]>();
  for (const state of devStates) {
    const list = groups.get(state.group) ?? [];
    list.push({ id: state.id, title: state.title });
    groups.set(state.group, list);
  }
  return [...groups.entries()];
})();

/** A blank tile's path, from under /d/production, with a break allowed after each slash. */
function tilePath(path: string): ReactNode[] {
  const parts = (path.replace(/^\/d\/production/, '') || '/').split(/(?<=\/)/);
  return parts.flatMap((part, i) => (i === parts.length - 1 ? [part] : [part, <wbr key={i} />]));
}

type TileProps = { page: GalleryPage; theme: FrameTheme; on: boolean; onPick: (id: string) => void };

/** One page in the list: its still in the plate's theme (or its path on a blank tile) and its name. */
function Tile({ page, theme, on, onPick }: TileProps) {
  const still = stillOf(page, theme);
  return (
    <button aria-pressed={on} className={on ? 'pgx-tile is-on' : 'pgx-tile'} type='button' onClick={() => onPick(page.id)}>
      {still ? (
        <img alt='' className='pgx-tile-img' decoding='async' height={360} loading='lazy' src={still} width={640} />
      ) : (
        <span className='pgx-tile-blank'>
          <span className='pgx-tile-path'>{tilePath(page.path)}</span>
        </span>
      )}
      <span className='pgx-tile-name'>{page.name}</span>
    </button>
  );
}

/**
 * Every shipped page of the production mirror and the hub's own pages,
 * one at a time in a live frame. The list under the stage groups the pages
 * by kind and shows each page's still; picking one loads it in the frame.
 * Width lays the page out at 1440 or 390 pixels. Theme starts on the docs
 * theme and follows it; a pick of the other theme holds until the docs
 * theme changes. A sign-in or onboarding page adds State, which opens any
 * state of the journey through the page's ?state= address. A plate keeps
 * one live frame, so the stills carry the list.
 */
export default function PageGalleryDemo() {
  const stateId = useId();
  const [picked, setPicked] = useState('production');
  const [width, setWidth] = useState<FrameWidth>('1440');
  const docsTheme: FrameTheme = useTheme();
  /* the reader's theme for the frame, dropped when the docs theme changes (state adjusted during render, no effect) */
  const [pin, setPin] = useState<FrameTheme | null>(null);
  const [seenDocs, setSeenDocs] = useState(docsTheme);
  if (seenDocs !== docsTheme) {
    setSeenDocs(docsTheme);
    setPin(null);
  }
  const theme = pin ?? docsTheme;
  const [statePick, setStatePick] = useState<{ page: string; state: string } | null>(null);

  const page = galleryPage(picked);
  const state = page.state ? (statePick?.page === page.id ? statePick.state : page.state) : null;
  const src = frameAddress(page, state);

  return (
    <Plate
      bare
      controls={
        <>
          <Choice label='Width' options={WIDTH_OPTIONS} value={width} onChange={setWidth} />
          <Choice
            label='Theme'
            options={THEME_OPTIONS}
            value={theme}
            onChange={(next) => setPin(next === docsTheme ? null : next)}
          />
          {state ? (
            <div className='dmo-field'>
              <label className='dmo-field-label' htmlFor={stateId}>
                State
              </label>
              <select
                className='dmo-input pgx-select'
                id={stateId}
                value={state}
                onChange={(event) => setStatePick({ page: page.id, state: event.currentTarget.value })}
              >
                {STATE_GROUPS.map(([group, states]) => (
                  <optgroup key={group} label={group}>
                    {states.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          ) : null}
          <a className='dmo-btn dmo-link' href={openAddress(page, state)}>
            Open Page
          </a>
          <p className='dmo-bar-status pgx-where'>
            <span className='pgx-where-path'>{src.replace(/[?&]chrome=0$/, '')}</span>
          </p>
          <div aria-label='Pages' className='pgx-list pt-scroll' role='group'>
            {GALLERY.map((kind) => (
              <div aria-labelledby={`${stateId}-${kind.id}`} className='pgx-kind' key={kind.id} role='group'>
                <p className='pgx-kind-label' id={`${stateId}-${kind.id}`}>
                  {kind.label}
                </p>
                <div className='pgx-tiles'>
                  {kind.pages.map((p) => (
                    <Tile key={p.id} on={p.id === page.id} page={p} theme={theme} onPick={setPicked} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      }
      fit
      label={`${page.name}, live at ${width}px in the ${theme} theme`}
      stageClassName='dmo-frame'
      tag={page.path}
    >
      <PageFrame src={src} still={stillOf(page, theme)} theme={theme} title={`${page.name} at ${width} pixels wide`} width={width} />
    </Plate>
  );
}
