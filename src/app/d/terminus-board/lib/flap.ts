import gsap from 'gsap';

/**
 * Split-flap engine for DOM text.
 *
 * Characters are rendered by React as two-layer cells — an invisible in-flow
 * ghost that holds the measure and a visible face (see sections/FlapText.tsx)
 * — so every string is real text before JS runs. This module only ever
 * mutates the face spans, which React never re-renders. A flip folds the face
 * shut (scaleY), swaps the glyph at the squeeze, and unfolds, riffling
 * through a deterministic multi-script cycle before landing on the face's
 * data-char target.
 */

/* Latin caps, CJK, Hangul, digits and marks: the board visibly passes through
   world scripts on its way to English. Indexed deterministically per tile and
   step so a given moment always renders the same frame. Exported so the
   departures rail's scramble runs the same inventory — one machine. */
export const CYCLE = 'AEIOUMKZ言語한ÑÉ0387·/–ΔΩ';

/* Fallback for the settle flash when the CSS token is unavailable. */
const FLASH_FALLBACK = '#cf8514';

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

/**
 * Re-target a line whose faces should next settle on `text`. Spaces are
 * stripped — a blank is word-space in the markup, never a tile — so the
 * character count must match the rendered face count.
 */
export function retarget(line: HTMLElement, text: string): void {
  const chars = Array.from(text.replace(/ /g, ''));
  faces(line).forEach((face, i) => {
    face.dataset.char = chars[i] ?? '';
  });
}

export type FlipOptions = {
  /** Cascade offset between neighbouring tiles, seconds. */
  per?: number;
  /** Fold cycles before the settled glyph (odd tiles get one extra). */
  cycles?: number;
  /** Flash the settling glyph phosphor-amber, cooling to its own ink. */
  flash?: boolean;
};

/** One-shot clacking flip of a line to its data-char targets, left to right. */
export function flipUp(line: HTMLElement, options: FlipOptions = {}): gsap.core.Timeline {
  const { per = 0.016, cycles = 2, flash = true } = options;
  const tl = gsap.timeline();

  faces(line).forEach((face, i) => {
    const target = face.dataset.char ?? '';
    if (face.textContent === target) return; // settled tiles never clack

    const style = getComputedStyle(face);
    const ink = style.color;
    const amber = style.getPropertyValue('--tb-flash').trim() || FLASH_FALLBACK;

    const sub = gsap.timeline();
    const steps = cycles + (i % 2);
    for (let c = 0; c < steps; c++) {
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
      /* The phosphor moment: the landed glyph holds hot for a beat, then
         cools on a decay curve — a fast fall out of amber with a long warm
         tail, emission dying rather than a linear crossfade. */
      sub
        .set(face, { color: amber }, '>-0.06')
        .to(face, { color: ink, duration: 0.85, ease: 'power3.out', clearProps: 'color' }, '>+0.12');
    }
    tl.add(sub, i * per);
  });

  return tl;
}
