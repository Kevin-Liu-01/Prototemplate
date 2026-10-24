import { useRef, useState } from 'react';

import { useMountEffect } from '../hooks';

/**
 * A picture's ref and whether it has finished, loaded or failed, for its
 * data-loaded fade; a failed picture still shows its box and alt text. A
 * picture already in the cache can finish before the page hydrates, when its
 * events are missed, so the mount checks it too.
 */
export function useImageLoaded() {
  const img = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  useMountEffect(() => {
    if (img.current?.complete) setLoaded(true);
  });
  const done = () => setLoaded(true);
  return { img, loaded, onLoad: done, onError: done };
}
