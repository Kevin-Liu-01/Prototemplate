'use client';

import { useGSAP } from '@gsap/react';
import { useRef } from 'react';

import {
  AURORA_PRESETS,
  createAuroraWash,
  type AuroraHandle,
  type AuroraParams,
  type AuroraPresetName,
} from '../lib/aurora-wash';

export type AuroraWashProps = {
  /** 'paper' = the hero's chroma-on-paper register; 'ink' = the dark band's;
      'paper-dark' = the paper register on the dark theme's ink-black paper. */
  preset?: AuroraPresetName;
  /** When set, the wash re-tunes itself to this preset under
      [data-theme='dark'] (and back), live — the northern-sky flip. Leave
      unset for permanently-dark surfaces (the band), which never remap. */
  darkPreset?: AuroraPresetName;
  params?: Partial<AuroraParams>;
  /** Overrides applied on top of `darkPreset` when the dark theme is active. */
  darkParams?: Partial<AuroraParams>;
  /** Device pixel ratio cap. The soft upscale is part of the look; keep <= 1. */
  dpr?: number;
  speed?: number;
  className?: string;
};

/**
 * This direction's own shader surface — the soft aurora wash. Renders nothing
 * but a canvas; callers position and mask it. When WebGL is unavailable the
 * canvas stays blank and the parent's own surface color shows, so parents
 * must already be the wash's base color.
 *
 * Theme correctness (P2): a themed wash (one with `darkPreset`) reads the
 * resolved theme off `document.documentElement[data-theme]` at init and
 * watches it with a MutationObserver, patching the shared engine's params on
 * flip — under reduced motion `setParams` re-renders the static still, so the
 * finished frame follows the theme too.
 */
export default function AuroraWash({
  preset = 'paper',
  darkPreset,
  params,
  darkParams,
  dpr = 1,
  speed = 1,
  className,
}: AuroraWashProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resolve = (dark: boolean): AuroraParams => {
      const name = dark && darkPreset ? darkPreset : preset;
      const patch = dark && darkPreset ? darkParams : params;
      return { ...AURORA_PRESETS[name], ...patch };
    };
    const isDark = () => document.documentElement.getAttribute('data-theme') === 'dark';

    const wash: AuroraHandle | null = createAuroraWash(canvas, {
      dpr,
      speed,
      params: resolve(isDark()),
    });
    if (!wash) return;

    let observer: MutationObserver | undefined;
    if (darkPreset) {
      observer = new MutationObserver(() => wash.setParams(resolve(isDark())));
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }

    return () => {
      observer?.disconnect();
      wash.destroy();
    };
  }, [preset, darkPreset, dpr, speed]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
