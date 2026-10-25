'use client';

import { useRef, useState } from 'react';

import { Choice } from '../controls';
import { useReducedMotion } from '../hooks';
import Plate from '../Plate';
import { asMatrix, type MatrixSize } from './bayer';
import CanvasStage, { type CanvasRig } from './CanvasStage';
import MotionControls from './MotionControls';
import { createFlowField, type FlowEngine } from './flow-field';

import './d23.css';

export type FlowFieldDemoProps = {
  cell?: number;
  count?: number;
  /** the random walk's diffusivity in px² per second */
  spread?: number;
  matrix?: MatrixSize;
};

const CELLS = [
  { value: '1', label: '1px' },
  { value: '2', label: '2px' },
  { value: '3', label: '3px' },
] as const;

const SPREADS = [
  { value: '0', label: 'None' },
  { value: '2', label: 'Low' },
  { value: '10', label: 'High' },
] as const;

const MATRICES = [
  { value: '4', label: '4×4' },
  { value: '8', label: '8×8' },
] as const;

/**
 * The flow field: particles in a divergence-free stream that splits
 * around the pointer, printed as a dithered density. The obstacle follows
 * the pointer and stays where the pointer leaves it; on a phone a tap
 * places it.
 */
export default function FlowFieldDemo({ cell = 2, count = 2400, spread = 2, matrix = 8 }: FlowFieldDemoProps) {
  const reduced = useReducedMotion();
  const rig = useRef<CanvasRig<FlowEngine> | null>(null);
  const [cellPx, setCellPx] = useState(cell);
  const [drift, setDrift] = useState(spread);
  const [size, setSize] = useState<MatrixSize>(matrix);
  const [speed, setSpeed] = useState(1);
  const [still, setStill] = useState(false);
  const [cost, setCost] = useState<number | null>(null);

  const change = (patch: Parameters<FlowEngine['set']>[0]) => {
    const current = rig.current;
    if (!current) return;
    current.engine.set(patch);
    if (still || reduced) current.engine.still();
    current.loop.invalidate();
  };

  return (
    <Plate
      controls={
        <>
          <Choice
            label='Cell'
            options={CELLS}
            value={String(cellPx)}
            onChange={(v) => {
              setCellPx(Number(v));
              change({ cell: Number(v) });
            }}
          />
          <Choice
            label='Spread'
            options={SPREADS}
            value={String(drift)}
            onChange={(v) => {
              setDrift(Number(v));
              change({ spread: Number(v) });
            }}
          />
          <Choice
            label='Matrix'
            options={MATRICES}
            value={String(size)}
            onChange={(v) => {
              setSize(asMatrix(v));
              change({ matrix: asMatrix(v) });
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
          />
        </>
      }
      height={360}
      label='A smoke rake whose filaments part around the pointer, printed as a dithered density'
      lazy
      moves
      phoneHeight={280}
      tag={`createFlowField({ cell: ${cellPx}, spread: ${drift} })`}
    >
      <CanvasStage<FlowEngine>
        canvasClassName='d23-cells'
        create={(canvas, inks) => createFlowField({ canvas, cell, count, spread, matrix, ink: inks.ink })}
        hint='A smoke rake in a stream. Move the pointer, or tap, to place the obstacle.'
        playing={!still}
        rig={rig}
        onCost={setCost}
        onInks={(current, inks) => current.engine.set({ ink: inks.ink })}
        onPoint={(current, x, y, kind) => {
          if (kind === 'leave') return;
          const settle = !current.loop.running();
          if (settle && kind !== 'down') return;
          current.engine.point(x, y, settle);
          current.loop.invalidate();
        }}
      />
    </Plate>
  );
}
