import gsap from 'gsap';

/**
 * Scroll velocity, sampled once for the whole page.
 *
 * Read from the native scrollport rather than Lenis so the tracker works
 * before <SmoothScroll> has published `window.lenis`, and under reduced
 * motion, where Lenis never starts at all.
 */
export const velocity = { smooth: 0 };

let previousY = 0;
let subscribers = 0;
let detach: (() => void) | null = null;

export function subscribeVelocity(): () => void {
  subscribers += 1;
  if (!detach) {
    previousY = window.scrollY;
    const tick = (_time: number, deltaMs: number) => {
      const y = window.scrollY;
      const raw = (y - previousY) / (Math.max(deltaMs, 8) / 1000);
      previousY = y;
      velocity.smooth += (raw - velocity.smooth) * 0.16;
    };
    gsap.ticker.add(tick);
    detach = () => gsap.ticker.remove(tick);
  }
  return () => {
    subscribers -= 1;
    if (subscribers <= 0 && detach) {
      detach();
      detach = null;
      velocity.smooth = 0;
    }
  };
}
