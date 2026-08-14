'use client';

import { useEffect } from 'react';

/** Mount-only effect - the gt-cloud hook's local twin. */
export function useMountEffect(effect: () => void | (() => void)) {
  /* eslint-disable-next-line react-hooks/exhaustive-deps */
  useEffect(effect, []);
}
