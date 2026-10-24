/** Whether the reader asked for less motion: what would animate takes its end state at once. */
export function prefersReducedMotion(): boolean {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}
