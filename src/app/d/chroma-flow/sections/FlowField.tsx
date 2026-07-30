'use client';

import { useGSAP } from '@gsap/react';
import type { RefObject } from 'react';
import { useRef } from 'react';

import { createFlowField, type FlowFieldHandle, type FlowParams } from '../lib/flow-field';

export type FlowFieldProps = {
  className?: string;
  params?: Partial<FlowParams>;
  /**
   * Extra params merged on top when the viewport is narrow (< 700px CSS px at
   * mount). The phone hero needs a denser, wilder field: the obstacle spans
   * almost the whole width, so without more perturbation the wrap-around arcs
   * read as smooth concentric rings instead of a flow.
   */
  narrowParams?: Partial<FlowParams>;
  /**
   * Follow the page theme: ink/paper resolve from the host's `--tc-ink` /
   * `--tc-paper` custom properties at init and re-resolve when
   * `<html data-theme>` flips (a MutationObserver, disconnected on cleanup).
   * Explicit `ink`/`paper` in `params` still win. Leave this off for fields
   * on permanently-dark plates (the Locadex band), whose inks are authored.
   */
  themeAware?: boolean;
  /**
   * Params merged on top while the theme is dark (themeAware only) — the
   * light-tuned field usually wants its chroma and coverage toned down so
   * white-ramp ribbons on ink-black paper read as drawing, not glow.
   */
  darkParams?: Partial<FlowParams>;
  speed?: number;
  dpr?: number;
  /**
   * Element the streamlines part around. Its box (relative to the canvas) is
   * measured and fed to the shader as the flow obstacle, so the composition —
   * type inside the calm of the flow — holds at every viewport.
   */
  carveRef?: RefObject<HTMLElement | null>;
};

/** `#rgb`, `#rrggbb` or `rgb()/rgba()` → linear-ish [0..1] triplet the shader takes. */
function parseColor(raw: string): [number, number, number] | null {
  const value = raw.trim();
  if (!value) return null;
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value);
  if (hex && hex[1]) {
    const h = hex[1];
    const wide = h.length === 6 ? h : [...h].map((c) => c + c).join('');
    const n = parseInt(wide, 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  }
  const fn = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i.exec(value);
  if (fn && fn[1] && fn[2] && fn[3]) {
    return [Number(fn[1]) / 255, Number(fn[2]) / 255, Number(fn[3]) / 255];
  }
  return null;
}

/**
 * A canvas registered with the shared flow-field engine (one WebGL context per
 * session — see ../lib/flow-field.ts). Renders nothing but the canvas; callers
 * position it. Falls back to plain paper when WebGL2 is unavailable.
 */
export default function FlowField({
  className,
  params,
  narrowParams,
  themeAware,
  darkParams,
  speed = 1,
  dpr,
  carveRef,
}: FlowFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const narrow = window.matchMedia('(max-width: 700px)').matches;
    const merged = narrow && narrowParams ? { ...params, ...narrowParams } : { ...params };

    /* Theme resolution: the page tokens are the palette. Read them off the
       canvas itself (it inherits the root's custom properties), so the field
       always paints the surface it actually sits on. */
    const themePatch = (): Partial<FlowParams> => {
      if (!themeAware) return {};
      const styles = getComputedStyle(canvas);
      const ink = parseColor(styles.getPropertyValue('--tc-ink'));
      const paper = parseColor(styles.getPropertyValue('--tc-paper'));
      const dark = document.documentElement.dataset.theme === 'dark';
      return {
        ...(ink ? { ink } : {}),
        ...(paper ? { paper } : {}),
        ...(dark ? darkParams : {}),
      };
    };

    const field: FlowFieldHandle | null = createFlowField(canvas, {
      params: { ...merged, ...themePatch() },
      speed,
      dpr,
    });
    if (!field) return;

    /* Re-resolve when the theme flips. The full merged set is re-applied so a
       flip back to light restores every key darkParams touched. */
    let themeObserver: MutationObserver | undefined;
    if (themeAware) {
      themeObserver = new MutationObserver(() => {
        field.setParams({ ...merged, ...themePatch() });
      });
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme'],
      });
    }

    const measure = () => {
      const carve = carveRef?.current;
      if (!carve) return;
      const box = carve.getBoundingClientRect();
      const own = canvas.getBoundingClientRect();
      if (box.width < 2 || own.width < 2) return;
      const halfW = box.width / 2;
      const halfH = box.height / 2;
      /* The physics ellipse hugs the box — a step past it, no more. At
         1.34/1.62 the clearing owned half the hero viewport and the still
         read hollow; the shader's hard rect cut keeps the corners clean. */
      const tight = own.width < 700;
      field.setParams({
        center: [box.left - own.left + halfW, box.top - own.top + halfH],
        radii: tight ? [halfW * 1.06, halfH * 1.16] : [halfW * 1.12, halfH * 1.3],
        half: [halfW, halfH],
      });
    };

    let observer: ResizeObserver | undefined;
    let raf = 0;
    const arm = () => {
      const carve = carveRef?.current;
      /* The carve target can be a later sibling whose ref is not attached yet
         when this layout effect runs — wait a frame for it. */
      if (!carve) {
        raf = requestAnimationFrame(arm);
        return;
      }
      measure();
      /* Re-measure when either box changes: font load, viewport resize,
         content wrap. */
      observer = new ResizeObserver(measure);
      observer.observe(carve);
      observer.observe(canvas);
      void document.fonts?.ready.then(measure);
    };
    if (carveRef) arm();

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
      themeObserver?.disconnect();
      field.destroy();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
