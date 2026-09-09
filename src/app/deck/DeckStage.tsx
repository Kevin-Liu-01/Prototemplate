import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import './deck-slides.css';

/** The built slide markup, emitted by scripts/build-deck.mjs. */
export function readDeckSlides(): string {
  return readFileSync(join(process.cwd(), 'src/app/deck/slides.html'), 'utf8');
}

export type DeckStageProps = {
  /** the contents of slides.html */
  html: string;
};

/**
 * The 52 slides on the sheet. A server component: the markup is read from
 * the file at build time and injected once, inside a .pt-slides box that
 * fills the 1600 x 900 stage so each absolutely placed .slide takes its 57px
 * inset from the sheet. The first slide is marked on so a render without
 * scripts shows the title; DeckViewer moves the mark from there. Every
 * later slide is display: none until it is on. This is the one place live
 * slide markup lives: the list, the grid and the book show the static
 * renders under public/deck/thumbs (directive 7.5).
 */
export default function DeckStage({ html }: DeckStageProps) {
  const marked = html.replace(
    /<section class="slide( [^"]*)?"/,
    (_, extra: string | undefined) => `<section class="slide${extra ?? ''} is-on"`
  );
  return (
    <div
      className='pt-deck-slides pt-slides'
      style={{ position: 'absolute', inset: 0 }}
      dangerouslySetInnerHTML={{ __html: marked }}
    />
  );
}
