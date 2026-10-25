'use client';

import { useRef, useState } from 'react';

import { Choice } from '../controls';
import { useReducedMotion } from '../hooks';
import Plate from '../Plate';
import CanvasStage, { type CanvasRig } from './CanvasStage';
import MotionControls from './MotionControls';
import { RAIN_SCRIPTS, createGlyphRain, type RainEngine, type RainScript } from './glyph-rain';

import './d23.css';

export type GlyphRainDemoProps = {
  /** drops per column */
  drops?: number;
};

const DROPS = [
  { value: '1', label: 'Sparse' },
  { value: '2', label: 'Medium' },
  { value: '3', label: 'Dense' },
] as const;

/**
 * Glyph rain in sixteen scripts. The near cells around the pointer light
 * up, and the chip in the corner names the script of the column under the
 * pointer, with the word for language in that script.
 */
export default function GlyphRainDemo({ drops = 1 }: GlyphRainDemoProps) {
  const reduced = useReducedMotion();
  const rig = useRef<CanvasRig<RainEngine> | null>(null);
  const [density, setDensity] = useState(drops);
  const [speed, setSpeed] = useState(1);
  const [still, setStill] = useState(false);
  const [cost, setCost] = useState<number | null>(null);
  const [read, setRead] = useState<RainScript | null>(null);

  return (
    <Plate
      controls={
        <>
          <Choice
            label='Drops'
            options={DROPS}
            value={String(density)}
            onChange={(next) => {
              setDensity(Number(next));
              rig.current?.engine.set({ drops: Number(next) });
              rig.current?.loop.invalidate();
            }}
          />
          <MotionControls
            cost={cost}
            max={2}
            min={0.25}
            reduced={reduced}
            speed={speed}
            still={still}
            onSpeed={(v) => {
              setSpeed(v);
              rig.current?.loop.setSpeed(v);
            }}
            onStill={(on) => {
              setStill(on);
              rig.current?.loop.setPlaying(!on);
            }}
          >
            <p className='dmo-bar-status'>{`${RAIN_SCRIPTS.length} scripts`}</p>
          </MotionControls>
        </>
      }
      height={360}
      label='Glyph rain in sixteen scripts that lights up around the pointer'
      lazy
      moves
      phoneHeight={300}
      tag={`createGlyphRain({ drops: ${density} })`}
    >
      <CanvasStage<RainEngine>
        canvasClassName='d23-canvas'
        create={(canvas, inks) => createGlyphRain({ canvas, drops, ink: inks.ink, family: getComputedStyle(canvas).fontFamily })}
        hint='Glyph rain in sixteen scripts. Move the pointer, or tap, to read a column.'
        playing={!still}
        rig={rig}
        onCost={setCost}
        onInks={(current, inks) => current.engine.set({ ink: inks.ink })}
        onPoint={(current, x, y, kind) => {
          const script = current.engine.point(kind === 'leave' ? null : x, y);
          setRead((prev) => (prev?.code === script?.code ? prev : script));
          current.loop.invalidate();
        }}
      >
        {read ? (
          <p className='d23-read'>
            <span>{read.name}</span>
            <span className='d23-read-sample' dir={read.rtl ? 'rtl' : 'ltr'} lang={read.lang}>
              {read.word}
            </span>
            <span className='d23-read-tag'>{read.code}</span>
          </p>
        ) : null}
      </CanvasStage>
    </Plate>
  );
}
