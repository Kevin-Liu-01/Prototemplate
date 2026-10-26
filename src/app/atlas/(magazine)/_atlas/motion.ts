/** Whether the reader asked for less motion: what would animate takes its end state at once. False where there is no
    window to ask, as in a server render. */
export function prefersReducedMotion(): boolean {
  return (
    typeof matchMedia === 'function' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
