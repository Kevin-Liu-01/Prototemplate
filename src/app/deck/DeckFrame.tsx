'use client';

import { useRef } from 'react';

import { useMountEffect } from '@/lib/use-mount-effect';

const DECK_SRC = '/brand-deck.html';

/** Posted by the deck (deck/parts/tail.html, show) on every slide change it writes to its own hash; n is the 1-based slide number. */
type DeckSlideMessage = { type: 'gt-deck-slide'; n: number };

function isDeckSlideMessage(data: unknown): data is DeckSlideMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    'n' in data &&
    data.type === 'gt-deck-slide' &&
    typeof data.n === 'number' &&
    Number.isInteger(data.n) &&
    data.n > 0
  );
}

/**
 * Frames the static deck and hands it keyboard focus on mount. The deck
 * reads the slide number from its own document's hash (deck/parts/tail.html,
 * fromHash), so a deep link on the page address, /deck#12 from the search
 * bar's slide rows (directive 8.3), is carried into the frame: on mount the
 * frame is pointed at brand-deck.html plus the page's hash, and a later
 * hashchange on the page (another search result while the deck is open) is
 * forwarded to the frame's own hash, which the deck listens for. The hash
 * runs the other way too: each slide change the deck writes to its own hash
 * is also posted to this window as { type: 'gt-deck-slide', n }, and the
 * page's hash is replaced to match, so the address bar and a copied link
 * name the slide on screen. replaceState fires no hashchange, so nothing is
 * forwarded back. The deck itself stays standalone (directive 8.1): outside
 * a frame it posts to nobody.
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
    const onMessage = (event: MessageEvent) => {
      if (event.source !== el.contentWindow || event.origin !== window.location.origin) return;
      const data: unknown = event.data;
      if (!isDeckSlideMessage(data)) return;
      const next = `#${data.n}`;
      if (window.location.hash === next) return;
      try {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${next}`);
      } catch {
        // a sandboxed document: the deck moved, the address does not
      }
    };
    el.addEventListener('load', onLoad);
    window.addEventListener('hashchange', onHash);
    window.addEventListener('message', onMessage);
    el.focus();
    return () => {
      el.removeEventListener('load', onLoad);
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('message', onMessage);
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
