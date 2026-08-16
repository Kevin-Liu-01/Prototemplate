import gsap from 'gsap';

/**
 * Split-flap animation engine for DOM text. React renders characters
 * as two-layer cells (see FlapText.tsx); this module mutates only the
 * [data-tb-face] spans, which React never re-renders. A flip folds the
 * face shut (scaleY), swaps the glyph at the squeeze, and unfolds,
 * cycling deterministically through CYCLE before settling on the
 * face's data-char target.
 */

/* Latin caps, CJK, Hangul, digits and marks: the board visibly passes
   through world scripts on its way to English. */
export const CYCLE = 'AEIOUMKZ言語한ÑÉ0387·/–ΔΩ';

/* Fallback for the settle flash when the CSS token is unavailable. */
const FLASH_FALLBACK = '#2563eb';

function cycleGlyph(index: number, step: number): string {
  return CYCLE[(index * 5 + step * 3) % CYCLE.length] ?? '·';
}

function faces(line: HTMLElement): HTMLElement[] {
  return Array.from(line.querySelectorAll<HTMLElement>('[data-tb-face]'));
}

/** Blank every face — the board's pre-riffle state. Ghosts keep the layout. */
export function blankLine(line: HTMLElement): void {
  for (const face of faces(line)) {
    face.textContent = '';
    face.style.transform = '';
  }
}

export type FlipOptions = {
  /** Cascade offset between neighbouring tiles, seconds. */
  per?: number;
  /** Fold cycles before the settled glyph (odd tiles get one extra). */
  cycles?: number;
  /** Flash the settling glyph accent-blue, cooling to its own ink. */
  flash?: boolean;
};

/** One-shot clacking flip of a line to its data-char targets, left to right. */
export function flipUp(
  line: HTMLElement,
  options: FlipOptions = {}
): gsap.core.Timeline {
  const { per = 0.016, cycles = 2, flash = true } = options;
  const tl = gsap.timeline();

  faces(line).forEach((face, i) => {
    const target = face.dataset.char ?? '';
    if (face.textContent === target) return; // settled tiles never clack

    const style = getComputedStyle(face);
    const ink = style.color;
    const accent =
      style.getPropertyValue('--tb-flash').trim() || FLASH_FALLBACK;

    const sub = gsap.timeline();
    const steps = cycles + (i % 2);
    for (let c = 0; c < steps; c += 1) {
      const last = c === steps - 1;
      const glyph = last ? target : cycleGlyph(i, c);
      sub.to(face, {
        scaleY: 0.08,
        duration: 0.026,
        ease: 'power1.in',
        onComplete: () => {
          face.textContent = glyph;
        },
      });
      /* Mid-riffle glyphs unfold mechanically; the LANDING glyph settles —
         a slightly longer unfold that over-rotates past flat and snaps
         back, the flap hitting its stop. */
      if (last) {
        sub.to(face, { scaleY: 1, duration: 0.09, ease: 'back.out(2.1)' });
      } else {
        sub.to(face, { scaleY: 1, duration: 0.03, ease: 'power1.out' });
      }
    }
    if (flash) {
      /* The settle moment: the landed glyph holds hot for a beat, then
         cools on a decay curve — emission dying, not a linear crossfade. */
      sub.set(face, { color: accent }, '>-0.06').to(
        face,
        {
          color: ink,
          duration: 0.85,
          ease: 'power3.out',
          clearProps: 'color',
        },
        '>+0.12'
      );
    }
    tl.add(sub, i * per);
  });

  return tl;
}
