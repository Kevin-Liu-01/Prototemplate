import { useEffect } from 'react';

/**
 * The port's one door to useEffect, listed by name in the practices
 * ratchet (scripts/lint/practices.mjs) beside src/lib/use-mount-effect.ts.
 *
 * `usePlateMountEffect` is packages/ui's useMountEffect: the effect runs
 * once on mount and its cleanup once on unmount, with no deferred cleanup,
 * which is where it differs from the site's useMountEffect. The frame
 * remounts the field on a scene change (PlateRoot keys FieldStack on the
 * scene), and the new stack registers its controller in the same commit
 * the old one unregisters; a cleanup deferred by a task would null the new
 * registration. Under StrictMode the effect runs, cleans up and runs
 * again, which every effect here survives because each one undoes itself.
 */
export function usePlateMountEffect(effect: () => void | (() => void)) {
  useEffect(effect, []);
}
