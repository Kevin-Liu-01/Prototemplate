'use client';

import { useRef, useState } from 'react';
import type { RefObject } from 'react';

import { useLayoutWork } from '@/lib/use-layout-work';
import { useMountEffect } from '@/lib/use-mount-effect';

import { Action, Choice } from '../controls';
import { useTheme } from '../hooks';
import Plate from '../Plate';
import { MATRIX_OPTIONS, asMatrix, type MatrixSize } from './bayer';
import { createDitherPad, type PadEngine } from './dither-pad';
import { readInks } from './ink';
import { watchPresence } from './presence';

import './d23.css';

export type DitherPadDemoProps = {
  matrix?: MatrixSize;
  cell?: number;
};

const CELLS = [
  { value: '2', label: '2px' },
  { value: '4', label: '4px' },
  { value: '6', label: '6px' },
  { value: '8', label: '8px' },
] as const;

const BRUSHES = [
  { value: 'add', label: 'Add' },
  { value: 'erase', label: 'Erase' },
] as const;

type Brush = (typeof BRUSHES)[number]['value'];

type PadStageProps = {
  pad: RefObject<PadEngine | null>;
  brush: RefObject<Brush>;
  cell: number;
  matrix: MatrixSize;
  onLit: (share: number) => void;
};

/** The pad's canvas and its pointer, created when the plate arms and released on unmount. */
function PadStage({ pad, brush, cell, matrix, onLit }: PadStageProps) {
  const host = useRef<HTMLDivElement>(null);
  const surface = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();
  const report = useRef(onLit);
  report.current = onLit;

  useMountEffect(() => {
    const el = host.current;
    const canvas = surface.current;
    if (!el || !canvas) return;
    const engine = createDitherPad({ canvas, cell, matrix, ink: readInks(el).ink });
    if (!engine) return;
    pad.current = engine;
    const redraw = () => {
      engine.paint();
      report.current(engine.coverage());
    };
    const presence = watchPresence({
      el,
      onChange: () => undefined,
      onResize: (state) => {
        engine.resize(state.width, state.height);
        redraw();
      },
    });
    engine.resize(presence.state.width, presence.state.height);
    redraw();

    let id = -1;
    let lastX = 0;
    let lastY = 0;
    const at = (event: PointerEvent) => {
      const box = el.getBoundingClientRect();
      return [event.clientX - box.left, event.clientY - box.top] as const;
    };
    const down = (event: PointerEvent) => {
      if (id !== -1 || event.button !== 0) return;
      id = event.pointerId;
      el.setPointerCapture(id);
      [lastX, lastY] = at(event);
      engine.dab(lastX, lastY, brush.current === 'erase');
      redraw();
    };
    const move = (event: PointerEvent) => {
      if (event.pointerId !== id) return;
      const [x, y] = at(event);
      engine.stroke(lastX, lastY, x, y, brush.current === 'erase');
      lastX = x;
      lastY = y;
      redraw();
    };
    const up = (event: PointerEvent) => {
      if (event.pointerId !== id) return;
      if (el.hasPointerCapture(id)) el.releasePointerCapture(id);
      id = -1;
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      presence.dispose();
      if (pad.current === engine) pad.current = null;
    };
  });

  useLayoutWork(
    () => {
      const el = host.current;
      if (!el || !pad.current) return;
      pad.current.set({ ink: readInks(el).ink });
      pad.current.paint();
    },
    { dependencies: [theme] }
  );

  return (
    <div aria-label='A dither pad. Drag on it to paint tone.' className='d23-host is-paint' ref={host} role='img'>
      <canvas aria-hidden='true' className='d23-cells' ref={surface} />
    </div>
  );
}

/**
 * A pad to paint tone into: the reader's strokes add or take away tone,
 * and the Bayer screen prints it at the chosen matrix and cell. It has no
 * loop; it draws on each stroke.
 */
export default function DitherPadDemo({ matrix = 8, cell = 4 }: DitherPadDemoProps) {
  const pad = useRef<PadEngine | null>(null);
  const brush = useRef<Brush>('add');
  const [size, setSize] = useState<MatrixSize>(matrix);
  const [cellPx, setCellPx] = useState(cell);
  const [mode, setMode] = useState<Brush>('add');
  const [lit, setLit] = useState<number | null>(null);

  const redraw = () => {
    const engine = pad.current;
    if (!engine) return;
    engine.paint();
    setLit(engine.coverage());
  };

  return (
    <Plate
      controls={
        <>
          <Choice
            label='Brush'
            options={BRUSHES}
            value={mode}
            onChange={(next) => {
              setMode(next);
              brush.current = next;
            }}
          />
          <Choice
            label='Matrix'
            options={MATRIX_OPTIONS}
            value={String(size)}
            onChange={(next) => {
              setSize(asMatrix(next));
              pad.current?.set({ matrix: asMatrix(next) });
              redraw();
            }}
          />
          <Choice
            label='Cell'
            options={CELLS}
            value={String(cellPx)}
            onChange={(next) => {
              setCellPx(Number(next));
              pad.current?.set({ cell: Number(next) });
              redraw();
            }}
          />
          <Action
            onClick={() => {
              pad.current?.reset();
              redraw();
            }}
          >
            Reset
          </Action>
          <Action
            onClick={() => {
              pad.current?.clear();
              redraw();
            }}
          >
            Clear
          </Action>
          <p className='dmo-bar-status d23-cost'>{lit === null ? 'Paint to add tone' : `${Math.round(lit * 100)} percent of cells lit`}</p>
        </>
      }
      height={320}
      label='A pad that prints painted tone through a Bayer screen'
      lazy
      phoneHeight={260}
      tag={`createDitherPad({ matrix: ${size}, cell: ${cellPx} })`}
    >
      <PadStage brush={brush} cell={cell} matrix={matrix} pad={pad} onLit={setLit} />
    </Plate>
  );
}
