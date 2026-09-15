'use client';

import { useRef } from 'react';

import { createDitherLoop } from '@/lib/dither';
import type { DitherLoopHandle, FieldFn } from '@/lib/dither';
import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * textile-block: the light behind the perforated blocks.
 *
 * A Bayer field on a canvas under the concrete layer of a perforated Relief.
 * The concrete is masked with the block's cut (the Ennis cruciform, the
 * Storer slots), so the field shows only through the holes. Two placements:
 * the hero, lit from the claim block's side (or from above when the region
 * is a strip), and the shadowed course, lit from the floor. Colors come from
 * the canvas's own computed `color` and `background-color`, which styles.css
 * sets from the wall tokens, so the field follows the theme without a hex
 * literal here. The loop renders one still under prefers-reduced-motion,
 * pauses offscreen and on hidden tabs, and is destroyed on unmount.
 */

export type LightCanvasProps = { kind: 'hero' | 'shadow' };

type Box = { wide: boolean };

function smoothstep(a: number, b: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/** Ink density rises away from the claim block; the hole nearest it is brightest. */
function heroField(box: Box): FieldFn {
  return (u, v, t) => {
    const along = box.wide ? v : u;
    const across = box.wide ? u : v;
    const base = 0.06 + 0.82 * smoothstep(0.02, 1, along);
    const drift = 0.05 * Math.sin(across * 7.1 + t * 0.35) + 0.03 * Math.sin(along * 11.3 - t * 0.22);
    return base + drift;
  };
}

/** The floor glows: lit cells crowd the bottom and thin toward the shade. */
function shadowField(): FieldFn {
  return (u, v, t) => {
    const base = 0.04 + 0.86 * smoothstep(0.12, 1, v);
    const drift = 0.05 * Math.sin(u * 6.3 + t * 0.4) + 0.03 * Math.sin(v * 9.7 + t * 0.27);
    return base + drift;
  };
}

function readInks(canvas: HTMLCanvasElement): { ink: string; paper: string } {
  const style = getComputedStyle(canvas);
  return { ink: style.color, paper: style.backgroundColor };
}

export default function LightCanvas({ kind }: LightCanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useMountEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const box: Box = { wide: canvas.clientWidth > canvas.clientHeight * 2.2 };
    const field = kind === 'hero' ? heroField(box) : shadowField();
    const { ink, paper } = readInks(canvas);

    const loop: DitherLoopHandle = createDitherLoop(canvas, field, {
      scale: 3,
      ink,
      paper,
      fps: 20,
      speed: 1,
      reducedMotionTime: 2.4,
    });

    const sizer = new ResizeObserver(() => {
      box.wide = canvas.clientWidth > canvas.clientHeight * 2.2;
      if (!loop.running) loop.render(2.4);
    });
    sizer.observe(canvas);

    const theme = new MutationObserver(() => {
      loop.setOptions(readInks(canvas));
    });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      sizer.disconnect();
      theme.disconnect();
      loop.destroy();
    };
  });

  return <canvas aria-hidden='true' className='tb-relief-light' ref={ref} />;
}
