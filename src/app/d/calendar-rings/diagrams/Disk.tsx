'use client';

/**
 * calendar-rings: the hero disk.
 *
 * Ornament home: the hero. A square plate carries the dither field of
 * fields.ts (the hub, four rings and the rim, density stepping outward,
 * two notched edges turning against each other) under one SVG overlay:
 * the hub circle in the accent (the source), the ring rules and the
 * thirteen radial rules in the ornament color, the thirteen bar-and-dot
 * numerals knocked out of the fourth ring in the ground color, and the
 * crown text set along the first ring in the display face. The claim
 * renders in the hub through `children`.
 *
 * The canvas follows the engine contract: one still under reduced
 * motion, paused offscreen and on hidden tabs, destroyed on unmount, its
 * ink re-read from the root's token whenever the theme flips. Nothing here
 * is a figure: rings, notches, cells, rules and counts only.
 */
import { useRef } from 'react';
import type { ReactNode } from 'react';

import { createDitherLoop } from '@/lib/dither';
import { useMountEffect } from '@/lib/use-mount-effect';

import { NumeralGlyph } from './Numeral';
import { calendarDisk, DISK, onThemeChange, readToken } from '../fields';

const U = 500;
const CROWN_R = Math.round(((DISK.hub + DISK.r1) / 2) * U);
const CELL_R = Math.round(((DISK.r3 + DISK.r4) / 2) * U);

export type DiskProps = {
  crown: string;
  children: ReactNode;
};

export function Disk({ crown, children }: DiskProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useMountEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const root = canvas.closest('.calendar-rings-root') ?? canvas;
    const ink = () => readToken(root, '--cr-ink') || 'currentColor';
    const loop = createDitherLoop(canvas, calendarDisk(), {
      scale: 3,
      ink: ink(),
      paper: 'transparent',
      fps: 12,
      reducedMotionTime: 0,
    });
    const release = onThemeChange(() => loop.setOptions({ ink: ink() }));
    return () => {
      release();
      loop.destroy();
    };
  });

  const cellStep = 360 / DISK.cells;
  const cells = Array.from({ length: DISK.cells }, (_, i) => i);

  return (
    <div className='cr-disk-stage'>
      <div className='cr-disk-plate'>
        <canvas className='cr-disk-canvas' ref={canvasRef} aria-hidden='true' />
        <svg className='cr-disk-svg' viewBox={`${-U} ${-U} ${U * 2} ${U * 2}`} aria-hidden='true' focusable='false'>
          <defs>
            <path id='calendar-rings-crown-path' d={`M${-CROWN_R} 0A${CROWN_R} ${CROWN_R} 0 0 1 ${CROWN_R} 0`} />
          </defs>
          {/* the hub circle marks the source: the one place the accent is spent on the disk */}
          <circle className='cr-disk-hub-ring' r={DISK.hub * U} />
          {/* ring rules in the ornament color, each seated on one density step */}
          <circle className='cr-disk-rule' r={DISK.r2 * U} />
          <circle className='cr-disk-rule' r={DISK.r3 * U} />
          <circle className='cr-disk-rule' r={DISK.r4 * U} />
          {/* thirteen radial rules divide the fourth ring into cells */}
          {cells.map((i) => (
            <path
              key={`r${i}`}
              className='cr-disk-rule'
              d={`M0 ${-DISK.r3 * U}V${-DISK.r4 * U}`}
              transform={`rotate(${((i + 0.5) * cellStep).toFixed(3)})`}
            />
          ))}
          {/* one bar-and-dot numeral per cell, knocked out of the ring in the ground color */}
          {cells.map((i) => (
            <g key={`n${i}`} className='cr-disk-numeral' transform={`rotate(${(i * cellStep).toFixed(3)}) translate(0 ${-CELL_R})`}>
              <NumeralGlyph n={i + 1} scale={3.4} />
            </g>
          ))}
          {/* the crown: the brand name inscribed along the first ring */}
          <text className='cr-crown' textAnchor='middle'>
            <textPath href='#calendar-rings-crown-path' startOffset='50%'>
              {crown}
            </textPath>
          </text>
        </svg>
      </div>
      <div className='cr-disk-hub'>{children}</div>
    </div>
  );
}
