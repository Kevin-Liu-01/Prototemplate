'use client';

import { useRef, useState } from 'react';

import { loadPictureTone, type PictureTone } from '@/components/plate/lib/picture-field';
import { useLayoutWork } from '@/lib/use-layout-work';

import { Action, Choice, Range } from '../controls';
import { useArmed } from '../hooks';
import Plate from '../Plate';
import { screenPicture, useMoodPick } from './mood-pick';
import { MOOD_THEMES, type MoodEntry, type MoodTheme } from './pictures';

import './artifacts.css';

type PaneProps = {
  armed: boolean;
  entry: MoodEntry;
  theme: MoodTheme;
  cell: number;
  opacity: number;
};

/**
 * One theme's pane: the grid screened at the pane's size on screen, drawn
 * again when the picture, the cell or the pane's size changes. The
 * opacity is the canvas's own, so a change of it draws nothing.
 */
function ScreenPane({ armed, entry, theme, cell, opacity }: PaneProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const spec = MOOD_THEMES[theme];

  useLayoutWork(
    () => {
      const el = canvas.current;
      if (!el || !armed) return;
      let alive = true;
      let tone: PictureTone | null = null;
      const draw = () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        if (!tone || w < 2 || h < 2) return;
        screenPicture(el, tone, entry, w, h, cell, spec.ink);
      };
      loadPictureTone(entry.src).then(
        (grid) => {
          if (!alive) return;
          tone = grid;
          draw();
        },
        () => {
          /* the pane keeps its ground; the caption still names the picture */
        }
      );
      const resize = new ResizeObserver(draw);
      resize.observe(el);
      return () => {
        alive = false;
        resize.disconnect();
      };
    },
    { dependencies: [armed, entry.key, cell, spec.ink], revertOnUpdate: true }
  );

  return (
    <div className={`dmo-art-pane is-${theme}`}>
      <canvas aria-hidden='true' className='dmo-art-canvas' ref={canvas} style={{ opacity }} />
      <span aria-hidden='true' className='dmo-art-chip'>
        {theme === 'dark' ? 'Dark' : 'Light'} {opacity.toFixed(2)}
      </span>
    </div>
  );
}

const CELLS = [
  { value: '1', label: '1px' },
  { value: '2', label: '2px' },
  { value: '3', label: '3px' },
  { value: '4', label: '4px' },
] as const;

/**
 * An artifact picture screened live from its tone grid in both themes at
 * once, with the standard's settings: 1 CSS px cells, white at 0.62 over
 * ink in the dark theme and ink at 0.7 over white in the light theme. The
 * cell and the two opacities are controls, and Standard puts them back.
 */
export default function MoodScreenDemo() {
  const panes = useRef<HTMLDivElement>(null);
  const armed = useArmed(panes);
  const { entry, controls } = useMoodPick({ set: 'plate', name: 'rosetta' });
  const [cell, setCell] = useState(1);
  const [dark, setDark] = useState<number>(MOOD_THEMES.dark.opacity);
  const [light, setLight] = useState<number>(MOOD_THEMES.light.opacity);
  const standard = cell === 1 && dark === MOOD_THEMES.dark.opacity && light === MOOD_THEMES.light.opacity;

  return (
    <Plate
      controls={
        <>
          {controls}
          <Choice label='Cell' options={CELLS} value={String(cell)} onChange={(v) => setCell(Number(v))} />
          <Range format={(v) => v.toFixed(2)} label='Dark opacity' max={1} min={0.2} step={0.01} value={dark} onChange={setDark} />
          <Range format={(v) => v.toFixed(2)} label='Light opacity' max={1} min={0.2} step={0.01} value={light} onChange={setLight} />
          <Action
            disabled={standard}
            title='Put the cell and both opacities back to the standard'
            onClick={() => {
              setCell(1);
              setDark(MOOD_THEMES.dark.opacity);
              setLight(MOOD_THEMES.light.opacity);
            }}
          >
            Standard
          </Action>
        </>
      }
      fit
      label={`${entry.title} screened in the dark and the light theme`}
      tag={`pictureField(tone, { placement }) at ${cell}px`}
    >
      <div className='dmo-art-panes' ref={panes}>
        <ScreenPane armed={armed} cell={cell} entry={entry} opacity={dark} theme='dark' />
        <ScreenPane armed={armed} cell={cell} entry={entry} opacity={light} theme='light' />
      </div>
      <p className='dmo-art-caption'>
        <span className='dmo-art-caption-title'>{entry.title}</span> {entry.credit}
      </p>
    </Plate>
  );
}
