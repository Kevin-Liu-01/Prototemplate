'use client';

import type { ReactNode } from 'react';

import { Range, Toggle } from '../controls';

type MotionControlsProps = {
  speed: number;
  /** the Speed range's ends; the step is a quarter */
  min: number;
  max: number;
  onSpeed: (speed: number) => void;
  still: boolean;
  /** the reader asks for reduced motion: the plate shows its still and the toggle is locked on */
  reduced: boolean;
  onStill: (still: boolean) => void;
  /** the engine's smoothed frame cost in ms, or null while it is measuring */
  cost: number | null;
  /** a status line set between the toggle and the cost */
  children?: ReactNode;
};

/**
 * The motion end of a 2D or 3D plate's controls row: the Speed range, the
 * Still toggle that shows the frame a reader with reduced motion sees, and
 * the plate's measured cost. The cost is the main-thread time of one frame,
 * smoothed, as the engine reports it about twice a second; it reads Still
 * when nothing is drawing, since a still costs one frame.
 */
export default function MotionControls({ speed, min, max, onSpeed, still, reduced, onStill, cost, children }: MotionControlsProps) {
  const held = still || reduced;
  const costText = held
    ? 'Still: one frame, then no work'
    : cost === null
      ? 'Measuring the frame'
      : `${cost < 10 ? cost.toFixed(2) : cost.toFixed(1)} ms of main thread a frame`;
  return (
    <>
      <Range format={(v) => `${v.toFixed(2)}x`} label='Speed' max={max} min={min} step={0.25} value={speed} onChange={onSpeed} />
      <Toggle disabled={reduced} label='Still' pressed={held} title='Show the frame a reader with reduced motion sees' onChange={onStill} />
      {children}
      <p className='dmo-bar-status d23-cost'>{costText}</p>
    </>
  );
}
