/**
 * When the reader has asked for less movement every diagram freezes at its
 * most legible frame instead of looping. (The gt-cloud lang contract,
 * reduced to the one helper this page's globe needs.)
 */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
