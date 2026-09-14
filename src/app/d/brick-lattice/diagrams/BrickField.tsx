'use client';

import { useRef } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

import { createLatticeLoop, FIELDS } from './lattice';
import type { FieldName, LatticeBox, LatticePalette } from './lattice';

/**
 * brick-lattice · the section ground.
 *
 * Home: the first child of every section. A canvas filling the section's
 * box, painted by the lattice engine with the field the section names.
 * Everything it needs from the design is read from CSS at paint time: the
 * brick module from the --bl-brick token (through a zero-height probe, so a
 * clamp() resolves to pixels), the four glaze colors from the --bl-* tokens
 * on the nearest ancestor (the kiln overrides them), and the document offset
 * from the section's own box. `anchor` names an element inside the section
 * whose box the field may centre on; the hero passes its claim panel.
 */
export type BrickFieldProps = {
  field: FieldName;
  animate?: boolean;
  anchor?: string;
  fps?: number;
};

function readToken(el: Element, name: string): string {
  return getComputedStyle(el).getPropertyValue(name).trim();
}

export default function BrickField({ field, animate = false, anchor, fps = 12 }: BrickFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const probeRef = useRef<HTMLElement>(null);

  useMountEffect(() => {
    const canvas = canvasRef.current;
    const probe = probeRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !probe || !host) return;

    const readPalette = (): LatticePalette => ({
      mortar: readToken(host, '--bl-mortar'),
      brick: readToken(host, '--bl-brick-face'),
      lapis: readToken(host, '--bl-lapis'),
      gold: readToken(host, '--bl-gold'),
    });

    const readBrick = () => probe.getBoundingClientRect().width || 24;

    const readDocTop = () => host.getBoundingClientRect().top + window.scrollY;

    const readAnchor = (): LatticeBox | null => {
      if (!anchor) return null;
      const el = host.querySelector(anchor);
      if (!el) return null;
      const a = el.getBoundingClientRect();
      const b = host.getBoundingClientRect();
      return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height };
    };

    const loop = createLatticeLoop(canvas, {
      field: FIELDS[field],
      animate,
      fps,
      readPalette,
      readBrick,
      readDocTop,
      readAnchor,
    });

    /* webfont swaps move the anchor panel; one more still once they settle */
    document.fonts?.ready.then(() => loop.render(0)).catch(() => undefined);

    return () => loop.destroy();
  });

  return (
    <>
      <canvas ref={canvasRef} className='bl-lattice' aria-hidden='true' />
      <i ref={probeRef} className='bl-brick-probe' aria-hidden='true' />
    </>
  );
}
