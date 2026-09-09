import { useEffect, useRef } from 'react';

/**
 * Runs an effect exactly once on mount, per repo policy against bare
 * useEffect, and runs its cleanup exactly once on unmount.
 *
 * React's StrictMode (on in next.config.ts) simulates an unmount right after
 * mount: it calls the cleanup and then the effect again, synchronously. A
 * plain "ran once" guard would skip that second call and leave the effect
 * torn down, so every listener registered here would be dead in dev. The
 * cleanup is therefore deferred by one task: the simulated re-run lands
 * first and cancels it, so the original setup stays live; a real unmount
 * has no re-run, and the deferred cleanup fires. The effect body itself
 * still runs at most once per mounted instance, so setup code that appends
 * DOM nodes without undoing them stays safe.
 */
export function useMountEffect(effect: () => void | (() => void)) {
  const cleanup = useRef<void | (() => void)>(undefined);
  const pending = useRef(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only by contract
  useEffect(() => {
    if (pending.current) {
      window.clearTimeout(pending.current);
      pending.current = 0;
    } else {
      cleanup.current = effect();
    }
    return () => {
      pending.current = window.setTimeout(() => {
        pending.current = 0;
        const dispose = cleanup.current;
        cleanup.current = undefined;
        if (dispose) dispose();
      }, 0);
    };
  }, []);
}
