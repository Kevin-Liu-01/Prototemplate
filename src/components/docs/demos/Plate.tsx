'use client';

import { useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import { useArmed, useReducedMotion } from './hooks';

import './demos.css';

export type PlateProps = {
  /** the entry point's own name, printed in the stage's corner */
  tag: string;
  /** what the plate shows, for assistive technology */
  label: string;
  /** an ink stage in both themes, for the fields tuned to ink grounds */
  night?: boolean;
  /** the stage's height in CSS pixels at desktop width */
  height?: number;
  /** the stage's height under 640px; the desktop height when unset */
  phoneHeight?: number;
  /** the controls row under the stage */
  controls?: ReactNode;
  /** the plate moves; under reduced motion its bar says it shows the still */
  moves?: boolean;
  /** mount the stage's children only once the plate nears the viewport */
  lazy?: boolean;
  /** the stage holds no corner tag (a drawing that fills it edge to edge) */
  bare?: boolean;
  /** the stage takes its content's height, padded, instead of a fixed one */
  fit?: boolean;
  /** an extra class on the stage, for a demo's own layout */
  stageClassName?: string;
  children: ReactNode;
};

/**
 * The frame of every live demo on the Components pages: a card with the
 * stage on top and the controls row under it, one hairline between them.
 * The stage follows the docs theme unless `night` pins it to ink, which
 * the GPU fields need because their palettes are tuned to an ink ground.
 * A lazy plate mounts its engine only when it first comes within 180px of
 * the viewport; from then on each engine pauses itself offscreen and on a
 * hidden tab, and unmounting the plate calls the engine's destroy().
 */
export default function Plate({
  tag,
  label,
  night = false,
  height = 300,
  phoneHeight,
  controls,
  moves = false,
  lazy = false,
  bare = false,
  fit = false,
  stageClassName,
  children,
}: PlateProps) {
  const root = useRef<HTMLDivElement>(null);
  const armed = useArmed(root);
  const reduced = useReducedMotion();
  const style = {
    '--dmo-h': `${height}px`,
    '--dmo-h-sm': `${phoneHeight ?? height}px`,
  } as CSSProperties;
  const stage = ['dmo-stage', night ? 'is-night' : '', fit ? 'is-fit' : '', stageClassName ?? ''].filter(Boolean).join(' ');
  return (
    <figure aria-label={label} className='dmo-plate not-prose' ref={root} role='group' style={style}>
      <div className={stage}>
        {lazy && !armed ? null : children}
        {bare ? null : (
          <span aria-hidden='true' className='dmo-plate-tag'>
            {tag}
          </span>
        )}
      </div>
      {controls || (moves && reduced) ? (
        <div className='dmo-bar'>
          {controls}
          {moves && reduced ? (
            <p className='dmo-bar-note' role='status'>
              Reduced motion is on, so the plate shows its still.
            </p>
          ) : null}
        </div>
      ) : null}
    </figure>
  );
}
