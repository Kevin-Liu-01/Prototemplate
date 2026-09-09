'use client';

import { useRef } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

/** Frames the static deck and hands it keyboard focus on mount. */
export default function DeckFrame() {
  const frame = useRef<HTMLIFrameElement>(null);

  useMountEffect(() => {
    frame.current?.focus();
  });

  return (
    <iframe
      allow='fullscreen'
      className='pt-deck-frame'
      ref={frame}
      src='/brand-deck.html'
      title='General Translation brand deck'
    />
  );
}
