'use client';

import type { RefObject } from 'react';
import { useRef } from 'react';

import type { LineLoop } from '@/lib/graticule/line-loop';
import { REST_WEIGHT } from '@/lib/graticule/line-loop';
import { playLoop } from '@/lib/graticule/loop-clock';
import { useMountEffect } from '@/lib/use-mount-effect';

/** The mark's whole 256 unit square. */
const SQUARE = [0, 0, 256, 256] as const;

type LineGlobeProps = {
  /** The animation, the mark and the still, drawn on the server (lineLoops in src/lib/graticule/line-animations.ts). */
  loop: LineLoop;
  /** The figure's accessible name. Without one the svg is decoration beside its caption and is hidden from assistive technology. */
  label?: string;
  /** The part of the 256 unit square to show, as x, y, width and height: the mark's drawn box crops the figure to its ring. The whole square by default. */
  box?: readonly [number, number, number, number];
  /** The element whose visibility plays the loop, the svg itself by default. Drawings that share one start, pause and resume together, so they stay in step. */
  watch?: RefObject<Element | null>;
  className?: string;
};

/**
 * One line globe animation for one graticule mark, in currentColor on the
 * mark's 256 unit square. The markup is the still the server drew, so the
 * first paint, a screenshot and reduced motion all show the rest mark,
 * nothing shifts when the loop starts, and the browser runs no geometry to
 * draw it. The shared loop clock (src/lib/graticule/loop-clock.ts) plays
 * the frames its worker computes and writes their path data through the
 * refs, with no React state per frame. The loop is read once at mount: key
 * the element by its animation and mark to change either.
 */
export default function LineGlobe({ loop, label, box = SQUARE, watch, className }: LineGlobeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const strokeRef = useRef<SVGPathElement>(null);
  const fillRef = useRef<SVGPathElement>(null);
  useMountEffect(() => {
    const svg = svgRef.current;
    const stroke = strokeRef.current;
    const fill = fillRef.current;
    if (!svg || !stroke || !fill) return;
    return playLoop(watch?.current ?? svg, loop, { stroke, fill });
  });
  return (
    <svg ref={svgRef} viewBox={box.join(' ')} className={className} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <path ref={strokeRef} d={loop.rest.stroke} fill='none' stroke='currentColor' strokeWidth={REST_WEIGHT} strokeLinecap='butt' strokeLinejoin='round' />
      <path ref={fillRef} d={loop.rest.fill} fill='currentColor' />
    </svg>
  );
}
