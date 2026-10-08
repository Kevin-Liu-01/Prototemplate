import { useLayoutEffect, useRef } from 'react';
import type { DependencyList } from 'react';

type LayoutWork = () => void | (() => void);

type LayoutWorkOptions = {
  /** the values whose change runs the work again; empty or absent runs it once */
  dependencies?: DependencyList;
  /** run the gathered cleanups before every rerun, not only on unmount */
  revertOnUpdate?: boolean;
};

/**
 * Dependency work before paint, with useGSAP's timing and no GSAP, for the
 * shell's components that never tween (GSAP stays where tweens run). The
 * work runs in a layout effect on mount and whenever `dependencies`
 * change. A cleanup it returns is gathered and runs on unmount; with
 * `revertOnUpdate`, or with no dependencies, the gathered cleanups also run
 * before each rerun, as useGSAP's context revert does.
 */
export function useLayoutWork(work: LayoutWork, { dependencies = [], revertOnUpdate = false }: LayoutWorkOptions = {}) {
  const cleanups = useRef<(() => void)[]>([]);
  const deferred = dependencies.length > 0 && !revertOnUpdate;

  const revert = () => {
    for (const cleanup of cleanups.current.splice(0)) cleanup();
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount only, as useGSAP's deferred revert
  useLayoutEffect(() => (deferred ? revert : undefined), []);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- the caller's dependencies, as useGSAP takes them
  useLayoutEffect(() => {
    const cleanup = work();
    if (cleanup) cleanups.current.push(cleanup);
    return deferred ? undefined : revert;
  }, dependencies);
}
