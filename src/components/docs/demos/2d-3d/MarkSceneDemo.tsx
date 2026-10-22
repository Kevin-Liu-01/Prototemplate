'use client';

import { useRef, useState } from 'react';

import { Choice, Range, Toggle } from '../controls';
import { useReducedMotion } from '../hooks';
import Plate from '../Plate';
import { MATRIX_OPTIONS, asMatrix, type MatrixSize } from './bayer';
import CostNote from './CostNote';
import type { DitherStageHandle, PassMode } from './dither-stage';
import type { Turn } from './drag';
import { buildMarkScene, type MarkState } from './mark-scene';
import SceneStage from './SceneStage';

import './d23.css';

export type MarkSceneDemoProps = {
  /** the Bayer matrix's side at mount */
  matrix?: MatrixSize;
  /** a cell's side in CSS pixels at mount */
  cell?: number;
  /** the light's azimuth in degrees at mount; negative is the viewer's left */
  light?: number;
};

const CELLS = [
  { value: '1', label: '1px' },
  { value: '2', label: '2px' },
  { value: '3', label: '3px' },
  { value: '4', label: '4px' },
] as const;

const PASSES = [
  { value: 'dither', label: 'Dither' },
  { value: 'split', label: 'Split' },
  { value: 'tone', label: 'Tone' },
] as const;

/**
 * The extruded GT mark turning under one light, printed through the Bayer
 * pass. Pass shows the screen, the continuous light the screen reads, or
 * both either side of a seam; Matrix and Cell set the screen; Light swings
 * the light's azimuth; Speed sets the turn; drag or the arrow keys turn the
 * mark by hand.
 */
export default function MarkSceneDemo({ matrix = 8, cell = 2, light = -50 }: MarkSceneDemoProps) {
  const reduced = useReducedMotion();
  const handle = useRef<DitherStageHandle | null>(null);
  const turn = useRef<Turn>({ yaw: 0, pitch: 0, dragging: false });
  const state = useRef<MarkState>({ turn: turn.current, light });
  const [size, setSize] = useState<MatrixSize>(matrix);
  const [cellPx, setCellPx] = useState(cell);
  const [mode, setMode] = useState<PassMode>('dither');
  const [azimuth, setAzimuth] = useState(light);
  const [speed, setSpeed] = useState(1);
  const [still, setStill] = useState(false);
  const [cost, setCost] = useState<number | null>(null);

  const build = useRef(buildMarkSceneFor(state));

  const pickMode = (next: PassMode) => {
    setMode(next);
    handle.current?.setPass({ mode: next });
  };
  const pickMatrix = (value: string) => {
    const next = asMatrix(value);
    setSize(next);
    handle.current?.setPass({ matrix: next });
  };
  const pickCell = (value: string) => {
    const next = Number(value);
    setCellPx(next);
    handle.current?.setPass({ cell: next });
  };
  const swing = (value: number) => {
    setAzimuth(value);
    state.current.light = value;
    handle.current?.invalidate();
  };
  const pace = (value: number) => {
    setSpeed(value);
    handle.current?.setSpeed(value);
  };
  const hold = (on: boolean) => {
    setStill(on);
    handle.current?.setPlaying(!on);
  };

  return (
    <Plate
      controls={
        <>
          <Choice label='Pass' options={PASSES} value={mode} onChange={pickMode} />
          <Choice label='Matrix' options={MATRIX_OPTIONS} value={String(size)} onChange={pickMatrix} />
          <Choice label='Cell' options={CELLS} value={String(cellPx)} onChange={pickCell} />
          <Range format={(v) => `${v}°`} label='Light' max={180} min={-180} step={1} value={azimuth} onChange={swing} />
          <Range format={(v) => `${v.toFixed(2)}x`} label='Speed' max={3} min={0} step={0.25} value={speed} onChange={pace} />
          <Toggle disabled={reduced} label='Still' pressed={still || reduced} title='Show the frame a reader with reduced motion sees' onChange={hold} />
          <CostNote ms={cost} still={still || reduced} />
        </>
      }
      height={380}
      label='The GT mark extruded in three.js and printed through a Bayer screen'
      lazy
      moves
      phoneHeight={280}
      tag={`createDitherStage({ matrix: ${size}, cell: ${cellPx} })`}
    >
      <SceneStage
        build={build.current}
        handle={handle}
        hint='The extruded GT mark. Drag or use the arrow keys to turn it.'
        pass={{ matrix: size, cell: cellPx, mode, split: 0.5 }}
        playing={!still}
        speed={speed}
        stillTime={1.1}
        turn={turn.current}
        onCost={setCost}
      />
    </Plate>
  );
}

function buildMarkSceneFor(state: { current: MarkState }) {
  return (env: Parameters<typeof buildMarkScene>[0]) => buildMarkScene(env, () => state.current);
}
