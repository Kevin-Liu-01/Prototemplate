'use client';

import { useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';

import { prefersReducedMotion } from '@/lib/reduced-motion';
import { useLayoutWork } from '@/lib/use-layout-work';
import { useMountEffect } from '@/lib/use-mount-effect';

import { useTheme } from '../hooks';
import { createDitherStage, type DitherStageHandle, type PassSettings, type SceneEnv, type SceneInstance } from './dither-stage';
import { attachDrag, type Turn } from './drag';
import { readInks } from './ink';

export type SceneStageProps = {
  /** builds the scene on each new context; read once, at mount */
  build: (env: SceneEnv) => SceneInstance;
  pass: PassSettings;
  stillTime: number;
  speed: number;
  playing: boolean;
  handle: RefObject<DitherStageHandle | null>;
  /** the pose a drag writes; no drag without it */
  turn?: Turn;
  rest?: { yaw: number; pitch: number };
  pitchLimit?: number;
  /** what the host announces when it takes focus */
  hint: string;
  onCost?: (ms: number) => void;
  children?: ReactNode;
};

/**
 * The host every 3D plate shares: a focusable box the stage fills with its
 * canvas, the drag and arrow-key turn, and the ink re-read on a theme flip.
 * The stage is created once, at mount; every later change reaches it
 * through the handle, so a control never rebuilds the context.
 */
export default function SceneStage({ build, pass, stillTime, speed, playing, handle, turn, rest, pitchLimit, hint, onCost, children }: SceneStageProps) {
  const host = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const [failed, setFailed] = useState(false);
  const report = useRef(onCost);
  report.current = onCost;

  useMountEffect(() => {
    const el = host.current;
    if (!el) return;
    const stage = createDitherStage({
      host: el,
      build,
      pass,
      inks: readInks(el),
      stillTime,
      speed,
      playing,
      onCost: (ms) => report.current?.(ms),
      onFail: () => setFailed(true),
    });
    handle.current = stage;
    /* the host is a slider over the turn: its value is the hand turn in degrees, wrapped to ±180 */
    const announce = () => {
      if (!turn) return;
      const degrees = Math.round(((((turn.yaw * 180) / Math.PI + 180) % 360) + 360) % 360 - 180);
      el.setAttribute('aria-valuenow', String(degrees));
      el.setAttribute('aria-valuetext', `Turned ${degrees} degrees`);
    };
    const detach = turn
      ? attachDrag({
          el,
          turn,
          rest,
          pitchLimit,
          reduced: prefersReducedMotion,
          onChange: () => {
            stage.invalidate();
            announce();
          },
        })
      : undefined;
    return () => {
      detach?.();
      stage.destroy();
      if (handle.current === stage) handle.current = null;
    };
  });

  useLayoutWork(
    () => {
      const el = host.current;
      if (el) handle.current?.setInks(readInks(el));
    },
    { dependencies: [theme] }
  );

  return (
    <div
      aria-label={hint}
      aria-orientation={turn ? 'horizontal' : undefined}
      aria-valuemax={turn ? 180 : undefined}
      aria-valuemin={turn ? -180 : undefined}
      aria-valuenow={turn ? 0 : undefined}
      aria-valuetext={turn ? 'Turned 0 degrees' : undefined}
      className={turn ? 'd23-host is-turn' : 'd23-host'}
      ref={host}
      role={turn ? 'slider' : 'img'}
      tabIndex={turn ? 0 : undefined}
    >
      {children}
      {failed ? <p className='d23-fail'>WebGL is unavailable in this browser, so the scene cannot draw.</p> : null}
    </div>
  );
}
