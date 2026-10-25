/** The media query every reduced-motion read on the site goes through. */
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** True when the reader's system asks for reduced motion; false on the server. */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.(REDUCED_MOTION_QUERY).matches);
}

/** The behavior for scrollTo and scrollIntoView: an instant jump under reduced motion, else a smooth scroll. */
export function scrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? 'auto' : 'smooth';
}

/** Calls `onChange` whenever the setting flips; returns the unsubscribe. */
export function onReducedMotionChange(onChange: () => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}
