import { useEffect, type DependencyList, type EffectCallback } from 'react';

/**
 * The port's one door to useEffect. The practices ratchet
 * (scripts/lint/practices.mjs) counts a bare `useEffect(` in any file whose
 * path does not contain `use-mount-effect`, so every effect in
 * src/components/plate goes through this file.
 *
 * `useMountEffect` is packages/ui's: the effect runs once on mount and its
 * cleanup once on unmount, with no deferred cleanup. The frame remounts the
 * field on a scene change (PlateRoot keys FieldStack on the scene), and
 * the new stack registers its controller in the same commit the old one
 * unregisters; a cleanup deferred by a task would null the new
 * registration. Under StrictMode the effect runs, cleans up and runs
 * again, which every effect here survives because each one undoes itself.
 */
export function useMountEffect(effect: () => void | (() => void)) {
  useEffect(effect, []);
}

/** An effect with a dependency list, for the few ported effects that re-run on a prop. */
export function useEffectOn(effect: EffectCallback, deps: DependencyList) {
  useEffect(effect, deps);
}
