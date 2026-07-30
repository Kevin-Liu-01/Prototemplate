import gsap from 'gsap';

/** The original's only easing vocabulary: hard steps, never a soft curve. */
export const STEP = (n: number) => `steps(${n})`;

/** transform-independent offset accumulation (never reads rects mid-scrub) */
export function offsetIn(el: HTMLElement, ancestor: HTMLElement) {
  let x = 0;
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== ancestor) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

export function centerIn(el: HTMLElement, ancestor: HTMLElement) {
  const o = offsetIn(el, ancestor);
  return { x: o.x + el.offsetWidth / 2, y: o.y + el.offsetHeight / 2 };
}

/**
 * The STAMP thud — jolt the revealed block. NEVER leave a transform on a pin
 * ancestor (a transformed ancestor breaks position:fixed pinning), so #story
 * and anything containing the pinned wrap is off-limits.
 */
export function thud(el: HTMLElement | null) {
  if (!el) return;
  let sec: HTMLElement = (el.closest('section, footer, header') as HTMLElement | null) || el;
  const storyPin = document.querySelector<HTMLElement>('#story-pin');
  if (sec.id === 'story' || (storyPin && sec.contains(storyPin))) {
    sec = document.querySelector<HTMLElement>('.story-head') || el;
  }
  gsap.fromTo(
    sec,
    { y: 2 },
    { y: 0, duration: 0.09, ease: STEP(1), overwrite: 'auto', clearProps: 'transform' }
  );
}
