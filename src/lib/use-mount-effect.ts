import { useEffect } from 'react';

/**
 * A wrapper around useEffect that only runs once on mount — the repo's
 * only sanctioned useEffect. Mirrors the gt-cloud house hook: a plain
 * empty-deps useEffect, NO ran-guard. Under StrictMode dev React replays
 * setup/cleanup/setup; a ran-guard would skip the second setup after its
 * cleanup destroyed the first mount's work (dead canvases in dev).
 */
export function useMountEffect(effect: () => void | (() => void)) {
  // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only by contract
  useEffect(effect, []);
}
