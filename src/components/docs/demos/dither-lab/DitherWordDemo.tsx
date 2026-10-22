'use client';

import { useId, useRef, useState } from 'react';

import { SCRIPTS } from '@/lib/glyph-field';
import { useLayoutWork } from '@/lib/use-layout-work';
import { useMountEffect } from '@/lib/use-mount-effect';

import { Choice } from '../controls';
import { useTheme } from '../hooks';
import Plate from '../Plate';
import { useBox } from './hooks';
import { PALETTE_OPTIONS, blit, packColor, readPalette, snapCell, surfaceFor, type Palette } from './raster';
import { screenTone, type ScreenId } from './screens';
import { textShape, wordTone, type CellShape, type WordStyle } from './shapes';

import './dither-lab.css';

const STYLES: readonly { value: WordStyle; label: string }[] = [
  { value: 'fringe', label: 'Fringe' },
  { value: 'ramp', label: 'Ramp' },
  { value: 'shade', label: 'Shade' },
  { value: 'glow', label: 'Glow' },
  { value: 'shadow', label: 'Shadow' },
];

type WordScreen = Extract<ScreenId, 'bayer4' | 'bayer8' | 'halftone'>;

const SCREENS: readonly { value: WordScreen; label: string }[] = [
  { value: 'bayer4', label: '4 by 4' },
  { value: 'bayer8', label: '8 by 8' },
  { value: 'halftone', label: 'Halftone' },
];

type StageProps = { text: string; style: WordStyle; screen: WordScreen; cellPx: number; palette: Palette };

function WordStage({ text, style, screen, cellPx, palette }: StageProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const size = useBox();
  const theme = useTheme();
  const [fonts, setFonts] = useState(0);
  const cache = useRef<{ key: string; shape: CellShape } | null>(null);

  /* the canvas reads the house face by name, so the shape waits for the webfont */
  useMountEffect(() => {
    let live = true;
    void document.fonts?.ready.then(() => {
      if (live) setFonts((n) => n + 1);
    });
    return () => {
      live = false;
    };
  });

  useLayoutWork(
    () => {
      const el = canvas.current;
      if (!el || size.w < 40 || size.h < 40) return;
      const cell = snapCell(cellPx);
      const cols = Math.floor(size.w / cell);
      const rows = Math.floor(size.h / cell);
      const family = getComputedStyle(el).fontFamily;
      const key = `${text}|${cols}x${rows}|${family}|${fonts}`;
      if (cache.current?.key !== key) cache.current = { key, shape: textShape(text, family, cols, rows) };
      const tone = wordTone(cache.current.shape, style, new Float32Array(cols * rows));
      const index = new Uint8Array(cols * rows);
      screenTone(screen, tone, cols, rows, index, cols, 0, 0, { pitch: 5 });
      const surface = surfaceFor(el, cols, rows, cell);
      if (!surface) return;
      const { ink, paper } = readPalette(el, palette);
      blit(surface, index, new Uint32Array([packColor(paper), packColor(ink)]));
    },
    { dependencies: [size.w, size.h, text, style, screen, cellPx, palette, theme, fonts] }
  );

  return (
    <div className='dl-box is-flush'>
      <div className='dl-fill' ref={size.ref}>
        <div className='dl-frame'>
          <canvas aria-hidden='true' className='dl-canvas dl-type-canvas' ref={canvas} />
        </div>
      </div>
    </div>
  );
}

/** The word "language" in the eight scripts of the glyph field, for the word row. */
const WORDS = SCRIPTS.map((s) => ({ value: s.word, label: s.word, lang: s.lang }));

/**
 * A line of type in the house face rasterized at three pixels a cell, its
 * signed distance field measured, and the field set as dither cells in one
 * of five styles. The reader types the line or picks the word "language"
 * in one of eight scripts.
 */
export default function DitherWordDemo() {
  const inputId = useId();
  const [text, setText] = useState('Every language');
  const [style, setStyle] = useState<WordStyle>('glow');
  const [screen, setScreen] = useState<WordScreen>('bayer8');
  const [cellPx, setCellPx] = useState(3);
  const [palette, setPalette] = useState<Palette>('theme');

  return (
    <Plate
      controls={
        <>
          <div className='dmo-field dmo-field-wide'>
            <label className='dmo-field-label' htmlFor={inputId}>
              Words
            </label>
            <input
              className='dmo-input dmo-input-wide'
              id={inputId}
              maxLength={28}
              spellCheck={false}
              type='text'
              value={text}
              onChange={(event) => setText(event.currentTarget.value)}
            />
          </div>
          <Choice label='Language' options={WORDS} value={text} onChange={setText} />
          <Choice label='Style' options={STYLES} value={style} onChange={setStyle} />
          <Choice label='Screen' options={SCREENS} value={screen} onChange={setScreen} />
          <Choice
            label='Cell'
            options={[
              { value: '2', label: '2px' },
              { value: '3', label: '3px' },
              { value: '4', label: '4px' },
              { value: '6', label: '6px' },
            ]}
            value={String(cellPx)}
            onChange={(v) => setCellPx(Number(v))}
          />
          <Choice label='Ink' options={PALETTE_OPTIONS} value={palette} onChange={setPalette} />
        </>
      }
      height={300}
      label={`The words "${text}" set as dither cells in the ${style} style`}
      lazy
      phoneHeight={200}
      tag={`textShape('${text.length > 18 ? `${text.slice(0, 18)}...` : text}')`}
    >
      <WordStage cellPx={cellPx} palette={palette} screen={screen} style={style} text={text} />
    </Plate>
  );
}
