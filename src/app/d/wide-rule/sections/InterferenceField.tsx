'use client';

import { useGSAP } from '@gsap/react';
import type { RefObject } from 'react';
import { useRef } from 'react';

import { createWaveField, WAVE_DEFAULTS, type WaveFieldHandle, type WaveParams } from '../lib/interference';

export type InterferenceFieldProps = {
  className?: string;
  params?: Partial<WaveParams>;
  /**
   * Extra params merged on top when the viewport is narrow (≤ 900px CSS px at
   * mount — the same breakpoint where the CSS moves --wr-axis, so the DOM
   * crosshair and the shader band never disagree about where the axis is).
   * The narrow hero drops the axis a step and tightens the wavelength so the
   * band still reads as a fringe event rather than three lonely arcs.
   */
  narrowParams?: Partial<WaveParams>;
  /**
   * Params merged on top while `[data-theme='dark']` is set on the document —
   * the canvas paints literal colors, so unlike the DOM around it it cannot
   * re-skin through custom properties. Only the keys present here are swapped
   * back and forth; everything else survives a toggle untouched.
   */
  darkParams?: Partial<WaveParams>;
  speed?: number;
  dpr?: number;
  /**
   * Element the destructive null is aimed at. Its box (relative to the
   * canvas) is measured and fed to the engine, which places the anti-phased
   * pair so the bisector null passes through the gate AND this box — the
   * headline is calm by physics at every viewport, never by mask.
   */
  nullRef?: RefObject<HTMLElement | null>;
};

/** Assigns one key of a Partial<WaveParams> without widening to `any`. */
function put<K extends keyof WaveParams>(
  patch: Partial<WaveParams>,
  key: K,
  value: WaveParams[K] | undefined
) {
  if (value !== undefined) patch[key] = value;
}

/**
 * A canvas registered with the shared interference engine (one WebGL context
 * per session — see ../lib/interference.ts). Renders nothing but the canvas;
 * callers position it. Falls back to plain paper when WebGL2 is unavailable.
 */
export default function InterferenceField({
  className,
  params,
  narrowParams,
  darkParams,
  speed = 1,
  dpr,
  nullRef,
}: InterferenceFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const narrow = window.matchMedia('(max-width: 900px)').matches;
    const merged = narrow && narrowParams ? { ...params, ...narrowParams } : { ...params };
    const field: WaveFieldHandle | null = createWaveField(canvas, { params: merged, speed, dpr });
    if (!field) return;

    const applyTheme = () => {
      if (!darkParams) return;
      const dark = document.documentElement.getAttribute('data-theme') === 'dark';
      const patch: Partial<WaveParams> = {};
      for (const key of Object.keys(darkParams) as (keyof WaveParams)[]) {
        put(patch, key, dark ? darkParams[key] : (merged[key] ?? WAVE_DEFAULTS[key]));
      }
      field.setParams(patch);
    };
    applyTheme();
    let themeObserver: MutationObserver | undefined;
    if (darkParams && typeof MutationObserver !== 'undefined') {
      themeObserver = new MutationObserver(applyTheme);
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });
    }

    const measure = () => {
      const target = nullRef?.current;
      if (!target) return;
      const box = target.getBoundingClientRect();
      const own = canvas.getBoundingClientRect();
      if (box.width < 2 || own.width < 2) return;
      field.setParams({
        nullCenter: [box.left - own.left + box.width / 2, box.top - own.top + box.height / 2],
      });
    };

    let observer: ResizeObserver | undefined;
    let raf = 0;
    const arm = () => {
      const target = nullRef?.current;
      /* The null target can be a later sibling whose ref is not attached yet
         when this layout effect runs — wait a frame for it. */
      if (!target) {
        raf = requestAnimationFrame(arm);
        return;
      }
      measure();
      /* Re-measure when either box changes: font load, viewport resize,
         content wrap. */
      observer = new ResizeObserver(measure);
      observer.observe(target);
      observer.observe(canvas);
      void document.fonts?.ready.then(measure);
    };
    if (nullRef) arm();

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
      themeObserver?.disconnect();
      field.destroy();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
