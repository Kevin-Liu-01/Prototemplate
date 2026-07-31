'use client';

import { useGSAP } from '@gsap/react';
import type { RefObject } from 'react';
import { useRef } from 'react';

import { createGraphiteSheen, SHEEN_DEFAULTS, type SheenHandle, type SheenParams } from '../lib/graphite-sheen';

export type SheenFieldProps = {
  className?: string;
  params?: Partial<SheenParams>;
  speed?: number;
  dpr?: number;
  /**
   * The grain-flip cell. Its box (relative to the canvas) is measured and fed
   * to the shader, so the 90° grain and the rotated specular axis stay exactly
   * under the headline cell's hairlines at every viewport.
   */
  flipRef?: RefObject<HTMLElement | null>;
};

/**
 * Dark-theme retune (P2): brushed graphite on ink-black is this material's
 * home turf, so the sheet does not stand down in dark mode — it re-exposes.
 * The shader is achromatic (`paper × lum`), so the whole flip is three
 * numbers: the paper term drops to a graphite a step above the page's
 * #070707, the grain cuts deeper so the brushing survives the dark ground,
 * and the specular band lifts harder so one raked light still reads. Tuned
 * against the ink-black one-surface family, not inverted mechanically.
 */
const DARK_TUNE: Pick<SheenParams, 'paper' | 'grainDepth' | 'bandGain'> = {
  paper: [0.088, 0.092, 0.106],
  grainDepth: 0.22,
  bandGain: 0.3,
};

/**
 * A canvas registered with the shared graphite-sheen engine (one WebGL context
 * per session — see ../lib/graphite-sheen.ts). Renders nothing but the canvas;
 * callers position it. Falls back to plain paper when WebGL2 is unavailable.
 */
export default function SheenField({ className, params, speed = 1, dpr, flipRef }: SheenFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const field: SheenHandle | null = createGraphiteSheen(canvas, { params, speed, dpr });
    if (!field) return;

    /* ---- theme: re-tune the material when <html data-theme> flips ----
       The light values are re-asserted from the defaults (plus any caller
       overrides) so a dark → light flip restores exactly the tuned sheet. */
    const applyTheme = () => {
      const dark = document.documentElement.dataset.theme === 'dark';
      field.setParams(
        dark
          ? DARK_TUNE
          : {
              paper: params?.paper ?? SHEEN_DEFAULTS.paper,
              grainDepth: params?.grainDepth ?? SHEEN_DEFAULTS.grainDepth,
              bandGain: params?.bandGain ?? SHEEN_DEFAULTS.bandGain,
            }
      );
    };
    applyTheme();
    const themeWatch = new MutationObserver(applyTheme);
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const measure = () => {
      const cell = flipRef?.current;
      if (!cell) return;
      const box = cell.getBoundingClientRect();
      const own = canvas.getBoundingClientRect();
      if (box.width < 2 || own.width < 2) return;
      /* The cell is also a cascade plate, so the first ResizeObserver callback
         can land mid-entrance while it is translated and scaled. Back the
         cell's own transform out of the rect (translate + center-origin scale
         is all the cascade uses) so the flip edge is measured where the cell
         SETTLES, not where it happens to be this frame. */
      let dx = 0;
      let dy = 0;
      let sx = 1;
      let sy = 1;
      const t = getComputedStyle(cell).transform;
      if (t && t !== 'none') {
        const m = new DOMMatrixReadOnly(t);
        dx = m.e;
        dy = m.f;
        sx = m.a || 1;
        sy = m.d || 1;
      }
      /* The rect is the cell itself, uninflated — the flip edge has to sit
         under the cell's own hairline, not a step outside it. */
      field.setParams({
        flipCenter: [
          box.left + box.width / 2 - dx - own.left,
          box.top + box.height / 2 - dy - own.top,
        ],
        flipHalf: [box.width / 2 / sx, box.height / 2 / sy],
      });
    };

    let observer: ResizeObserver | undefined;
    let raf = 0;
    const arm = () => {
      const cell = flipRef?.current;
      /* The flip target can be a later sibling whose ref is not attached yet
         when this layout effect runs — wait a frame for it. */
      if (!cell) {
        raf = requestAnimationFrame(arm);
        return;
      }
      measure();
      /* Re-measure when either box changes: font load, viewport resize,
         content wrap. */
      observer = new ResizeObserver(measure);
      observer.observe(cell);
      observer.observe(canvas);
      void document.fonts?.ready.then(measure);
    };
    if (flipRef) arm();

    return () => {
      cancelAnimationFrame(raf);
      themeWatch.disconnect();
      observer?.disconnect();
      field.destroy();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
