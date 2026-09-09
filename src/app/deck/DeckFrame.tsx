'use client';

import { useRef } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

const DECK_SRC = '/brand-deck.html';

/**
 * Frames the static deck and hands it keyboard focus on mount. The deck
 * reads the slide number from its own document's hash (deck/parts/tail.html,
 * fromHash), so a deep link on the page address, /deck#12 from the search
 * bar's slide rows (directive 8.3), is carried into the frame: on mount the
 * frame is pointed at brand-deck.html plus the page's hash, and a later
 * hashchange on the page (another search result while the deck is open) is
 * forwarded to the frame's own hash, which the deck listens for. The deck
 * keeps writing its own hash as the slides move; the page address stays as
 * it was, so the deck remains standalone (directive 8.1).
 */
export default function DeckFrame() {
  const frame = useRef<HTMLIFrameElement>(null);

  useMountEffect(() => {
    const el = frame.current;
    if (!el) return;
    const hash = window.location.hash;
    if (hash.length > 1) {
      /* replace, never assign: the frame's first document must not become a history entry of its own */
      try {
        el.contentWindow?.location.replace(`${DECK_SRC}${hash}`);
      } catch {
        el.src = `${DECK_SRC}${hash}`;
      }
    }
    const onLoad = () => el.focus();
    const onHash = () => {
      const next = window.location.hash;
      if (next.length <= 1) return;
      try {
        const inner = el.contentWindow;
        if (inner && inner.location.hash !== next) inner.location.hash = next;
      } catch {
        // the frame left the origin; nothing to forward to
      }
    };
    el.addEventListener('load', onLoad);
    window.addEventListener('hashchange', onHash);
    el.focus();
    return () => {
      el.removeEventListener('load', onLoad);
      window.removeEventListener('hashchange', onHash);
    };
  });

  return (
    <iframe
      allow='fullscreen'
      className='pt-deck-frame'
      ref={frame}
      src={DECK_SRC}
      title='General Translation brand deck'
    />
  );
}
