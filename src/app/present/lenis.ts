import type Lenis from 'lenis';

/**
 * SmoothScroll publishes its Lenis instance on window.lenis, but that global
 * declaration collides with the loose one the lenis package ships, so the
 * instance is read back through a cast instead of the global type.
 */
export function getLenis(): Lenis | undefined {
  return (window as unknown as { lenis?: Lenis }).lenis;
}
