'use client';

import { useRef } from 'react';
import type { ReactNode, RefObject } from 'react';

import { useLayoutWork } from '@/lib/use-layout-work';
import { useMountEffect } from '@/lib/use-mount-effect';

import { useTheme } from '../hooks';
import { createCanvasLoop, type CanvasEngine, type CanvasLoopHandle } from './canvas-loop';
import { readInks, type StageInks } from './ink';

export type CanvasRig<E extends CanvasEngine> = { engine: E; loop: CanvasLoopHandle };

export type PointKind = 'move' | 'down' | 'leave';

export type CanvasStageProps<E extends CanvasEngine> = {
  /** builds the engine once, at mount; null when the canvas has no 2D context */
  create: (canvas: HTMLCanvasElement, inks: StageInks) => E | null;
  rig: RefObject<CanvasRig<E> | null>;
  playing: boolean;
  /** the pointer over the stage, in CSS pixels from its top left */
  onPoint?: (rig: CanvasRig<E>, x: number, y: number, kind: PointKind) => void;
  /** the stage's inks after a theme flip */
  onInks: (rig: CanvasRig<E>, inks: StageInks) => void;
  onCost?: (ms: number) => void;
  /** 'd23-cells' for a one-pixel-per-cell canvas, 'd23-canvas' for one at the pixel ratio */
  canvasClassName: string;
  hint: string;
  children?: ReactNode;
};

/**
 * The host every canvas 2D plate shares: the canvas, the engine and its
 * loop created once at mount and destroyed on unmount, the pointer handed
 * to the engine, and the ink re-read on a theme flip.
 */
export default function CanvasStage<E extends CanvasEngine>({ create, rig, playing, onPoint, onInks, onCost, canvasClassName, hint, children }: CanvasStageProps<E>) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();
  const report = useRef(onCost);
  report.current = onCost;
  const point = useRef(onPoint);
  point.current = onPoint;

  useMountEffect(() => {
    const el = host.current;
    const surface = canvas.current;
    if (!el || !surface) return;
    const engine = create(surface, readInks(el));
    if (!engine) return;
    const loop = createCanvasLoop({ host: el, engine, playing, onCost: (ms) => report.current?.(ms) });
    const current: CanvasRig<E> = { engine, loop };
    rig.current = current;

    const at = (event: PointerEvent, kind: PointKind) => {
      const box = el.getBoundingClientRect();
      point.current?.(current, event.clientX - box.left, event.clientY - box.top, kind);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' && event.buttons === 0) return;
      at(event, 'move');
    };
    const down = (event: PointerEvent) => at(event, 'down');
    /* a finger lifts and leaves at once; only a mouse leaving puts the pointer out */
    const leave = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') at(event, 'leave');
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerleave', leave);

    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointerleave', leave);
      loop.destroy();
      if (rig.current === current) rig.current = null;
    };
  });

  useLayoutWork(
    () => {
      const el = host.current;
      const current = rig.current;
      if (!el || !current) return;
      onInks(current, readInks(el));
      current.loop.invalidate();
    },
    { dependencies: [theme] }
  );

  return (
    <div aria-label={hint} className='d23-host is-pointer' ref={host} role='img'>
      <canvas aria-hidden='true' className={canvasClassName} ref={canvas} />
      {children}
    </div>
  );
}
