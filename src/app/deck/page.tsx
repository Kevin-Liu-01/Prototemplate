import type { Metadata } from 'next';

import DeckFrame from './DeckFrame';

import './deck.css';

export const metadata: Metadata = {
  title: { absolute: 'General Translation brand deck' },
  description:
    'The General Translation brand in 76 slides: thesis, values, writing style, mark, color, type, line rules, diagrams, dither, motion, the shipped site and every public surface, docs, blog, content rules, prototemplate, glyphfield, fixed points, and current status.',
  // declared per-route so the browser stops probing the app-wide /favicon.ico
  icons: { icon: '/brand/no-bg-gt-logo-light.png' },
};

/**
 * The brand deck as a page: the self-contained slideshow at
 * /public/brand-deck.html (fonts and screenshots inlined) framed to the
 * viewport. The file carries its own viewer: a sidebar of live thumbnails,
 * a toolbar, an overview grid (g), present mode (p), dark mode (d),
 * fullscreen (f) and a shortcut card (?). Arrow keys move; the frame takes
 * focus on load so the keys reach the deck without a click.
 */
export default function DeckPage() {
  return (
    <main className='pt-deckpage' style={{ position: 'fixed', inset: 0, margin: 0 }}>
      <DeckFrame />
    </main>
  );
}
