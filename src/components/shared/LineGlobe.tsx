'use client';

import { useRef } from 'react';

import type { MarkId } from '@/lib/graticule/geometry';
import { REST_WEIGHT } from '@/lib/graticule/geometry';
import type { LineAnimationId } from '@/lib/graticule/line-animations';
import { LINE_ANIMATIONS } from '@/lib/graticule/line-animations';
import { playLoop } from '@/lib/graticule/loop-clock';
import { useMountEffect } from '@/lib/use-mount-effect';

type LineGlobeProps = {
  animation: LineAnimationId;
  mark: MarkId;
  /** The figure's accessible name. Without one the svg is decoration beside its caption and is hidden from assistive technology. */
  label?: string;
  className?: string;
};

/**
 * One line globe animation for one graticule mark, in currentColor on the
 * mark's 256 unit square. The markup is the rest mark, so the first paint,
 * a screenshot and reduced motion all show the still, and nothing shifts
 * when the loop starts. The shared loop clock (src/lib/graticule/
 * loop-clock.ts) writes each frame's path data through the refs, with no
 * React state per frame. The animation and the mark are read once at
 * mount: key the element by both to change either.
 */
export default function LineGlobe({ animation, mark, label, className }: LineGlobeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const strokeRef = useRef<SVGPathElement>(null);
  const fillRef = useRef<SVGPathElement>(null);
  const loop = LINE_ANIMATIONS[animation];
  const rest = loop.still(mark);
  useMountEffect(() => {
    const svg = svgRef.current;
    const stroke = strokeRef.current;
    const fill = fillRef.current;
    if (!svg || !stroke || !fill) return;
    return playLoop(svg, { duration: loop.duration, frame: (t) => loop.frame(t, mark), still: () => loop.still(mark) }, { stroke, fill });
  });
  return (
    <svg ref={svgRef} viewBox='0 0 256 256' className={className} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <path ref={strokeRef} d={rest.stroke} fill='none' stroke='currentColor' strokeWidth={REST_WEIGHT} strokeLinecap='butt' strokeLinejoin='round' />
      <path ref={fillRef} d={rest.fill} fill='currentColor' />
    </svg>
  );
}
