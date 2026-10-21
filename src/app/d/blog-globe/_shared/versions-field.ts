/**
 * The parts of gt-cloud's Versions engine (apps/landing/src/components/blog/
 * versions-field.ts on k/blog-globe at 5ba413acfb) that the globe figures
 * import: the row step's timing, the keys of the language control and the
 * text step's masks. Each export below is copied verbatim. The rest of that
 * file (the Versions figure's dithered field and mountVersions) is left out,
 * because no globe uses it and it needs gt-cloud's studio field.
 */
import {
  DITHER_LEVELS,
  ditherMaskUrl,
  smoothstep,
} from '@/app/d/blog-globe/_shared/ditherMask';

const CELL = 2; // CSS px per cell, for the field and the text step alike
export const STEP_MS = 150; // one row's step
export const STAGGER_MS = 55; // rows start this far apart, top to bottom

export type Box = { left: number; top: number; right: number; bottom: number };

/** A row's progress through a switch, t ms after it starts: 0 before its turn, 1 once done. */
export function rowK(t: number, row: number): number {
  return smoothstep((t - row * STAGGER_MS) / STEP_MS);
}

const STEPS: Record<string, number | undefined> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

/** The stop a key selects, or null for a key the pill leaves alone. Arrows wrap, and left and right swap in right-to-left text. */
export function stepIndex(
  key: string,
  index: number,
  count: number,
  rtl: boolean
): number | null {
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  const step = STEPS[key];
  if (step === undefined) return null;
  const across = key === 'ArrowLeft' || key === 'ArrowRight';
  return (index + (rtl && across ? -step : step) + count) % count;
}

export type Masks = { out: string[]; in: string[] };
let masks: Promise<Masks> | null = null;

/** Every level decoded before the first step: a mask still decoding paints as transparent. Shared by every figure on the page. */
export function loadMasks() {
  masks ??= (async () => {
    const levels = Array.from({ length: DITHER_LEVELS + 1 }, (_, l) => l);
    const out = levels.map((l) => ditherMaskUrl(l, CELL, 'out'));
    const into = levels.map((l) => ditherMaskUrl(l, CELL, 'in'));
    await Promise.all(
      [...out, ...into].map((url) => {
        const image = new Image();
        image.src = url.slice('url("'.length, -'")'.length);
        return image.decode().catch(() => null);
      })
    );
    return { out, in: into };
  })();
  return masks;
}

/** Sets one row's mask, or clears it with null. */
export function setMask(row: Element | undefined, url: string | null) {
  if (!(row instanceof HTMLElement)) return;
  const { style } = row;
  style.setProperty('mask-image', url);
  style.setProperty('-webkit-mask-image', url);
}

