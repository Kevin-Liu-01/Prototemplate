'use client';

import { useRef, useState } from 'react';

import { Choice, Range, Toggle } from '../controls';
import { useReducedMotion } from '../hooks';
import Plate from '../Plate';
import { MATRIX_OPTIONS, asMatrix, type MatrixSize } from './bayer';
import CostNote from './CostNote';
import type { DitherStageHandle, SceneEnv } from './dither-stage';
import type { Turn } from './drag';
import SceneStage from './SceneStage';
import { STACK_LAYERS, buildStackScene, type StackState } from './stack-scene';

import './d23.css';

export type StackSceneDemoProps = {
  matrix?: MatrixSize;
  cell?: number;
  /** the light's azimuth from the viewer's line in degrees; negative is the left */
  light?: number;
};

const CELLS = [
  { value: '1', label: '1px' },
  { value: '2', label: '2px' },
  { value: '3', label: '3px' },
] as const;

/**
 * The pipeline stack: three isometric plates that open and close on one
 * clock, printed through the Bayer pass with hairline edges and leaders.
 * A drag turns the stack about its axis and it eases back to the
 * isometric view on release.
 */
export default function StackSceneDemo({ matrix = 4, cell = 2, light = -70 }: StackSceneDemoProps) {
  const reduced = useReducedMotion();
  const handle = useRef<DitherStageHandle | null>(null);
  const turn = useRef<Turn>({ yaw: 0, pitch: 0, dragging: false });
  const labels = useRef<(HTMLElement | null)[]>([null, null, null]);
  const state = useRef<StackState>({ turn: turn.current, light, labels: labels.current });
  const build = useRef((env: SceneEnv) => {
    const style = getComputedStyle(document.body);
    const fonts = {
      text: style.fontFamily || 'sans-serif',
      mono: style.getPropertyValue('--pt-mono').trim() || 'monospace',
    };
    return buildStackScene(env, () => state.current, fonts);
  });
  const [size, setSize] = useState<MatrixSize>(matrix);
  const [cellPx, setCellPx] = useState(cell);
  const [azimuth, setAzimuth] = useState(light);
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
          <Choice label='Matrix' options={MATRIX_OPTIONS} value={String(size)} onChange={pickMatrix} />
          <Choice label='Cell' options={CELLS} value={String(cellPx)} onChange={pickCell} />
          <Range format={(v) => `${v}°`} label='Light' max={0} min={-135} step={1} value={azimuth} onChange={swing} />
          <Range format={(v) => `${v.toFixed(2)}x`} label='Speed' max={2} min={0.25} step={0.25} value={speed} onChange={pace} />
          <Toggle disabled={reduced} label='Still' pressed={still || reduced} title='Show the frame a reader with reduced motion sees' onChange={hold} />
          <CostNote ms={cost} still={still || reduced} />
        </>
      }
      height={440}
      label='The content, translation and CDN layers as an isometric stack that opens and closes'
      lazy
      moves
      phoneHeight={340}
      tag='buildStackScene()'
    >
      <SceneStage
          build={build.current}
          handle={handle}
          hint='The pipeline stack. Drag or use the arrow keys to turn it.'
          pass={{ matrix: size, cell: cellPx, mode: 'dither', split: 0.5 }}
          pitchLimit={0}
          playing={!still}
          rest={{ yaw: 0, pitch: 0 }}
          speed={speed}
          stillTime={4}
          turn={turn.current}
          onCost={setCost}
        >
          {STACK_LAYERS.map((layer, i) => (
            <p
              className='d23-label'
              key={layer}
              ref={(el) => {
                labels.current[i] = el;
              }}
            >
              {layer}
            </p>
          ))}
      </SceneStage>
    </Plate>
  );
}
