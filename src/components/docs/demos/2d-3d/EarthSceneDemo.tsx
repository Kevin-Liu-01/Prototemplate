'use client';

import { useRef, useState } from 'react';

import { Choice, Range } from '../controls';
import { useReducedMotion } from '../hooks';
import Plate from '../Plate';
import { MATRIX_OPTIONS, asMatrix, type MatrixSize } from './bayer';
import MotionControls from './MotionControls';
import type { DitherStageHandle, SceneEnv } from './dither-stage';
import type { Turn } from './drag';
import { buildEarthScene, type EarthLines, type EarthState } from './earth-scene';
import SceneStage from './SceneStage';

import './d23.css';

export type EarthSceneDemoProps = {
  matrix?: MatrixSize;
  cell?: number;
  /** the sun's azimuth in degrees at mount; negative is the viewer's left */
  sun?: number;
  lines?: EarthLines;
};

const CELLS = [
  { value: '1', label: '1px' },
  { value: '2', label: '2px' },
  { value: '3', label: '3px' },
] as const;

const LINES = [
  { value: 'both', label: 'Both' },
  { value: 'coast', label: 'Coast' },
  { value: 'grid', label: 'Graticule' },
  { value: 'none', label: 'None' },
] as const;

/**
 * The lit globe: real land on a sphere, a sun that the reader swings, a
 * 23.4 degree axis, coast and graticule hairlines, printed through the
 * Bayer pass. Drag or the arrow keys turn and tilt it.
 */
export default function EarthSceneDemo({ matrix = 8, cell = 2, sun = -85, lines = 'both' }: EarthSceneDemoProps) {
  const reduced = useReducedMotion();
  const handle = useRef<DitherStageHandle | null>(null);
  const turn = useRef<Turn>({ yaw: 0, pitch: 0, dragging: false });
  const state = useRef<EarthState>({ turn: turn.current, sun, lines });
  const build = useRef((env: SceneEnv) => buildEarthScene(env, () => state.current));
  const [size, setSize] = useState<MatrixSize>(matrix);
  const [cellPx, setCellPx] = useState(cell);
  const [azimuth, setAzimuth] = useState(sun);
  const [drawn, setDrawn] = useState<EarthLines>(lines);
  const [speed, setSpeed] = useState(1);
  const [still, setStill] = useState(false);
  const [cost, setCost] = useState<number | null>(null);

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
    state.current.sun = value;
    handle.current?.invalidate();
  };
  const pickLines = (value: EarthLines) => {
    setDrawn(value);
    state.current.lines = value;
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
          <Choice label='Lines' options={LINES} value={drawn} onChange={pickLines} />
          <Choice label='Matrix' options={MATRIX_OPTIONS} value={String(size)} onChange={pickMatrix} />
          <Choice label='Cell' options={CELLS} value={String(cellPx)} onChange={pickCell} />
          <Range format={(v) => `${v}°`} label='Sun' max={180} min={-180} step={1} value={azimuth} onChange={swing} />
          <MotionControls cost={cost} max={4} min={0} reduced={reduced} speed={speed} still={still} onSpeed={pace} onStill={hold} />
        </>
      }
      height={420}
      label='A lit globe with real coastlines, drawn in three.js and printed through a Bayer screen'
      lazy
      moves
      phoneHeight={320}
      tag={`buildEarthScene({ lines: '${drawn}' })`}
    >
      <SceneStage
        build={build.current}
        handle={handle}
        hint='The lit globe. Drag or use the arrow keys to turn and tilt it.'
        pass={{ matrix: size, cell: cellPx, mode: 'dither', split: 0.5 }}
        pitchLimit={0.7}
        playing={!still}
        speed={speed}
        stillTime={4}
        turn={turn.current}
        onCost={setCost}
      />
    </Plate>
  );
}
