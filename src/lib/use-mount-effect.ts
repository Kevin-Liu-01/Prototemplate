import { useEffect, useRef } from 'react';

/** Runs an effect exactly once on mount, per repo policy against bare useEffect. */
export function useMountEffect(effect: () => void | (() => void)) {
  const ran = useRef(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only by contract
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    return effect();
  }, []);
}
