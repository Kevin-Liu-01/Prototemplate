import gsap from 'gsap';

/**
 * The presenter's scroll box. The shell fixes the document, so the deck
 * scrolls inside the stage: PresenterStage owns the .pr-scroll element, and
 * every slide hands it to its ScrollTriggers as `scroller` and measures it
 * where the old code measured the window.
 *
 * Slides find the box from their own root with scrollerOf(), not through a
 * ref handed down from the stage: React attaches a parent's ref only after
 * its children's layout effects have run, so inside a slide's useGSAP the
 * stage's ref is still null, while the committed DOM is already complete
 * and closest() reads it.
 */
export const SCROLLER_CLASS = 'pr-scroll';

/** The scroll box around an element inside the presenter, or null outside one. */
export function scrollerOf(el: Element | null | undefined): HTMLElement | null {
  return el?.closest<HTMLElement>(`.${SCROLLER_CLASS}`) ?? null;
}

/* a glide's length: a floor plus a share of the distance, capped */
const GLIDE_FLOOR_S = 0.6;
const GLIDE_PX_PER_S = 8000;
const GLIDE_CAP_S = 1.8;

/** The clamped target and the glide's length in milliseconds, 0 when instant. */
export type Glide = { top: number; duration: number };

const glides = new WeakMap<HTMLElement, gsap.core.Tween>();

/** Stops a glide in flight, for when the user takes the wheel. */
export function stopGlide(scroller: HTMLElement): void {
  glides.get(scroller)?.kill();
  glides.delete(scroller);
}

/**
 * Scrolls the box to `top`, driven by GSAP rather than the browser's smooth
 * scrolling. A ScrollTrigger refresh scrolls the box to 0 to measure and
 * back, and a resize of the box (the list toggling as grid mode closes)
 * lands mid-glide; either cancels a native smooth scroll and strands the
 * deck between slides, while a tween keeps writing its own frames through
 * both. Instant when asked, and always under reduced motion.
 */
export function glideTo(scroller: HTMLElement, top: number, instant = false): Glide {
  stopGlide(scroller);
  const max = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
  const target = Math.round(Math.max(0, Math.min(top, max)));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (instant || reduced) {
    scroller.scrollTop = target;
    return { top: target, duration: 0 };
  }
  const distance = Math.abs(target - scroller.scrollTop);
  const duration = Math.min(GLIDE_CAP_S, GLIDE_FLOOR_S + distance / GLIDE_PX_PER_S);
  const state = { top: scroller.scrollTop };
  const tween = gsap.to(state, {
    top: target,
    duration,
    ease: 'power3.inOut',
    onUpdate: () => {
      scroller.scrollTop = state.top;
    },
    onComplete: () => {
      glides.delete(scroller);
    },
  });
  glides.set(scroller, tween);
  return { top: target, duration: duration * 1000 };
}
