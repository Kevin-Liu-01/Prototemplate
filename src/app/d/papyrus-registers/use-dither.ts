'use client';

import { useRef } from 'react';

import { createDitherLoop } from '@/lib/dither';
import type { DitherLoopOptions, FieldFn } from '@/lib/dither';
import { useMountEffect } from '@/lib/use-mount-effect';

/**
 * papyrus-registers · one canvas, one Bayer loop, colors read from tokens.
 *
 * The hook mounts createDitherLoop on the returned canvas ref with the ink
 * and paper resolved from CSS custom properties on the page root, so no
 * hex literal lives in TSX and the canvas follows the theme: a
 * MutationObserver on <html data-theme> re-reads both tokens and hands
 * them to the running loop. The engine already renders one still under
 * reduced motion, pauses offscreen and on hidden tabs; destroy() runs on
 * unmount.
 */
export type PapyrusDitherOptions = Omit<DitherLoopOptions, 'ink' | 'paper'> & {
  /** The custom property that names the lit cell color, `--pr-ornament` for gold. */
  inkToken: string;
  /** The custom property for unlit cells; omitted, the canvas is transparent there. */
  paperToken?: string;
};

export function usePapyrusDither(field: FieldFn, opts: PapyrusDitherOptions) {
  const ref = useRef<HTMLCanvasElement>(null);

  useMountEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const root = canvas.closest('.papyrus-registers-root') ?? document.documentElement;
    const { inkToken, paperToken, ...rest } = opts;
    const read = (token: string) => getComputedStyle(root).getPropertyValue(token).trim();
    const colors = () => ({
      ink: read(inkToken),
      paper: paperToken ? read(paperToken) : 'transparent',
    });

    const handle = createDitherLoop(canvas, field, { ...rest, ...colors() });
    const observer = new MutationObserver(() => handle.setOptions(colors()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      observer.disconnect();
      handle.destroy();
    };
  });

  return ref;
}
