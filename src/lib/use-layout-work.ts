import { useLayoutEffect } from 'react';
import type { DependencyList } from 'react';

type LayoutWork = () => void | (() => void);

type LayoutWorkOptions = {
  /** the values whose change runs the work again; empty or absent runs it once */
  dependencies?: DependencyList;
  /** accepted from call sites written in useGSAP's shape; the cleanup runs before every rerun either way */
  revertOnUpdate?: boolean;
};

/**
 * Dependency work before paint, with useGSAP's timing and no GSAP, for the
 * components that never tween (GSAP stays where tweens run). The work runs
 * in a layout effect on mount and whenever `dependencies` change, and a
 * cleanup it returns runs before the next run and on unmount, so a rerun
 * never leaves the last run's listeners or engines behind.
 */
export function useLayoutWork(work: LayoutWork, { dependencies = [] }: LayoutWorkOptions = {}) {
  // eslint-disable-next-line react-hooks/exhaustive-deps -- the caller's dependencies, as useGSAP takes them
  useLayoutEffect(work, dependencies);
}
