'use client';

/**
 * calendar-rings: one ring unrolled into a wide arc band.
 *
 * Ornament home: the layout itself. Every section after the hero is a
 * chord of a ring concentric with the disk above, so its top and bottom
 * edges are shallow arcs that bow toward the page's center line and its
 * cells are divided by radial rules that converge upward. The band's
 * ends are the column's own edges, where the page cuts the ring.
 *
 * The band owns every line it shows: the two arcs, the radial dividers
 * and the two end rules are one SVG, drawn once; cells draw no border.
 * Cell content follows the arc by a per-cell translate that never touches
 * layout. The SVG is sized from the measured box so the strokes stay 1px
 * and the sag stays in pixels at every width; before measurement the
 * server geometry stretches to fit and is replaced on mount.
 *
 * Under 720px the ring is unrolled flat: the SVG hides, the cells stack,
 * and the stylesheet draws the seams between them as plain hairlines.
 */
import { useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

export type ArcBandProps = {
  cells: readonly ReactNode[];
  /** Relative widths of the cells in fr; equal when omitted. */
  weights?: readonly number[];
  /** Pixels the top arc drops between the band's ends and its center. */
  sag: number;
  className?: string;
  cellClassName?: string;
  /** Renders the cells as a list when the content is one. */
  list?: boolean;
};

type Box = { w: number; h: number };

const SERVER_BOX: Box = { w: 1170, h: 320 };
const STEPS = 48;

type Geometry = { top: string; bottom: string; dividers: string[]; ends: string[] };

/** Arcs, dividers and end rules for a band of `w` by `h` with `sag` at the center, divided at `bounds`. */
function arcGeometry(w: number, h: number, sagIn: number, bounds: readonly number[]): Geometry {
  const sag = Math.max(0.5, sagIn);
  const cx = w / 2;
  const R = ((w / 2) * (w / 2) + sag * sag) / (2 * sag);
  const cy = sag - R;
  const Rb = R + h - sag;
  const yOn = (x: number, rad: number) => cy + Math.sqrt(Math.max(0, rad * rad - (x - cx) * (x - cx)));
  const poly = (rad: number) => {
    let d = '';
    for (let i = 0; i <= STEPS; i++) {
      const x = (w * i) / STEPS;
      d += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${yOn(x, rad).toFixed(2)}`;
    }
    return d;
  };
  const dividers = bounds.map((f) => {
    const x = f * w;
    const yt = yOn(x, R);
    const dxn = (x - cx) / R;
    const dyn = (yt - cy) / R;
    const xb = cx + dxn * Rb;
    const yb = cy + dyn * Rb;
    return `M${x.toFixed(2)} ${yt.toFixed(2)}L${xb.toFixed(2)} ${yb.toFixed(2)}`;
  });
  const ends = [`M0.5 0V${yOn(0, Rb).toFixed(2)}`, `M${(w - 0.5).toFixed(2)} 0V${yOn(w, Rb).toFixed(2)}`];
  return { top: poly(R), bottom: poly(Rb), dividers, ends };
}

export function ArcBand({ cells, weights, sag, className, cellClassName, list = false }: ArcBandProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<Box>(SERVER_BOX);

  useMountEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      if (w > 0 && h > 0) setBox((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  });

  const ws = weights && weights.length === cells.length ? weights : cells.map(() => 1);
  const total = ws.reduce((sum, x) => sum + x, 0);
  const bounds: number[] = [];
  const centers: number[] = [];
  let acc = 0;
  ws.forEach((x, i) => {
    centers.push((acc + x / 2) / total);
    acc += x;
    if (i < ws.length - 1) bounds.push(acc / total);
  });

  const geometry = arcGeometry(box.w, box.h, sag, bounds);
  const Cells = list ? 'ul' : 'div';
  const Cell = list ? 'li' : 'div';

  return (
    <div
      ref={ref}
      className={className ? `cr-arc ${className}` : 'cr-arc'}
      style={{ '--cr-sag': `${sag}px` } as CSSProperties}
    >
      <svg
        className='cr-arc-svg'
        viewBox={`0 0 ${box.w} ${box.h}`}
        preserveAspectRatio='none'
        aria-hidden='true'
        focusable='false'
      >
        <path className='cr-arc-line' d={geometry.top} />
        <path className='cr-arc-line' d={geometry.bottom} />
        {geometry.dividers.map((d, i) => (
          <path key={`d${i}`} className='cr-arc-line' d={d} />
        ))}
        {geometry.ends.map((d, i) => (
          <path key={`e${i}`} className='cr-arc-line' d={d} />
        ))}
      </svg>
      {/* the template travels as a variable so the flat cut below 860px can override it in the sheet */}
      <Cells className='cr-arc-cells' style={{ '--cr-cols': ws.map((x) => `${x}fr`).join(' ') } as CSSProperties}>
        {cells.map((cell, i) => {
          const p = 2 * (centers[i] ?? 0.5) - 1;
          const k = 1 - p * p;
          return (
            <Cell
              key={i}
              className={cellClassName ? `cr-arc-cell ${cellClassName}` : 'cr-arc-cell'}
              style={{ '--cr-k': k.toFixed(3) } as CSSProperties}
            >
              {cell}
            </Cell>
          );
        })}
      </Cells>
    </div>
  );
}
