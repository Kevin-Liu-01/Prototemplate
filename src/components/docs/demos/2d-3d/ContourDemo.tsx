'use client';

import { useRef, useState } from 'react';

import { Choice } from '../controls';
import { useReducedMotion } from '../hooks';
import Plate from '../Plate';
import CanvasStage, { type CanvasRig } from './CanvasStage';
import { createContours, type ContourEngine, type ContourMode } from './contours';
import MotionControls from './MotionControls';

import './d23.css';

export type ContourDemoProps = {
  mode?: ContourMode;
  interval?: number;
};

const MODES = [
  { value: 'both', label: 'Both' },
  { value: 'contours', label: 'Contours' },
  { value: 'hachures', label: 'Hachures' },
] as const;

const INTERVALS = [
  { value: '0.035', label: 'Fine' },
  { value: '0.05', label: 'Medium' },
  { value: '0.08', label: 'Coarse' },
] as const;

/**
 * Contours and hachures over one drifting height field, with a hill that
 * follows the pointer. On a phone a tap places the hill.
 */
export default function ContourDemo({ mode = 'both', interval = 0.05 }: ContourDemoProps) {
  const reduced = useReducedMotion();
  const rig = useRef<CanvasRig<ContourEngine> | null>(null);
  const [drawn, setDrawn] = useState<ContourMode>(mode);
  const [step, setStep] = useState(interval);
  const [speed, setSpeed] = useState(1);
  const [still, setStill] = useState(false);
  const [cost, setCost] = useState<number | null>(null);

  const change = (patch: Parameters<ContourEngine['set']>[0]) => {
    rig.current?.engine.set(patch);
    rig.current?.loop.invalidate();
  };

  return (
    <Plate
      controls={
        <>
          <Choice
            label='Lines'
            options={MODES}
            value={drawn}
            onChange={(next) => {
              setDrawn(next);
              change({ mode: next });
            }}
          />
          <Choice
            label='Interval'
            options={INTERVALS}
            value={String(step)}
            onChange={(next) => {
              setStep(Number(next));
              change({ interval: Number(next) });
            }}
          />
          <MotionControls
            cost={cost}
            max={4}
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
          />
        </>
      }
      height={360}
      label='Contour lines and hachures drawn over a drifting height field'
      lazy
      moves
      phoneHeight={280}
      tag={`createContours({ mode: '${drawn}' })`}
    >
      <CanvasStage<ContourEngine>
        canvasClassName='d23-canvas'
        create={(canvas, inks) => createContours({ canvas, mode, interval, ink: inks.ink })}
        hint='Contours and hachures. Move the pointer, or tap, to raise a hill.'
        playing={!still}
        rig={rig}
        onCost={setCost}
        onInks={(current, inks) => current.engine.set({ ink: inks.ink })}
        onPoint={(current, x, y, kind) => {
          if (kind === 'leave') return;
          current.engine.point(x, y, !current.loop.running());
          current.loop.invalidate();
        }}
      />
    </Plate>
  );
}
